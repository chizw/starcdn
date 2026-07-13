use std::{collections::BTreeMap, sync::Arc};

use axum::{
    body::Body,
    extract::{Path, State},
    http::{header, HeaderMap, HeaderValue, Method, Response, StatusCode, Uri},
    response::IntoResponse,
};
use tokio::sync::Semaphore;

use crate::{app::AppState, cache::cache_key};

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Target {
    pub route_name: String,
    pub upstream_name: String,
    pub url: String,
}

pub fn sanitize_rel_path(
    prefix: &str,
    request_path: &str,
    strict_single_segment: bool,
) -> Result<String, String> {
    if !request_path.starts_with(prefix) {
        return Err("invalid route".to_string());
    }
    let mut rel = request_path
        .trim_start_matches(prefix)
        .trim_end_matches('/')
        .to_string();
    if rel.is_empty() || rel.contains('\0') || rel.contains("..") || rel.starts_with('/') {
        return Err("invalid resource path".to_string());
    }
    if strict_single_segment && rel.contains('/') {
        return Err("invalid avatar path".to_string());
    }
    while rel.contains("//") {
        rel = rel.replace("//", "/");
    }
    if rel.is_empty() || rel == "." || rel.starts_with("../") {
        return Err("invalid resource path".to_string());
    }
    Ok(rel)
}

pub fn sorted_query(query: &[(String, String)]) -> String {
    let mut values: BTreeMap<&str, Vec<&str>> = BTreeMap::new();
    for (key, value) in query {
        values.entry(key.as_str()).or_default().push(value.as_str());
    }
    let mut parts = Vec::new();
    for (key, vals) in values {
        for value in vals {
            parts.push(format!("{}={}", key, value));
        }
    }
    parts.join("&")
}

/// 将 `/cnb/` 相对路径规范为 CNB 可直接取文件的上游路径。
/// 支持：
/// - jsDelivr 风格：`owner/repo@ref/path/file`
/// - 显式 raw/blob：`owner/repo/-/git/raw|raw|blob/ref/path`
pub fn rewrite_cnb_rel(rel: &str) -> String {
    if let Some((repo, rest)) = rel.split_once("/-/") {
        if let Some(path) = rest.strip_prefix("git/raw/") {
            return format!("{}/-/git/raw/{}", repo, path);
        }
        if let Some(path) = rest.strip_prefix("raw/") {
            return format!("{}/-/git/raw/{}", repo, path);
        }
        if let Some(path) = rest.strip_prefix("blob/") {
            return format!("{}/-/git/raw/{}", repo, path);
        }
        return rel.to_string();
    }

    // owner[/group]/repo@ref[/file...]
    if let Some(at) = rel.find('@') {
        let repo = &rel[..at];
        let after = &rel[at + 1..];
        if after.is_empty() || repo.is_empty() {
            return rel.to_string();
        }
        return match after.split_once('/') {
            Some((reference, file_path)) if !file_path.is_empty() => {
                format!("{}/-/git/raw/{}/{}", repo, reference, file_path)
            }
            Some((reference, _)) => format!("{}/-/git/raw/{}", repo, reference),
            None => format!("{}/-/git/raw/{}", repo, after),
        };
    }

    rel.to_string()
}

pub fn cnb_target(rel: &str, query: &[(String, String)]) -> Target {
    let rewritten = rewrite_cnb_rel(rel);
    let mut url = format!("https://cnb.cool/{}", rewritten);
    let query_string = sorted_query(query);
    if !query_string.is_empty() {
        url.push('?');
        url.push_str(&query_string);
    }
    Target {
        route_name: "cnb".to_string(),
        upstream_name: "cnb".to_string(),
        url,
    }
}

