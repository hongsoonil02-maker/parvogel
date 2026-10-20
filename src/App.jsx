import React, { Suspense, lazy, useEffect } from 'react';
import { HashRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Landing from './pages/Landing';

// Lazy loading for Blog components
const BlogList = lazy(() => import('./pages/BlogList'));
const BlogPost = lazy(() => import('./pages/BlogPost'));

const Router = HashRouter;

// GitHub Pages 404.html SPA 리다이렉트 복구 핸들러
function SpaRedirectHandler() {
  const navigate = useNavigate();
  useEffect(() => {
    try {
      const redirect = sessionStorage.getItem('__spa_redirect');
      if (redirect) {
        sessionStorage.removeItem('__spa_redirect');
        const target = redirect.startsWith('/') ? redirect : `/${redirect}`;
        navigate(target, { replace: true });
      }
    } catch (_e) {
      /* ignore */
    }
  }, [navigate]);
  return null;
}

function App() {
  return (
    <HelmetProvider>
      <Router>
        <SpaRedirectHandler />
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-gray-50"><div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div></div>}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/blog" element={<BlogList />} />
            <Route path="/blog/:id" element={<BlogPost />} />
          </Routes>
        </Suspense>
      </Router>
    </HelmetProvider>
  );
}

export default App;
