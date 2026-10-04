import React from 'react';
import { Helmet } from 'react-helmet-async';
import { SITE_URL, absoluteUrl } from '../config/site';

const SUPPORTED_HREFLANGS = ['ko','en','ja','zh','es','fr','de','th','vi','ru','pt','ar','id','ms','tr'];

export default function SEO({ title, description, url, type = 'website', image, structuredData, breadcrumbs }) {
  const siteUrl = SITE_URL;
  const defaultTitle = '파보겔(Parvogel) 공식몰 — 몬스멕타 동물병원 처방 급성설사·파보장염 1초 펌프 보조사료 | 한국아그로';
  const defaultDescription = '동물병원 몬스멕타 파보겔 단독 처방 케이스 공개. 강아지·고양이·앵무새(반려조) 급성 설사·구토·혈변·파보장염·소낭정체 시 1초 펌프/1방울로 장 점막 코팅 및 독소 흡착 배출을 돕는 보조사료. 쿠팡 로켓배송 & 네이버 스마트스토어 공식 배송.';

  const seo = {
    title: title ? `${title} | 파보겔(Parvogel)` : defaultTitle,
    description: description || defaultDescription,
    url: url ? absoluteUrl(url) : siteUrl,
    image: image || absoluteUrl('/og-image.png'),
  };

  const defaultStructuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        "name": "파보겔 (Parvogel)",
        "image": seo.image,
        "description": seo.description,
        "brand": { "@type": "Brand", "name": "Parvogel" },
        "offers": {
          "@type": "AggregateOffer",
          "url": seo.url,
          "priceCurrency": "KRW",
          "lowPrice": "18000",
          "highPrice": "75000",
          "availability": "https://schema.org/InStock"
        },
        "additionalProperty": [
          { "@type": "PropertyValue", "name": "제형", "value": "겔 타입 펌프" },
          { "@type": "PropertyValue", "name": "보관", "value": "상온 1~30℃ 18개월" }
        ]
      },
      {
        "@type": "Organization",
        "name": "(주)한국아그로",
        "url": SITE_URL,
        "logo": absoluteUrl('/og-image.png'),
        "contactPoint": { "@type": "ContactPoint", "telephone": "+82-2-6949-5708", "contactType": "customer service", "availableLanguage": ["ko","en"] }
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          { "@type": "Question", "name": "동물병원 처방약과 함께 급여해도 되나요?", "acceptedAnswer": { "@type": "Answer", "text": "병용 가능하나 몬모릴로나이트 흡착 특성상 처방약 전후 1~2시간 간격을 권장합니다. 수의사 상담 권장." } },
          { "@type": "Question", "name": "어린 새끼나 임신 모체에도 안전한가요?", "acceptedAnswer": { "@type": "Answer", "text": "체내 흡수되지 않고 대변으로 배출되는 물리적 코팅/흡착 원리로 생후 30일령 전후 자견·자묘에도 부담이 낮으나, 급여 전 수의사 상담을 권장합니다." } },
          { "@type": "Question", "name": "새, 앵무새, 조류(반려조)가 물설사나 소낭 정체를 보일 때도 안전하게 급여 가능한가요?", "acceptedAnswer": { "@type": "Answer", "text": "네, 매우 안전합니다. 순수 천연 몬모릴로나이트의 비흡수성 물리적 점막 코팅 원리로 체구가 작은 앵무새도 간·신장 부담 없이 부리 끝에 1방울(약 0.1ml)만 묻혀주면 24시간 내 빠른 변 안정화에 큰 도움을 줍니다." } },
          { "@type": "Question", "name": "개봉 후 보관 방법과 유효기간은?", "acceptedAnswer": { "@type": "Answer", "text": "직사광선을 피해 상온 1~30℃ 보관 시 제조일로부터 18개월. 펌프 캡을 닫아 보관하세요." } }
        ]
      },
      {
        "@type": "VideoObject",
        "name": "55일령 강아지 임상 관찰 7일 기록 — 파보겔 다큐멘터리",
        "description": "급성 장염·발작 증상의 55일령 환축 임상 관찰 영상. 보조사료 파보겔 급여 후 경과 관찰 기록.",
        "thumbnailUrl": seo.image,
        "uploadDate": "2026-08-28",
        "embedUrl": absoluteUrl('/#video'),
        "contentUrl": absoluteUrl('/og-image.png')
      },
      {
        "@type": "VideoObject",
        "name": "홍대표 앵무새 꼬미 24시간 급성 설사 회복 실화 직캠 쇼츠",
        "description": "낙조 위기였던 앵무새 꼬미에게 파보겔 1방울 급여 후 24시간 만에 정상 변을 보고 활력을 되찾은 실제 케어 유튜브 쇼츠 영상.",
        "thumbnailUrl": absoluteUrl('/images/gomi/gomi_after_close.jpg'),
        "uploadDate": "2026-09-15",
        "embedUrl": "https://www.youtube.com/embed/2vGdq9EbDwA",
        "contentUrl": "https://youtube.com/shorts/2vGdq9EbDwA"
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": breadcrumbs ? breadcrumbs.map((b, i) => ({
          "@type": "ListItem",
          "position": i + 1,
          "name": b.name,
          "item": absoluteUrl(b.url)
        })) : [
          { "@type": "ListItem", "position": 1, "name": "홈", "item": SITE_URL },
          { "@type": "ListItem", "position": 2, "name": "파보겔", "item": SITE_URL }
        ]
      }
    ]
  };

  const schema = structuredData || defaultStructuredData;

  // hreflang: generate ?lng= alternates + x-default (ko)
  const hreflangLinks = SUPPORTED_HREFLANGS.map((lng) => ({
    rel: 'alternate',
    hreflang: lng,
    href: lng === 'ko' ? siteUrl : `${siteUrl}?lng=${lng}`,
  }));
  const xDefaultHref = siteUrl;

  return (
    <Helmet>
      {/* Standard Meta Tags */}
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      <meta name="keywords" content="파보겔, parvogel, 몬스멕타, 강아지설사, 고양이설사, 앵무새설사, 새설사, 반려조물설사, 조류낙조예방, 소낭정체, 파보장염, 1초펌프, 한국아그로" />
      <link rel="canonical" href={seo.url} />
      {hreflangLinks.map((l) => (
        <link key={l.hreflang} rel={l.rel} hrefLang={l.hreflang} href={l.href} />
      ))}
      <link rel="alternate" hrefLang="x-default" href={xDefaultHref} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={seo.url} />
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:image" content={seo.image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content="파보겔(Parvogel) — 5가지 복합 겔 타입 보조사료" />
      <meta property="og:site_name" content="파보겔 (Parvogel)" />
      <meta name="author" content="(주)한국아그로" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={seo.url} />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:description" content={seo.description} />
      <meta name="twitter:image" content={seo.image} />
      <meta name="twitter:image:alt" content="파보겔(Parvogel) — 5가지 복합 겔 타입 보조사료" />

      {/* Schema.org JSON-LD */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
}
