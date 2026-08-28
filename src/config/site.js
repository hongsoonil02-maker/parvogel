// 사이트 전역 상수 — canonical/OG/구조화데이터의 단일 기준 URL
// 실제 서비스 도메인(public/CNAME, index.html og:url과 동일).
// ⚠️ 도메인 변경 시 이 값과 함께 index.html의 og:url·og:image·twitter:image 및 public/CNAME도 반드시 같이 갱신할 것.
export const SITE_URL = 'https://parvogel.kr'

// 베이스 경로(/parvogel/ 등)를 반영한 애셋 경로 — GitHub Pages 하위 경로 배포 대응
export const assetUrl = (path) => {
    const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '')
    return `${base}/${String(path).replace(/^\//, '')}`
}

// SEO/canonical 등 외부 공개용 절대 URL
export const absoluteUrl = (path) =>
    `${SITE_URL}/${String(path).replace(/^\//, '')}`
