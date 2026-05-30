package admin

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"starcdn/internal/auth"
	"starcdn/internal/db"
)

type Handler struct {
	authSvc *auth.Service
	db      *db.DB
}

func NewHandler(authSvc *auth.Service, database *db.DB) *Handler {
	return &Handler{
		authSvc: authSvc,
		db:      database,
	}
}

func (h *Handler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	path := r.URL.Path

	switch {
	case path == "/admin/api/stats":
		h.requireAuth(w, r, h.handleGetStats)
	case path == "/admin/api/ban":
		switch r.Method {
		case http.MethodGet:
			h.requireAuth(w, r, h.handleListBans)
		case http.MethodPost:
			h.requireAuth(w, r, h.handleCreateBan)
		}
	case strings.HasPrefix(path, "/admin/api/ban/"):
		if r.Method == http.MethodDelete {
			id := extractBanID(path)
			if id == 0 {
				http.Error(w, "invalid ban ID", http.StatusBadRequest)
				return
			}
			h.requireAuthWithID(w, r, h.handleDeleteBan, id)
		} else {
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		}
	case path == "/admin/api/passkey/register/begin":
		h.requireAuth(w, r, h.handlePasskeyRegisterBegin)
	case path == "/admin/api/passkey/register/finish":
		h.requireAuth(w, r, h.handlePasskeyRegisterFinish)
	case path == "/admin/api/passkey/login/begin":
		h.handlePasskeyLoginBegin(w, r)
	case path == "/admin/api/passkey/login/finish":
		h.handlePasskeyLoginFinish(w, r)
	case path == "/admin/api/login":
		h.handlePasswordLogin(w, r)
	case path == "/admin/api/logout":
		h.requireAuth(w, r, h.handleLogout)
	case path == "/admin/api/flush":
		h.requireAuth(w, r, h.handleFlush)
	default:
		http.NotFound(w, r)
	}
}

func (h *Handler) requireAuth(w http.ResponseWriter, r *http.Request, handler func(http.ResponseWriter, *http.Request)) {
	token := extractToken(r)
	if token == "" {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	_, _, err := h.authSvc.ValidateJWT(token)
	if err != nil {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	handler(w, r)
}

func (h *Handler) requireAuthWithID(w http.ResponseWriter, r *http.Request, handler func(http.ResponseWriter, *http.Request, int64), banID int64) {
	token := extractToken(r)
	if token == "" {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	_, _, err := h.authSvc.ValidateJWT(token)
	if err != nil {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	handler(w, r, banID)
}

func extractToken(r *http.Request) string {
	authHeader := r.Header.Get("Authorization")
	if strings.HasPrefix(authHeader, "Bearer ") {
		return strings.TrimPrefix(authHeader, "Bearer ")
	}

	cookie, err := r.Cookie("admin_token")
	if err == nil {
		return cookie.Value
	}

	return ""
}

func extractBanID(path string) int64 {
	parts := strings.Split(strings.Trim(path, "/"), "/")
	if len(parts) < 4 {
		return 0
	}
	var id int64
	for _, c := range parts[3] {
		if c >= '0' && c <= '9' {
			id = id*10 + int64(c-'0')
		} else {
			return 0
		}
	}
	return id
}

type loginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

func (h *Handler) handlePasswordLogin(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req loginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid request"})
		return
	}

	token, err := h.authSvc.LoginPassword(req.Username, req.Password)
	if err != nil {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "invalid credentials"})
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "admin_token",
		Value:    token,
		Path:     "/",
		MaxAge:   86400,
		HttpOnly: false,
		Secure:   false,
		SameSite: http.SameSiteLaxMode,
	})

	writeJSON(w, http.StatusOK, map[string]string{"token": token})
}

func (h *Handler) handleLogout(w http.ResponseWriter, r *http.Request) {
	token := extractToken(r)
	if token != "" {
		_ = h.authSvc.Logout(token)
	}

	http.SetCookie(w, &http.Cookie{
		Name:   "admin_token",
		Value:  "",
		Path:   "/",
		MaxAge: -1,
	})

	writeJSON(w, http.StatusOK, map[string]string{"message": "logged out"})
}

func (h *Handler) handleGetStats(w http.ResponseWriter, r *http.Request) {
	page := 1
	pageSize := 20

	if p := r.URL.Query().Get("page"); p != "" {
		if val, err := strconv.Atoi(p); err == nil && val > 0 {
			page = val
		}
	}
	if ps := r.URL.Query().Get("page_size"); ps != "" {
		if val, err := strconv.Atoi(ps); err == nil && val > 0 && val <= 100 {
			pageSize = val
		}
	}

	summary, err := h.db.GetTrafficSummary(page, pageSize)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to get stats"})
		return
	}

	writeJSON(w, http.StatusOK, summary)
}

type createBanRequest struct {
	Pattern string `json:"pattern"`
	Type    string `json:"type"`
	Reason  string `json:"reason"`
}

func (h *Handler) handleCreateBan(w http.ResponseWriter, r *http.Request) {
	var req createBanRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid request"})
		return
	}

	if req.Pattern == "" || req.Type == "" {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "pattern and type are required"})
		return
	}

	if req.Type != "URL" && req.Type != "package" {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "type must be URL or package"})
		return
	}

	rule, err := h.db.CreateBanRule(req.Pattern, req.Type, req.Reason)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to create ban rule"})
		return
	}

	writeJSON(w, http.StatusCreated, rule)
}

func (h *Handler) handleListBans(w http.ResponseWriter, r *http.Request) {
	rules, err := h.db.ListBanRules()
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to list ban rules"})
		return
	}

	writeJSON(w, http.StatusOK, rules)
}

func (h *Handler) handleDeleteBan(w http.ResponseWriter, r *http.Request, id int64) {
	if err := h.db.DeleteBanRule(id); err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to delete ban rule"})
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{"message": "ban rule deleted"})
}

type flushRequest struct {
	FlushToken string `json:"flush_token"`
}

func (h *Handler) handleFlush(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{"message": "flush requested"})
}

func (h *Handler) handlePasskeyRegisterBegin(w http.ResponseWriter, r *http.Request) {
	token := extractToken(r)
	userID, _, err := h.authSvc.ValidateJWT(token)
	if err != nil {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
		return
	}

	creation, err := h.authSvc.BeginPasskeyRegistration(userID, w)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to begin registration"})
		return
	}

	writeJSON(w, http.StatusOK, creation)
}

func (h *Handler) handlePasskeyRegisterFinish(w http.ResponseWriter, r *http.Request) {
	token := extractToken(r)
	userID, _, err := h.authSvc.ValidateJWT(token)
	if err != nil {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
		return
	}

	if err := h.authSvc.FinishPasskeyRegistration(userID, r); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "registration failed: " + err.Error()})
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{"message": "passkey registered"})
}

func (h *Handler) handlePasskeyLoginBegin(w http.ResponseWriter, r *http.Request) {
	assertion, err := h.authSvc.BeginPasskeyLogin(w)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to begin login"})
		return
	}

	writeJSON(w, http.StatusOK, assertion)
}

func (h *Handler) handlePasskeyLoginFinish(w http.ResponseWriter, r *http.Request) {
	token, err := h.authSvc.FinishPasskeyLogin(r)
	if err != nil {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "login failed"})
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "admin_token",
		Value:    token,
		Path:     "/",
		MaxAge:   86400,
		HttpOnly: true,
		Secure:   false,
		SameSite: http.SameSiteLaxMode,
	})

	writeJSON(w, http.StatusOK, map[string]string{"token": token})
}

func writeJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(data)
}
