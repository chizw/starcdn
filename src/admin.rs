use axum::{
    extract::{Path, Query, State},
    http::{HeaderMap, StatusCode},
    Json,
};
use serde::Deserialize;

use crate::{app::AppState, auth::require_auth};

#[derive(Deserialize)]
pub struct PageQuery {
    page: Option<i64>,
    page_size: Option<i64>,
}

#[derive(Deserialize)]
pub struct CreateBanRequest {
    pattern: String,
    reason: Option<String>,
    mode: Option<String>,
}

#[derive(Deserialize)]
pub struct PurgeRequest {
    #[serde(default)]
    mode: Option<String>,
    #[serde(default)]
    target: Option<String>,
}

// 预留按模式/目标刷新；当前实现全量 purge。
#[allow(dead_code)]
fn _purge_request_fields(req: &PurgeRequest) -> (Option<&str>, Option<&str>) {
    (req.mode.as_deref(), req.target.as_deref())
}

pub async fn public_stats(State(state): State<AppState>) -> Json<serde_json::Value> {
    let stats = state.db.stats(1, 10).await.ok();
    let total_requests = stats
        .as_ref()
        .map(|stats| stats.total_requests)
        .unwrap_or_default();
    let total_bytes = stats
        .as_ref()
        .map(|stats| stats.total_bytes_sent)
        .unwrap_or_default();
    Json(serde_json::json!([
        { "name": "Unpkg", "total_requests": total_requests, "total_bytes": total_bytes, "online": true },
        { "name": "Jsdelivr", "total_requests": 0, "total_bytes": 0, "online": true },
        { "name": "Gravatar", "total_requests": 0, "total_bytes": 0, "online": true },
        { "name": "Cdnjs", "total_requests": 0, "total_bytes": 0, "online": true },
        { "name": "CNB", "total_requests": 0, "total_bytes": 0, "online": true }
    ]))
}

pub async fn session(
    State(state): State<AppState>,
    headers: HeaderMap,
) -> Result<Json<serde_json::Value>, StatusCode> {
    let claims = require_auth(&headers, &state).await?;
    Ok(Json(
        serde_json::json!({ "authenticated": true, "username": claims.username }),
    ))
}

pub async fn system(
    State(state): State<AppState>,
    headers: HeaderMap,
) -> Result<Json<serde_json::Value>, StatusCode> {
    let claims = require_auth(&headers, &state).await?;
    Ok(Json(serde_json::json!({
        "authenticated": true,
        "username": claims.username,
        "backend": "rust",
        "cache_ttl_seconds": state.cache.ttl().as_secs(),
        "max_concurrency": state.config.max_concurrency,
        "max_upstream_concurrency": state.config.max_upstream_concurrency
    })))
}

pub async fn admin_stats(
    State(state): State<AppState>,
    headers: HeaderMap,
    Query(query): Query<PageQuery>,
) -> Result<Json<serde_json::Value>, StatusCode> {
    require_auth(&headers, &state).await?;
    let stats = state
        .db
        .stats(
            query.page.unwrap_or(1),
            query.page_size.unwrap_or(20).clamp(1, 100),
        )
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    Ok(Json(
        serde_json::to_value(stats).unwrap_or_else(|_| serde_json::json!({})),
    ))
}

pub async fn list_bans(
    State(state): State<AppState>,
    headers: HeaderMap,
) -> Result<Json<serde_json::Value>, StatusCode> {
    require_auth(&headers, &state).await?;
    let rules = state
        .db
        .list_bans()
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    Ok(Json(
        serde_json::to_value(rules).unwrap_or_else(|_| serde_json::json!([])),
    ))
}

pub async fn create_ban(
    State(state): State<AppState>,
    headers: HeaderMap,
    Json(req): Json<CreateBanRequest>,
) -> Result<(StatusCode, Json<serde_json::Value>), (StatusCode, Json<serde_json::Value>)> {
    require_auth(&headers, &state)
        .await
        .map_err(|status| json_error(status, "unauthorized"))?;
    if req.pattern.trim().is_empty() {
        return Err(json_error(StatusCode::BAD_REQUEST, "pattern is required"));
    }
    let mode = req
        .mode
        .unwrap_or_else(|| infer_mode(&req.pattern).to_string());
    let reason = req.reason.unwrap_or_default();
    let rule = state
        .db
        .create_ban(req.pattern.trim(), &mode, &reason)
        .await
        .map_err(|_| {
            json_error(
                StatusCode::INTERNAL_SERVER_ERROR,
                "failed to create ban rule",
            )
        })?;
    Ok((
        StatusCode::CREATED,
        Json(serde_json::to_value(rule).unwrap_or_else(|_| serde_json::json!({}))),
    ))
}

pub async fn delete_ban(
    State(state): State<AppState>,
    headers: HeaderMap,
    Path(id): Path<i64>,
) -> Result<Json<serde_json::Value>, StatusCode> {
    require_auth(&headers, &state).await?;
    state
        .db
        .delete_ban(id)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    Ok(Json(serde_json::json!({ "message": "ban rule deleted" })))
}

pub async fn purge_cache(
    State(state): State<AppState>,
    headers: HeaderMap,
    Json(req): Json<PurgeRequest>,
) -> Result<Json<serde_json::Value>, StatusCode> {
    require_auth(&headers, &state).await?;
    let mode = req.mode.unwrap_or_else(|| "all".to_string());
    let target = req.target.unwrap_or_else(|| "*".to_string());
    // 首版统一全量清理；mode/target 进入响应，便于后续扩展按前缀/URL 刷新。
    let deleted_files = state
        .cache
        .purge_all()
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    Ok(Json(serde_json::json!({
        "message": "cache purged",
        "mode": mode,
        "target": target,
        "deleted_files": deleted_files
    })))
}

fn infer_mode(pattern: &str) -> &'static str {
    if pattern.starts_with("ext:") {
        "ext"
    } else if pattern.starts_with('/') && pattern.ends_with('/') && pattern.len() > 1 {
        "regex"
    } else if pattern.contains('*') || pattern.contains('?') {
        "glob"
    } else if pattern.ends_with('/') {
        "prefix"
    } else {
        "exact"
    }
}

fn json_error(status: StatusCode, message: &str) -> (StatusCode, Json<serde_json::Value>) {
    (status, Json(serde_json::json!({ "error": message })))
}
