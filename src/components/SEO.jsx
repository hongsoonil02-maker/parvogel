import React from 'react';
import { Helmet } from 'react-helmet-async';
import { SITE_URL, absoluteUrl } from '../config/site';

export default function SEO({ title, description, url, type = 'website', image, structuredData }) {
  // canonical/OG 기준은 site.js의 단일 상수 사용 (GitHub Pages 실배포 URL)
  const siteUrl = SITE_URL;
  const defaultTitle = '파보겔(Parvo Gel) - 쓰러진 강아지의 기적의 7일 회복 실화 | 반려견·전축종 급성 설사 케어';
  const defaultDescription = '1-deoxinojirimycin & Patent No. 2011B0042620.8 특허균주 복합제 파보겔. 1초 원터치 펌프로 주사기 없이 스트레스 제로 급여. 쓰러진 55일령 강아지의 7일 회복 실화.';

  const seo = {
    title: title ? `${title} | 파보겔(Parvogel)` : defaultTitle,
    description: description || defaultDescription,
    url: url ? absoluteUrl(url) : siteUrl,
    image: image || absoluteUrl('/assets/parvogel-authentic.png'), // 기본 정품 이미지
  };

  // 기본 제품 구조화된 데이터 (가격은 실제 판매가: 100ml 18,000원 ~ 500ml 75,000원)
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
      "lowPrice": "18000",
      "highPrice": "75000",
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
