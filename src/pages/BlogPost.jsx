import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import SEO from '../components/SEO';
import posts from '../data/posts.json';
import { assetUrl, absoluteUrl } from '../config/site';

export default function BlogPost() {
  const { id } = useParams();
  const post = posts.find(p => p.id === id);

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  // 인라인 마크다운 (bold, links) 파싱
  const renderInline = (str) => {
    const regex = /(\*\*.*?\*\*|\[.*?\]\(.*?\))/g;
    const parts = str.split(regex);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-bold text-gray-900">{part.slice(2, -2)}</strong>;
      }
      const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
      if (linkMatch) {
        const isExt = linkMatch[2].startsWith('http');
        return (
          <a
            key={i}
            href={linkMatch[2]}
            target={isExt ? '_blank' : undefined}
            rel={isExt ? 'noopener noreferrer' : undefined}
            className="text-primary-600 hover:text-primary-700 underline font-bold transition-colors inline-flex items-center gap-0.5"
          >
            <span>{linkMatch[1]}</span>
            {isExt && <span className="text-xs">↗</span>}
          </a>
        );
      }
      return part;
    });
  };

  // 간단한 마크다운/줄바꿈 파싱
  const renderContent = (text) => {
    return text.split('\n').map((line, idx) => {
      // 이미지 (![alt](src)) — GitHub Pages 하위 경로 배포 대응을 위해 BASE_URL 적용
      const imgMatch = line.match(/^!\[(.*?)\]\((.*?)\)\s*$/);
      if (imgMatch) {
        return (
          <figure key={idx} className="my-8">
            <img
              src={assetUrl(imgMatch[2])}
              alt={imgMatch[1]}
              loading="lazy"
              className="w-full rounded-2xl border border-gray-100 shadow-md"
            />
            {imgMatch[1] && (
              <figcaption className="text-center text-sm text-gray-500 mt-2">{imgMatch[1]}</figcaption>
            )}
          </figure>
        );
      }

      // 유튜브 숏츠/비디오 임베드 (@[youtube](id))
      const ytMatch = line.match(/^@\[youtube\]\((.*?)\)\s*$/);
      if (ytMatch) {
        const videoId = ytMatch[1];
        return (
          <div key={idx} className="my-8 max-w-[320px] mx-auto aspect-[9/16] rounded-2xl overflow-hidden shadow-2xl border-2 border-red-500/40 bg-black">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0`}
              title="YouTube Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="w-full h-full border-0"
            />
          </div>
        );
      }

      // 구분선
      if (line.trim() === '---') {
        return <hr key={idx} className="my-8 border-gray-200" />;
      }

      // 인용문 (> text)
      if (line.startsWith('> ')) {
        return (
          <blockquote key={idx} className="my-4 pl-4 py-2 border-l-4 border-amber-500 bg-amber-50/50 text-slate-800 italic text-base md:text-lg rounded-r-xl">
            {renderInline(line.replace(/^>\s*/, ''))}
          </blockquote>
        );
      }

      // 제목 H3
      if (line.startsWith('### ')) {
        return <h3 key={idx} className="text-xl md:text-2xl font-bold text-gray-900 mt-8 mb-4">{line.replace('### ', '')}</h3>;
      }

      // 리스트
      if (line.match(/^[0-9]+\.\s/)) {
        return <p key={idx} className="text-gray-700 text-base md:text-lg mb-2 font-medium pl-4">{renderInline(line)}</p>;
      }

      // 빈 줄
      if (line.trim() === '') return <br key={idx} />;
      
      // 일반 문단
      return (
        <p key={idx} className="text-gray-700 text-base md:text-lg mb-4 leading-relaxed break-keep">
          {renderInline(line)}
        </p>
      );
    });
  };

  const articleStructuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "image": [
      absoluteUrl(post.image)
    ],
    "datePublished": post.date,
    "author": [{
      "@type": "Organization",
      "name": "Parvogel Research Team"
    }]
  };

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title={post.title}
        description={post.excerpt}
        type="article"
        image={absoluteUrl(post.image)}
        structuredData={articleStructuredData}
      />
      
      {/* Header Image */}
      <div className="w-full h-[40vh] md:h-[50vh] relative bg-gray-900">
        <img
          src={assetUrl(post.image)}
          alt={post.title}
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 max-w-4xl mx-auto text-white">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-primary-600 text-white text-xs font-bold rounded-full">
              {post.category}
            </span>
            <span className="text-sm font-medium text-gray-300">{post.date}</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-snug break-keep">
            {post.title}
          </h1>
        </div>
      </div>

      {/* Content */}
      <article className="max-w-3xl mx-auto px-6 py-12 md:py-16">
        <div className="prose prose-lg max-w-none">
          {renderContent(post.content)}
        </div>

        {/* CTA Banner inside post */}
        <div className="mt-16 p-8 bg-primary-50 rounded-2xl border border-primary-100 text-center">
          <h4 className="text-2xl font-bold text-gray-900 mb-2">우리 농장의 송아지를 안전하게 지키는 방법</h4>
          <p className="text-gray-600 mb-6">설사 초기 대응, 파보겔이 가장 빠르고 확실한 선택입니다.</p>
          <Link to="/" className="inline-block px-8 py-4 bg-primary-600 text-white font-bold rounded-xl shadow-lg hover:bg-primary-700 transition-colors">
            파보겔 자세히 알아보기
          </Link>
        </div>

        {/* Back link */}
        <div className="mt-12 pt-8 border-t border-gray-100 flex items-center justify-between">
          <Link to="/blog" className="inline-flex items-center text-gray-500 hover:text-primary-600 font-medium transition-colors">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
            목록으로 돌아가기
          </Link>
        </div>
      </article>
    </div>
  );
}
