package auth

import (
	"bytes"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"starcdn/internal/db"

	"github.com/go-webauthn/webauthn/protocol"
	"github.com/go-webauthn/webauthn/webauthn"
	"github.com/golang-jwt/jwt/v5"
	"github.com/tinylib/msgp/msgp"
	"golang.org/x/crypto/bcrypt"
)

type Config struct {
	RPID          string
	RPOrigin      string
	JWTSecret     string
	JWTExpiration time.Duration
}

type Service struct {
	cfg Config
	wa  *webauthn.WebAuthn
	db  *db.DB
}

func New(cfg Config, database *db.DB) (*Service, error) {
	waConfig := &webauthn.Config{
		RPDisplayName: "StarCDN Admin",
		RPID:          cfg.RPID,
		RPOrigins:     []string{cfg.RPOrigin},
	}
	wa, err := webauthn.New(waConfig)
	if err != nil {
		return nil, fmt.Errorf("failed to create webauthn: %w", err)
	}

	return &Service{
		cfg: cfg,
		wa:  wa,
		db:  database,
	}, nil
}

type userForWebAuthn struct {
	*db.User
}

func (u userForWebAuthn) WebAuthnID() []byte {
	return []byte(fmt.Sprintf("%d", u.ID))
}

func (u userForWebAuthn) WebAuthnName() string {
	return u.Username
}

func (u userForWebAuthn) WebAuthnDisplayName() string {
	return u.Username
}

func (u userForWebAuthn) WebAuthnCredentials() []webauthn.Credential {
	rawCreds := u.PasskeyCredentials()
	creds := make([]webauthn.Credential, 0, len(rawCreds))
	for _, raw := range rawCreds {
		var cred webauthn.Credential
		if err := cred.UnmarshalJSON(raw); err == nil {
			creds = append(creds, cred)
		}
	}
	return creds
}

func (u userForWebAuthn) WebAuthnIcon() string {
	return ""
}

func (s *Service) HashPassword(password string) (string, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(hash), nil
}

func (s *Service) VerifyPassword(hash, password string) bool {
	return bcrypt.CompareHashAndPassword([]byte(hash), []byte(password)) == nil
}

func (s *Service) GenerateJWT(userID int64, username string) (string, time.Time, error) {
	expiresAt := time.Now().Add(s.cfg.JWTExpiration)
	claims := jwt.MapClaims{
		"sub":      fmt.Sprintf("%d", userID),
		"username": username,
		"exp":      expiresAt.Unix(),
		"iat":      time.Now().Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signed, err := token.SignedString([]byte(s.cfg.JWTSecret))
	if err != nil {
		return "", time.Time{}, err
	}
	return signed, expiresAt, nil
}

func (s *Service) ValidateJWT(tokenStr string) (int64, string, error) {
	token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", t.Header["alg"])
		}
		return []byte(s.cfg.JWTSecret), nil
	})
	if err != nil || !token.Valid {
		return 0, "", fmt.Errorf("invalid token")
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return 0, "", fmt.Errorf("invalid claims")
	}

	sub, _ := claims["sub"].(string)
	var userID int64
	fmt.Sscanf(sub, "%d", &userID)
	username, _ := claims["username"].(string)
	return userID, username, nil
}

func (s *Service) LoginPassword(username, password string) (string, error) {
	user, err := s.db.GetUserByUsername(username)
	if err != nil {
		return "", fmt.Errorf("invalid credentials")
	}

	if user.PasswordHash == "" || !s.VerifyPassword(user.PasswordHash, password) {
		return "", fmt.Errorf("invalid credentials")
	}

	jwtToken, expiresAt, err := s.GenerateJWT(user.ID, user.Username)
	if err != nil {
		return "", fmt.Errorf("failed to generate token: %w", err)
	}

	_, err = s.db.CreateSession(user.ID, jwtToken, expiresAt)
	if err != nil {
		return "", fmt.Errorf("failed to create session: %w", err)
	}

	return jwtToken, nil
}

func (s *Service) Logout(token string) error {
	return s.db.DeleteSession(token)
}

func marshalSessionData(session *webauthn.SessionData) ([]byte, error) {
	var buf bytes.Buffer
	w := msgp.NewWriter(&buf)
	if err := session.EncodeMsg(w); err != nil {
		return nil, err
	}
	w.Flush()
	return buf.Bytes(), nil
}

func unmarshalSessionData(data []byte) (*webauthn.SessionData, error) {
	r := msgp.NewReader(bytes.NewReader(data))
	var session webauthn.SessionData
	if err := session.DecodeMsg(r); err != nil {
		return nil, err
	}
	return &session, nil
}

func (s *Service) setCookie(w http.ResponseWriter, name, value string, maxAge int) {
	http.SetCookie(w, &http.Cookie{
		Name:     name,
		Value:    value,
		Path:     "/admin",
		MaxAge:   maxAge,
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteLaxMode,
	})
}

func (s *Service) BeginPasskeyRegistration(userID int64, w http.ResponseWriter) (*protocol.CredentialCreation, error) {
	user, err := s.db.GetUserByID(userID)
	if err != nil {
		return nil, err
	}
	waUser := userForWebAuthn{user}
	options, session, err := s.wa.BeginRegistration(&waUser)
	if err != nil {
		return nil, err
	}

	sessionBytes, err := marshalSessionData(session)
	if err != nil {
		return nil, err
	}
	sessionStr := hex.EncodeToString(sessionBytes)

	s.setCookie(w, "webauthn_session", sessionStr, 300)

	return options, nil
}

