use std::{sync::Arc, time::Duration};

use axum::{
    routing::{delete, get, post},
    Router,
};
use reqwest::Client;
use tokio::sync::Semaphore;
use tower_http::{
    services::{ServeDir, ServeFile},
    trace::TraceLayer,
};

use crate::{admin, auth, cache::CacheStore, config::Config, db::Database, proxy, waf::WafEngine};

#[derive(Clone)]
pub struct AppState {
    pub config: Config,
    pub db: Database,
    pub cache: CacheStore,
    pub client: Client,
    pub waf: WafEngine,
    pub upstream_semaphore: Arc<Semaphore>,
}

pub async fn build_app(config: Config) -> Result<Router, Box<dyn std::error::Error>> {
    let db = Database::connect(&config).await?;
    let cache = CacheStore::new(&config.cache_dir, config.cache_ttl).await?;
    let client = Client::builder()
        .connect_timeout(Duration::from_secs(10))
        .timeout(Duration::from_secs(30))
        .pool_max_idle_per_host(32)
        .user_agent("StarCDN-RustProxy/1.0")
        .build()?;
    let waf = WafEngine::new(db.clone());
    let state = AppState {
        upstream_semaphore: proxy::upstream_semaphore(config.max_upstream_concurrency),
        config,
        db,
        cache,
        client,
        waf,
    };
    let cleanup_cache = state.cache.clone();
    tokio::spawn(async move {
        let mut interval = tokio::time::interval(Duration::from_secs(60));
        loop {
            interval.tick().await;
            cleanup_cache.sweep_expired().await;
        }
    });
    let mut router = Router::new()
        .route("/api/stats/", get(admin::public_stats))
        .route("/api/stats", get(admin::public_stats))
        .route("/admin/api/login", post(auth::login))
        .route("/admin/api/logout", post(auth::logout))
        .route("/admin/api/password", post(auth::change_password))
        .route("/admin/api/session", get(admin::session))
        .route("/admin/api/system", get(admin::system))
        .route("/admin/api/stats", get(admin::admin_stats))
        .route(
            "/admin/api/ban",
            get(admin::list_bans).post(admin::create_ban),
        )
        .route("/admin/api/ban/:id", delete(admin::delete_ban))
        .route("/admin/api/cache/purge", post(admin::purge_cache))
        .route(
            "/avatar/:param",
            get(proxy::handle_avatar).head(proxy::handle_avatar),
        )
        .route(
            "/npm/*path",
            get(proxy::handle_proxy).head(proxy::handle_proxy),
        )
        .route(
            "/gh/*path",
            get(proxy::handle_proxy).head(proxy::handle_proxy),
        )
        .route(
            "/ajax/libs/*path",
            get(proxy::handle_proxy).head(proxy::handle_proxy),
        )
        .route(
            "/cnb/*path",
            get(proxy::handle_proxy).head(proxy::handle_proxy),
        )
        .layer(TraceLayer::new_for_http())
        .with_state(state.clone());
    if let Some(static_dir) = &state.config.static_dir {
        router = router.fallback_service(
            ServeDir::new(static_dir)
                .not_found_service(ServeFile::new(format!("{}/404.html", static_dir))),
        );
    }
    Ok(router)
}
