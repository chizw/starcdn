use std::{
    sync::{
        atomic::{AtomicUsize, Ordering},
        Arc,
    },
    time::Duration,
};

use axum::{
    body::Body,
    http::{HeaderMap, Request, StatusCode},
};
use starcdn::{
    app::build_app,
    cache::{cache_key, CacheStore},
    config::{parse_duration, Config},
    db::Database,
    proxy::{cnb_target, sanitize_rel_path, targets_for, upstream_semaphore},
    waf::{parse_mode, WafMode, WafRule},
};
use tower::ServiceExt;

#[test]
fn maps_cnb_route_to_cnb_cool_upstream() {
    let target = cnb_target(
        "jsdmirror/home",
        &[
            ("b".to_string(), "2".to_string()),
            ("a".to_string(), "1".to_string()),
        ],
    );
    assert_eq!(target.url, "https://cnb.cool/jsdmirror/home?a=1&b=2");
    assert_eq!(target.route_name, "cnb");
}

#[test]
fn maps_cnb_jsdelivr_style_path_to_git_raw() {
    let target = cnb_target("jsdmirror/json@main/third-party-mirrors.json", &[]);
    assert_eq!(
        target.url,
        "https://cnb.cool/jsdmirror/json/-/git/raw/main/third-party-mirrors.json"
    );

    let already_raw = cnb_target(
        "jsdmirror/json/-/git/raw/main/third-party-mirrors.json",
        &[],
    );
    assert_eq!(
        already_raw.url,
        "https://cnb.cool/jsdmirror/json/-/git/raw/main/third-party-mirrors.json"
    );

    let blob = cnb_target("jsdmirror/json/-/blob/main/third-party-mirrors.json", &[]);
    assert_eq!(
        blob.url,
        "https://cnb.cool/jsdmirror/json/-/git/raw/main/third-party-mirrors.json"
    );
}

#[test]
fn rejects_traversal_paths_before_proxying() {
    assert!(sanitize_rel_path("/npm/", "/npm/../secret", false).is_err());
    assert!(sanitize_rel_path("/avatar/", "/avatar/user/hash", true).is_err());
    assert_eq!(
        sanitize_rel_path("/npm/", "/npm/jquery/dist/index.js", false).unwrap(),
        "jquery/dist/index.js"
    );
}

#[test]
fn cache_key_is_stable_and_upstream_sensitive() {
    let first = cache_key("cnb", "https://cnb.cool/a");
    let second = cache_key("cnb", "https://cnb.cool/a");
    let third = cache_key("npm", "https://cnb.cool/a");
    assert_eq!(first, second);
    assert_ne!(first, third);
}

#[test]
fn waf_supports_ext_glob_prefix_and_regex_modes() {
    assert!(WafRule {
        pattern: "exe,zip".to_string(),
        mode: WafMode::Ext
    }
    .matches("/npm/pkg/file.zip"));
    assert!(WafRule {
        pattern: "/cnb/private*".to_string(),
        mode: WafMode::Glob
    }
    .matches("/cnb/private/repo"));
    assert!(WafRule {
        pattern: "/avatar/".to_string(),
        mode: WafMode::Prefix
    }
    .matches("/avatar/foo"));
    assert!(WafRule {
        pattern: r"^/npm/.+\.min\.js$".to_string(),
        mode: WafMode::Regex
    }
    .matches("/npm/jquery/dist/jquery.min.js"));
}

#[test]
fn parses_rust_backend_duration_values() {
    assert_eq!(parse_duration("10m").unwrap().as_secs(), 600);
    assert_eq!(parse_duration("168h").unwrap().as_secs(), 604800);
    assert!(parse_duration("bad").is_none());
}

#[test]
fn routes_include_expected_upstream_fallbacks() {
    let npm = targets_for("npm", "react", &[]);
    assert_eq!(npm.len(), 2);
    assert_eq!(npm[0].url, "https://unpkg.com/react");
    assert_eq!(npm[1].url, "https://cdn.jsdelivr.net/npm/react");

    let cnb = targets_for(
        "cnb",
        "jsdmirror/home",
        &[("ref".to_string(), "main".to_string())],
    );
    assert_eq!(cnb.len(), 1);
    assert_eq!(cnb[0].url, "https://cnb.cool/jsdmirror/home?ref=main");
}

#[test]
fn waf_mode_parser_defaults_unknown_modes_to_glob() {
    assert_eq!(parse_mode("exact"), WafMode::Exact);
    assert_eq!(parse_mode("prefix"), WafMode::Prefix);
    assert_eq!(parse_mode("suffix"), WafMode::Suffix);
    assert_eq!(parse_mode("ext"), WafMode::Ext);
    assert_eq!(parse_mode("regex"), WafMode::Regex);
    assert_eq!(parse_mode("unknown"), WafMode::Glob);
}

#[tokio::test]
async fn cache_store_writes_reads_and_purges_entries() {
    let temp = tempfile::tempdir().unwrap();
    let store = CacheStore::new(temp.path(), Duration::from_secs(60))
        .await
        .unwrap();
    let key = cache_key("cnb", "https://cnb.cool/jsdmirror/home");
    let mut headers = HeaderMap::new();
    headers.insert("content-type", "text/plain".parse().unwrap());

    store
        .put(&key, StatusCode::OK, &headers, "cnb", b"hello")
        .await
        .unwrap();
    let entry = store.get(&key).await.unwrap();
    assert_eq!(entry.body, b"hello");
    assert_eq!(entry.meta.upstream, "cnb");
    assert_eq!(entry.meta.status, 200);

    let deleted = store.purge_all().await.unwrap();
    assert_eq!(deleted, 2);
    assert!(store.get(&key).await.is_none());
}

