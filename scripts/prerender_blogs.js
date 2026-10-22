import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');
const postsPath = path.resolve(rootDir, 'src/data/posts.json');

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function markdownToSimpleHtml(md) {
  if (!md) return '';
  const lines = md.split('\n');
  let html = '';
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith('### ')) {
      html += `\n<h3 style="font-size:1.4rem; font-weight:800; margin:1.5rem 0 0.5rem; color:#0f172a;">${escapeHtml(trimmed.slice(4))}</h3>`;
    } else if (trimmed.startsWith('## ')) {
      html += `\n<h2 style="font-size:1.7rem; font-weight:800; margin:2rem 0 0.8rem; color:#0f172a;">${escapeHtml(trimmed.slice(3))}</h2>`;
    } else if (trimmed.startsWith('# ')) {
      html += `\n<h1 style="font-size:2rem; font-weight:900; margin:2.2rem 0 1rem; color:#0f172a;">${escapeHtml(trimmed.slice(2))}</h1>`;
    } else if (trimmed.startsWith('> ')) {
      html += `\n<blockquote style="padding:0.75rem 1rem; border-left:4px solid #f59e0b; background:#fffbeb; color:#1e293b; margin:1rem 0; font-style:italic;">${escapeHtml(trimmed.slice(2))}</blockquote>`;
    } else if (trimmed.startsWith('---')) {
      html += `\n<hr style="margin:2rem 0; border:0; border-top:1px solid #e2e8f0;" />`;
    } else if (trimmed.startsWith('@[youtube]')) {
      const match = trimmed.match(/@\[youtube\]\((.*?)\)/);
      if (match) {
        html += `\n<div style="margin:1.5rem 0; text-align:center;"><iframe src="https://www.youtube-nocookie.com/embed/${match[1]}" width="320" height="568" frameborder="0" allowfullscreen title="YouTube Video"></iframe></div>`;
      }
    } else {
      // Bold 처리
      const formatted = escapeHtml(trimmed).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      html += `\n<p style="font-size:1.05rem; line-height:1.75; margin-bottom:1rem; color:#334155;">${formatted}</p>`;
    }
  }
  return html;
}

