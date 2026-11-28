# Read the new file as binary
with open('C:/Users/master/parvogel_landing/marketing_factory/core/weekly_review_clean3.py', 'rb') as f:
    content = f.read()

# Find the html_template = line
idx = content.find(b'html_template =')
if idx >= 0:
    # Find the end of the triple-quoted string
    end_idx = content.find(b'"""', idx + 20)
    if end_idx >= 0:
        print('Triple-quoted string found at:', end_idx)
        print('Length:', end_idx - idx)
        print('Content:')
        print(content[idx:end_idx+3])