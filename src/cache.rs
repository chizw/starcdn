use std::{
    path::{Path, PathBuf},
    sync::Arc,
    time::{Duration, SystemTime, UNIX_EPOCH},
};

use axum::{
    body::Body,
    http::{HeaderMap, HeaderName, HeaderValue, Response, StatusCode},
};
use dashmap::DashMap;
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use tokio::sync::Mutex;

pub fn cache_key(route_name: &str, upstream_url: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(route_name.as_bytes());
    hasher.update(b"|");
    hasher.update(upstream_url.as_bytes());
    hex::encode(hasher.finalize())
}

#[derive(Clone)]
pub struct CacheStore {
    dir: PathBuf,
    ttl: Duration,
    locks: Arc<DashMap<String, Arc<Mutex<()>>>>,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct CacheMeta {
    pub status: u16,
    pub headers: Vec<(String, String)>,
    pub created_at: i64,
    pub expires_at: i64,
    pub upstream: String,
    pub content_length: usize,
    pub content_hash: String,
}

#[derive(Clone)]
pub struct CacheEntry {
    pub meta: CacheMeta,
    pub body: Vec<u8>,
}

impl CacheStore {
    pub async fn new(dir: impl AsRef<Path>, ttl: Duration) -> Result<Self, std::io::Error> {
        tokio::fs::create_dir_all(dir.as_ref()).await?;
        Ok(Self {
            dir: dir.as_ref().to_path_buf(),
            ttl,
            locks: Arc::new(DashMap::new()),
        })
    }

    pub fn ttl(&self) -> Duration {
        self.ttl
    }

    pub fn lock_for(&self, key: &str) -> Arc<Mutex<()>> {
        self.locks
            .entry(key.to_string())
            .or_insert_with(|| Arc::new(Mutex::new(())))
            .clone()
    }

    pub async fn get(&self, key: &str) -> Option<CacheEntry> {
        let meta_path = self.meta_path(key);
        let body_path = self.body_path(key);
        let meta_bytes = tokio::fs::read(meta_path).await.ok()?;
        let meta: CacheMeta = serde_json::from_slice(&meta_bytes).ok()?;
        if now_ts() > meta.expires_at {
            let _ = self.delete(key).await;
            return None;
        }
        let body = tokio::fs::read(body_path).await.ok()?;
        Some(CacheEntry { meta, body })
    }

    pub async fn put(
        &self,
        key: &str,
        status: StatusCode,
        headers: &HeaderMap,
        upstream: &str,
        body: &[u8],
    ) -> Result<(), std::io::Error> {
        let created_at = now_ts();
        let mut clean_headers = Vec::new();
        for (name, value) in headers {
            if let Ok(value) = value.to_str() {
                clean_headers.push((name.as_str().to_string(), value.to_string()));
            }
        }
        let mut hasher = Sha256::new();
        hasher.update(body);
        let meta = CacheMeta {
            status: status.as_u16(),
            headers: clean_headers,
            created_at,
            expires_at: created_at + self.ttl.as_secs() as i64,
            upstream: upstream.to_string(),
            content_length: body.len(),
            content_hash: hex::encode(hasher.finalize()),
        };
        self.atomic_write(&self.body_path(key), body).await?;
        self.atomic_write(
            &self.meta_path(key),
            serde_json::to_vec(&meta).unwrap_or_default().as_slice(),
        )
        .await
    }

    pub async fn delete(&self, key: &str) -> Result<(), std::io::Error> {
        let _ = tokio::fs::remove_file(self.meta_path(key)).await;
        let _ = tokio::fs::remove_file(self.body_path(key)).await;
        Ok(())
    }

    pub async fn purge_all(&self) -> Result<usize, std::io::Error> {
        let mut count = 0;
        let mut entries = tokio::fs::read_dir(&self.dir).await?;
        while let Some(entry) = entries.next_entry().await? {
            if !entry.file_type().await?.is_file() {
                continue;
            }
            tokio::fs::remove_file(entry.path()).await?;
            count += 1;
        }
        Ok(count)
    }

    pub async fn sweep_expired(&self) {
        let Ok(mut entries) = tokio::fs::read_dir(&self.dir).await else {
            return;
        };
        while let Ok(Some(entry)) = entries.next_entry().await {
            let path = entry.path();
            if path.extension().and_then(|ext| ext.to_str()) != Some("json") {
                continue;
            }
            let remove = match tokio::fs::read(&path)
                .await
                .ok()
                .and_then(|bytes| serde_json::from_slice::<CacheMeta>(&bytes).ok())
            {
                Some(meta) => now_ts() >= meta.expires_at,
                None => true,
            };
            if remove {
                let _ = tokio::fs::remove_file(&path).await;
                let _ = tokio::fs::remove_file(path.with_extension("body")).await;
            }
        }
    }

    pub fn response_from_entry(&self, entry: CacheEntry, head: bool) -> Response<Body> {
        let mut response = Response::new(if head {
            Body::empty()
        } else {
            Body::from(entry.body)
        });
        *response.status_mut() = StatusCode::from_u16(entry.meta.status).unwrap_or(StatusCode::OK);
        for (name, value) in entry.meta.headers {
            if let (Ok(name), Ok(value)) =
                (HeaderName::try_from(name), HeaderValue::from_str(&value))
            {
                response.headers_mut().insert(name, value);
            }
        }
        response
            .headers_mut()
            .insert("x-starcdn-cache", HeaderValue::from_static("HIT"));
        response.headers_mut().insert(
            "age",
            HeaderValue::from_str(&(now_ts() - entry.meta.created_at).max(0).to_string())
                .unwrap_or_else(|_| HeaderValue::from_static("0")),
        );
        response
    }

    fn meta_path(&self, key: &str) -> PathBuf {
        self.dir.join(format!("{}.json", key))
    }

    fn body_path(&self, key: &str) -> PathBuf {
        self.dir.join(format!("{}.body", key))
    }

    async fn atomic_write(&self, path: &Path, data: &[u8]) -> Result<(), std::io::Error> {
        let tmp = path.with_extension("tmp");
        tokio::fs::write(&tmp, data).await?;
        tokio::fs::rename(tmp, path).await
    }
}

pub fn now_ts() -> i64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs() as i64
}
