import json

f = open('src/locales/ko/translation.json', 'rb')
c = f.read()
decoded = c.decode('utf-8-sig')

# Check if there are multiple root objects
brace_count = 0
in_string = False
escape_next = False
root_objects = []
current_start = 0

for i, ch in enumerate(decoded):
    if not in_string:
        if ch == '{':
            if brace_count == 0:
                current_start = i
            brace_count += 1
        elif ch == '}':
            brace_count -= 1
            if brace_count == 0:
                root_objects.append((current_start, i))
    elif ch == '"' and not escape_next:
        in_string = True
    elif ch == '\\' and in_string:
        escape_next = True
    else:
        escape_next = False
    if in_string and ch == '"' and not escape_next:
        in_string = False
    if escape_next:
        escape_next = False

print('Root objects found:', len(root_objects))
for idx, (start, end) in enumerate(root_objects):
    print(f'{idx}: {start}-{end} (length: {end-start+1})')
    preview = decoded[start:start+80].replace('\n', '\\n')
    print(f'  Preview: {preview}...')