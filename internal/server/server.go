package server

import (
	"crypto/md5"
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
	"regexp"
	"sort"
	"strconv"
	"strings"
	"sync"
	"time"

	"starcdn/internal/admin"
	"starcdn/internal/auth"
	"starcdn/internal/db"
)

type Config struct {
	Addr      string
	CacheDir  string
	CacheTTL  time.Duration
	DBPath    string
	AdminUser string
	AdminPass string
	JWTSecret string
	StaticDir string
}

type Server struct {
	cfg          Config
	routes       []ProxyRoute
	client       *http.Client
	rateLimits   *rateLimiter
	database     *db.DB
	authSvc      *auth.Service
	adminHdlr    *admin.Handler
	staticDir    string
	staticServer http.Handler
	cleanupStop  chan struct{}
	cleanupDone  chan struct{}
}

type ProxyRoute struct {
	Name       string
	Prefix     string
	Upstreams  []Upstream
	CacheTTL   time.Duration
	StrictRel  bool
	URLBuilder func(rel string, r *http.Request) []ResolvedURL
}

type Upstream struct {
	Name string
	Base string
}

// ResolvedURL is the result of a route's URLBuilder.
// Unlike Upstream+buildTargetURL, the target URL is fully resolved by the builder
// and does not need the rel/query to be appended.
type ResolvedURL struct {
	TargetURL    string
	UpstreamName string
}

type cacheMeta struct {
	StatusCode int         `json:"statusCode"`
	Header     http.Header `json:"header"`
	CreatedAt  time.Time   `json:"createdAt"`
	ExpiresAt  time.Time   `json:"expiresAt"`
}

func New(cfg Config) (*Server, error) {
	if cfg.CacheDir == "" {
		cfg.CacheDir = ".cache/starcdn"
	}
	// 本地缓存默认保留 10 分钟：吸收短时流量峰值 + 给上游 CDN 留出缓存窗口
	if cfg.CacheTTL <= 0 {
		cfg.CacheTTL = 10 * time.Minute
	}
	if err := os.MkdirAll(cfg.CacheDir, 0755); err != nil {
		return nil, err
	}

	var database *db.DB
	var authSvc *auth.Service
	var adminHdlr *admin.Handler

	if cfg.DBPath != "" {
		var err error
		database, err = db.New(cfg.DBPath)
		if err != nil {
			return nil, fmt.Errorf("failed to open database: %w", err)
		}

		if cfg.JWTSecret == "" {
			cfg.JWTSecret = auth.GenerateSecureKey()
		}

		authSvc, err = auth.New(auth.Config{
			JWTSecret:     cfg.JWTSecret,
			JWTExpiration: 24 * time.Hour,
		}, database)
		if err != nil {
			return nil, fmt.Errorf("failed to create auth service: %w", err)
		}

		if cfg.AdminUser != "" && cfg.AdminPass != "" {
			if err := authSvc.InitAdminUser(cfg.AdminUser, cfg.AdminPass); err != nil {
				return nil, fmt.Errorf("failed to init admin user: %w", err)
			}
		}

		adminHdlr = admin.NewHandler(authSvc, database)
	}

	return &Server{
		cfg:    cfg,
		routes: defaultProxyRoutes(cfg.CacheTTL),
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
		rateLimits:  newRateLimiter(120, time.Minute),
		database:    database,
		authSvc:     authSvc,
		adminHdlr:   adminHdlr,
		staticDir:   cfg.StaticDir,
		cleanupStop: make(chan struct{}),
		cleanupDone: make(chan struct{}),
	}, nil
}

func defaultProxyRoutes(cacheTTL time.Duration) []ProxyRoute {
	return []ProxyRoute{
		{Name: "gh", Prefix: "/gh/", Upstreams: []Upstream{
			{Name: "jsdelivr", Base: "https://cdn.jsdelivr.net/gh/"},
		}, CacheTTL: cacheTTL},
		{Name: "npm", Prefix: "/npm/", Upstreams: []Upstream{
			{Name: "unpkg", Base: "https://unpkg.com/"},
			{Name: "jsdelivr", Base: "https://cdn.jsdelivr.net/npm/"},
		}, CacheTTL: cacheTTL},
		{Name: "cdnjs", Prefix: "/ajax/libs/", Upstreams: []Upstream{
			{Name: "cdnjs", Base: "https://cdnjs.cloudflare.com/ajax/libs/"},
		}, CacheTTL: cacheTTL},
		{Name: "avatar", Prefix: "/avatar/", CacheTTL: cacheTTL, StrictRel: true, URLBuilder: avatarURLBuilder},
	}
}

