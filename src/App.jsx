import React, { Suspense, lazy } from 'react';
import { BrowserRouter, HashRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Landing from './pages/Landing';

// Lazy loading for Blog components
const BlogList = lazy(() => import('./pages/BlogList'));
const BlogPost = lazy(() => import('./pages/BlogPost'));

// 커스텀 도메인(parvogel.kr)에서는 BrowserRouter, GitHub Pages 서브경로 호환 위해 HashRouter 폴백
const isCustomDomain = typeof window !== 'undefined' && window.location.hostname === 'parvogel.kr';
const Router = isCustomDomain ? BrowserRouter : HashRouter;

function App() {
  return (
    <HelmetProvider>
      <Router>
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
