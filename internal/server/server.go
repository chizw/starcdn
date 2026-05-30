package server

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"mime"
	"net"
	"net/http"
	"net/url"
	"os"
	"path"
	"path/filepath"
	"sort"
	"strings"
	"sync"
	"time"
)

type Config struct {
	Addr       string
	StaticDir  string
	CacheDir   string
	FlushToken string
	CacheTTL   time.Duration
}

type Server struct {
	cfg        Config
	routes     []ProxyRoute
	client     *http.Client
	rateLimits *rateLimiter
}

type ProxyRoute struct {
	Name         string
	Prefix       string
	UpstreamBase string
	CacheTTL     time.Duration
}

type cacheMeta struct {
	StatusCode int         `json:"statusCode"`
	Header     http.Header `json:"header"`
	CreatedAt  time.Time   `json:"createdAt"`
	ExpiresAt  time.Time   `json:"expiresAt"`
}

func New(cfg Config) (*Server, error) {
	if cfg.StaticDir == "" {
		cfg.StaticDir = "out"
	}
	if cfg.CacheDir == "" {
		cfg.CacheDir = ".cache/starcdn"
	}
	if cfg.CacheTTL <= 0 {
		cfg.CacheTTL = 7 * 24 * time.Hour
	}
	if err := os.MkdirAll(cfg.CacheDir, 0755); err != nil {
		return nil, err
	}

	return &Server{
		cfg: cfg,
		routes: []ProxyRoute{
			{Name: "jsdelivr-gh", Prefix: "/gh/", UpstreamBase: "https://cdn.jsdelivr.net/gh/", CacheTTL: cfg.CacheTTL},
			{Name: "jsdelivr-wp", Prefix: "/wp/", UpstreamBase: "https://cdn.jsdelivr.net/wp/", CacheTTL: cfg.CacheTTL},
			{Name: "npm", Prefix: "/npm/", UpstreamBase: "https://cdn.jsdelivr.net/npm/", CacheTTL: cfg.CacheTTL},
			{Name: "cdnjs", Prefix: "/ajax/libs/", UpstreamBase: "https://cdnjs.cloudflare.com/ajax/libs/", CacheTTL: cfg.CacheTTL},
			{Name: "gravatar", Prefix: "/avatar/", UpstreamBase: "https://avatar.eo.wuxit.cn/avatar/", CacheTTL: cfg.CacheTTL},
		},
		client: &http.Client{
			Timeout: 30 * time.Second,
			Transport: &http.Transport{
				Proxy:                 http.ProxyFromEnvironment,
				DialContext:           (&net.Dialer{Timeout: 10 * time.Second, KeepAlive: 30 * time.Second}).DialContext,
				TLSHandshakeTimeout:   10 * time.Second,
				ResponseHeaderTimeout: 20 * time.Second,
				IdleConnTimeout:       90 * time.Second,
				MaxIdleConns:          100,
				MaxIdleConnsPerHost:   20,
			},
		},
		rateLimits: newRateLimiter(120, time.Minute),
	}, nil
}

func (s *Server) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	s.setSecurityHeaders(w)

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusNoContent)
		return
	}

	if route, ok := s.matchRoute(r.URL.Path); ok {
		s.handleProxy(w, r, route)
		return
	}

	s.handleStatic(w, r)
}

func (s *Server) matchRoute(requestPath string) (ProxyRoute, bool) {
	for _, route := range s.routes {
		if strings.HasPrefix(requestPath, route.Prefix) {
			return route, true
		}
	}
	return ProxyRoute{}, false
}