pub fn targets_for(prefix: &str, rel: &str, query: &[(String, String)]) -> Vec<Target> {
    let query_string = sorted_query(query);
    let with_query = |mut url: String| {
        if !query_string.is_empty() {
            url.push('?');
            url.push_str(&query_string);
        }
        url
    };
    match prefix {
        "npm" => vec![
            Target {
                route_name: "npm".to_string(),
                upstream_name: "unpkg".to_string(),
                url: with_query(format!("https://unpkg.com/{}", rel)),
            },
            Target {
                route_name: "npm".to_string(),
                upstream_name: "jsdelivr".to_string(),
                url: with_query(format!("https://cdn.jsdelivr.net/npm/{}", rel)),
            },
        ],
        "gh" => vec![Target {
            route_name: "gh".to_string(),
            upstream_name: "jsdelivr".to_string(),
            url: with_query(format!("https://cdn.jsdelivr.net/gh/{}", rel)),
        }],
        "ajax" => vec![Target {
            route_name: "cdnjs".to_string(),
            upstream_name: "cdnjs".to_string(),
            url: with_query(format!("https://cdnjs.cloudflare.com/ajax/libs/{}", rel)),
        }],
        "cnb" => vec![cnb_target(rel, query)],
        _ => vec![],
    }
}

pub async fn handle_proxy(
    State(state): State<AppState>,
    method: Method,
    uri: Uri,
    headers: HeaderMap,
) -> impl IntoResponse {
    if method != Method::GET && method != Method::HEAD {
        return StatusCode::METHOD_NOT_ALLOWED.into_response();
    }
    let path = uri.path().to_string();
    if state.waf.is_banned(&path).await {
        return axum::response::Redirect::temporary("/waf").into_response();
    }
    let (prefix, route_prefix, strict) = if path == "/npm" || path.starts_with("/npm/") {
        ("npm", "/npm/", false)
    } else if path == "/gh" || path.starts_with("/gh/") {
        ("gh", "/gh/", false)
    } else if path == "/ajax/libs" || path.starts_with("/ajax/libs/") {
        ("ajax", "/ajax/libs/", false)
    } else if path == "/cnb" || path.starts_with("/cnb/") {
        ("cnb", "/cnb/", false)
    } else {
        return StatusCode::NOT_FOUND.into_response();
    };
    let rel = match sanitize_rel_path(
        route_prefix,
        &format_path_for_route(&path, route_prefix),
        strict,
    ) {
        Ok(rel) => rel,
        Err(err) => return (StatusCode::BAD_REQUEST, err).into_response(),
    };
    let query = parse_query(uri.query().unwrap_or_default());
    let targets = targets_for(prefix, &rel, &query);
    proxy_targets(state, method == Method::HEAD, &path, headers, targets).await
}

pub async fn handle_avatar(
    State(state): State<AppState>,
    Path(param): Path<String>,
    method: Method,
    uri: Uri,
    headers: HeaderMap,
) -> impl IntoResponse {
    if method != Method::GET && method != Method::HEAD {
        return StatusCode::METHOD_NOT_ALLOWED.into_response();
    }
    let request_path = format!("/avatar/{}", param);
    if state.waf.is_banned(&request_path).await {
        return axum::response::Redirect::temporary("/waf").into_response();
    }
    if param.is_empty() || param.contains('/') || param.contains("..") {
        return (StatusCode::BAD_REQUEST, "invalid avatar path").into_response();
    }
    let query = parse_query(uri.query().unwrap_or_default());
    let size = query
        .iter()
        .find(|(key, _)| key == "s")
        .or_else(|| query.iter().find(|(key, _)| key == "size"))
        .and_then(|(_, value)| value.parse::<u16>().ok())
        .unwrap_or(80)
        .clamp(1, 2048);
    let lower = param.trim().to_ascii_lowercase();
    let hash = if lower.chars().all(|ch| ch.is_ascii_digit()) && (4..=12).contains(&lower.len()) {
        let url = format!("https://q1.qlogo.cn/g?b=qq&nk={}&s={}", lower, size);
        return proxy_targets(
            state,
            method == Method::HEAD,
            &request_path,
            headers,
            vec![Target {
                route_name: "avatar".to_string(),
                upstream_name: "qlogo".to_string(),
                url,
            }],
        )
        .await;
    } else if let Some(qq) = lower
        .strip_suffix("@qq.com")
        .filter(|value| value.chars().all(|ch| ch.is_ascii_digit()))
    {
        let url = format!("https://q1.qlogo.cn/g?b=qq&nk={}&s={}", qq, size);
        return proxy_targets(
            state,
            method == Method::HEAD,
            &request_path,
            headers,
            vec![Target {
                route_name: "avatar".to_string(),
                upstream_name: "qlogo".to_string(),
                url,
            }],
        )
        .await;
    } else if lower.len() == 32 && lower.chars().all(|ch| ch.is_ascii_hexdigit()) {
        lower
    } else {
        format!("{:x}", md5::compute(lower.as_bytes()))
    };
    let targets = vec![
        Target {
            route_name: "avatar".to_string(),
            upstream_name: "weavatar".to_string(),
            url: format!("https://weavatar.com/avatar/{}?s={}", hash, size),
        },
        Target {
            route_name: "avatar".to_string(),
            upstream_name: "gravatar".to_string(),
            url: format!("https://secure.gravatar.com/avatar/{}?s={}", hash, size),
        },
    ];
    proxy_targets(
        state,
        method == Method::HEAD,
        &request_path,
        headers,
        targets,
    )
    .await
}

