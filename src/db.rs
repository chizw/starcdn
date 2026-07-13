use std::{path::Path, time::Duration};

use chrono::{DateTime, Utc};
use sqlx::{
    sqlite::{SqliteConnectOptions, SqlitePoolOptions},
    Row, SqlitePool,
};

use crate::config::Config;

#[derive(Clone)]
pub struct Database {
    pool: SqlitePool,
}

#[derive(Debug, serde::Serialize)]
pub struct BanRuleRecord {
    pub id: i64,
    pub pattern: String,
    pub mode: String,
    pub reason: String,
    pub enabled: bool,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, serde::Serialize)]
pub struct TopUrl {
    pub request_path: String,
    pub request_count: i64,
    pub bytes_sent: i64,
}

#[derive(Debug, serde::Serialize)]
pub struct StatsSummary {
    pub total_requests: i64,
    pub total_bytes_sent: i64,
    pub unique_paths: i64,
    pub total_pages: i64,
    pub current_page: i64,
    pub page_size: i64,
    pub top_urls: Vec<TopUrl>,
}

impl Database {
    pub async fn connect(config: &Config) -> Result<Self, Box<dyn std::error::Error>> {
        if let Some(parent) = Path::new(&config.db_path).parent() {
            tokio::fs::create_dir_all(parent).await?;
        }
        let options = SqliteConnectOptions::new()
            .filename(&config.db_path)
            .create_if_missing(true);
        let pool = SqlitePoolOptions::new()
            .max_connections(8)
            .acquire_timeout(Duration::from_secs(5))
            .connect_with(options)
            .await?;
        let database = Self { pool };
        database.migrate(config.db_reset).await?;
        database
            .ensure_admin(&config.admin_user, &config.admin_pass)
            .await?;
        Ok(database)
    }

    pub fn pool(&self) -> &SqlitePool {
        &self.pool
    }

    async fn migrate(&self, reset: bool) -> Result<(), sqlx::Error> {
        let legacy =
            sqlx::query("SELECT name FROM sqlite_master WHERE type='table' AND name='users'")
                .fetch_optional(&self.pool)
                .await?
                .is_some()
                && sqlx::query("PRAGMA table_info(users)")
                    .fetch_all(&self.pool)
                    .await?
                    .iter()
                    .any(|row| row.get::<String, _>("name") == "passkey_credentials_json");
        if legacy && !reset {
            return Err(sqlx::Error::Protocol("detected legacy Go database schema; backup data and set STARCDN_DB_RESET=true to rebuild".to_string()));
        }
        if reset {
            for table in [
                "users",
                "sessions",
                "traffic_stats",
                "ban_rules",
                "cache_purge_logs",
                "schema_migrations",
            ] {
                sqlx::query(&format!("DROP TABLE IF EXISTS {}", table))
                    .execute(&self.pool)
                    .await?;
            }
        }
        sqlx::query("CREATE TABLE IF NOT EXISTS schema_migrations (version INTEGER PRIMARY KEY, applied_at TEXT NOT NULL)").execute(&self.pool).await?;
        sqlx::query("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)").execute(&self.pool).await?;
        sqlx::query("CREATE TABLE IF NOT EXISTS sessions (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, token TEXT NOT NULL UNIQUE, expires_at TEXT NOT NULL, created_at TEXT NOT NULL)").execute(&self.pool).await?;
        sqlx::query("CREATE TABLE IF NOT EXISTS traffic_stats (request_path TEXT PRIMARY KEY, request_count INTEGER NOT NULL DEFAULT 0, bytes_sent INTEGER NOT NULL DEFAULT 0, last_accessed TEXT NOT NULL)").execute(&self.pool).await?;
        sqlx::query("CREATE TABLE IF NOT EXISTS ban_rules (id INTEGER PRIMARY KEY AUTOINCREMENT, pattern TEXT NOT NULL, mode TEXT NOT NULL DEFAULT 'glob', reason TEXT NOT NULL DEFAULT '', enabled INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)").execute(&self.pool).await?;
        sqlx::query("CREATE TABLE IF NOT EXISTS cache_purge_logs (id INTEGER PRIMARY KEY AUTOINCREMENT, target TEXT NOT NULL, mode TEXT NOT NULL, created_at TEXT NOT NULL)").execute(&self.pool).await?;
        Ok(())
    }