func (s *Service) FinishPasskeyRegistration(userID int64, r *http.Request) error {
	user, err := s.db.GetUserByID(userID)
	if err != nil {
		return err
	}

	cookie, err := r.Cookie("webauthn_session")
	if err != nil {
		return fmt.Errorf("session cookie not found")
	}

	sessionBytes, err := hex.DecodeString(cookie.Value)
	if err != nil {
		return fmt.Errorf("invalid session")
	}

	session, err := unmarshalSessionData(sessionBytes)
	if err != nil {
		return fmt.Errorf("invalid session data: %w", err)
	}

	bodyBytes, err := io.ReadAll(r.Body)
	if err != nil {
		return fmt.Errorf("failed to read request body: %w", err)
	}
	parsedResponse, err := protocol.ParseCredentialCreationResponseBytes(bodyBytes)
	if err != nil {
		return fmt.Errorf("failed to parse credential creation response: %w", err)
	}

	waUser := userForWebAuthn{user}
	credential, err := s.wa.CreateCredential(&waUser, *session, parsedResponse)
	if err != nil {
		return err
	}

	creds := user.PasskeyCredentials()
	credJSON, _ := json.Marshal(credential)
	creds = append(creds, credJSON)

	return s.db.UpdatePasskeyCredentials(userID, creds)
}

func (s *Service) BeginPasskeyLogin(w http.ResponseWriter) (*protocol.CredentialAssertion, error) {
	options, session, err := s.wa.BeginDiscoverableLogin()
	if err != nil {
		return nil, err
	}

	sessionBytes, err := marshalSessionData(session)
	if err != nil {
		return nil, err
	}
	sessionStr := hex.EncodeToString(sessionBytes)

	s.setCookie(w, "webauthn_session", sessionStr, 300)

	return options, nil
}

func (s *Service) FinishPasskeyLogin(r *http.Request) (string, error) {
	cookie, err := r.Cookie("webauthn_session")
	if err != nil {
		return "", fmt.Errorf("session cookie not found")
	}

	sessionBytes, err := hex.DecodeString(cookie.Value)
	if err != nil {
		return "", fmt.Errorf("invalid session")
	}

	session, err := unmarshalSessionData(sessionBytes)
	if err != nil {
		return "", fmt.Errorf("invalid session data: %w", err)
	}

	user, _, err := s.wa.FinishPasskeyLogin(s.findUserByCredentialHandle, *session, r)
	if err != nil {
		return "", err
	}

	dbUser, ok := user.(*dbUserWrapper)
	if !ok {
		return "", fmt.Errorf("user type assertion failed")
	}

	jwtToken, expiresAt, err := s.GenerateJWT(dbUser.ID, dbUser.Username)
	if err != nil {
		return "", err
	}

	_, err = s.db.CreateSession(dbUser.ID, jwtToken, expiresAt)
	if err != nil {
		return "", err
	}

	return jwtToken, nil
}

func (s *Service) findUserByCredentialHandle(rawID, userHandle []byte) (webauthn.User, error) {
	users, err := s.getAllUsers()
	if err != nil {
		return nil, err
	}

	for _, u := range users {
		waUser := userForWebAuthn{u}
		for _, cred := range waUser.WebAuthnCredentials() {
			if bytes.Equal(cred.ID, rawID) {
				return &dbUserWrapper{u}, nil
			}
		}
	}
	return nil, fmt.Errorf("user not found")
}

type dbUserWrapper struct {
	*db.User
}

func (u *dbUserWrapper) WebAuthnID() []byte {
	return []byte(fmt.Sprintf("%d", u.ID))
}

func (u *dbUserWrapper) WebAuthnName() string {
	return u.Username
}

func (u *dbUserWrapper) WebAuthnDisplayName() string {
	return u.Username
}

func (u *dbUserWrapper) WebAuthnCredentials() []webauthn.Credential {
	rawCreds := u.PasskeyCredentials()
	creds := make([]webauthn.Credential, 0, len(rawCreds))
	for _, raw := range rawCreds {
		var cred webauthn.Credential
		if err := cred.UnmarshalJSON(raw); err == nil {
			creds = append(creds, cred)
		}
	}
	return creds
}

func (u *dbUserWrapper) WebAuthnIcon() string {
	return ""
}

func (s *Service) findUserByCredential(targetCred *webauthn.Credential) (*db.User, error) {
	users, err := s.getAllUsers()
	if err != nil {
		return nil, err
	}

	for _, u := range users {
		waUser := userForWebAuthn{u}
		for _, cred := range waUser.WebAuthnCredentials() {
			if bytes.Equal(cred.ID, targetCred.ID) {
				return u, nil
			}
		}
	}
	return nil, fmt.Errorf("user not found")
}

func (s *Service) getAllUsers() ([]*db.User, error) {
	rows, err := s.db.Query("SELECT id, username, password_hash, passkey_credentials_json, created_at, updated_at FROM users")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []*db.User
	for rows.Next() {
		u := &db.User{}
		if err := rows.Scan(&u.ID, &u.Username, &u.PasswordHash, &u.PasskeyCredentialsRaw, &u.CreatedAt, &u.UpdatedAt); err != nil {
			continue
		}
		users = append(users, u)
	}
	return users, nil
}

func GenerateSecureKey() string {
	b := make([]byte, 32)
	rand.Read(b)
	return hex.EncodeToString(b)
}

func (s *Service) InitAdminUser(username, password string) error {
	_, err := s.db.GetUserByUsername(username)
	if err == nil {
		return nil
	}

	hash, err := s.HashPassword(password)
	if err != nil {
		return err
	}

	_, err = s.db.CreateUser(username, hash)
	return err
}

func (s *Service) ClearPasskeyCookie(name string, w http.ResponseWriter) {
	http.SetCookie(w, &http.Cookie{
		Name:   name,
		Value:  "",
		Path:   "/admin",
		MaxAge: -1,
	})
}
