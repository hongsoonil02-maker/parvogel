import json

def fix_json_surgical(filepath, lang_name):
    """Surgically fix the JSON by ensuring proper commas between top-level properties"""
    with open(filepath, 'r', encoding='utf-8-sig') as f:
        raw = f.read()
    
    print(f"\n=== Surgical fix for {lang_name} ===")
    
    # The issue: missing comma between testimonials closing and order
    # Pattern: "  }\n},\n  \"order\":" should be "  }\n  },\n  \"order\":"
    # But actually the structure is:
    #   "testimonials": { ... }
    #   "order": { ... }
    # So after testimonials closes with "  }" there should be a comma
    
    # Let's find the exact pattern and fix it
    # The broken pattern: "  }\n},\n  \"order\":"
    # Should be: "  }\n  },\n  \"order\":"
    
    # Actually, looking at the raw chars:
    # Position 10006: } (closes t5Content)
    # Position 10007: \n
    # Position 10008: } (closes testimonials) 
    # Position 10009: , (comma after testimonials)
    # Position 10010: \n
    # Position 10011-10012: two spaces
    # Position 10013: " (start of "order")
    
    # This looks correct! The comma IS there at position 10009.
    # But the error says "Expecting ',' delimiter: line 249 column 10 (char 10021)"
    # Line 249 is "  \"order\": {"
    # Column 10 would be after "  \"order\": "
    
    # Wait, the error is at line 249 column 10, which is the start of the order object
    # The parser expects a comma BEFORE "order" but the previous token was "}" (closing testimonials)
    # In JSON, you need a comma between object properties
    
    # Let's check the raw around that area more carefully
    with open(filepath, 'r', encoding='utf-8-sig') as f:
        raw = f.read()
    
    # Find the testimonials closing and order opening
    idx = raw.find('"testimonials": {')
    if idx == -1:
        print("testimonials not found")
        return False
    
    # Find the closing of testimonials
    brace_depth = 0
    in_string = False
    escape_next = False
    testimonials_end = -1
    
    for i in range(idx, len(raw)):
        ch = raw[i]
        if not in_string:
            if ch == '{':
                brace_depth += 1
            elif ch == '}':
                brace_depth -= 1
                if brace_depth == 0:
                    # This closes the testimonials object
                    print(f"Testimonials ends at position {i}")
                    # Check next chars
                    print(f"Next 30 chars: {repr(raw[i:i+30])}")
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
    
    # Now let's do a proper fix: parse the whole thing as a stream and rebuild
    # The issue is likely a missing comma between top-level properties
    # Let's use a streaming parser to rebuild correctly
    
    # Better approach: use json5 or a more lenient parser, or manually fix
    # Let's try to fix by ensuring commas between all top-level properties
    
    # Find all top-level property boundaries
    # A top-level property starts at brace_depth=1 with a key
    
    brace_depth = 0
    in_string = False
    escape_next = False
    top_level_starts = []
    current_key = None
    
    for i, ch in enumerate(raw):
        if not in_string:
            if ch == '{':
                if brace_depth == 0:
                    # Start of main object
                    pass
                elif brace_depth == 1:
                    # This is a top-level property value starting
                    pass
                brace_depth += 1
            elif ch == '}':
                brace_depth -= 1
            elif ch == '"' and brace_depth == 1 and not in_string:
                # Potential key at top level
                # Find the key
                end_quote = raw.find('"', i+1)
                if end_quote != -1:
                    key = raw[i+1:end_quote]
                    # Check if followed by :
                    after = raw[end_quote+1:end_quote+10].lstrip()
                    if after.startswith(':'):
                        top_level_starts.append((i, key))
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
    
    print(f"Top-level keys found: {[k for _, k in top_level_starts]}")
    
    # Now let's try a different approach: use a JSON repair library concept
    # The issue is missing commas between top-level properties
    # Let's manually insert commas where needed
    
    # Find all top-level property boundaries (where brace_depth goes 1->0)
    brace_depth = 0
    in_string = False
    escape_next = False
    prop_boundaries = []  # (start, end) of each top-level property
    
    prop_start = -1
    for i, ch in enumerate(raw):
        if not in_string:
            if ch == '{':
                if brace_depth == 1:
                    prop_start = i
                brace_depth += 1
            elif ch == '}':
                brace_depth -= 1
                if brace_depth == 1:
                    # Just closed a top-level property value
                    pass
                elif brace_depth == 0:
                    # Closed main object
                    pass
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
    
    # Let's try a simpler approach: just fix the specific syntax errors
    # The errors are:
    # 1. Korean: line 249 column 10 (char 10021) - Expecting ',' delimiter
    # 2. English: line 429 column 8 (char 29092) - Expecting ',' delimiter
    
    # These are likely missing commas between top-level properties
    # Let's read as lines and fix line by line
    
    lines = raw.splitlines(keepends=True)
    
    # Fix: ensure every top-level property (except last) ends with comma
    # A top-level property ends when brace_depth goes from 1 to 0
    # The line with the closing } at depth 1 should end with comma (unless it's the last property)
    
    # Let's track brace depth per line
    fixed_lines = []
    brace_depth = 0
    in_string = False
    escape_next = False
    
    for i, line in enumerate(raw.splitlines(keepends=True)):
        # Track brace depth for this line
        line_brace_depth_start = brace_depth
        
        for ch in line:
            if not in_string:
                if ch == '{':
                    brace_depth += 1
                elif ch == '}':
                    brace_depth -= 1
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
        
        # Check if this line closes a top-level property (brace_depth goes from 1 to 0)
        # Actually, we need to track more carefully
        fixed_lines.append(line)
    
    # This line-by-line approach is tricky. Let's try a different strategy.
    # Use a JSON repair approach: parse with a more lenient parser
    
    # Actually, let's just use the 'dirtyjson' or 'json5' approach
    # But we don't have those libraries. Let's manually fix the known issues.
    
    # Known issues from error messages:
    # Korean: line 249 column 10 - Expecting ',' delimiter
    # English: line 429 column 8 - Expecting ',' delimiter
    
    # These are likely missing commas between top-level properties
    # Let's read the file and add commas where needed
    
    # Strategy: parse the JSON as a stream of tokens and rebuild
    # But that's complex. Let's try a simpler fix:
    # The issue is likely that the last property before "order" and "faq" 
    # doesn't have a trailing comma.
    
    # Let's find the line numbers for the top-level property endings
    # and add commas where missing
    
    lines = raw.splitlines(keepends=True)
    
    # Track brace depth per line
    brace_depth = 0
    in_string = False
    escape_next = False
    line_depths = []
    
    for line in raw.splitlines(keepends=False):
        line_brace_depth_start = brace_depth
        for ch in line:
            if not in_string:
                if ch == '{':
                    brace_depth += 1
                elif ch == '}':
                    brace_depth -= 1
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
        line_depths.append((brace_depth, line))
    
    # Find lines where brace_depth goes from 1 to 0 (top-level property ends)
    # Those lines should end with comma (unless it's the last property)
    fixed_lines = []
    for i, (depth, line) in enumerate(line_depths):
        # Check if this line closes a top-level property
        # A top-level property ends when we go from depth 1 to 0
        # But we need to track within the line...
        pass
    
    # This is getting too complex. Let's use a simpler approach:
    # Just fix the specific known issues by adding commas where the parser expects them.
    
    # For Korean: error at line 249 column 10 (char 10021)
    # Line 249 is: '  "order": {'
    # The parser expects a comma before "order"
    # So the previous line (line 248) should end with comma
    # Line 248 is: '},'
    # Wait, line 248 already ends with comma!
    
    # Let me check the exact lines again
    lines = raw.splitlines(keepends=True)
    for i in range(240, 260):
        if i < len(lines):
            print(f"Line {i+1}: {repr(lines[i])}")
    
    # Line 248 (index 247): '},\n' - this closes testimonials and has comma
    # Line 249 (index 248): '  "order": {\n' - starts order
    # This looks correct! The comma IS there.
    
    # But the error says "Expecting ',' delimiter: line 249 column 10"
    # Column 10 of line 249 is after '  "order": '
    # The parser is at the start of the order object value
    # It expects a comma BEFORE the "order" key
    # But the comma IS there on the previous line!
    
    # Unless... the previous line doesn't actually have a comma in the parsed version
    # Let me check the raw bytes
    
    # Actually, the issue might be that the testimonials object doesn't end properly
    # Let's check if testimonials has an extra } that closes the main object
    
    # From the brace depth analysis: main object closes at position 10008
    # That's after testimonials closes
    # But there should be MORE properties (order, faq, footer)
    # So the main object should NOT close there
    
    # The issue: there's an extra } somewhere that closes the main object prematurely
    # Let's find where the extra } is
    
    # From the zero positions: [10008, 10080, 13502, 18722, 18804, 19065, 25521, 29534, 29854, 30189, 30514]
    # The main object should only close at the very end (~32420)
    # Position 10008 is the FIRST zero - that's the premature closure!
    
    # So there's an extra } at position 10008 that closes the main object
    # But position 10008 is the } that closes testimonials
    # That means testimonials is at depth 1 (top-level), and its closing } brings depth to 0
    # But there should be more properties after testimonials!
    
    # The issue: testimonials is the LAST property in the main object
    # But it shouldn't be - order, faq, footer should come after
    # The JSON structure has testimonials as the last property
    # But the English structure has: testimonials, order, faq, footer
    
    # So the Korean JSON is MISSING the order, faq, footer properties in the main object
    # They exist as separate root objects instead!
    
    # The fix: merge the separate root objects (order, faq, footer) into the main object
    # by removing the premature closing } at position 10008
    
    # The extra } is at position 10008 (the } that closes testimonials)
    # But that } should NOT bring depth to 0 - there should be more properties
    # The issue is that the main object has depth 1, testimonials adds depth 2, 
    # closing testimonials brings depth to 1, but then there's an EXTRA } that brings it to 0
    
    # Let's find that extra }
    # It's at position 10008 according to the zero_positions list
    # But position 10008 is the } that closes testimonials (depth 2->1)
    # There must be ANOTHER } right after that brings 1->0
    
    # Let's check the raw around position 10008
    print(f"Position 10000-10030: {repr(raw[10000:10030])}")
    
    # The issue: there are TWO } in a row: one closes testimonials, one closes main
    # But the second one shouldn't be there!
    
    # Let's find and remove the extra }
    # The pattern: "  }\n},\n  \"order\":"
    # Should be: "  }\n  },\n  \"order\":"
    
    # Find and fix this pattern
    broken = '  }\n},\n  "order":'
    fixed = '  }\n  },\n  "order":'
    
    if broken in raw:
        print("Found broken pattern!")
        raw = raw.replace(broken, fixed)
        print("Fixed!")
    else:
        print("Pattern not found, trying variations...")
        # Try with different spacing
        import re
        pattern = r'(\s*\}\s*\n\s*\}\s*\n\s*"order":)'
        match = re.search(pattern, raw)
        if match:
            print(f"Found with regex: {repr(match.group())}")
            raw = re.sub(pattern, r'  }\n  },\n  "order":', raw)
            print("Fixed with regex!")
        else:
            print("Pattern not found")
    
    # Also fix the same for faq and footer
    # Pattern for faq: "  }\n},\n  \"faq\":"
    broken2 = '  }\n},\n  "faq":'
    fixed2 = '  }\n  },\n  "faq":'
    if broken2 in raw:
        raw = raw.replace(broken2, fixed2)
        print("Fixed faq pattern!")
    
    # Pattern for footer: "  }\n},\n  \"footer\":"
    broken3 = '  }\n},\n  "footer":'
    fixed3 = '  }\n  },\n  "footer":'
    if broken3 in raw:
        raw = raw.replace(broken3, fixed3)
        print("Fixed footer pattern!")
    
    # Write fixed version
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(raw)
    
    # Verify
    try:
        json.loads(raw)
        print(f"SUCCESS: {lang_name} JSON parses correctly!")
        return True
    except json.JSONDecodeError as e:
        print(f"STILL BROKEN: {e}")
        return False

# Fix both files
fix_json_surgical('src/locales/ko/translation.json', 'Korean')
fix_json_surgical('src/locales/en/translation.json', 'English')

# Verify both
for lang, path in [('Korean', 'src/locales/ko/translation.json'), ('English', 'src/locales/en/translation.json')]:
    with open(path, 'r', encoding='utf-8-sig') as f:
        try:
            data = json.load(f)
            print(f"\n{lang} verification: OK - {len(data)} keys: {list(data.keys())}")
        except json.JSONDecodeError as e:
            print(f"{lang} verification FAILED: {e}")