def test():
    html_template = """<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Pretendard', sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }}
    </style>
</head>
<body>
{html}
</body>
</html>"""
    return html_template.format(html="test")

print(test())