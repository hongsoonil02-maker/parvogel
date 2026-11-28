#!/usr/bin/env python3
"""
Weekly Review Automation — 주간 성과 리뷰 자동화
- 대시보드 데이터 수집 및 분석
- 자동 리포트 생성 (Markdown/HTML)
- 핵심 지표 트렌드 분석
- 액션 아이템 도출
- 슬랙/이메일/카카오 채널 발송
"""

import os
import json
import sqlite3
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from pathlib import Path

# Load environment
from dotenv import load_dotenv
current_dir = os.path.dirname(os.path.abspath(__file__))
factory_dir = os.path.dirname(current_dir)
load_dotenv(os.path.join(factory_dir, ".env"))

class WeeklyReview:
    """주간 성과 리뷰 자동화"""
    
    def __init__(self):
        self.factory_dir = factory_dir
        self.data_dir = os.path.join(factory_dir, "data")
        self.output_dir = os.path.join(factory_dir, "output")
        self.reports_dir = os.path.join(self.output_dir, "weekly_reports")
        os.makedirs(self.reports_dir, exist_ok=True)
        
        # 데이터 소스 경로
        self.ledger_path = os.path.join(self.data_dir, "published_ledger.json")
        self.fatigue_path = os.path.join(self.data_dir, "creative_fatigue.json")
        self.competitor_path = os.path.join(self.data_dir, "competitor_monitoring.json")
        self.ab_test_path = os.path.join(self.data_dir, "ab_test_results.json")
        self.dashboard_path = os.path.join(self.output_dir, "viral_funnel_dashboard.html")
        
        # 알림 설정
        self.slack_webhook = os.environ.get("SLACK_WEBHOOK_URL", "")
        self.discord_webhook = os.environ.get("DISCORD_WEBHOOK_URL", "")
        self.kakao_channel = None  # KakaoChannelAdapter 인스턴스 주입 가능
        
    def load_json(self, path: str) -> Any:
        """JSON 파일 로드"""
        if os.path.exists(path):
            try:
                with open(path, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception as e:
                print(f"[WARN] Failed to load {path}: {e}")
        return {}
    
    def get_week_range(self, weeks_ago: int = 0) -> tuple:
        """주간 범위 계산 (월요일 기준)"""
        today = datetime.now()
        # 이번 주 월요일
        monday = today - timedelta(days=today.weekday())
        target_monday = monday - timedelta(weeks=weeks_ago)
        target_sunday = target_monday + timedelta(days=6)
        return target_monday, target_sunday
    
    def collect_ledger_data(self, weeks_ago: int = 0) -> List[Dict]:
        """주간 발행 장부 데이터 수집"""
        ledger = self.load_json(self.ledger_path)
        monday, sunday = self.get_week_range(weeks_ago)
        monday_str = monday.strftime("%Y-%m-%d")
        sunday_str = sunday.strftime("%Y-%m-%d")
        
        week_data = []
        for entry in ledger:
            entry_date = entry.get("date", "")
            if monday_str <= entry_date <= sunday_str:
                week_data.append(entry)
        
        return week_data
    
    def analyze_publishing_performance(self, week_data: List[Dict]) -> Dict:
        """발행 성과 분석"""
        if not week_data:
            return {"total_runs": 0, "success_rate": 0, "channels": {}}
        
        total_runs = len(week_data)
        channel_stats = {}
        
        for entry in week_data:
            results = entry.get("publish_results", {})
            for channel, result in results.items():
                if channel not in channel_stats:
                    channel_stats[channel] = {"total": 0, "success": 0, "failed": 0}
                
                channel_stats[channel]["total"] += 1
                if isinstance(result, str) and result.startswith("SUCCESS"):
                    channel_stats[channel]["success"] += 1
                elif result in ["FAILED", "ERROR"] or (isinstance(result, str) and result.startswith("ERROR")):
                    channel_stats[channel]["failed"] += 1
        
        # 성공률 계산
        for channel, stats in channel_stats.items():
            total = stats["total"]
            stats["success_rate"] = round(stats["success"] / total * 100, 1) if total > 0 else 0
        
        # 전체 성공률 (핵심 채널 기준)
        core_channels = ["YouTube_Shorts", "Instagram_Reels", "TikTok", "Facebook_Page", "Naver_Blog"]
        core_total = sum(channel_stats.get(c, {}).get("total", 0) for c in core_channels)
        core_success = sum(channel_stats.get(c, {}).get("success", 0) for c in core_channels)
        overall_success_rate = round(core_success / core_total * 100, 1) if core_total > 0 else 0
        
        return {
            "total_runs": total_runs,
            "overall_success_rate": overall_success_rate,
            "channels": channel_stats,
            "core_channels": core_channels
        }
    
    def analyze_content_performance(self, week_data: List[Dict]) -> Dict:
        """콘텐츠 성과 분석 (조회수, 참여도 등)"""
        # 실제로는 YouTube Analytics API, Instagram Insights API 등 연동 필요
        # 여기서는 발행된 콘텐츠 타입별 분석
        
        content_types = {}
        themes = {}
        
        for entry in week_data:
            theme = entry.get("theme", "Unknown")
            themes[theme] = themes.get(theme, 0) + 1
            
            video_file = entry.get("video_file", "")
            if "clinical" in video_file.lower() or "documentary" in video_file.lower():
                ctype = "임상 다큐"
            elif "ranking" in video_file.lower():
                ctype = "랭킹"
            elif "pump" in video_file.lower():
                ctype = "펌프 가이드"
            elif "review" in video_file.lower():
                ctype = "리뷰 훅"
            else:
                ctype = "기타"
            
            content_types[ctype] = content_types.get(ctype, 0) + 1
        
        return {
            "by_theme": themes,
            "by_content_type": content_types,
            "total_videos": len(week_data)
        }
    
    def analyze_creative_fatigue(self) -> Dict:
        """크리에이티브 피로도 분석"""
        fatigue_data = self.load_json(os.path.join(self.data_dir, "creative_fatigue.json"))
        
        if not fatigue_data or "creatives" not in fatigue_data:
            return {"status": "no_data", "alerts": []}
        
        alerts = []
        high_fatigue = []
        
        for creative_id, data in fatigue_data["creatives"].items():
            fatigue_score = data.get("fatigue_score", 0)
            if fatigue_score >= 75:
                high_fatigue.append({
                    "creative_id": creative_id,
                    "score": fatigue_score,
                    "signals": data.get("fatigue_signals", []),
                    "recommend_refresh": data.get("recommend_refresh", False)
                })
            elif fatigue_score >= 50:
                alerts.append({
                    "creative_id": creative_id,
                    "score": fatigue_score,
                    "signals": data.get("fatigue_signals", [])
                })
        
        return {
            "total_creatives": len(fatigue_data["creatives"]),
            "high_fatigue_count": len(high_fatigue),
            "alert_count": len(alerts),
            "high_fatigue": high_fatigue,
            "alerts": alerts
        }
    
    def analyze_competitor_trends(self) -> Dict:
        """경쟁사 트렌드 분석"""
        competitor_data = self.load_json(os.path.join(self.data_dir, "competitor_monitoring.json"))
        
        if not competitor_data or "history" not in competitor_data:
            return {"status": "no_data"}
        
        history = competitor_data["history"]
        if not history:
            return {"status": "no_history"}
        
        latest = history[-1] if history else {}
        insights = latest.get("insights", [])
        recommended_actions = latest.get("recommended_actions", [])
        
        # 경쟁사별 순위 변화 추적
        ranking_changes = {}
        for entry in history:
            for comp in entry.get("competitors", []):
                name = comp.get("name", "")
                changes = comp.get("ranking_changes", {})
                if name not in ranking_changes:
                    ranking_changes[name] = []
                ranking_changes[name].append(changes)
        
        return {
            "last_check": latest.get("timestamp", ""),
            "insights": insights,
            "recommended_actions": recommended_actions,
            "ranking_trends": ranking_changes
        }
    
    def analyze_ab_tests(self) -> Dict:
        """A/B 테스트 결과 분석"""
        ab_data = self.load_json(os.path.join(self.data_dir, "ab_test_results.json"))
        
        if not ab_data:
            return {"status": "no_data"}
        
        active_tests = {k: v for k, v in ab_data.get("tests", {}).items() if v.get("status") == "running"}
        completed_tests = ab_data.get("completed", {})
        
        results = {
            "active_count": len(active_tests),
            "completed_count": len(completed_tests),
            "active_tests": {},
            "recent_winners": []
        }
        
        for test_id, test in active_tests.items():
            results["active_tests"][test_id] = {
                "variants": list(test.get("variants", {}).keys()),
                "metric": test.get("metric", "conversion_rate"),
                "started_at": test.get("started_at", "")
            }
        
        for test_id, test in list(completed_tests.items())[-5:]:  # 최근 5개
            winner = test.get("winner")
            if winner:
                results["recent_winners"].append({
                    "test_id": test_id,
                    "winner": winner.get("variant", ""),
                    "lift_pct": winner.get("lift_pct", 0),
                    "p_value": winner.get("p_value", 1),
                    "significant": winner.get("statistically_significant", False)
                })
        
        return results
    
    def generate_report(self, weeks_ago: int = 0) -> Dict:
        """종합 주간 리포트 생성"""
        week_data = self.collect_ledger_data(weeks_ago)
        monday, sunday = self.get_week_range(weeks_ago)
        
        report = {
            "period": {
                "start": monday.strftime("%Y-%m-%d"),
                "end": sunday.strftime("%Y-%m-%d"),
                "week_number": monday.isocalendar()[1]
            },
            "publishing_performance": self.analyze_publishing_performance(week_data),
            "content_performance": self.analyze_content_performance(week_data),
            "creative_fatigue": self.analyze_creative_fatigue(),
            "competitor_trends": self.analyze_competitor_trends(),
            "ab_tests": self.analyze_ab_tests(),
            "generated_at": datetime.now().isoformat()
        }
        
        return report
    
    def render_markdown_report(self, report: Dict) -> str:
        """마크다운 리포트 렌더링"""
        period = report["period"]
        pub = report["publishing_performance"]
        content = report["content_performance"]
        fatigue = report["creative_fatigue"]
        competitor = report["competitor_trends"]
        ab_tests = report["ab_tests"]
        
        md = f"""# 📊 파보겔 주간 마케팅 리포트
**기간**: {period['start']} ~ {period['end']} (W{period['week_number']})
**생성일시**: {report['generated_at'][:19].replace('T', ' ')}

---

## 📈 발행 성과 요약
- **총 실행 횟수**: {pub['total_runs']}회
- **핵심 채널 성공률**: {pub['overall_success_rate']}%

### 채널별 상세
| 채널 | 실행 | 성공 | 실패 | 성공률 |
|------|------|------|------|--------|
"""
        
        for channel, stats in pub["channels"].items():
            md += f"| {channel} | {stats['total']} | {stats['success']} | {stats['failed']} | {stats['success_rate']}% |\n"
        
        md += f"""

---

## 🎬 콘텐츠 성과
- **총 비디오**: {content['total_videos']}개

### 테마별 분포
"""
        for theme, count in content["by_theme"].items():
            md += f"- **{theme}**: {count}회\n"
        
        md += "\n### 콘텐츠 타입별\n"
        for ctype, count in content["by_content_type"].items():
            md += f"- **{ctype}**: {count}개\n"
        
            md += "\n---\n\n## ⚠️ 크리에이티브 피로도 알림\n"
            if fatigue.get("status") == "no_data":
                md += "- 데이터 없음 (피로도 추적 시작 필요)\n"
            else:
                md += f"""- **총 크리에이티브**: {fatigue.get('total_creatives', 0)}개
    - **고위험 (≥75)**: {fatigue.get('high_fatigue_count', 0)}개
    - **주의 (≥50)**: {fatigue.get('alert_count', 0)}개

### 고위험 크리에이티브 (≥75)
"""
            if fatigue.get("high_fatigue"):

## 🏆 경쟁사 동향
- **마지막 체크**: {competitor.get('last_check', 'N/A')[:19].replace('T', ' ')}

### 주요 인사이트
"""
        for insight in competitor.get("insights", []):
            md += f"- {insight}\n"
        
        md += "\n### 추천 액션\n"
        for action in competitor.get("recommended_actions", []):
            md += f"- {action}\n"
        
        md += f"""
---

## 🧪 A/B 테스트 현황
- **진행 중**: {ab_tests['active_count']}개
- **완료**: {ab_tests['completed_count']}개

### 최근 승자
"""
        for winner in ab_tests.get("recent_winners", []):
            sig = "✅" if winner["significant"] else "⚠️"
            md += f"- {sig} **{winner['test_id']}**: {winner['winner']} 승리 (상승 {winner['lift_pct']:.1f}%, p={winner['p_value']:.4f})\n"
        
        if not ab_tests.get("recent_winners"):
            md += "최근 완료된 테스트 없음\n"
        
        md += f"""
---

## 🎯 금주 액션 아이템
1. **고위험 크리에이티브 교체**: {fatigue['high_fatigue_count']}개 즉시 교체 필요
2. **성과 저조 채널 개선**: 성공률 70% 미만 채널 원인 분석
3. **경쟁사 대응**: {len(competitor.get('recommended_actions', []))}개 추천 액션 실행
4. **A/B 테스트**: 진행 중 {ab_tests['active_count']}개 모니터링, 완료된 테스트 승자 적용
5. **콘텐츠 다양화**: 단일 테마 편중 해소 (상위 3개 테마가 {sum(sorted(content['by_theme'].values(), reverse=True)[:3])}회 차지)

---

*자동 생성: {report['generated_at'][:19].replace('T', ' ')} | 파보겔 마케팅 팩토리*
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
        return html_template.format(html=html, dt=datetime.now().strftime('%Y-%m-%d %H:%M'))def save_report(self, report: Dict, formats: List[str] = ["md", "html"]) -> Dict[str, str]:
        """리포트 저장"""
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
        
        # JSON 원본도 저장
        json_path = os.path.join(self.reports_dir, f"{filename_base}.json")
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(report, f, ensure_ascii=False, indent=2)
        saved["json"] = json_path
        
        return saved
    
    def send_notifications(self, report: Dict, channels: List[str] = ["slack", "discord"]) -> Dict[str, bool]:
        """알림 발송"""
        results = {}
        md_content = self.render_markdown_report(report)
        
        # Slack
        if "slack" in channels and self.slack_webhook:
            try:
                payload = {
                    "text": f"📊 파보겔 주간 리포트 (W{report['period']['week_number']})",
                    "blocks": [
                        {"type": "section", "text": {"type": "mrkdwn", "text": f"*주간 리포트 완료* (W{report['period']['week_number']})"}},
                        {"type": "section", "text": {"type": "mrkdwn", "text": f"성공률: {report['publishing_performance']['overall_success_rate']}% | 실행: {report['publishing_performance']['total_runs']}회"}},
                        {"type": "context", "elements": [{"type": "mrkdwn", "text": f"생성: {datetime.now().strftime('%Y-%m-%d %H:%M')}"}]}
                    ]
                }
                response = requests.post(self.slack_webhook, json=payload, timeout=10)
                results["slack"] = response.status_code == 200
            except Exception as e:
                print(f"[WARN] Slack notification failed: {e}")
                results["slack"] = False
        
        # Discord
        if "discord" in channels and self.discord_webhook:
            try:
                payload = {
                    "content": f"📊 **파보겔 주간 리포트 (W{report['period']['week_number']})**",
                    "embeds": [{
                        "title": f"주간 마케팅 리포트 (W{report['period']['week_number']})",
                        "description": f"기간: {report['period']['start']} ~ {report['period']['end']}",
                        "color": 0x1e40af,
                        "fields": [
                            {"name": "총 실행", "value": str(report['publishing_performance']['total_runs']), "inline": True},
                            {"name": "성공률", "value": f"{report['publishing_performance']['overall_success_rate']}%", "inline": True},
                            {"name": "고위험 크리에이티브", "value": str(report['creative_fatigue']['high_fatigue_count']), "inline": True}
                        ],
                        "timestamp": datetime.now().isoformat()
                    }]
                }
                response = requests.post(self.discord_webhook, json=payload, timeout=10)
                results["discord"] = response.status_code == 200
            except Exception as e:
                print(f"[WARN] Discord notification failed: {e}")
                results["discord"] = False
        
        return results
    
    def run_weekly_cycle(self, weeks_ago: int = 0, send_notifications: bool = True) -> Dict:
        """주간 리뷰 사이클 실행"""
        print(f"\n=== Weekly Review Cycle (W{datetime.now().isocalendar()[1] - weeks_ago}) ===")
        
        # 1. 리포트 생성
        report = self.generate_report(weeks_ago)
        
        # 2. 리포트 저장
        saved = self.save_report(report, formats=["md", "html", "json"])
        print(f"📁 Reports saved: {saved}")
        
        # 3. 알림 발송
        if send_notifications:
            notifications = self.send_notifications(report)
            print(f"🔔 Notifications sent: {notifications}")
        
        # 4. 크리에이티브 피로도 기반 액션
        fatigue = report["creative_fatigue"]
        if fatigue["high_fatigue_count"] > 0:
            print(f"⚠️ HIGH FATIGUE ALERT: {fatigue['high_fatigue_count']} creatives need refresh!")
        
        # 5. 경쟁사 대응 액션
        competitor = report["competitor_trends"]
        if competitor.get("recommended_actions"):
            print(f"🎯 Competitor actions: {len(competitor['recommended_actions'])} recommended")
        
        # 6. A/B 테스트 승자 적용
        ab_tests = report["ab_tests"]
        for winner in ab_tests.get("recent_winners", []):
            if winner["significant"]:
                print(f"🏆 A/B Test Winner: {winner['test_id']} -> {winner['winner']} (+{winner['lift_pct']:.1f}%)")
        
        return {
            "report": report,
            "saved_files": saved,
            "notifications": notifications if send_notifications else {}
        }


if __name__ == "__main__":
    reviewer = WeeklyReview()
    result = reviewer.run_weekly_cycle(weeks_ago=0, send_notifications=False)
    print(f"\n✅ Weekly review completed!")
    print(f"Report: {result['saved_files']}")