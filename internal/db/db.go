package db

import (
	"database/sql"
	"encoding/json"
	"time"

	_ "modernc.org/sqlite"
)

type DB struct {
	*sql.DB
}

func New(path string) (*DB, error) {
	db, err := sql.Open("sqlite", path+"?_pragma=journal_mode(WAL)&_pragma=busy_timeout(5000)")
	if err != nil {
		return nil, err
	}

	if err := db.Ping(); err != nil {
		return nil, err
	}

	if err := migrate(db); err != nil {
		return nil, err
	}

	return &DB{db}, nil
}

func migrate(db *sql.DB) error {
	schema := `
	CREATE TABLE IF NOT EXISTS users (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		username TEXT NOT NULL UNIQUE,
		password_hash TEXT NOT NULL DEFAULT '',
		passkey_credentials_json TEXT NOT NULL DEFAULT '[]',
		created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
		updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
	);

	CREATE TABLE IF NOT EXISTS sessions (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		user_id INTEGER NOT NULL,
		token TEXT NOT NULL UNIQUE,
		expires_at DATETIME NOT NULL,
		created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
		FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
	);

	CREATE TABLE IF NOT EXISTS traffic_stats (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		request_path TEXT NOT NULL UNIQUE,
		request_count INTEGER NOT NULL DEFAULT 1,
		bytes_sent INTEGER NOT NULL DEFAULT 0,
		last_accessed DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
	);

	CREATE INDEX IF NOT EXISTS idx_traffic_path ON traffic_stats(request_path);

	CREATE TABLE IF NOT EXISTS ban_rules (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		pattern TEXT NOT NULL,
		type TEXT NOT NULL CHECK(type IN ('URL', 'package')),
		reason TEXT NOT NULL DEFAULT '',
		created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
		enabled INTEGER NOT NULL DEFAULT 1
	);

	CREATE INDEX IF NOT EXISTS idx_ban_pattern ON ban_rules(pattern);
	`
	_, err := db.Exec(schema)
	return err
}

type User struct {
	ID                    int64     `json:"id"`
	Username              string    `json:"username"`
	PasswordHash          string    `json:"-"`
	PasskeyCredentialsRaw string    `json:"-"`
	CreatedAt             time.Time `json:"created_at"`
	UpdatedAt             time.Time `json:"updated_at"`
}

func (u *User) PasskeyCredentials() []json.RawMessage {
	var creds []json.RawMessage
	_ = json.Unmarshal([]byte(u.PasskeyCredentialsRaw), &creds)
	return creds
}

func (u *User) SetPasskeyCredentials(creds []json.RawMessage) {
	data, _ := json.Marshal(creds)
	u.PasskeyCredentialsRaw = string(data)
}

func (d *DB) CreateUser(username, passwordHash string) (*User, error) {
	result, err := d.Exec(
		"INSERT INTO users (username, password_hash) VALUES (?, ?)",
		username, passwordHash,
	)
	if err != nil {
		return nil, err
	}
	id, _ := result.LastInsertId()
	return d.GetUserByID(id)
}