export function prerender() {
  if (!fs.existsSync(distDir)) {
    console.error('dist directory not found. Please run vite build first.');
    return;
  }

  const baseHtmlPath = path.resolve(distDir, 'index.html');
  if (!fs.existsSync(baseHtmlPath)) {
    console.error('dist/index.html not found.');
    return;
  }

  const baseHtml = fs.readFileSync(baseHtmlPath, 'utf-8');
  const posts = JSON.parse(fs.readFileSync(postsPath, 'utf-8'));

  console.log(`[SEO Prerender] Starting static HTML generation for ${posts.length} blog posts...`);

  // 1. 블로그 목록 페이지 dist/blog/index.html 생성
  const blogListDir = path.resolve(distDir, 'blog');
  fs.mkdirSync(blogListDir, { recursive: true });

  const blogListMetaTitle = '수의학 칼럼 & 회복 사례 | 파보겔(Parvogel) 공식몰';
  const blogListMetaDesc = '파보겔 학술자문단 수의사 칼럼 및 강아지·고양이·반려조 장 건강 안심 케어 사례 모음. 수의학적 원인 분석과 실전 응급 가이드.';
  const blogListUrl = 'https://parvogel.kr/blog';

  let listCardsHtml = posts.map(p => `
    <article style="background:#ffffff; border-radius:1rem; border:1px solid #e2e8f0; overflow:hidden; margin-bottom:1.5rem; padding:1.5rem;">
      <span style="display:inline-block; padding:0.25rem 0.75rem; background:#eff6ff; color:#1d4ed8; font-size:0.75rem; font-weight:700; border-radius:9999px; margin-bottom:0.5rem;">${escapeHtml(p.category || '전문 칼럼')}</span>
      <h2 style="font-size:1.35rem; font-weight:800; margin-bottom:0.5rem;"><a href="/blog/${p.id}" style="color:#0f172a; text-decoration:none;">${escapeHtml(p.title)}</a></h2>
      <p style="color:#64748b; font-size:0.95rem; line-height:1.6; margin-bottom:1rem;">${escapeHtml(p.excerpt)}</p>
      <div style="font-size:0.8rem; color:#94a3b8;">${escapeHtml(p.date)} · ${escapeHtml(p.author || '파보겔 학술연구팀')}</div>
    </article>
  `).join('\n');

  let listHtml = baseHtml
    .replace(/<title>.*?<\/title>/i, `<title>${escapeHtml(blogListMetaTitle)}</title>`)
    .replace(/<meta name="description" content=".*?" \/>/i, `<meta name="description" content="${escapeHtml(blogListMetaDesc)}" />`)
    .replace(/<link rel="canonical" href=".*?" \/>/i, `<link rel="canonical" href="${blogListUrl}" />`)
    .replace(/<meta property="og:title" content=".*?" \/>/i, `<meta property="og:title" content="${escapeHtml(blogListMetaTitle)}" />`)
    .replace(/<meta property="og:description" content=".*?" \/>/i, `<meta property="og:description" content="${escapeHtml(blogListMetaDesc)}" />`)
    .replace(/<meta property="og:url" content=".*?" \/>/i, `<meta property="og:url" content="${blogListUrl}" />`)
    .replace(/<meta name="twitter:title" content=".*?" \/>/i, `<meta name="twitter:title" content="${escapeHtml(blogListMetaTitle)}" />`)
    .replace(/<meta name="twitter:description" content=".*?" \/>/i, `<meta name="twitter:description" content="${escapeHtml(blogListMetaDesc)}" />`)
    .replace('<div id="root"></div>', `
      <div id="root">
        <main style="max-width:860px; margin:2rem auto; padding:1.5rem; font-family:-apple-system,BlinkMacSystemFont,'Pretendard',sans-serif;">
          <header style="text-align:center; margin-bottom:2.5rem;">
            <a href="/" style="color:#1d4ed8; text-decoration:none; font-weight:700; font-size:0.9rem;">&larr; 파보겔 공식몰 메인으로 이동</a>
            <h1 style="font-size:2.25rem; font-weight:900; color:#0f172a; margin-top:1rem;">수의학 칼럼 &amp; 회복 사례</h1>
            <p style="color:#64748b; margin-top:0.5rem; font-size:1.1rem;">반려동물의 건강한 장 컨디션을 위한 수의학적 가이드</p>
          </header>
          <section>${listCardsHtml}</section>
        </main>
      </div>
    `);

  fs.writeFileSync(path.resolve(blogListDir, 'index.html'), listHtml, 'utf-8');
  console.log(`[SEO Prerender] Generated: dist/blog/index.html`);

  // 2. 각 블로그 포스트 상세 정적 HTML 생성
  for (const post of posts) {
    const postDir = path.resolve(distDir, 'blog', post.id);
    fs.mkdirSync(postDir, { recursive: true });

    const postMetaTitle = `${post.title} | 파보겔 공식몰`;
    const postMetaDesc = post.excerpt || '';
    const postUrl = `https://parvogel.kr/blog/${post.id}`;
    const postImage = post.image ? (post.image.startsWith('http') ? post.image : `https://parvogel.kr${post.image}`) : 'https://parvogel.kr/og-image.png';

    const articleJsonLd = {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": post.title,
      "description": post.excerpt,
      "image": [postImage],
      "datePublished": post.date,
      "dateModified": post.date,
      "author": [{
        "@type": "Person",
        "name": post.author || "김동준 수의사 (하남 사랑동물병원 원장 / 파보겔 학술자문위원)"
      }],
      "publisher": {
        "@type": "Organization",
        "name": "(주)한국아그로",
        "url": "https://parvogel.kr/",
        "logo": {
          "@type": "ImageObject",
          "url": "https://parvogel.kr/og-image.png"
        }
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": postUrl
      }
    };

    const articleBodyHtml = markdownToSimpleHtml(post.content);

    let postHtml = baseHtml
      .replace(/<title>.*?<\/title>/i, `<title>${escapeHtml(postMetaTitle)}</title>`)
      .replace(/<meta name="description" content=".*?" \/>/i, `<meta name="description" content="${escapeHtml(postMetaDesc)}" />`)
      .replace(/<link rel="canonical" href=".*?" \/>/i, `<link rel="canonical" href="${postUrl}" />`)
      .replace(/<meta property="og:title" content=".*?" \/>/i, `<meta property="og:title" content="${escapeHtml(postMetaTitle)}" />`)
      .replace(/<meta property="og:description" content=".*?" \/>/i, `<meta property="og:description" content="${escapeHtml(postMetaDesc)}" />`)
      .replace(/<meta property="og:url" content=".*?" \/>/i, `<meta property="og:url" content="${postUrl}" />`)
      .replace(/<meta property="og:image" content=".*?" \/>/i, `<meta property="og:image" content="${escapeHtml(postImage)}" />`)
      .replace(/<meta property="og:type" content=".*?" \/>/i, `<meta property="og:type" content="article" />`)
      .replace(/<meta name="twitter:title" content=".*?" \/>/i, `<meta name="twitter:title" content="${escapeHtml(postMetaTitle)}" />`)
      .replace(/<meta name="twitter:description" content=".*?" \/>/i, `<meta name="twitter:description" content="${escapeHtml(postMetaDesc)}" />`)
      .replace(/<meta name="twitter:image" content=".*?" \/>/i, `<meta name="twitter:image" content="${escapeHtml(postImage)}" />`);

    // Schema.org Article 스크립트 추가
    const scriptInsert = `\n    <script type="application/ld+json">\n    ${JSON.stringify(articleJsonLd, null, 2)}\n    </script>\n</head>`;
    postHtml = postHtml.replace('</head>', scriptInsert);

    // root 내부에 완벽한 본문 주입 (봇 크롤링 최적화)
    const injectedBody = `
      <div id="root">
        <main style="max-width:820px; margin:2rem auto; padding:1.5rem; font-family:-apple-system,BlinkMacSystemFont,'Pretendard',sans-serif;">
          <nav style="margin-bottom:1.5rem;">
            <a href="/blog" style="color:#1d4ed8; text-decoration:none; font-weight:700; font-size:0.9rem;">&larr; 칼럼 목록으로 돌아가기</a>
            <span style="color:#cbd5e1; margin:0 0.5rem;">|</span>
            <a href="/" style="color:#475569; text-decoration:none; font-size:0.9rem;">파보겔 공식몰 메인</a>
          </nav>
          <header style="margin-bottom:2rem; border-bottom:1px solid #f1f5f9; padding-bottom:1.5rem;">
            <span style="display:inline-block; padding:0.25rem 0.75rem; background:#eff6ff; color:#1d4ed8; font-size:0.8rem; font-weight:800; border-radius:9999px; margin-bottom:0.75rem;">${escapeHtml(post.category || '전문 칼럼')}</span>
            <h1 style="font-size:2.2rem; font-weight:900; color:#0f172a; line-height:1.35; margin-bottom:0.75rem;">${escapeHtml(post.title)}</h1>
            <div style="font-size:0.9rem; color:#64748b;">
              <span>작성: <strong>${escapeHtml(post.author || '파보겔 연구팀')}</strong></span> · 
              <time datetime="${post.date}">${escapeHtml(post.date)}</time>
            </div>
          </header>
          <article style="font-size:1.05rem; line-height:1.8; color:#334155;">
            ${articleBodyHtml}
          </article>
          <div style="margin-top:3rem; padding:2rem; background:#f0f9ff; border:1px solid #bae6fd; border-radius:1.25rem; text-align:center;">
            <h4 style="font-size:1.35rem; font-weight:900; color:#0f172a; margin-bottom:0.5rem;">새벽 2시에도 당황하지 않는 1초 펌프 안심 케어</h4>
            <p style="color:#475569; margin-bottom:1.25rem;">주사기 실랑이 없이 간식처럼 냠냠 핥아먹는 천연 나노 몬모릴로나이트 겔, 파보겔</p>
            <a href="https://smartstore.naver.com/petschury/products/13718496355" target="_blank" rel="noopener noreferrer" style="display:inline-block; background:#0284c7; color:#ffffff; font-weight:800; padding:0.85rem 1.75rem; border-radius:0.75rem; text-decoration:none; box-shadow:0 4px 12px rgba(2,132,199,0.3);">
              파보겔 공식 스토어 바로가기 &rarr;
            </a>
          </div>
        </main>
      </div>
    `;

    postHtml = postHtml.replace('<div id="root"></div>', injectedBody);

    fs.writeFileSync(path.resolve(postDir, 'index.html'), postHtml, 'utf-8');
    console.log(`[SEO Prerender] Generated: dist/blog/${post.id}/index.html`);
  }

  console.log('[SEO Prerender] All static HTML pages successfully generated! Google/Naver bot 100% indexing ready.');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  prerender();
}