// Start 启动后台过期缓存清理协程
func (s *Server) Start() {
	go s.runCacheCleanup(s.cfg.CacheTTL)
}

// Shutdown 停止后台清理协程
func (s *Server) Shutdown() {
	if s.cleanupStop == nil {
		return
	}
	select {
	case <-s.cleanupStop:
		return
	default:
		close(s.cleanupStop)
	}
	if s.cleanupDone != nil {
		<-s.cleanupDone
	}
}

func (s *Server) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	s.setSecurityHeaders(w)

	if r.Method == http.MethodOptions {
		s.handleOptions(w, r)
		return
	}

	if r.URL.Path == "/api/stats/" {
		s.handlePublicStats(w, r)
		return
	}

	if strings.HasPrefix(r.URL.Path, "/admin/api/") {
		if s.adminHdlr != nil {
			s.adminHdlr.ServeHTTP(w, r)
		} else {
			http.NotFound(w, r)
		}
		return
	}

	if route, ok := s.matchRoute(r.URL.Path); ok {
		s.handleProxy(w, r, route)
		return
	}

	s.serveStaticFile(w, r)
}

func (s *Server) matchRoute(requestPath string) (ProxyRoute, bool) {
	for _, route := range s.routes {
		base := strings.TrimSuffix(route.Prefix, "/")
		if requestPath == base || strings.HasPrefix(requestPath, route.Prefix) {
			return route, true
		}
	}
	return ProxyRoute{}, false
}

func (s *Server) serveStaticFile(w http.ResponseWriter, r *http.Request) {
	if s.staticDir == "" {
		http.NotFound(w, r)
		return
	}

	fs := http.Dir(s.staticDir)
	p := path.Clean(r.URL.Path)
	if p == "." {
		p = "/"
	}

	f, err := fs.Open(p)
	if err == nil {
		defer f.Close()
		stat, err := f.Stat()
		if err == nil && !stat.IsDir() {
			http.FileServer(fs).ServeHTTP(w, r)
			return
		}
		if err == nil && stat.IsDir() {
			if idx, err := fs.Open(p + "/index.html"); err == nil {
				idx.Close()
				r.URL.Path = p + "/"
				http.FileServer(fs).ServeHTTP(w, r)
				return
			}
		}
	}

	if !strings.Contains(path.Base(p), ".") {
		if idx, err := fs.Open(p + "/index.html"); err == nil {
			idx.Close()
			r.URL.Path = p + "/"
			http.FileServer(fs).ServeHTTP(w, r)
			return
		}
	}

	if p != "/404.html" {
		if f404, err := fs.Open("/404.html"); err == nil {
			defer f404.Close()
			stat, err := f404.Stat()
			if err == nil {
				w.Header().Set("Content-Type", "text/html; charset=utf-8")
				w.Header().Set("Content-Length", strconv.FormatInt(stat.Size(), 10))
				w.WriteHeader(http.StatusNotFound)
				io.Copy(w, f404)
				return
			}
		}
	}

	http.NotFound(w, r)
}

func (s *Server) handlePublicStats(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.Header().Set("Cache-Control", "public, max-age=15")

	if s.database == nil {
		w.Write([]byte("[]"))
		return
	}

	prefixes := map[string]string{
		"/npm/":       "Jsdelivr",
		"/gh/":        "Jsdelivr",
		"/wp/":        "Jsdelivr",
		"/avatar/":    "Gravatar",
		"/ajax/libs/": "Cdnjs",
	}

	stats, err := s.database.GetServiceStats(prefixes)
	if err != nil {
		stats = nil
	}

	merged := make(map[string]*db.ServiceStats)
	for i := range stats {
		name := stats[i].Name
		if existing, ok := merged[name]; ok {
			existing.TotalRequests += stats[i].TotalRequests
			existing.TotalBytes += stats[i].TotalBytes
		} else {
			copy := stats[i]
			merged[name] = &copy
		}
	}

	order := []string{"Unpkg", "Jsdelivr", "Gravatar", "Cdnjs"}
	result := make([]*db.ServiceStats, 0, len(order))
	for _, name := range order {
		if s, ok := merged[name]; ok {
			result = append(result, s)
		} else {
			result = append(result, &db.ServiceStats{Name: name, TotalRequests: 0, TotalBytes: 0, Online: true})
		}
	}

	json.NewEncoder(w).Encode(result)
}