func (d *DB) GetUserByUsername(username string) (*User, error) {
	u := &User{}
	err := d.QueryRow(
		"SELECT id, username, password_hash, passkey_credentials_json, created_at, updated_at FROM users WHERE username = ?",
		username,
	).Scan(&u.ID, &u.Username, &u.PasswordHash, &u.PasskeyCredentialsRaw, &u.CreatedAt, &u.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return u, nil
}

func (d *DB) GetUserByID(id int64) (*User, error) {
	u := &User{}
	err := d.QueryRow(
		"SELECT id, username, password_hash, passkey_credentials_json, created_at, updated_at FROM users WHERE id = ?",
		id,
	).Scan(&u.ID, &u.Username, &u.PasswordHash, &u.PasskeyCredentialsRaw, &u.CreatedAt, &u.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return u, nil
}

func (d *DB) UpdatePasskeyCredentials(userID int64, creds []json.RawMessage) error {
	data, _ := json.Marshal(creds)
	_, err := d.Exec(
		"UPDATE users SET passkey_credentials_json = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
		string(data), userID,
	)
	return err
}

func (d *DB) UpdatePassword(userID int64, passwordHash string) error {
	_, err := d.Exec(
		"UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
		passwordHash, userID,
	)
	return err
}

type Session struct {
	ID        int64     `json:"id"`
	UserID    int64     `json:"user_id"`
	Token     string    `json:"token"`
	ExpiresAt time.Time `json:"expires_at"`
	CreatedAt time.Time `json:"created_at"`
}

func (d *DB) CreateSession(userID int64, token string, expiresAt time.Time) (*Session, error) {
	result, err := d.Exec(
		"INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)",
		userID, token, expiresAt,
	)
	if err != nil {
		return nil, err
	}
	id, _ := result.LastInsertId()
	return d.GetSession(id)
}

func (d *DB) GetSession(id int64) (*Session, error) {
	s := &Session{}
	err := d.QueryRow(
		"SELECT id, user_id, token, expires_at, created_at FROM sessions WHERE id = ?",
		id,
	).Scan(&s.ID, &s.UserID, &s.Token, &s.ExpiresAt, &s.CreatedAt)
	if err != nil {
		return nil, err
	}
	return s, nil
}

func (d *DB) GetSessionByToken(token string) (*Session, error) {
	s := &Session{}
	err := d.QueryRow(
		"SELECT id, user_id, token, expires_at, created_at FROM sessions WHERE token = ? AND expires_at > CURRENT_TIMESTAMP",
		token,
	).Scan(&s.ID, &s.UserID, &s.Token, &s.ExpiresAt, &s.CreatedAt)
	if err != nil {
		return nil, err
	}
	return s, nil
}

func (d *DB) DeleteSession(token string) error {
	_, err := d.Exec("DELETE FROM sessions WHERE token = ?", token)
	return err
}

func (d *DB) CleanExpiredSessions() error {
	_, err := d.Exec("DELETE FROM sessions WHERE expires_at <= CURRENT_TIMESTAMP")
	return err
}

func (d *DB) UpsertTrafficStats(requestPath string, bytesSent int64) error {
	_, err := d.Exec(
		`INSERT INTO traffic_stats (request_path, request_count, bytes_sent, last_accessed)
		 VALUES (?, 1, ?, CURRENT_TIMESTAMP)
		 ON CONFLICT(request_path) DO UPDATE SET
		 request_count = request_count + 1,
		 bytes_sent = bytes_sent + ?,
		 last_accessed = CURRENT_TIMESTAMP`,
		requestPath, bytesSent, bytesSent,
	)
	return err
}

type TrafficSummary struct {
	TotalRequests   int64  `json:"total_requests"`
	TotalBytesSent  int64  `json:"total_bytes_sent"`
	UniquePaths     int64  `json:"unique_paths"`
	TopURLs         []TopURL `json:"top_urls"`
}

type TopURL struct {
	RequestPath  string `json:"request_path"`
	RequestCount int64  `json:"request_count"`
	BytesSent    int64  `json:"bytes_sent"`
}

func (d *DB) GetTrafficSummary() (*TrafficSummary, error) {
	s := &TrafficSummary{}
	var err error

	err = d.QueryRow("SELECT COUNT(DISTINCT request_path), COALESCE(SUM(request_count), 0), COALESCE(SUM(bytes_sent), 0) FROM traffic_stats").
		Scan(&s.UniquePaths, &s.TotalRequests, &s.TotalBytesSent)
	if err != nil {
		return nil, err
	}

	rows, err := d.Query(
		"SELECT request_path, request_count, bytes_sent FROM traffic_stats ORDER BY request_count DESC LIMIT 20",
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	s.TopURLs = make([]TopURL, 0)
	for rows.Next() {
		var u TopURL
		if err := rows.Scan(&u.RequestPath, &u.RequestCount, &u.BytesSent); err != nil {
			continue
		}
		s.TopURLs = append(s.TopURLs, u)
	}
	return s, nil
}

type BanRule struct {
	ID        int64     `json:"id"`
	Pattern   string    `json:"pattern"`
	Type      string    `json:"type"`
	Reason    string    `json:"reason"`
	CreatedAt time.Time `json:"created_at"`
	Enabled   bool      `json:"enabled"`
}

func (d *DB) CreateBanRule(pattern, ruleType, reason string) (*BanRule, error) {
	result, err := d.Exec(
		"INSERT INTO ban_rules (pattern, type, reason) VALUES (?, ?, ?)",
		pattern, ruleType, reason,
	)
	if err != nil {
		return nil, err
	}
	id, _ := result.LastInsertId()
	return d.GetBanRule(id)
}

func (d *DB) GetBanRule(id int64) (*BanRule, error) {
	b := &BanRule{}
	err := d.QueryRow(
		"SELECT id, pattern, type, reason, created_at, enabled FROM ban_rules WHERE id = ?",
		id,
	).Scan(&b.ID, &b.Pattern, &b.Type, &b.Reason, &b.CreatedAt, &b.Enabled)
	if err != nil {
		return nil, err
	}
	return b, nil
}

func (d *DB) ListBanRules() ([]BanRule, error) {
	rows, err := d.Query(
		"SELECT id, pattern, type, reason, created_at, enabled FROM ban_rules ORDER BY created_at DESC",
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var rules []BanRule
	for rows.Next() {
		var b BanRule
		if err := rows.Scan(&b.ID, &b.Pattern, &b.Type, &b.Reason, &b.CreatedAt, &b.Enabled); err != nil {
			continue
		}
		rules = append(rules, b)
	}
	return rules, nil
}

func (d *DB) DeleteBanRule(id int64) error {
	_, err := d.Exec("DELETE FROM ban_rules WHERE id = ?", id)
	return err
}

func (d *DB) ToggleBanRule(id int64, enabled bool) error {
	_, err := d.Exec("UPDATE ban_rules SET enabled = ? WHERE id = ?", enabled, id)
	return err
}

func (d *DB) IsPathBanned(requestPath string) (bool, string, error) {
	rows, err := d.Query(
		"SELECT pattern, type FROM ban_rules WHERE enabled = 1",
	)
	if err != nil {
		return false, "", err
	}
	defer rows.Close()

	for rows.Next() {
		var pattern, ruleType string
		if err := rows.Scan(&pattern, &ruleType); err != nil {
			continue
		}
		if matchBanPattern(requestPath, pattern, ruleType) {
			return true, pattern, nil
		}
	}
	return false, "", nil
}

func matchBanPattern(requestPath, pattern, ruleType string) bool {
	if pattern == "" {
		return false
	}
	if ruleType == "URL" {
		return requestPath == pattern || (pattern[len(pattern)-1] == '*' && len(requestPath) >= len(pattern)-1 && requestPath[:len(pattern)-1] == pattern[:len(pattern)-1])
	}
	return requestPath == pattern || (pattern[len(pattern)-1] == '*' && len(requestPath) >= len(pattern)-1 && requestPath[:len(pattern)-1] == pattern[:len(pattern)-1])
}