#[tokio::test]
async fn cache_store_sweeps_expired_entries() {
    let temp = tempfile::tempdir().unwrap();
    let store = CacheStore::new(temp.path(), Duration::from_secs(1))
        .await
        .unwrap();
    let key = cache_key("npm", "https://unpkg.com/react");
    store
        .put(&key, StatusCode::OK, &HeaderMap::new(), "unpkg", b"react")
        .await
        .unwrap();

    tokio::time::sleep(Duration::from_millis(1200)).await;
    store.sweep_expired().await;

    assert!(store.get(&key).await.is_none());
}

#[tokio::test]
async fn database_records_stats_and_ban_rules() {
    let temp = tempfile::tempdir().unwrap();
    let config = test_config(temp.path());
    let db = Database::connect(&config).await.unwrap();

    db.record_traffic("/cnb/jsdmirror/home", 128).await;
    db.record_traffic("/cnb/jsdmirror/home", 64).await;
    let stats = db.stats(1, 20).await.unwrap();
    assert_eq!(stats.total_requests, 2);
    assert_eq!(stats.total_bytes_sent, 192);
    assert_eq!(stats.top_urls[0].request_path, "/cnb/jsdmirror/home");

    let rule = db
        .create_ban("/cnb/private*", "glob", "private repo")
        .await
        .unwrap();
    assert_eq!(db.list_bans().await.unwrap().len(), 1);
    db.delete_ban(rule.id).await.unwrap();
    assert!(db.list_bans().await.unwrap().is_empty());
}

#[tokio::test]
async fn app_blocks_banned_proxy_path_before_upstream_fetch() {
    let temp = tempfile::tempdir().unwrap();
    let mut config = test_config(temp.path());
    // 先初始化 schema，再写入规则；后续 build_app 不得再 reset 数据库。
    config.db_reset = true;
    let db = Database::connect(&config).await.unwrap();
    db.create_ban("/cnb/private*", "glob", "blocked")
        .await
        .unwrap();
    config.db_reset = false;

    let app = build_app(config).await.unwrap();
    let response = app
        .oneshot(
            Request::builder()
                .uri("/cnb/private/repo")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::TEMPORARY_REDIRECT);
    assert_eq!(response.headers().get("location").unwrap(), "/waf");
}

#[tokio::test]
async fn singleflight_lock_serializes_same_cache_key() {
    let temp = tempfile::tempdir().unwrap();
    let store = CacheStore::new(temp.path(), Duration::from_secs(60))
        .await
        .unwrap();
    let active = Arc::new(AtomicUsize::new(0));
    let max_active = Arc::new(AtomicUsize::new(0));
    let mut handles = Vec::new();

    for _ in 0..32 {
        let lock = store.lock_for("same-key");
        let active = active.clone();
        let max_active = max_active.clone();
        handles.push(tokio::spawn(async move {
            let _guard = lock.lock().await;
            let now = active.fetch_add(1, Ordering::SeqCst) + 1;
            max_active.fetch_max(now, Ordering::SeqCst);
            tokio::time::sleep(Duration::from_millis(5)).await;
            active.fetch_sub(1, Ordering::SeqCst);
        }));
    }

    for handle in handles {
        handle.await.unwrap();
    }

    assert_eq!(max_active.load(Ordering::SeqCst), 1);
}

#[tokio::test]
async fn upstream_semaphore_enforces_concurrency_limit() {
    let semaphore = upstream_semaphore(3);
    let active = Arc::new(AtomicUsize::new(0));
    let max_active = Arc::new(AtomicUsize::new(0));
    let mut handles = Vec::new();

    for _ in 0..24 {
        let semaphore = semaphore.clone();
        let active = active.clone();
        let max_active = max_active.clone();
        handles.push(tokio::spawn(async move {
            let _permit = semaphore.acquire_owned().await.unwrap();
            let now = active.fetch_add(1, Ordering::SeqCst) + 1;
            max_active.fetch_max(now, Ordering::SeqCst);
            tokio::time::sleep(Duration::from_millis(10)).await;
            active.fetch_sub(1, Ordering::SeqCst);
        }));
    }

    for handle in handles {
        handle.await.unwrap();
    }

    assert_eq!(max_active.load(Ordering::SeqCst), 3);
}

fn test_config(root: &std::path::Path) -> Config {
    Config {
        addr: ":0".to_string(),
        static_dir: None,
        cache_dir: root.join("cache").to_string_lossy().to_string(),
        cache_ttl: Duration::from_secs(60),
        db_path: root.join("starcdn.db").to_string_lossy().to_string(),
        admin_user: "admin".to_string(),
        admin_pass: "admin123".to_string(),
        jwt_secret: "test-secret".to_string(),
        flush_token: None,
        max_concurrency: 64,
        max_upstream_concurrency: 8,
        db_reset: true,
    }
}