    async fn ensure_admin(&self, username: &str, password: &str) -> Result<(), sqlx::Error> {
        let exists = sqlx::query("SELECT id FROM users WHERE username = ?")
            .bind(username)
            .fetch_optional(&self.pool)
            .await?
            .is_some();
        if !exists {
            let now = Utc::now().to_rfc3339();
            let hash =
                crate::auth::hash_password(password).map_err(|err| sqlx::Error::Protocol(err))?;
            sqlx::query("INSERT INTO users (username, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?)").bind(username).bind(hash).bind(&now).bind(&now).execute(&self.pool).await?;
        }
        Ok(())
    }

    pub async fn record_traffic(&self, path: &str, bytes: i64) {
        let now = Utc::now().to_rfc3339();
        let _ = sqlx::query("INSERT INTO traffic_stats (request_path, request_count, bytes_sent, last_accessed) VALUES (?, 1, ?, ?) ON CONFLICT(request_path) DO UPDATE SET request_count = request_count + 1, bytes_sent = bytes_sent + excluded.bytes_sent, last_accessed = excluded.last_accessed")
            .bind(path).bind(bytes).bind(now).execute(&self.pool).await;
    }

    pub async fn stats(&self, page: i64, page_size: i64) -> Result<StatsSummary, sqlx::Error> {
        let total = sqlx::query("SELECT COALESCE(SUM(request_count),0) requests, COALESCE(SUM(bytes_sent),0) bytes, COUNT(*) paths FROM traffic_stats").fetch_one(&self.pool).await?;
        let unique_paths = total.get::<i64, _>("paths");
        let total_pages = ((unique_paths + page_size - 1) / page_size).max(1);
        let page = page.clamp(1, total_pages);
        let offset = (page - 1) * page_size;
        let rows = sqlx::query("SELECT request_path, request_count, bytes_sent FROM traffic_stats ORDER BY request_count DESC LIMIT ? OFFSET ?").bind(page_size).bind(offset).fetch_all(&self.pool).await?;
        let top_urls = rows
            .into_iter()
            .map(|row| TopUrl {
                request_path: row.get("request_path"),
                request_count: row.get("request_count"),
                bytes_sent: row.get("bytes_sent"),
            })
            .collect();
        Ok(StatsSummary {
            total_requests: total.get("requests"),
            total_bytes_sent: total.get("bytes"),
            unique_paths,
            total_pages,
            current_page: page,
            page_size,
            top_urls,
        })
    }

    pub async fn list_bans(&self) -> Result<Vec<BanRuleRecord>, sqlx::Error> {
        let rows = sqlx::query("SELECT id, pattern, mode, reason, enabled, created_at, updated_at FROM ban_rules ORDER BY id DESC").fetch_all(&self.pool).await?;
        Ok(rows
            .into_iter()
            .map(|row| BanRuleRecord {
                id: row.get("id"),
                pattern: row.get("pattern"),
                mode: row.get("mode"),
                reason: row.get("reason"),
                enabled: row.get::<i64, _>("enabled") != 0,
                created_at: row.get("created_at"),
                updated_at: row.get("updated_at"),
            })
            .collect())
    }

    pub async fn create_ban(
        &self,
        pattern: &str,
        mode: &str,
        reason: &str,
    ) -> Result<BanRuleRecord, sqlx::Error> {
        let now: DateTime<Utc> = Utc::now();
        let now = now.to_rfc3339();
        let id = sqlx::query("INSERT INTO ban_rules (pattern, mode, reason, enabled, created_at, updated_at) VALUES (?, ?, ?, 1, ?, ?)").bind(pattern).bind(mode).bind(reason).bind(&now).bind(&now).execute(&self.pool).await?.last_insert_rowid();
        Ok(BanRuleRecord {
            id,
            pattern: pattern.to_string(),
            mode: mode.to_string(),
            reason: reason.to_string(),
            enabled: true,
            created_at: now.clone(),
            updated_at: now,
        })
    }

    pub async fn delete_ban(&self, id: i64) -> Result<(), sqlx::Error> {
        sqlx::query("DELETE FROM ban_rules WHERE id = ?")
            .bind(id)
            .execute(&self.pool)
            .await?;
        Ok(())
    }
}