async fn proxy_targets(
    state: AppState,
    head: bool,
    request_path: &str,
    headers: HeaderMap,
    targets: Vec<Target>,
) -> axum::response::Response {
    let Ok(_permit) = state.upstream_semaphore.clone().acquire_owned().await else {
        return StatusCode::SERVICE_UNAVAILABLE.into_response();
    };
    for target in targets {
        let key = cache_key(&target.upstream_name, &target.url);
        if let Some(entry) = state.cache.get(&key).await {
            state
                .db
                .record_traffic(request_path, entry.body.len() as i64)
                .await;
            return state.cache.response_from_entry(entry, head).into_response();
        }
        let lock = state.cache.lock_for(&key);
        let _guard = lock.lock().await;
        if let Some(entry) = state.cache.get(&key).await {
            state
                .db
                .record_traffic(request_path, entry.body.len() as i64)
                .await;
            return state.cache.response_from_entry(entry, head).into_response();
        }
        if let Some(response) = fetch_one(&state, head, request_path, &headers, &target, &key).await
        {
            return response;
        }
    }
    StatusCode::BAD_GATEWAY.into_response()
}

async fn fetch_one(
    state: &AppState,
    head: bool,
    request_path: &str,
    headers: &HeaderMap,
    target: &Target,
    key: &str,
) -> Option<axum::response::Response> {
    let mut builder = state
        .client
        .get(&target.url)
        .header(header::USER_AGENT, "StarCDN-RustProxy/1.0");
    for name in [
        header::ACCEPT,
        header::ACCEPT_LANGUAGE,
        header::IF_NONE_MATCH,
        header::IF_MODIFIED_SINCE,
    ] {
        if let Some(value) = headers.get(&name) {
            builder = builder.header(name, value);
        }
    }
    let upstream = builder.send().await.ok()?;
    let status = StatusCode::from_u16(upstream.status().as_u16()).ok()?;
    if status.as_u16() >= 400 {
        return None;
    }
    let mut response_headers = HeaderMap::new();
    for (name, value) in upstream.headers() {
        response_headers.insert(name.clone(), value.clone());
    }
    let body = upstream.bytes().await.ok()?.to_vec();
    response_headers.insert(
        "cache-control",
        HeaderValue::from_str(&format!("public, max-age={}", state.cache.ttl().as_secs())).ok()?,
    );
    response_headers.insert("x-starcdn-cache", HeaderValue::from_static("MISS"));
    response_headers.insert(
        "x-starcdn-upstream",
        HeaderValue::from_str(&target.upstream_name).ok()?,
    );
    if status == StatusCode::OK {
        let _ = state
            .cache
            .put(key, status, &response_headers, &target.upstream_name, &body)
            .await;
    }
    state
        .db
        .record_traffic(request_path, body.len() as i64)
        .await;
    let mut response = Response::new(if head {
        Body::empty()
    } else {
        Body::from(body)
    });
    *response.status_mut() = status;
    *response.headers_mut() = response_headers;
    Some(response.into_response())
}

fn parse_query(query: &str) -> Vec<(String, String)> {
    if query.is_empty() {
        return Vec::new();
    }
    query
        .split('&')
        .filter_map(|part| {
            let mut split = part.splitn(2, '=');
            Some((
                split.next()?.to_string(),
                split.next().unwrap_or_default().to_string(),
            ))
        })
        .collect()
}

fn format_path_for_route(path: &str, route_prefix: &str) -> String {
    if path == route_prefix.trim_end_matches('/') {
        route_prefix.to_string()
    } else {
        path.to_string()
    }
}

pub fn upstream_semaphore(limit: usize) -> Arc<Semaphore> {
    Arc::new(Semaphore::new(limit))
}
