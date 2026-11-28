import React from 'react';
import { Helmet } from 'react-helmet-async';
import { SITE_URL, absoluteUrl } from '../config/site';

const SUPPORTED_HREFLANGS = ['ko','en','ja','zh','es','fr','de','th','vi','ru','pt','ar','id','ms','tr'];

export default function SEO({ title, description, url, type = 'website', image, structuredData, breadcrumbs }) {
  const siteUrl = SITE_URL;
  const defaultTitle = '파보겔(Parvogel) 공식몰 — 강아지·고양이 급성 묽은 변·파보장염 케어 1초 펌프 보조사료 | 한국아그로';
  const defaultDescription = '55일령 아기 강아지 7일간의 드라마틱한 회복 관찰 기록. 강아지·고양이·앵무새(반려조) 급성 묽은 변·구토·혈변·소낭정체 시 1초 펌프/1방울로 장 점막 코팅 및 독소 흡착 배출을 돕는 보조사료. 쿠팡 로켓배송 & 네이버 스마트스토어 공식 배송.';

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
        "@id": "https://parvogel.kr/#product",
        "name": "파보겔 (Parvogel)",
        "alternateName": ["동물용 파보겔", "반려동물 장 케어 파보겔", "Parvogel"],
        "image": seo.image,
        "description": seo.description,
        "brand": {
          "@type": "Brand",
          "name": "파보겔 (Parvogel)"
        },
        "manufacturer": {
          "@type": "Organization",
          "name": "(주)한국아그로",
          "url": "https://parvogel.kr/"
        },
        "category": "동물용 보조사료 / 반려동물 장 건강 케어",
        "offers": {
          "@type": "AggregateOffer",
          "url": seo.url,
          "priceCurrency": "KRW",
          "lowPrice": "18000",
          "highPrice": "60000",
          "offerCount": "3",
          "availability": "https://schema.org/InStock",
          "seller": {
            "@type": "Organization",
            "name": "(주)한국아그로"
          }
        },
        "additionalProperty": [
          { "@type": "PropertyValue", "name": "제형", "value": "겔 타입 펌프" },
          { "@type": "PropertyValue", "name": "보관", "value": "상온 1~30℃ 18개월" },
          { "@type": "PropertyValue", "name": "대상동물", "value": "강아지, 고양이, 앵무새(반려조) 등 반려동물" },
          { "@type": "PropertyValue", "name": "주요성분", "value": "초미세 나노 몬모릴로나이트, 1-DNJ, 특허균주, 유기산 완충계" }
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
        "name": "생후 55일 아기 푸들 실제 진료실 28초 회복 기록 — 파보겔",
        "description": "급성 소화기 증상으로 내원한 생후 55일 아기 푸들의 하남 사랑동물병원 김동준 원장 실제 진료실 관찰 기록. 파보겔 1초 펌프 급여 후 3일 만에 자력 기립 및 사료 완식 회복 관찰.",
        "thumbnailUrl": absoluteUrl('/assets/parvogel_real_clinical_poster.jpg'),
        "uploadDate": "2026-11-22",
        "embedUrl": absoluteUrl('/#parvogel-clinical-doc'),
        "contentUrl": absoluteUrl('/assets/parvogel_real_clinical_28s_landing.mp4')
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
      },
      {
        "@type": "HowTo",
        "@id": "https://parvogel.kr/#howto",
        "name": "강아지·고양이 급성 설사·구토 발생 시 파보겔 1초 펌프 응급 급여법",
        "description": "아이가 구토와 설사로 기력을 잃었을 때 주사기 스트레스 없이 1초 만에 안전하게 급여하는 수의학적 응급 대처법",
        "step": [
          {
            "@type": "HowToStep",
            "name": "1단계: 탈수 및 체온 안정화",
            "text": "목덜미 피부를 살짝 당겨 탈수도를 확인하고, 체온이 떨어지지 않도록 미온 패드나 담요로 보온합니다."
          },
          {
            "@type": "HowToStep",
            "name": "2단계: 1초 원터치 펌프 급여",
            "text": "주사기 거품 토해냄 없이 입을 가볍게 벌리고 혀 뒤편이나 잇몸에 파보겔을 1~2회(약 1~2ml) 펌핑하여 묻혀줍니다."
          },
          {
            "@type": "HowToStep",
            "name": "3단계: 장 점막 코팅 및 경과 관찰",
            "text": "초미세 나노 몬모릴로나이트가 장 점막을 즉시 코팅하고 유해 독소를 흡착 배출하도록 휴식을 취하게 한 뒤 동물병원 진료를 연계합니다."
          }
        ]
      },
      {
        "@type": "FAQPage",
        "@id": "https://parvogel.kr/#faq",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "새끼 강아지가 피설사나 물설사를 할 때 병원에 가기 전 응급처치는 어떻게 하나요?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "새끼 강아지는 탈수와 저혈당 쇼크가 급속도로 오므로 절식시키지 말고, 즉시 체온을 유지한 뒤 파보겔을 입안에 1~2회 펌핑하여 장 점막을 즉시 코팅하고 전해질을 공급해 주어야 합니다. 주사기로 억지로 물을 먹이면 기도로 넘어갈 수 있으므로 부드러운 겔 형태인 파보겔로 1초 만에 케어하는 것이 안전합니다."
            }
          },
          {
            "@type": "Question",
            "name": "강아지 지사제로 일반 화학 약품을 먹이면 왜 위험한가요?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "일반 화학 지사제는 장 운동을 강제로 멈추어 배출되어야 할 유해균과 독소를 장내에 가두어 장벽을 더 자극할 수 있습니다. 반면 파보겔은 체내 흡수율 0%인 100% 천연 초미세 몬모릴로나이트로 장을 억지로 마비시키지 않고 장내 유해 물질만 물리적으로 흡착하여 대변과 함께 안전하게 배출되도록 돕습니다."
            }
          },
          {
            "@type": "Question",
            "name": "강아지·고양이 급성 설사나 파보장염 의심 시 어떻게 급여하나요?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "아이가 구토나 물설사로 지쳐 있을 때 입을 가볍게 벌리고 혀 뒤편이나 잇몸에 1~2회 펌핑하여 급여합니다. 주사기 거품 토해냄 없이 아이가 스스로 핥아먹으며, 물리적 점막 코팅과 독소 흡착을 즉각 돕습니다."
            }
          },
          {
            "@type": "Question",
            "name": "동물병원 처방약과 병용 급여가 가능한가요?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "병용이 가능하나, 나노 몬모릴로나이트의 강력한 물리적 흡착 특성상 동물병원 처방약 투약 전후 1~2시간의 시간 간격을 두고 급여하시는 것을 권장합니다."
            }
          },
          {
            "@type": "Question",
            "name": "새, 앵무새, 조류(반려조)의 급성 물설사나 소낭 정체에도 급여할 수 있나요?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "네, 매우 안전합니다. 순수 천연 몬모릴로나이트의 비흡수성 물리적 점막 코팅 원리로 체구가 작고 대사가 빠른 앵무새에게도 간·신장 부담 없이 부리 끝에 1방울(약 0.1ml)만 살짝 묻혀주면 24시간 내 빠른 변 안정화에 큰 도움이 됩니다."
            }
          }
        ]
      },
      {
        "@type": "VideoObject",
        "@id": "https://parvogel.kr/#video-clinical",
        "name": "생후 55일 아기 푸들 실제 진료실 28초 회복 기록 — 파보겔",
        "description": "급성 소화기 증상으로 내원한 생후 55일 아기 푸들의 하남 사랑동물병원 김동준 원장 실제 진료실 관찰 기록. 파보겔 1초 펌프 급여 후 3일 만에 자력 기립 및 사료 완식 회복 관찰.",
        "thumbnailUrl": "https://parvogel.kr/assets/parvogel_real_clinical_poster.jpg",
        "uploadDate": "2026-11-22",
        "embedUrl": "https://parvogel.kr/#parvogel-clinical-doc",
        "contentUrl": "https://parvogel.kr/assets/parvogel_real_clinical_28s_landing.mp4"
      },
      {
        "@type": "VideoObject",
        "@id": "https://parvogel.kr/#video-gomi",
        "name": "홍대표 앵무새 꼬미 24시간 급성 설사 회복 실화 직캠 쇼츠",
        "description": "낙조 위기였던 앵무새 꼬미에게 파보겔 1방울 급여 후 24시간 만에 정상 변을 보고 활력을 되찾은 실제 케어 유튜브 쇼츠 영상.",
        "thumbnailUrl": "https://parvogel.kr/images/gomi/gomi_after_close.jpg",
        "uploadDate": "2026-09-15",
        "embedUrl": "https://www.youtube.com/embed/2vGdq9EbDwA",
        "contentUrl": "https://youtube.com/shorts/2vGdq9EbDwA"
      }
    ]
  };

  const schema = structuredData;

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
      <meta name="keywords" content="파보겔, parvogel, 강아지설사, 강아지장케어, 강아지묽은변, 고양이설사, 앵무새설사, 새설사, 반려조물설사, 조류낙조예방, 소낭정체, 파보장염, 1초펌프, 한국아그로" />
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
      <meta property="og:image:alt" content="파보겔(Parvogel) — 강아지·고양이·앵무새 급성 설사·구토 1초 펌프 케어, 체내 흡수 0% 간·신장 부담 없음" />
      <meta property="og:site_name" content="파보겔 (Parvogel)" />
      <meta name="author" content="(주)한국아그로" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={seo.url} />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:description" content={seo.description} />
      <meta name="twitter:image" content={seo.image} />
      <meta name="twitter:image:alt" content="파보겔(Parvogel) — 강아지·고양이·앵무새 급성 설사·구토 1초 펌프 케어, 체내 흡수 0% 간·신장 부담 없음" />

      {/* Schema.org JSON-LD */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
}
