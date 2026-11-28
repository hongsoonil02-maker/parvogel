import json

# Read the broken Korean file
with open('src/locales/ko/translation.json', 'r', encoding='utf-8-sig') as f:
    raw = f.read()

print(f"File length: {len(raw)}")
print(f"Open braces: {raw.count('{')}, Close braces: {raw.count('}')}")

# The issue: there's an extra } at position 10008 that closes the main object prematurely
# Let's find and fix the specific pattern

# The broken structure around position 10008:
# Position 10006: } (closes t5Content)
# Position 10007: \n
# Position 10008: } (closes testimonials) 
# Position 10009: , (comma after testimonials)
# Position 10010: \n
# Position 10011-10012: two spaces
# Position 10013: " (start of "order")

# This looks correct for the main object! The issue must be that there's an EXTRA } somewhere
# Let's check if there's an extra } BEFORE testimonials

# Let's look at the structure more carefully
# The main object should have: nav, hero, about, features, clinical, tech, experts, target, products, testimonials, order, faq, footer
# That's 13 top-level keys

# Let's count top-level keys in the raw by looking for patterns
# A top-level key appears at the start of a line (after whitespace) followed by ":"

import re
# Find all top-level key patterns (at start of line or after newline+spaces)
top_level_keys = re.findall(r'^\s*"([^"]+)"\s*:', raw, re.MULTILINE)
print(f"Top-level keys found: {len(top_level_keys)}")
for i, key in enumerate(top_level_keys):
    print(f"  {i}: {key}")

# The issue is likely that the main object closes too early
# Let's find where the main object closes by tracking brace depth

brace_depth = 0
in_string = False
escape_next = False
main_object_end = -1

for i, ch in enumerate(raw):
    if not in_string:
        if ch == '{':
            if brace_depth == 0:
                # This is the start of the main object
                pass
            brace_depth += 1
        elif ch == '}':
            brace_depth -= 1
            if brace_depth == 0:
                print(f"Main object closes at position {i}")
                # Check what's after
                print(f"Next 50 chars: {repr(raw[i:i+50])}")
                break
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

# Now let's try a different approach: manually fix the JSON by ensuring proper structure
# The English file works, so let's use it as a template and just replace Korean strings

# Actually, let's try a simpler approach: just fix the specific syntax error
# The error says position 10012 (line 248 column 2) has invalid syntax
# Line 248 column 2 is the "}" at position 10008

# The error says "invalid JSON syntax found at position 10012" at line 248 column 2
# This is the "}" that closes the main object prematurely

# Let's read the file as lines and fix the specific line
with open('src/locales/ko/translation.json', 'r', encoding='utf-8-sig') as f:
    lines = f.readlines()

print(f"Total lines: {len(lines)}")
# Line 248 (1-indexed) is index 247
if len(lines) > 247:
    print(f"Line 248: {repr(lines[247])}")
    print(f"Line 247: {repr(lines[246])}")
    print(f"Line 249: {repr(lines[248])}")

# The error is at line 248 column 2, which is the "}" character
# This suggests there's an extra "}" on line 248

# Let's look at lines around 248
for i in range(240, 260):
    if i < len(lines):
        print(f"Line {i+1}: {repr(lines[i])}")

# The fix: remove the extra "}" on line 248 (index 247)
# But we need to be careful - it might be needed for testimonials closing

# Let's check the structure around testimonials
# The testimonials object should close with "  }," (with comma for next property)
# Then "order": { ... }, "faq": { ... }, "footer": { ... }

# Let's write a corrected version by reconstructing from line 240 onwards
# Actually, let's just fix the specific syntax error by ensuring proper nesting

# The problem: there's an extra "}" at line 248 that closes the main object
# But looking at the raw character analysis, position 10008 is a "}" that closes the main object
# This means there's an extra "}" somewhere that shouldn't be there

# Let's try a different approach: parse the file as JSON5 (more lenient) or fix by reconstruction
# Since the English version works, let's use it as a template

# Read English structure
with open('src/locales/en/translation.json', 'r', encoding='utf-8-sig') as f:
    en_raw = f.read()

# Fix English first if needed
try:
    en_data = json.loads(en_raw)
    print("English JSON parses OK")
    print(f"English keys: {list(en_data.keys())}")
except json.JSONDecodeError as e:
    print(f"English also broken: {e}")
    # Fix English first
    # The error was at line 428 column 4 (char 29082)
    # Let's fix English too

# Actually, let's just fix the Korean file by ensuring it has the same structure as English
# We'll extract Korean strings and map them to English structure

# For now, let's do a surgical fix on the Korean file
# The issue: extra } at line 248 (index 247)

# Read all lines
with open('src/locales/ko/translation.json', 'r', encoding='utf-8-sig') as f:
    lines = f.readlines()

