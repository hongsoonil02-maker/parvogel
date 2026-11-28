with open('C:/Users/master/parvogel_landing/marketing_factory/core/weekly_review.py', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Replace lines 372-403 with correct content
new_lines = lines[:372] + [
    '    def render_html_report(self, report: Dict) -> str:\n',
    '        """HTML 리포트 렌더링"""\n',
    '        md = self.render_markdown_report(report)\n',
    '        # 마크다운 to HTML 변환\n',
    '        html = md.replace(\'\\n\', \'<br>\').replace(\'# \', \'<h1>\').replace(\'## \', \'<h2>\').replace(\'### \', \'<h3>\')\n',
    '        html_template = """<!DOCTYPE html>\n',
    '<html lang="ko">\n',
    '<head>\n',
    '    <meta charset="UTF-8">\n',
    '    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n',
    '    <title>파보겔 주간 마케팅 리포트</title>\n',
    '    <style>\n',
    '        body {{ font-family: -apple-system, BlinkMacSystemFont, \'Pretendard\', sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }}\n',
    '        h1 {{ color: #1e40af; border-bottom: 2px solid #1e40af; padding-bottom: 10px; }}\n',
    '        h2 {{ color: #374151; margin-top: 30px; }}\n',
    '        table {{ width: 100%; border-collapse: collapse; margin: 15px 0; }}\n',
    '        th, td {{ border: 1px solid #e5e7eb; padding: 10px; text-align: left; }}\n',
    '        th {{ background: #f3f4f6; }}\n',
    '        .alert {{ background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 15px 0; }}\n',
    '        .success {{ background: #f0fdf4; border-left: 4px solid #22c55e; padding: 15px; margin: 15px 0; }}\n',
    '        .warning {{ background: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px; margin: 15px 0; }}\n',
    '        code {{ background: #f3f4f6; padding: 2px 6px; border-radius: 4px; }}\n',
    '        .footer {{ margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }}\n',
    '    </style>\n',
    '</head>\n',
    '<body>\n',
    '{html}\n',
    '<div class="footer">자동 생성: {dt} | 파보겔 마케팅 팩토리</div>\n',
    '</body>\n',
    '</html>"""\n',
    '        return html_template.format(html=html, dt=datetime.now().strftime(\'%Y-%m-%d %H:%M\'))\n',
] + lines[404:]

with open('C:/Users/master/parvogel_landing/marketing_factory/core/weekly_review.py', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
print('Done')