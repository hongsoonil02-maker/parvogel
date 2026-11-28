# Read the new file as binary
with open('C:/Users/master/parvogel_landing/marketing_factory/core/weekly_review_final.py', 'rb') as f:
    content = f.read()

# Find the end of the triple-quoted string
idx = content.find(b'</html>"""')
if idx >= 0:
    print('Found at:', idx)
    print('Context:', content[idx:idx+20])
    print('Hex:', content[idx:idx+20].hex())