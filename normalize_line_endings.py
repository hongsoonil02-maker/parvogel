# Read the text_mode file as binary
with open('C:/Users/master/parvogel_landing/marketing_factory/core/weekly_review_text_mode.py', 'rb') as f:
    content = f.read()

# Normalize line endings to LF
content = content.replace(b'\r\n', b'\n')

# Write back
with open('C:/Users/master/parvogel_landing/marketing_factory/core/weekly_review_normalized.py', 'wb') as f:
    f.write(content)
print('Normalized line endings done')

# Test compilation
with open('C:/Users/master/parvogel_landing/marketing_factory/core/weekly_review_normalized.py', 'r', encoding='utf-8') as f:
    content2 = f.read()

try:
    compile(content2, 'weekly_review_normalized.py', 'exec')
    print('Compilation successful!')
except SyntaxError as e:
    print('SyntaxError:', e)
    print('Line', e.lineno, ':', e.text)