func (s *Server) handleProxy(w http.ResponseWriter, r *http.Request, route ProxyRoute) {
	fmt.Printf("[DEBUG] handleProxy: method=%s, path=%s\n", r.Method, r.URL.Path)
	if r.Method != http.MethodGet && r.Method != http.MethodHead {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	if s.database != nil {
		banned, _, err := s.database.IsPathBanned(r.URL.Path)
		fmt.Printf("[DEBUG] handleProxy: IsPathBanned returned banned=%v, err=%v\n", banned, err)
		if err == nil && banned {
			http.Redirect(w, r, "/waf", http.StatusFound)
			return
		}
	}

	if !s.rateLimits.allow(clientIP(r)) {
		http.Error(w, "too many requests", http.StatusTooManyRequests)
		return
	}

	rel, err := s.extractRelPath(route, r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	targets, err := s.resolveTargets(route, rel, r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	fmt.Printf("[DEBUG] handleProxy: targets count=%d\n", len(targets))
	if len(targets) == 0 {
		http.Error(w, "no upstream available", http.StatusBadGateway)
		return
	}

	for _, t := range targets {
		if s.serveCache(w, r, t.Key) {
			return
		}

		if s.fetchAndCacheWithStats(w, r, t.URL, t.Key, route.CacheTTL, t.UpstreamName) {
			return
		}
	}

	http.Error(w, "all upstreams failed", http.StatusBadGateway)
}

type proxyTarget struct {
	URL          string
	Key          string
	UpstreamName string
}

func (s *Server) resolveTargets(route ProxyRoute, rel string, r *http.Request) ([]proxyTarget, error) {
	if route.URLBuilder != nil {
		resolved := route.URLBuilder(rel, r)
		fmt.Printf("[DEBUG] resolveTargets: URLBuilder returned %d items\n", len(resolved))
		if len(resolved) == 0 {
			return nil, errors.New("invalid avatar path")
		}
		out := make([]proxyTarget, 0, len(resolved))
		for _, ru := range resolved {
			out = append(out, proxyTarget{
				URL:          ru.TargetURL,
				Key:          cacheKey(ru.UpstreamName, ru.TargetURL),
				UpstreamName: ru.UpstreamName,
			})
		}
		return out, nil
	}

	out := make([]proxyTarget, 0, len(route.Upstreams))
	for _, up := range route.Upstreams {
		targetURL, key, perr := s.buildTargetURL(rel, up, r)
		if perr != nil {
			continue
		}
		out = append(out, proxyTarget{URL: targetURL, Key: key, UpstreamName: up.Name})
	}
	return out, nil
}

func (s *Server) extractRelPath(route ProxyRoute, r *http.Request) (string, error) {
	rawPath, err := url.PathUnescape(r.URL.EscapedPath())
	if err != nil {
		return "", errors.New("invalid path")
	}
	fmt.Printf("[DEBUG] extractRelPath: rawPath=%s, route.Prefix=%s\n", rawPath, route.Prefix)
	if !strings.HasPrefix(rawPath, route.Prefix) {
		return "", errors.New("invalid route")
	}

	rel := strings.TrimPrefix(rawPath, route.Prefix)
	fmt.Printf("[DEBUG] extractRelPath: rel after TrimPrefix=%s\n", rel)
	if rel == "" || strings.Contains(rel, "\x00") || strings.Contains(rel, "..") || strings.HasPrefix(rel, "/") {
		return "", errors.New("invalid resource path")
	}

	rel = strings.TrimSuffix(rel, "/")
	fmt.Printf("[DEBUG] extractRelPath: rel after TrimSuffix=%s\n", rel)
	if rel == "" {
		return "", errors.New("invalid resource path")
	}

	if route.StrictRel && strings.Contains(rel, "/") {
		return "", errors.New("invalid avatar path")
	}

	cleanRel := path.Clean("/" + rel)
	fmt.Printf("[DEBUG] extractRelPath: cleanRel=%s\n", cleanRel)
	if cleanRel == "/" || strings.HasPrefix(cleanRel, "/../") || cleanRel == "/.." {
		return "", errors.New("invalid resource path")
	}
	fmt.Printf("[DEBUG] extractRelPath: returning %s\n", strings.TrimPrefix(cleanRel, "/"))
	return strings.TrimPrefix(cleanRel, "/"), nil
}

func (s *Server) buildTargetURL(rel string, up Upstream, r *http.Request) (string, string, error) {
	base, err := url.Parse(up.Base)
	if err != nil {
		return "", "", errors.New("invalid upstream")
	}
	base.Path = strings.TrimRight(base.Path, "/") + "/" + rel
	base.RawQuery = sanitizedQuery(r.URL.Query()).Encode()

	return base.String(), cacheKey(up.Name, base.String()), nil
}

func cacheKey(name string, targetURL string) string {
	sum := sha256.Sum256([]byte(name + "|" + targetURL))
	return hex.EncodeToString(sum[:])
}

func sanitizedQuery(values url.Values) url.Values {
	clean := url.Values{}
	keys := make([]string, 0, len(values))
	for key := range values {
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

func (s *Server) fetchAndCacheWithStats(w http.ResponseWriter, r *http.Request, targetURL string, key string, ttl time.Duration, upstreamName string) bool {
	req, err := http.NewRequestWithContext(r.Context(), http.MethodGet, targetURL, nil)
	if err != nil {
		return false
	}
	copyRequestHeaders(req.Header, r.Header)
	req.Header.Set("User-Agent", "StarCDN-GoProxy/1.0")

	resp, err := s.client.Do(req)
	if err != nil {
		return false
	}
	defer resp.Body.Close()

	// 4xx 和 5xx 由调用方触发备用上游
	if resp.StatusCode >= 400 {
		return false
	}

	body, err := io.ReadAll(io.LimitReader(resp.Body, 256*1024*1024))
	if err != nil {
		return false
	}

	bytesSent := int64(len(body))
	if s.database != nil && resp.StatusCode >= 200 && resp.StatusCode < 300 {
		_ = s.database.UpsertTrafficStats(r.URL.Path, bytesSent)
	}

	header := cloneResponseHeaders(resp.Header)
	if header.Get("Content-Type") == "" {
		if ext := path.Ext(req.URL.Path); ext != "" {
			header.Set("Content-Type", mime.TypeByExtension(ext))
		} else if len(body) > 0 && strings.HasPrefix(string(body), "\xff\xd8") {
			header.Set("Content-Type", "image/jpeg")
		} else if len(body) > 0 && strings.HasPrefix(string(body), "\x89PNG") {
			header.Set("Content-Type", "image/png")
		} else if len(body) > 0 && strings.HasPrefix(string(body), "GIF8") {
			header.Set("Content-Type", "image/gif")
		} else if len(body) > 0 && strings.HasPrefix(string(body), "RIFF") && strings.HasPrefix(string(body[4:]), "WEBP") {
			header.Set("Content-Type", "image/webp")
		}
	}
	header.Set("Cache-Control", fmt.Sprintf("public, max-age=%d", int(ttl.Seconds())))
	header.Set("X-StarCDN-Cache", "MISS")
	header.Set("X-StarCDN-Upstream", upstreamName)

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
	return true
}

func (s *Server) serveCache(w http.ResponseWriter, r *http.Request, key string) bool {
	meta, body, err := s.readCache(key)
	if err != nil || time.Now().UTC().After(meta.ExpiresAt) {
		return false
	}

	bytesSent := int64(len(body))
	if s.database != nil {
		_ = s.database.UpsertTrafficStats(r.URL.Path, bytesSent)
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

// runCacheCleanup 定期扫描缓存目录，删除已过期的 .body / .json 配对文件
func (s *Server) runCacheCleanup(ttl time.Duration) {
	defer close(s.cleanupDone)

	// 清理周期取 TTL 的一半（最少 30 秒）—— 既能及时回收，又不会频繁扫盘
	interval := ttl / 2
	if interval < 30*time.Second {
		interval = 30 * time.Second
	}

	ticker := time.NewTicker(interval)
	defer ticker.Stop()

	for {
		select {
		case <-s.cleanupStop:
			return
		case <-ticker.C:
			s.sweepExpiredCache()
		}
	}
}

// sweepExpiredCache 删除 ExpiresAt 早于当前时间的缓存条目（同时清理 .body 和 .json）
func (s *Server) sweepExpiredCache() {
	entries, err := os.ReadDir(s.cfg.CacheDir)
	if err != nil {
		return
	}
	now := time.Now().UTC()
	for _, entry := range entries {
		if entry.IsDir() {
			continue
		}
		name := entry.Name()
		if !strings.HasSuffix(name, ".json") {
			continue
		}
		metaPath := filepath.Join(s.cfg.CacheDir, name)
		metaBytes, err := os.ReadFile(metaPath)
		if err != nil {
			continue
		}
		var meta cacheMeta
		if err := json.Unmarshal(metaBytes, &meta); err != nil {
			// 哈希校验文件已损坏，连同 body 一起删除
			bodyPath := strings.TrimSuffix(metaPath, ".json") + ".body"
			_ = os.Remove(metaPath)
			_ = os.Remove(bodyPath)
			continue
		}
		if now.After(meta.ExpiresAt) {
			bodyPath := strings.TrimSuffix(metaPath, ".json") + ".body"
			_ = os.Remove(metaPath)
			_ = os.Remove(bodyPath)
		}
	}
}

func (s *Server) setSecurityHeaders(w http.ResponseWriter) {
	w.Header().Set("X-Content-Type-Options", "nosniff")
	w.Header().Set("Referrer-Policy", "strict-origin-when-cross-origin")
	w.Header().Set("Permissions-Policy", "camera=(), microphone=(), geolocation()")

	// CORS: 公共代理默认 *,复用上游客显式声明的 ACAO 时以下行为辅助头
	if w.Header().Get("Access-Control-Allow-Origin") == "" {
		w.Header().Set("Access-Control-Allow-Origin", "*")
	}
	w.Header().Set("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "*")
	w.Header().Set("Access-Control-Expose-Headers", "X-StarCDN-Cache, X-StarCDN-Upstream, Age, Content-Length, Content-Range")
	w.Header().Set("Access-Control-Max-Age", "86400")
	w.Header().Set("Timing-Allow-Origin", "*")
	w.Header().Set("Cross-Origin-Resource-Policy", "cross-origin")

	// CSP: 公共代理转发任意内容,采用宽松但有边界的策略。
	// frame-ancestors 'none' 防 clickjacking;base-uri 'self' 防 base 标签劫持;
	// object-src 'none' 防 Flash/Java 等老插件向量;form-action 'self' 允许同源表单提交。
	w.Header().Set("Content-Security-Policy",
		"default-src * data: blob: 'unsafe-inline' 'unsafe-eval'; "+
			"frame-ancestors 'none'; base-uri 'self'; object-src 'none'; form-action 'self'")
}

// handleOptions 响应 CORS 预检;实际缓存与代理仍走 GET/HEAD 链路。
func (s *Server) handleOptions(w http.ResponseWriter, r *http.Request) {
	if r.Header.Get("Access-Control-Request-Method") != "" {
		w.Header().Set("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", r.Header.Get("Access-Control-Request-Headers"))
		w.Header().Set("Vary", "Origin, Access-Control-Request-Method, Access-Control-Request-Headers")
	}
	w.WriteHeader(http.StatusNoContent)
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

var (
	qqBareNumber = regexp.MustCompile(`^\d{4,12}$`)
	qqEmailRe    = regexp.MustCompile(`^(\d{4,12})@qq\.com$`)
	md5HexRe     = regexp.MustCompile(`^[a-f0-9]{32}$`)
	anyEmailRe   = regexp.MustCompile(`^[^\s@]+@[^\s@]+\.[^\s@]+$`)
)

// quickSize 把 s=1~5 映射成常用头像尺寸（覆盖 1-2048 之外的"快捷档"）
var quickSize = map[int]int{
	1: 40,
	2: 80,
	3: 160,
	4: 320,
	5: 640,
}

// avatarURLBuilder 分发 QQ 头像 / WeAvatar 头像 / Gravatar 头像：
//   - 纯数字（4-12 位 QQ 号）        → 腾讯 QQ 头像
//   - 数字@qq.com                    → 提取 QQ 号 → 腾讯 QQ 头像
//   - 32 位 MD5 hex（原生 hash 传入）→ WeAvatar 主，Gravatar 备
//   - 其他 email                     → 内部 MD5(lowercase) → WeAvatar 主，Gravatar 备
//   - 其他字符串                     → 当 hash 直接代理：WeAvatar 主，Gravatar 备
func avatarURLBuilder(rel string, r *http.Request) []ResolvedURL {
	q := r.URL.Query()
	size := avatarSize(q)
	defaultAvatar := q.Get("d")
	if defaultAvatar == "" {
		defaultAvatar = "identicon"
	}

	lower := strings.ToLower(strings.TrimSpace(rel))

	// 1) 纯数字 → QQ 头像
	if qqBareNumber.MatchString(lower) {
		return []ResolvedURL{
			{
				TargetURL:    fmt.Sprintf("https://q1.qlogo.cn/g?b=qq&nk=%s&s=%s", lower, size),
				UpstreamName: "qq",
			},
			{
				TargetURL:    fmt.Sprintf("https://q1.qlogo.cn/g?b=qq&nk=%s&s=640", lower),
				UpstreamName: "qq_large",
			},
			{
				TargetURL:    fmt.Sprintf("https://secure.gravatar.com/avatar/%s?s=%s&d=%s", md5Hex(lower), size, defaultAvatar),
				UpstreamName: "gravatar",
			},
		}
	}

	// 2) 数字@qq.com → MD5 → WeAvatar/Gravatar 优先，QQ头像兜底
	if m := qqEmailRe.FindStringSubmatch(lower); len(m) == 2 {
		sum := md5.Sum([]byte(lower))
		hash := hex.EncodeToString(sum[:])
		return []ResolvedURL{
			{
				TargetURL:    fmt.Sprintf("https://weavatar.com/avatar/%s?s=%s&d=%s", hash, size, defaultAvatar),
				UpstreamName: "weavatar",
			},
			{
				TargetURL:    fmt.Sprintf("https://secure.gravatar.com/avatar/%s?s=%s&d=%s", hash, size, defaultAvatar),
				UpstreamName: "gravatar",
			},
			{
				TargetURL:    fmt.Sprintf("https://q1.qlogo.cn/g?b=qq&nk=%s&s=%s", m[1], size),
				UpstreamName: "qq",
			},
			{
				TargetURL:    fmt.Sprintf("https://q1.qlogo.cn/g?b=qq&nk=%s&s=640", m[1]),
				UpstreamName: "qq_large",
			},
		}
	}

	// 3) 32 位 MD5 hex（原生 hash）→ WeAvatar 主，Gravatar 备
	if md5HexRe.MatchString(lower) {
		return gravatarChain(lower, size, defaultAvatar)
	}

	// 4) 其他 email → MD5 → WeAvatar 主，Gravatar 备
	if anyEmailRe.MatchString(lower) {
		sum := md5.Sum([]byte(lower))
		hash := hex.EncodeToString(sum[:])
		return gravatarChain(hash, size, defaultAvatar)
	}

	// 5) 兜底：当 hash 直接代理（lowercase 后传）→ WeAvatar 主，Gravatar 备
	return gravatarChain(url.PathEscape(lower), size, defaultAvatar)
}

// gravatarChain 返回 WeAvatar 主 + Gravatar 备 的上游链
func gravatarChain(hash, size, defaultAvatar string) []ResolvedURL {
	return []ResolvedURL{
		{
			TargetURL:    fmt.Sprintf("https://weavatar.com/avatar/%s?s=%s&d=%s", hash, size, defaultAvatar),
			UpstreamName: "weavatar",
		},
		{
			TargetURL:    fmt.Sprintf("https://secure.gravatar.com/avatar/%s?s=%s&d=%s", hash, size, defaultAvatar),
			UpstreamName: "gravatar",
		},
	}
}

// avatarSize 从 query 中读取 s 或 size（s 优先）：
//   - 1~5  → 走 quickSize 映射（40/80/160/320/640）
//   - 其他 → 原样使用，限制在 1-2048
//   - 缺省/非法 → 80
func avatarSize(q url.Values) string {
	raw := q.Get("s")
	if raw == "" {
		raw = q.Get("size")
	}
	if raw == "" {
		return "80"
	}
	n, err := strconv.Atoi(raw)
	if err != nil || n < 1 {
		return "80"
	}
	if v, ok := quickSize[n]; ok {
		return strconv.Itoa(v)
	}
	if n > 2048 {
		n = 2048
	}
	return strconv.Itoa(n)
}

func md5Hex(s string) string {
	sum := md5.Sum([]byte(s))
	return hex.EncodeToString(sum[:])
}