func (s *Server) handleProxy(w http.ResponseWriter, r *http.Request, route ProxyRoute) {
	if r.Method != http.MethodGet && r.Method != http.MethodHead {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	if !s.rateLimits.allow(clientIP(r)) {
		http.Error(w, "too many requests", http.StatusTooManyRequests)
		return
	}

	targetURL, key, err := s.buildTargetURL(route, r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	flush := r.URL.Query().Get("flush") == "1"
	if flush && s.cfg.FlushToken != "" && r.URL.Query().Get("flush_token") != s.cfg.FlushToken {
		http.Error(w, "invalid flush token", http.StatusForbidden)
		return
	}
	if flush && s.cfg.FlushToken == "" && !isPrivateClient(r) {
		http.Error(w, "flush token required", http.StatusForbidden)
		return
	}

	if flush {
		_ = s.deleteCache(key)
	} else if s.serveCache(w, r, key) {
		return
	}

	s.fetchAndCache(w, r, targetURL, key, route.CacheTTL)
}

func (s *Server) buildTargetURL(route ProxyRoute, r *http.Request) (string, string, error) {
	rawPath, err := url.PathUnescape(r.URL.EscapedPath())
	if err != nil {
		return "", "", errors.New("invalid path")
	}
	if !strings.HasPrefix(rawPath, route.Prefix) {
		return "", "", errors.New("invalid route")
	}

	rel := strings.TrimPrefix(rawPath, route.Prefix)
	if rel == "" || strings.Contains(rel, "\x00") || strings.Contains(rel, "..") || strings.HasPrefix(rel, "/") {
		return "", "", errors.New("invalid resource path")
	}

	cleanRel := path.Clean("/" + rel)
	if cleanRel == "/" || strings.HasPrefix(cleanRel, "/../") || cleanRel == "/.." {
		return "", "", errors.New("invalid resource path")
	}
	cleanRel = strings.TrimPrefix(cleanRel, "/")

	base, err := url.Parse(route.UpstreamBase)
	if err != nil {
		return "", "", errors.New("invalid upstream")
	}
	base.Path = strings.TrimRight(base.Path, "/") + "/" + cleanRel
	base.RawQuery = sanitizedQuery(r.URL.Query()).Encode()

	keySource := route.Name + "|" + base.String()
	sum := sha256.Sum256([]byte(keySource))
	return base.String(), hex.EncodeToString(sum[:]), nil
}

func sanitizedQuery(values url.Values) url.Values {
	clean := url.Values{}
	keys := make([]string, 0, len(values))
	for key := range values {
		if key == "flush" || key == "flush_token" {
			continue
		}
		keys = append(keys, key)
	}
	sort.Strings(keys)
	for _, key := range keys {
		for _, value := range values[key] {
			clean.Add(key, value)
		}
	}
	return clean
}

func (s *Server) fetchAndCache(w http.ResponseWriter, r *http.Request, targetURL string, key string, ttl time.Duration) {
	req, err := http.NewRequestWithContext(r.Context(), http.MethodGet, targetURL, nil)
	if err != nil {
		http.Error(w, "bad gateway", http.StatusBadGateway)
		return
	}
	copyRequestHeaders(req.Header, r.Header)
	req.Header.Set("User-Agent", "StarCDN-GoProxy/1.0")

	resp, err := s.client.Do(req)
	if err != nil {
		http.Error(w, "bad gateway", http.StatusBadGateway)
		return
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(io.LimitReader(resp.Body, 256*1024*1024))
	if err != nil {
		http.Error(w, "bad gateway", http.StatusBadGateway)
		return
	}

	header := cloneResponseHeaders(resp.Header)
	if header.Get("Content-Type") == "" {
		if ext := path.Ext(req.URL.Path); ext != "" {
			header.Set("Content-Type", mime.TypeByExtension(ext))
		}
	}
	header.Set("Cache-Control", fmt.Sprintf("public, max-age=%d", int(ttl.Seconds())))
	header.Set("X-StarCDN-Cache", "MISS")

	if resp.StatusCode == http.StatusOK {
		_ = s.writeCache(key, cacheMeta{
			StatusCode: resp.StatusCode,
			Header:     cloneResponseHeaders(header),
			CreatedAt:  time.Now().UTC(),
			ExpiresAt:  time.Now().UTC().Add(ttl),
		}, body)
	}

	writeHeaders(w.Header(), header)
	w.WriteHeader(resp.StatusCode)
	if r.Method != http.MethodHead {
		_, _ = w.Write(body)
	}
}

func (s *Server) serveCache(w http.ResponseWriter, r *http.Request, key string) bool {
	meta, body, err := s.readCache(key)
	if err != nil || time.Now().UTC().After(meta.ExpiresAt) {
		return false
	}

	header := cloneResponseHeaders(meta.Header)
	header.Set("X-StarCDN-Cache", "HIT")
	header.Set("Age", fmt.Sprintf("%d", int(time.Since(meta.CreatedAt).Seconds())))
	writeHeaders(w.Header(), header)
	w.WriteHeader(meta.StatusCode)
	if r.Method != http.MethodHead {
		_, _ = w.Write(body)
	}
	return true
}

func (s *Server) cachePaths(key string) (string, string) {
	return filepath.Join(s.cfg.CacheDir, key+".json"), filepath.Join(s.cfg.CacheDir, key+".body")
}

func (s *Server) readCache(key string) (cacheMeta, []byte, error) {
	metaPath, bodyPath := s.cachePaths(key)
	metaBytes, err := os.ReadFile(metaPath)
	if err != nil {
		return cacheMeta{}, nil, err
	}
	body, err := os.ReadFile(bodyPath)
	if err != nil {
		return cacheMeta{}, nil, err
	}
	var meta cacheMeta
	if err := json.Unmarshal(metaBytes, &meta); err != nil {
		return cacheMeta{}, nil, err
	}
	return meta, body, nil
}

func (s *Server) writeCache(key string, meta cacheMeta, body []byte) error {
	metaPath, bodyPath := s.cachePaths(key)
	metaBytes, err := json.Marshal(meta)
	if err != nil {
		return err
	}
	if err := writeFileAtomic(bodyPath, body); err != nil {
		return err
	}
	return writeFileAtomic(metaPath, metaBytes)
}

func (s *Server) deleteCache(key string) error {
	metaPath, bodyPath := s.cachePaths(key)
	_ = os.Remove(metaPath)
	_ = os.Remove(bodyPath)
	return nil
}

func writeFileAtomic(name string, data []byte) error {
	tmp := name + ".tmp"
	if err := os.WriteFile(tmp, data, 0644); err != nil {
		return err
	}
	return os.Rename(tmp, name)
}

func (s *Server) handleStatic(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet && r.Method != http.MethodHead {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	fileServer := http.FileServer(http.Dir(s.cfg.StaticDir))
	fileServer.ServeHTTP(w, r)
}

func (s *Server) setSecurityHeaders(w http.ResponseWriter) {
	w.Header().Set("X-Content-Type-Options", "nosniff")
	w.Header().Set("Referrer-Policy", "strict-origin-when-cross-origin")
	w.Header().Set("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
}

func copyRequestHeaders(dst http.Header, src http.Header) {
	allowed := []string{"Accept", "Accept-Encoding", "Accept-Language", "If-None-Match", "If-Modified-Since", "Range"}
	for _, key := range allowed {
		for _, value := range src.Values(key) {
			dst.Add(key, value)
		}
	}
}

func cloneResponseHeaders(src http.Header) http.Header {
	dst := http.Header{}
	for key, values := range src {
		if isHopByHopHeader(key) || strings.EqualFold(key, "Set-Cookie") {
			continue
		}
		for _, value := range values {
			dst.Add(key, value)
		}
	}
	return dst
}

func writeHeaders(dst http.Header, src http.Header) {
	for key, values := range src {
		dst.Del(key)
		for _, value := range values {
			dst.Add(key, value)
		}
	}
}

func isHopByHopHeader(key string) bool {
	switch strings.ToLower(key) {
	case "connection", "keep-alive", "proxy-authenticate", "proxy-authorization", "te", "trailer", "transfer-encoding", "upgrade":
		return true
	default:
		return false
	}
}

func clientIP(r *http.Request) string {
	if value := r.Header.Get("X-Forwarded-For"); value != "" {
		parts := strings.Split(value, ",")
		return strings.TrimSpace(parts[0])
	}
	host, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		return r.RemoteAddr
	}
	return host
}

func isPrivateClient(r *http.Request) bool {
	ip := net.ParseIP(clientIP(r))
	if ip == nil {
		return false
	}
	return ip.IsLoopback() || ip.IsPrivate()
}

type rateLimiter struct {
	mu     sync.Mutex
	limit  int
	window time.Duration
	items  map[string]rateItem
}

type rateItem struct {
	count int
	reset time.Time
}

func newRateLimiter(limit int, window time.Duration) *rateLimiter {
	return &rateLimiter{limit: limit, window: window, items: map[string]rateItem{}}
}

func (r *rateLimiter) allow(key string) bool {
	r.mu.Lock()
	defer r.mu.Unlock()

	now := time.Now()
	item := r.items[key]
	if item.reset.IsZero() || now.After(item.reset) {
		r.items[key] = rateItem{count: 1, reset: now.Add(r.window)}
		return true
	}
	if item.count >= r.limit {
		return false
	}
	item.count++
	r.items[key] = item
	return true
}
