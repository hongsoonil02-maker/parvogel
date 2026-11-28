# Create a completely new weekly_review.py with only ASCII in Python code
# Korean text only in HTML template strings

new_content = '''#!/usr/bin/env python3
"""
Weekly Review Automation -- Weekly Performance Review Automation
- Dashboard data collection
- Automated report generation (Markdown/HTML)
- Slack/Email notification integration
"""

# Load environment
from dotenv import load_dotenv
load_dotenv()

import os
import json
import sqlite3
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, asdict
import statistics

# Configuration
REPORTS_DIR = os.getenv("REPORTS_DIR", "reports")
DB_PATH = os.getenv("WEEKLY_REVIEW_DB", "weekly_review.db")
SLACK_WEBHOOK_URL = os.getenv("SLACK_WEBHOOK_URL")

os.makedirs(REPORTS_DIR, exist_ok=True)


@dataclass
class PublishingMetrics:
    """Publishing metrics data class"""
    channel: str
    posts_count: int
    total_views: int
    total_likes: int
    total_comments: int
    total_shares: int
    avg_engagement_rate: float
    best_post_id: str
    best_post_views: int


@dataclass
class ContentAnalysis:
    """Content analysis data class"""
    total_posts: int
    by_theme: Dict[str, int]
    by_format: Dict[str, int]
    top_keywords: List[str]
    avg_length: float


@dataclass
class CreativeFatigue:
    """Creative fatigue data class"""
    creative_id: str
    channel: str
    impressions: int
    clicks: int
    ctr: float
    engagement_rate: float
    fatigue_score: float
    status: str  # "healthy", "warning", "critical"


@dataclass
class CompetitorTrend:
    """Competitor trend data class"""
    competitor: str
    channel: str
    posts_count: int
    avg_engagement: float
    top_content: List[str]
    recommended_actions: List[str]


@dataclass
class ABTestResult:
    """A/B test result data class"""
    test_id: str
    variant_a: str
    variant_b: str
    metric: str
    a_value: float
    b_value: float
    winner: str
    p_value: float
    confidence: float


class WeeklyReview:
    """Weekly Review Automation Class"""

    def __init__(self):
        self.reports_dir = REPORTS_DIR
        self.db_path = DB_PATH
        self._init_db()

    def _init_db(self):
        """Initialize database"""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS publishing_log (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    channel TEXT,
                    post_id TEXT,
                    title TEXT,
                    views INTEGER,
                    likes INTEGER,
                    comments INTEGER,
                    shares INTEGER,
                    published_at TEXT,
                    theme TEXT,
                    format TEXT
                )
            """)
            conn.execute("""
                CREATE TABLE IF NOT EXISTS creative_performance (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    creative_id TEXT,
                    channel TEXT,
                    impressions INTEGER,
                    clicks INTEGER,
                    ctr REAL,
                    engagement_rate REAL,
                    fatigue_score REAL,
                    status TEXT,
                    recorded_at TEXT
                )
            """)
            conn.execute("""
                CREATE TABLE IF NOT EXISTS competitor_monitoring (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    competitor TEXT,
                    channel TEXT,
                    posts_count INTEGER,
                    avg_engagement REAL,
                    top_content TEXT,
                    recommended_actions TEXT,
                    recorded_at TEXT
                )
            """)
            conn.execute("""
                CREATE TABLE IF NOT EXISTS ab_tests (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    test_id TEXT,
                    variant_a TEXT,
                    variant_b TEXT,
                    metric TEXT,
                    a_value REAL,
                    b_value REAL,
                    winner TEXT,
                    p_value REAL,
                    confidence REAL,
                    recorded_at TEXT
                )
            """)
            conn.commit()

    def _get_week_period(self) -> Dict[str, str]:
        """Get current week period"""
        now = datetime.now()
        start_of_week = now - timedelta(days=now.weekday())
        start_of_week = start_of_week.replace(hour=0, minute=0, second=0, microsecond=0)
        end_of_week = start_of_week + timedelta(days=6, hours=23, minutes=59, seconds=59)
        
        return {
            "start": start_of_week.strftime("%Y-%m-%d"),
            "end": end_of_week.strftime("%Y-%m-%d"),
            "week_number": start_of_week.isocalendar()[1],
            "year": start_of_week.isocalendar()[0]
        }

    def collect_publishing_metrics(self) -> List[PublishingMetrics]:
        """Collect publishing metrics from database"""
        period = self._get_week_period()
        
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute("""
                SELECT channel, COUNT(*) as posts_count,
                       SUM(views) as total_views,
                       SUM(likes) as total_likes,
                       SUM(comments) as total_comments,
                       SUM(shares) as total_shares,
                       AVG(CASE WHEN views > 0 THEN (likes + comments + shares) * 1.0 / views ELSE 0 END) as avg_engagement_rate,
                       MAX(CASE WHEN views = (SELECT MAX(views) FROM publishing_log WHERE channel = pl.channel AND published_at >= ? AND published_at <= ?) THEN post_id END) as best_post_id,
                       MAX(views) as best_post_views
                FROM publishing_log pl
                WHERE published_at >= ? AND published_at <= ?
                GROUP BY channel
            """, (period["start"], period["end"], period["start"], period["end"]))
            
            results = []
            for row in cursor.fetchall():
                results.append(PublishingMetrics(
                    channel=row[0],
                    posts_count=row[1],
                    total_views=row[2] or 0,
                    total_likes=row[3] or 0,
                    total_comments=row[4] or 0,
                    total_shares=row[5] or 0,
                    avg_engagement_rate=row[6] or 0.0,
                    best_post_id=row[7] or "",
                    best_post_views=row[8] or 0
                ))
            return results

    def analyze_content_performance(self) -> ContentAnalysis:
        """Analyze content performance"""
        period = self._get_week_period()
        
        with sqlite3.connect(self.db_path) as conn:
            # By theme
            cursor = conn.execute("""
                SELECT theme, COUNT(*) as count
                FROM publishing_log
                WHERE published_at >= ? AND published_at <= ?
                GROUP BY theme
            """, (period["start"], period["end"]))
            by_theme = {row[0]: row[1] for row in cursor.fetchall()}
            
            # By format
            cursor = conn.execute("""
                SELECT format, COUNT(*) as count
                FROM publishing_log
                WHERE published_at >= ? AND published_at <= ?
                GROUP BY format
            """, (period["start"], period["end"]))
            by_format = {row[0]: row[1] for row in cursor.fetchall()}
            
            # Total posts
            cursor = conn.execute("""
                SELECT COUNT(*) FROM publishing_log
                WHERE published_at >= ? AND published_at <= ?
            """, (period["start"], period["end"]))
            total_posts = cursor.fetchone()[0]
            
            # Top keywords (simplified)
            cursor = conn.execute("""
                SELECT title FROM publishing_log
                WHERE published_at >= ? AND published_at <= ?
            """, (period["start"], period["end"]))
            titles = [row[0] for row in cursor.fetchall()]
            
            # Simple keyword extraction
            from collections import Counter
            import re
            words = []
            for title in titles:
                words.extend(re.findall(r'[가-힣a-zA-Z]+', title.lower()))
            top_keywords = [word for word, _ in Counter(words).most_common(10)]
            
            # Average length
            avg_length = sum(len(t) for t in titles) / len(titles) if titles else 0
            
            return ContentAnalysis(
                total_posts=total_posts,
                by_theme=by_theme,
                by_format=by_format,
                top_keywords=top_keywords,
                avg_length=avg_length
            )

    def check_creative_fatigue(self) -> List[CreativeFatigue]:
        """Check creative fatigue"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute("""
                SELECT creative_id, channel, impressions, clicks, ctr, engagement_rate, fatigue_score, status
                FROM creative_performance
                WHERE recorded_at >= date('now', '-7 days')
                ORDER BY fatigue_score DESC
            """)
            
            results = []
            for row in cursor.fetchall():
                results.append(CreativeFatigue(
                    creative_id=row[0],
                    channel=row[1],
                    impressions=row[2],
                    clicks=row[3],
                    ctr=row[4],
                    engagement_rate=row[5],
                    fatigue_score=row[6],
                    status=row[7]
                ))
            return results

    def monitor_competitors(self) -> List[CompetitorTrend]:
        """Monitor competitor trends"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute("""
                SELECT competitor, channel, posts_count, avg_engagement, top_content, recommended_actions
                FROM competitor_monitoring
                WHERE recorded_at >= date('now', '-7 days')
            """)
            
            results = []
            for row in cursor.fetchall():
                results.append(CompetitorTrend(
                    competitor=row[0],
                    channel=row[1],
                    posts_count=row[2],
                    avg_engagement=row[3],
                    top_content=json.loads(row[4]) if row[4] else [],
                    recommended_actions=json.loads(row[5]) if row[5] else []
                ))
            return results

    def get_ab_test_results(self) -> List[ABTestResult]:
        """Get A/B test results"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute("""
                SELECT test_id, variant_a, variant_b, metric, a_value, b_value, winner, p_value, confidence
                FROM ab_tests
                WHERE recorded_at >= date('now', '-7 days')
            """)
            
            results = []
            for row in cursor.fetchall():
                results.append(ABTestResult(
                    test_id=row[0],
                    variant_a=row[1],
                    variant_b=row[2],
                    metric=row[3],
                    a_value=row[4],
                    b_value=row[5],
                    winner=row[6],
                    p_value=row[7],
                    confidence=row[8]
                ))
            return results

    def render_markdown_report(self, report: Dict) -> str:
        """Render markdown report"""
        period = report["period"]
        publishing = report["publishing_metrics"]
        content = report["content_analysis"]
        fatigue = report["creative_fatigue"]
        competitor = report["competitor_trends"]
        ab_tests = report["ab_tests"]
        
        md = f"""# 파보겔 주간 마케팅 리포트 (W{period['week_number']}, {period['year']})

**기간**: {period['start']} ~ {period['end']}
**생성일시**: {report['generated_at'][:19].replace('T', ' ')}

---

## 1. 발행 성과 요약

| 채널 | 발행 수 | 총 조회수 | 총 좋아요 | 총 댓글 | 총 공유 | 평균 참여율 | 베스트 포스트 |
|------|---------|-----------|-----------|---------|---------|-------------|---------------|
"""
        for p in publishing:
            md += f"| {p.channel} | {p.posts_count} | {p.total_views:,} | {p.total_likes:,} | {p.total_comments:,} | {p.total_shares:,} | {p.avg_engagement_rate:.2%} | {p.best_post_id} ({p.best_post_views:,}) |\n"
        
        md += f"""
## 2. 콘텐츠 분석

**총 발행 수**: {content.total_posts}건
**평균 길이**: {content.avg_length:.0f}자

### 테마별 분포
"""
        for theme, count in content.by_theme.items():
            md += f"- {theme}: {count}건\n"
        
        md += "\n### 포맷별 분포\n"
        for fmt, count in content.by_format.items():
            md += f"- {fmt}: {count}건\n"
        
        md += f"\n### 상위 키워드\n"
        for kw in content.top_keywords:
            md += f"- {kw}\n"
        
        md += f"""
## 3. 크리에이티브 피로도 현황

| 크리에이티브 | 채널 | 노출수 | 클릭수 | CTR | 참여율 | 피로도 점수 | 상태 |
|--------------|------|--------|--------|-----|--------|-------------|------|
"""
        for f in fatigue:
            md += f"| {f.creative_id} | {f.channel} | {f.impressions:,} | {f.clicks:,} | {f.ctr:.2%} | {f.engagement_rate:.2%} | {f.fatigue_score:.1f} | {f.status} |\n"
        
        high_fatigue = [f for f in fatigue if f.status in ["warning", "critical"]]
        md += f"\n**높은 피로도 크리에이티브**: {len(high_fatigue)}개\n"
        
        md += f"""
## 4. 경쟁사 동향

"""
        for c in competitor:
            md += f"### {c.competitor} ({c.channel})\n"
            md += f"- 발행 수: {c.posts_count}건\n"
            md += f"- 평균 참여율: {c.avg_engagement:.2%}\n"
            md += f"- 추천 액션: {', '.join(c.recommended_actions) if c.recommended_actions else '없음'}\n\n"
        
        md += f"""
## 5. A/B 테스트 현황

"""
        active_tests = [t for t in ab_tests if t.winner == "pending"]
        completed_tests = [t for t in ab_tests if t.winner != "pending"]
        
        md += f"**진행 중**: {len(active_tests)}건\n"
        md += f"**완료**: {len(completed_tests)}건\n\n"
        
        for t in completed_tests:
            md += f"- **{t.test_id}**: {t.variant_a} vs {t.variant_b} ({t.metric}) -> 승자: {t.winner} (p={t.p_value:.4f}, 신뢰도: {t.confidence:.1%})\n"
        
        md += f"""
## 6. 차주 액션 아이템

1. **크리에이티브 피로도 높은 크리에이티브**: {len(high_fatigue)}개 교체 필요
2. **긴급 조치 필요 알림**: 참여율 70% 미만 크리에이티브 즉시 점검
3. **경쟁사 동향**: {len(competitor)}개 경쟁사 모니터링, {sum(len(c.recommended_actions) for c in competitor)}개 액션 아이템 도출
4. **A/B 테스트**: 진행 중 {len(active_tests)}건, 완료 {len(completed_tests)}건 중 유의미한 결과 도출
5. **콘텐츠 집중도**: 주요 3개 테마가 전체의 {sum(sorted(content.by_theme.values(), reverse=True)[:3])}건 차지

---

*자동 생성: {report['generated_at'][:19].replace('T', ' ')} | 파보겔 마케팅 팩토리
"""
        return md

    def render_html_report(self, report: Dict) -> str:
        """HTML Report Rendering"""
        md = self.render_markdown_report(report)
        # Markdown to HTML conversion
        html = md.replace('\n', '<br>').replace('# ', '<h1>').replace('## ', '<h2>').replace('### ', '<h3>')
        html_template = """<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>파보겔 주간 마케팅 리포트</title>
    <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Pretendard', sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }}
        h1 {{ color: #1e40af; border-bottom: 2px solid #1e40af; padding-bottom: 10px; }}
        h2 {{ color: #374151; margin-top: 30px; }}
        table {{ width: 100%; border-collapse: collapse; margin: 15px 0; }}
        th, td {{ border: 1px solid #e5e7eb; padding: 10px; text-align: left; }}
        th {{ background: #f3f4f6; }}
        .alert {{ background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 15px 0; }}
        .success {{ background: #f0fdf4; border-left: 4px solid #22c55e; padding: 15px; margin: 15px 0; }}
        .warning {{ background: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px; margin: 15px 0; }}
        code {{ background: #f3f4f6; padding: 2px 6px; border-radius: 4px; }}
        .footer {{ margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }}
    </style>
</head>
<body>
{html}
<div class="footer">자동 생성: {dt} | 파보겔 마케팅 팩토리</div>
</body>
</html>"""
        return html_template.format(html=html, dt=datetime.now().strftime('%Y-%m-%d %H:%M'))

    def save_report(self, report: Dict, formats: List[str] = ["md", "html"]) -> Dict[str, str]:
        """Save report"""
        period = report["period"]
        filename_base = f"weekly_report_W{period['week_number']}_{period['start']}"
        
        saved = {}
        
        if "md" in formats:
            md_path = os.path.join(self.reports_dir, f"{filename_base}.md")
            md_content = self.render_markdown_report(report)
            with open(md_path, "w", encoding="utf-8") as f:
                f.write(md_content)
            saved["markdown"] = md_path
        
        if "html" in formats:
            html_path = os.path.join(self.reports_dir, f"{period['start']}_weekly_report.html")
            html_content = self.render_html_report(report)
            with open(html_path, "w", encoding="utf-8") as f:
                f.write(html_content)
            saved["html"] = html_path
        
        # Save JSON original
        json_path = os.path.join(self.reports_dir, f"{filename_base}.json")
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(report, f, ensure_ascii=False, indent=2)
        saved["json"] = json_path
        
        return saved

    def generate_weekly_report(self) -> Dict:
        """Generate weekly report"""
        period = self._get_week_period()
        
        publishing = self.collect_publishing_metrics()
        content = self.analyze_content_performance()
        fatigue = self.check_creative_fatigue()
        competitor = self.monitor_competitors()
        ab_tests = self.get_ab_test_results()
        
        report = {
            "period": period,
            "generated_at": datetime.now().isoformat(),
            "publishing_metrics": [asdict(p) for p in publishing],
            "content_analysis": asdict(content),
            "creative_fatigue": [asdict(f) for f in fatigue],
            "competitor_trends": [asdict(c) for c in competitor],
            "ab_tests": [asdict(t) for t in ab_tests]
        }
        
        # Save reports
        self.save_report(report)
        
        return report

    def send_slack_notification(self, report: Dict) -> bool:
        """Send Slack notification"""
        if not SLACK_WEBHOOK_URL:
            return False
        
        period = report["period"]
        publishing = report["publishing_metrics"]
        total_views = sum(p["total_views"] for p in publishing)
        total_posts = sum(p["posts_count"] for p in publishing)
        
        payload = {
            "text": f"파보겔 주간 리포트 (W{period['week_number']}) 완료",
            "blocks": [
                {
                    "type": "header",
                    "text": {"type": "plain_text", "text": "파보겔 주간 마케팅 리포트"}
                },
                {
                    "type": "section",
                    "fields": [
                        {"type": "mrkdwn", "text": f"*기간*: {period['start']} ~ {period['end']}"},
                        {"type": "mrkdwn", "text": f"*총 발행*: {total_posts}건"},
                        {"type": "mrkdwn", "text": f"*총 조회수*: {total_views:,}"},
                        {"type": "mrkdwn", "text": f"*주차*: W{period['week_number']}"}
                    ]
                }
            ]
        }
        
        try:
            import requests
            response = requests.post(SLACK_WEBHOOK_URL, json=payload, timeout=10)
            return response.status_code == 200
        except Exception:
            return False


def main():
    """Main entry point"""
    review = WeeklyReview()
    report = review.generate_weekly_report()
    review.send_slack_notification(report)
    print(f"Weekly report generated: W{report['period']['week_number']}")


if __name__ == "__main__":
    main()
'''

# Write to the original file
with open('C:/Users/master/parvogel_landing/marketing_factory/core/weekly_review.py', 'w', encoding='utf-8') as f:
    f.write(new_content)
print('Write to original file done')

# Test compilation
try:
    compile(new_content, 'weekly_review.py', 'exec')
    print('Compilation successful!')
except SyntaxError as e:
    print('SyntaxError:', e)
    print('Line', e.lineno, ':', e.text)