# Read the new file as binary
with open('C:/Users/master/parvogel_landing/marketing_factory/core/weekly_review_final3.py', 'rb') as f:
    content = f.read()

# Check the exact bytes around line 385
lines = content.split(b'\n')
print('Line 385 (0-indexed 384):', lines[384] if len(lines) > 384 else 'N/A')
print('Line 386 (0-indexed 385):', lines[385] if len(lines) > 385 else 'N/A')
print('Line 387 (0-indexed 386):', lines[386] if len(lines) > 386 else 'N/A')

# Check for any non-ASCII characters in the Python code
print()
print('Checking for non-ASCII in Python code...')
for i, line in enumerate(lines):
    for j, b in enumerate(line):
        if b > 127:
            print('Line {}, pos {}: 0x{:02X}'.format(i+1, j, b))
            print('  Context: {}'.format(line[max(0,j-20):j+20]))