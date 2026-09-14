import React from 'react';
import { Helmet } from 'react-helmet-async';
import { SITE_URL, absoluteUrl } from '../config/site';

export default function SEO({ title, description, url, type = 'website', image, structuredData, breadcrumbs }) {
  const siteUrl = SITE_URL;
  const defaultTitle = '파보겔(Parvo Gel) — 급성 설사·장염 보조 케어 보조사료 | 반려견·전축종';
  const defaultDescription = '보조사료 파보겔. 1-deoxinojirimycin & 특허균주 복합, 1초 원터치 펌프 급여. 장 점막 보호막 코팅 및 독소 흡착 배출에 도움을 줄 수 있음. *질병 치료 대체 불가.';

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
          { "@type": "Question", "name": "개봉 후 보관 방법과 유효기간은?", "acceptedAnswer": { "@type": "Answer", "text": "직사광선을 피해 상온 1~30℃ 보관 시 제조일로부터 18개월. 펌프 캡을 닫아 보관하세요." } }
        ]
      },
      {
        "@type": "VideoObject",
        "name": "55일령 강아지 임상 관찰 7일 기록 — 파보겔 다큐멘터리",
        "description": "급성 장염·발작 증상의 55일령 환축 임상 관찰 영상. 보조사료 파보겔 급여 후 경과 관찰 기록.",
        "thumbnailUrl": seo.image,
        "uploadDate": "2026-08-28",
        "contentUrl": absoluteUrl('/assets/parvogel_clinical_documentary_v2.mp4')
      }
    ]
  };

  const schema = structuredData || defaultStructuredData;

  return (
    <Helmet>
      {/* Standard Meta Tags */}
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      <link rel="canonical" href={seo.url} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={seo.url} />
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:image" content={seo.image} />
      <meta property="og:site_name" content="파보겔 (Parvogel)" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={seo.url} />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:description" content={seo.description} />
      <meta name="twitter:image" content={seo.image} />

      {/* Schema.org JSON-LD */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
}