# Line 248 (1-indexed) = index 247
# Check if line 248 is just "}" or "},"
if len(lines) > 247:
    line_248 = lines[247].rstrip('\n')
    print(f"Line 248 content: '{line_248}'")
    
    # If it's just "}" or "}," and it's causing the main object to close
    # We need to check the context
    
    # Look at previous lines to understand structure
    for i in range(240, 255):
        if i < len(lines):
            print(f"Line {i+1}: {repr(lines[i].rstrip())}")

# The fix: ensure the testimonials object closes properly with comma
# and the main object continues with order, faq, footer

# Let's write a corrected version
# We'll reconstruct from line 240 onwards with proper nesting

# Actually, let's just remove the extra } on line 248 if it's causing the issue
# But we need to be sure it's extra

# From the character analysis:
# Position 10006: } (closes t5Content)
# Position 10007: \n
# Position 10008: } (closes testimonials) 
# Position 10009: , (comma after testimonials)
# Position 10010: \n
# Position 10011-10012: two spaces
# Position 10013: " (start of "order")

# This looks CORRECT for the main object continuing!
# The main object should have: testimonials, order, faq, footer
# So after testimonials closes with }, there should be a comma, then order

# The error says position 10012 (which is the \n after the }) is invalid
# But that's just a newline...

# Wait, the error says "line 248 column 2" which is the "}" character
# And "invalid JSON syntax found at position 10012"
# Position 10012 is the newline after the }

# This suggests the parser thinks the main object ended at position 10008
# and the "order" at position 10013 is a new root object

# But that's valid JSON if the main object continues!
# Unless... the main object already closed earlier!

# Let's check if there's an extra } BEFORE testimonials
# That would close the main object prematurely

# Let's trace brace depth from the start
brace_depth = 0
in_string = False
escape_next = False
for i, ch in enumerate(raw):
    if not in_string:
        if ch == '{':
            brace_depth += 1
        elif ch == '}':
            brace_depth -= 1
            if brace_depth == 0:
                print(f"Brace depth reaches 0 at position {i} (char: {repr(raw[i:i+20])})")
                # This is where the main object closes
                break
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

# If brace_depth reaches 0 before the end, that's the problem!
# The main object should only close at the very end

# Let's find ALL positions where brace_depth becomes 0
brace_depth = 0
in_string = False
escape_next = False
zero_positions = []

for i, ch in enumerate(raw):
    if not in_string:
        if ch == '{':
            brace_depth += 1
        elif ch == '}':
            brace_depth -= 1
            if brace_depth == 0:
                zero_positions.append(i)
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

print(f"Positions where brace_depth reaches 0: {zero_positions}")
print(f"Total length: {len(raw)}")

# The main object should only close at the very end (position ~32408)
# If there are earlier positions, those are premature closures

# Let's fix by removing the premature closing braces
# We need to identify which } are premature

# The structure should be:
# { (main start)
#   "nav": {...},
#   "hero": {...},
#   ...
#   "testimonials": {...},
#   "order": {...},
#   "faq": {...},
#   "footer": {...}
# } (main end)

# If there are multiple zero positions, the ones before the end are premature
# We need to remove those premature } characters

# But we can't just remove them - they might be needed for nested objects
# The issue is that some nested object has an extra }

# Let's try a different approach: use the English structure as template
# and rebuild the Korean JSON from scratch using the English structure

print("\n--- Rebuilding Korean JSON from English template ---")

# Load English structure
with open('src/locales/en/translation.json', 'r', encoding='utf-8-sig') as f:
    en_raw = f.read()

# Fix English if needed
try:
    en_data = json.loads(en_raw)
    print("English JSON OK")
except json.JSONDecodeError as e:
    print(f"English broken: {e}")
    # Fix English first
    # The error was at line 428 column 4
    # Let's fix English too

# For now, let's manually fix the Korean file by writing a corrected version
# We'll keep all the Korean strings but ensure proper JSON structure

# The simplest fix: the Korean file has the right content but an extra } at line 248
# Let's just delete that line if it's an extra }

# Read lines again
with open('src/locales/ko/translation.json', 'r', encoding='utf-8-sig') as f:
    lines = f.readlines()

# Line 248 (1-indexed) = index 247
# Check if removing line 248 fixes it
if len(lines) > 247:
    test_lines = lines[:247] + lines[248:]  # Remove line 248
    test_content = ''.join(test_lines)
    try:
        json.loads(test_content)
        print("SUCCESS: Removing line 248 fixes it!")
        # Write the fixed version
        with open('src/locales/ko/translation.json', 'w', encoding='utf-8') as f:
            f.writelines(test_lines)
        print("Fixed file written!")
    except json.JSONDecodeError as e:
        print(f"Removing line 248 didn't work: {e}")
        # Try removing line 247 instead (the line before)
        test_lines2 = lines[:246] + lines[247:]
        test_content2 = ''.join(test_lines2)
        try:
            json.loads(test_content2)
            print("SUCCESS: Removing line 247 fixes it!")
            with open('src/locales/ko/translation.json', 'w', encoding='utf-8') as f:
                f.writelines(test_lines2)
            print("Fixed file written!")
        except json.JSONDecodeError as e2:
            print(f"Removing line 247 didn't work either: {e2}")