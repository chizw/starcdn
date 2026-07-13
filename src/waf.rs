use globset::{Glob, GlobMatcher};
use regex::Regex;
use sqlx::Row;

use crate::db::Database;

#[derive(Clone, Debug, PartialEq, Eq)]
pub enum WafMode {
    Exact,
    Prefix,
    Suffix,
    Ext,
    Glob,
    Regex,
}

#[derive(Clone)]
pub struct WafEngine {
    db: Database,
}

impl WafEngine {
    pub fn new(db: Database) -> Self {
        Self { db }
    }

    pub async fn is_banned(&self, request_path: &str) -> bool {
        let Ok(rows) = sqlx::query("SELECT pattern, mode FROM ban_rules WHERE enabled = 1")
            .fetch_all(self.db.pool())
            .await
        else {
            return false;
        };
        rows.into_iter().any(|row| {
            let pattern: String = row.get("pattern");
            let mode: String = row.get("mode");
            WafRule {
                pattern,
                mode: parse_mode(&mode),
            }
            .matches(request_path)
        })
    }
}

pub fn parse_mode(mode: &str) -> WafMode {
    match mode {
        "exact" => WafMode::Exact,
        "prefix" => WafMode::Prefix,
        "suffix" => WafMode::Suffix,
        "ext" => WafMode::Ext,
        "regex" => WafMode::Regex,
        _ => WafMode::Glob,
    }
}

#[derive(Clone, Debug)]
pub struct WafRule {
    pub pattern: String,
    pub mode: WafMode,
}

impl WafRule {
    pub fn matches(&self, request_path: &str) -> bool {
        match self.mode {
            WafMode::Exact => request_path == self.pattern,
            WafMode::Prefix => request_path.starts_with(&self.pattern),
            WafMode::Suffix => request_path.ends_with(&self.pattern),
            WafMode::Ext => self.pattern.split(',').any(|ext| {
                let ext = ext.trim().trim_start_matches('.').to_ascii_lowercase();
                !ext.is_empty()
                    && request_path
                        .to_ascii_lowercase()
                        .ends_with(&format!(".{}", ext))
            }),
            WafMode::Glob => matcher(&self.pattern)
                .map(|m| m.is_match(request_path))
                .unwrap_or(false),
            WafMode::Regex => Regex::new(&self.pattern)
                .map(|re| re.is_match(request_path))
                .unwrap_or(false),
        }
    }
}

fn matcher(pattern: &str) -> Result<GlobMatcher, globset::Error> {
    Ok(Glob::new(pattern)?.compile_matcher())
}
