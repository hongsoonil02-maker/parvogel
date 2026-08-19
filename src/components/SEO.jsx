import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function SEO({ title, description, url, type = 'website', image, structuredData }) {
  const siteUrl = 'https://parvogel.com'; // 실제 도메인으로 변경하세요
  const defaultTitle = '파보겔(Parvogel) - 송아지 설사 특효 지사 보조제';
  const defaultDescription = '고순도 나노 몬모릴로나이트가 함유된 파보겔은 송아지, 자돈 등 가축의 설사를 빠르게 멎게 하고 장 건강을 회복시키는 프리미엄 지사 보조제입니다.';
  
  const seo = {
    title: title ? `${title} | 파보겔(Parvogel)` : defaultTitle,
    description: description || defaultDescription,
    url: url ? `${siteUrl}${url}` : siteUrl,
    image: image || `${siteUrl}/assets/parvogel-1.jpg`, // 기본 이미지
  };

  // 기본 제품 구조화된 데이터
  const defaultStructuredData = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": "파보겔 (Parvogel)",
    "image": seo.image,
    "description": seo.description,
    "brand": {
      "@type": "Brand",
      "name": "Parvogel"
    },
    "offers": {
      "@type": "AggregateOffer",
      "url": seo.url,
      "priceCurrency": "KRW",
      "lowPrice": "40000",
      "highPrice": "150000",
      "availability": "https://schema.org/InStock"
    }
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
