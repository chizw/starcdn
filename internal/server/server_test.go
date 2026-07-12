package server

import "testing"

func TestDefaultProxyRoutesMatchWithoutTrailingSlash(t *testing.T) {
	s := &Server{routes: defaultProxyRoutes(0)}

	for _, requestPath := range []string{"/npm", "/gh", "/ajax/libs", "/avatar"} {
		if _, ok := s.matchRoute(requestPath); !ok {
			t.Fatalf("expected %s to match a proxy route", requestPath)
		}
	}
}
