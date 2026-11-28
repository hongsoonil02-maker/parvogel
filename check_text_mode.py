# Read the text_mode file as binary
with open('C:/Users/master/parvogel_landing/marketing_factory/core/weekly_review_text_mode.py', 'rb') as f:
    content = f.read()

# Find the html_template = line
idx = content.find(b'html_template =')
if idx >= 0:
    # Find the end of the triple-quoted string
    end_idx = content.find(b'"""', idx + 20)
    if end_idx >= 0:
        print('Triple-quoted string found at:', end_idx)
        print('Length:', end_idx - idx)
        # Check the content
        triple_quoted = content[idx:end_idx+3]
        print('First 100 bytes:', triple_quoted[:100])
        print('Last 100 bytes:', triple_quoted[-100:])
        
        # Count the number of triple quotes
        count = triple_quoted.count(b'"""')
        print('Number of triple quotes:', count)