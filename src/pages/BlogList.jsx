import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';
import posts from '../data/posts.json';
import { assetUrl } from '../config/site';

export default function BlogList() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-24">
      <SEO 
        title="전문가 칼럼 및 성공 사례" 
        description="파보겔(Parvogel)의 송아지 설사 치료 성공 사례와 수의사 전문가 칼럼을 확인하세요." 
      />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in-up">
          <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
            수의학 칼럼 & 성공 사례
          </h1>
          <p className="text-lg text-gray-600">
            건강한 축산 환경을 위한 파보겔의 유용한 정보와 소식을 전해드립니다.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {posts.map((post, i) => (
            <Link 
              key={post.id} 
              to={`/blog/${post.id}`}
              className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="aspect-[16/10] overflow-hidden bg-gray-100 relative">
                <img
                  src={assetUrl(post.image)}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-primary-700 text-xs font-bold rounded-full shadow-sm">
                    {post.category}
                  </span>
                </div>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <p className="text-xs text-gray-500 font-medium mb-2">{post.date}</p>
                <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-primary-600 transition-colors">
                  {post.title}
                </h2>
                <p className="text-sm text-gray-600 line-clamp-3 mb-4 flex-1">
                  {post.excerpt}
                </p>
                <div className="mt-auto flex items-center text-primary-600 text-sm font-semibold group-hover:translate-x-1 transition-transform">
                  자세히 보기 
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <Link to="/" className="inline-flex items-center text-gray-500 hover:text-primary-600 transition-colors font-medium">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
