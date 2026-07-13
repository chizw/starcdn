use argon2::{password_hash::{PasswordHash, PasswordHasher, PasswordVerifier, SaltString}, Argon2};
use axum::{extract::State, http::{header, HeaderMap, StatusCode}, Json};
use chrono::{Duration, Utc};
use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, Validation};
use rand_core::OsRng;
use serde::{Deserialize, Serialize};
use sqlx::Row;

use crate::app::AppState;

#[derive(Debug, Deserialize)]
pub struct LoginRequest {
    pub username: String,
    pub password: String,
}

#[derive(Debug, Deserialize)]
pub struct ChangePasswordRequest {
    pub old_password: String,
    pub new_password: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String,
    pub username: String,
    pub exp: usize,
    pub iat: usize,
}

pub fn hash_password(password: &str) -> Result<String, String> {
    let salt = SaltString::generate(&mut OsRng);
    Argon2::default().hash_password(password.as_bytes(), &salt).map(|hash| hash.to_string()).map_err(|err| err.to_string())
}

fn verify_password(password: &str, hash: &str) -> bool {
    let Ok(parsed) = PasswordHash::new(hash) else { return false };
    Argon2::default().verify_password(password.as_bytes(), &parsed).is_ok()
}

pub fn token_for(user_id: i64, username: &str, secret: &str) -> Result<String, jsonwebtoken::errors::Error> {
    let now = Utc::now();
    let claims = Claims { sub: user_id.to_string(), username: username.to_string(), iat: now.timestamp() as usize, exp: (now + Duration::hours(24)).timestamp() as usize };
    encode(&Header::default(), &claims, &EncodingKey::from_secret(secret.as_bytes()))
}

pub fn validate_token(token: &str, secret: &str) -> Option<Claims> {
    decode::<Claims>(token, &DecodingKey::from_secret(secret.as_bytes()), &Validation::default()).ok().map(|data| data.claims)
}

pub fn extract_token(headers: &HeaderMap) -> Option<String> {
    if let Some(value) = headers.get(header::AUTHORIZATION).and_then(|value| value.to_str().ok()) {
        if let Some(token) = value.strip_prefix("Bearer ") {
            return Some(token.to_string());
        }
    }
    headers.get(header::COOKIE).and_then(|value| value.to_str().ok()).and_then(|cookie| {
        cookie.split(';').map(str::trim).find_map(|part| part.strip_prefix("admin_token=").map(str::to_string))
    })
}

pub async fn require_auth(headers: &HeaderMap, state: &AppState) -> Result<Claims, StatusCode> {
    let token = extract_token(headers).ok_or(StatusCode::UNAUTHORIZED)?;
    validate_token(&token, &state.config.jwt_secret).ok_or(StatusCode::UNAUTHORIZED)
}

pub async fn login(State(state): State<AppState>, Json(req): Json<LoginRequest>) -> Result<(HeaderMap, Json<serde_json::Value>), (StatusCode, Json<serde_json::Value>)> {
    let row = sqlx::query("SELECT id, username, password_hash FROM users WHERE username = ?").bind(&req.username).fetch_optional(state.db.pool()).await.map_err(|_| json_error(StatusCode::INTERNAL_SERVER_ERROR, "database error"))?;
    let Some(row) = row else { return Err(json_error(StatusCode::UNAUTHORIZED, "invalid credentials")) };
    let id: i64 = row.get("id");
    let username: String = row.get("username");
    let password_hash: String = row.get("password_hash");
    if !verify_password(&req.password, &password_hash) {
        return Err(json_error(StatusCode::UNAUTHORIZED, "invalid credentials"));
    }
    let token = token_for(id, &username, &state.config.jwt_secret).map_err(|_| json_error(StatusCode::INTERNAL_SERVER_ERROR, "token error"))?;
    let mut headers = HeaderMap::new();
    headers.insert(header::SET_COOKIE, format!("admin_token={}; Path=/; Max-Age=86400; SameSite=Lax", token).parse().unwrap());
    Ok((headers, Json(serde_json::json!({ "token": token }))))
}

pub async fn logout() -> (HeaderMap, Json<serde_json::Value>) {
    let mut headers = HeaderMap::new();
    headers.insert(header::SET_COOKIE, "admin_token=; Path=/; Max-Age=0; SameSite=Lax".parse().unwrap());
    (headers, Json(serde_json::json!({ "message": "logged out" })))
}

pub async fn change_password(State(state): State<AppState>, headers: HeaderMap, Json(req): Json<ChangePasswordRequest>) -> Result<Json<serde_json::Value>, (StatusCode, Json<serde_json::Value>)> {
    let claims = require_auth(&headers, &state).await.map_err(|status| json_error(status, "unauthorized"))?;
    let user_id = claims.sub.parse::<i64>().map_err(|_| json_error(StatusCode::UNAUTHORIZED, "unauthorized"))?;
    let row = sqlx::query("SELECT password_hash FROM users WHERE id = ?").bind(user_id).fetch_one(state.db.pool()).await.map_err(|_| json_error(StatusCode::UNAUTHORIZED, "unauthorized"))?;
    let password_hash: String = row.get("password_hash");
    if !verify_password(&req.old_password, &password_hash) || req.new_password.len() < 6 {
        return Err(json_error(StatusCode::BAD_REQUEST, "invalid password"));
    }
    let new_hash = hash_password(&req.new_password).map_err(|_| json_error(StatusCode::INTERNAL_SERVER_ERROR, "hash error"))?;
    sqlx::query("UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?").bind(new_hash).bind(Utc::now().to_rfc3339()).bind(user_id).execute(state.db.pool()).await.map_err(|_| json_error(StatusCode::INTERNAL_SERVER_ERROR, "database error"))?;
    Ok(Json(serde_json::json!({ "message": "password changed" })))
}

fn json_error(status: StatusCode, message: &str) -> (StatusCode, Json<serde_json::Value>) {
    (status, Json(serde_json::json!({ "error": message })))
}
