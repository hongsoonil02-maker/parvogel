# Read the entire file as binary
with open('C:/Users/master/parvogel_landing/marketing_factory/core/weekly_review.py', 'rb') as f:
    content = f.read()

# Decode as UTF-8
text = content.decode('utf-8')

# The file has garbled Korean text throughout. Let me fix all of it.
# Replace all garbled Korean text with correct text
replacements = {
    'HTML ����Ʈ ������': 'HTML 리포트 렌더링',
    '��ũ�ٿ� to HTML ��ȯ': '마크다운 to HTML 변환',
    '�ĺ��� �ְ� ������ ����Ʈ': '파보겔 주간 마케팅 리포트',
    '�ڵ� ����: {dt} | �ĺ��� ������ ���丮': '자동 생성: {dt} | 파보겔 마케팅 팩토리',
    '����Ʈ ����': '리포트 저장',
    '�먮룞 ?앹꽦': '자동 생성',
    '?뚮낫寃?留덉????⑺넗由?': '파보겔 마케팅 팩토리',
    '怨좎쐞???щ━?먯씠?곕툕 援먯껜': '크리에이티브 피로도 높은 크리에이티브',
    '?깃낵 ?議?梨꾨꼸 媛쒖꽑': '긴급 조치 필요 알림',
    '寃쎌웳?????': '경쟁사 동향',
    'A/B ?뚯뒪??': 'A/B 테스트 현황',
    '肄섑뀗痢??ㅼ뼇??': '차주 액션 아이템',
    '?뚮낫寃?二쇨컙 留덉???由ы룷??': '파보겔 주간 마케팅 리포트',
    '由ы룷???뚮뜑留?': '리포트 렌더링',
    '媛꾨떒??留덊겕?ㅼ슫 to HTML 蹂??': '마크다운 to HTML 변환',
    '�?�': '저장',
    '�?�': '저장',
}

for old, new in replacements.items():
    text = text.replace(old, new)

# Write to a new file
with open('C:/Users/master/parvogel_landing/marketing_factory/core/weekly_review_fixed_complete.py', 'w', encoding='utf-8') as f:
    f.write(text)
print('Write to new file done')

# Verify new file
with open('C:/Users/master/parvogel_landing/marketing_factory/core/weekly_review_fixed_complete.py', 'r', encoding='utf-8') as f:
    content2 = f.read()

# Check the function
start2 = content2.find('def render_html_report')
end2 = content2.find('def save_report', start2)
print('New file - Start:', start2)
print('New file - End:', end2)
print('New file - Length:', end2 - start2)
print('New file - Content:')
print(content2[start2:end2])