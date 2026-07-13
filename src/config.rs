use std::time::Duration;

#[derive(Clone, Debug)]
pub struct Config {
    pub addr: String,
    pub static_dir: Option<String>,
    pub cache_dir: String,
    pub cache_ttl: Duration,
    pub db_path: String,
    pub admin_user: String,
    pub admin_pass: String,
    pub jwt_secret: String,
    pub flush_token: Option<String>,
    pub max_concurrency: usize,
    pub max_upstream_concurrency: usize,
    pub db_reset: bool,
}

pub fn parse_duration(value: &str) -> Option<Duration> {
    if value.is_empty() {
        return None;
    }
    let mut digits = String::new();
    let mut unit = String::new();
    for ch in value.chars() {
        if ch.is_ascii_digit() {
            if !unit.is_empty() {
                return None;
            }
            digits.push(ch);
        } else {
            unit.push(ch);
        }
    }
    let number = digits.parse::<u64>().ok()?;
    match unit.as_str() {
        "s" => Some(Duration::from_secs(number)),
        "m" => Some(Duration::from_secs(number * 60)),
        "h" => Some(Duration::from_secs(number * 60 * 60)),
        "d" => Some(Duration::from_secs(number * 60 * 60 * 24)),
        "" => Some(Duration::from_secs(number)),
        _ => None,
    }
}

impl Config {
    pub fn from_env() -> Self {
        Self {
            addr: env("STARCDN_ADDR", ":2606"),
            static_dir: std::env::var("STARCDN_STATIC_DIR").ok().filter(|value| !value.is_empty()),
            cache_dir: env("STARCDN_CACHE_DIR", ".cache/starcdn"),
            cache_ttl: std::env::var("STARCDN_CACHE_TTL").ok().and_then(|value| parse_duration(&value)).unwrap_or(Duration::from_secs(600)),
            db_path: env("STARCDN_DB_PATH", ".data/starcdn.db"),
            admin_user: env("STARCDN_ADMIN_USER", "admin"),
            admin_pass: env("STARCDN_ADMIN_PASS", "admin123"),
            jwt_secret: env("STARCDN_JWT_SECRET", "starcdn-rust-default-jwt-secret-change-me"),
            flush_token: std::env::var("STARCDN_FLUSH_TOKEN").ok().filter(|value| !value.is_empty()),
            max_concurrency: usize_env("STARCDN_MAX_CONCURRENCY", 4096),
            max_upstream_concurrency: usize_env("STARCDN_MAX_UPSTREAM_CONCURRENCY", 512),
            db_reset: bool_env("STARCDN_DB_RESET", false),
        }
    }
}

fn env(key: &str, fallback: &str) -> String {
    std::env::var(key).ok().filter(|value| !value.is_empty()).unwrap_or_else(|| fallback.to_string())
}

fn usize_env(key: &str, fallback: usize) -> usize {
    std::env::var(key).ok().and_then(|value| value.parse().ok()).unwrap_or(fallback)
}

fn bool_env(key: &str, fallback: bool) -> bool {
    std::env::var(key).ok().map(|value| matches!(value.as_str(), "1" | "true" | "TRUE" | "yes" | "YES")).unwrap_or(fallback)
}
