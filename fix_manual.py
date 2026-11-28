import json

def fix_json_manual(filepath, lang_name):
    """Manually fix the JSON by reading line by line and fixing specific issues"""
    with open(filepath, 'r', encoding='utf-8-sig') as f:
        lines = f.readlines()
    
    print(f"\n=== Manual fix for {lang_name} ===")
    print(f"Total lines: {len(lines)}")
    
    # The issue: missing commas between top-level properties
    # Specifically between testimonials and order, order and faq, faq and footer
    
    # Let's track brace depth and add commas where needed
    fixed_lines = []
    brace_depth = 0
    in_string = False
    escape_next = False
    
    # First pass: track brace depth for each line
    line_depths = []
    for line in lines:
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
    
    # Second pass: add commas where top-level properties end
    # A top-level property ends when we go from depth 1 to 0
    # But we need to track within the line...
    
    # Simpler approach: find lines that close top-level objects (depth goes 1->0)
    # and ensure they end with comma (unless it's the very last property)
    
    fixed_lines = []
    brace_depth = 0
    in_string = False
    escape_next = False
    
    for i, line in enumerate(lines):
        line_brace_depth_start = brace_depth
        line_has_closing_at_depth_1 = False
        
        # Track brace depth within the line
        for ch in line:
            if not in_string:
                if ch == '{':
                    brace_depth += 1
                elif ch == '}':
                    if brace_depth == 1:
                        line_has_closing_at_depth_1 = True
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
        
        # Check if this line closes a top-level property (depth 1 -> 0)
        # We need to check if the line contains a } that brings depth from 1 to 0
        # This is tricky with line-by-line. Let's use a different approach.
        
        fixed_lines.append(line)
    
    # Let's try a different approach: fix the specific known issues
    # The errors are at specific positions where commas are missing between root objects
    
    # Join lines back
    content = ''.join(lines)
    
    # The issue: multiple root objects due to premature closing of main object
    # The main object closes prematurely, then order, faq, footer become separate roots
    # We need to merge them by removing the premature closing of main object
    
    # The main object should have: nav, hero, about, features, clinical, tech, experts, target, products, testimonials, order, faq, footer
    # But the JSON has main object closing after testimonials, then order, faq, footer as separate roots
    
    # Fix: remove the premature closing of main object (the extra } after testimonials)
    # The pattern is: testimonials closes with }, then there's an extra } that closes main
    # Then order, faq, footer become separate roots
    
    # Let's do a targeted fix: find the extra } after testimonials and remove it
    content = ''.join(lines)
    
    # Find the testimonials object end
    # The structure should be:
    # "testimonials": { ... },
    # "order": { ... },
    # "faq": { ... },
    # "footer": { ... }
    # }
    
    # But currently it's:
    # "testimonials": { ... }
    # }
    # "order": { ... }
    # "faq": { ... }
    # "footer": { ... }
    
    # The extra } is right after testimonials closes
    # We need to remove that extra } and add a comma after testimonials
    
    # Find the pattern: "testimonials": { ... }\n}\n  "order":
    # Replace with: "testimonials": { ... },\n  "order":
    
    import re
    
    content = ''.join(lines)
    
    # Fix 1: Remove extra } after testimonials and add comma
    # Pattern: "testimonials": { ... }\n}\n  "order":
    # The testimonials object ends with }\n}\n  "order":
    # Should be: }\n  },\n  "order":
    
    # Let's do a more precise fix using the known structure
    # The main object should have 13 top-level keys
    # Let's parse the content as multiple root objects and merge
    
    # Add commas between root objects
    # Pattern: }\n{ -> },\n{
    # Pattern: }\n  " -> },\n  "
    
    fixed = content
    fixed = re.sub(r'(\})\s*\n\s*(\{)', r'\1,\n\2', fixed)
    fixed = re.sub(r'(\})\s*\n\s*(")', r'\1,\n\2', fixed)
    
    # Now wrap in array and parse
    try:
        wrapped = '[' + fixed + ']'
        parsed = json.loads(wrapped)
        print(f"Parsed {len(parsed)} root objects")
        
        # Merge all root objects
        def deep_merge(target, source):
            for key, value in source.items():
                if key in target and isinstance(target[key], dict) and isinstance(value, dict):
                    deep_merge(target[key], value)
                else:
                    target[key] = value
        
        merged = {}
        for obj in parsed:
            if isinstance(obj, dict):
                for key, value in obj.items():
                    if key in merged and isinstance(merged[key], dict) and isinstance(value, dict):
                        deep_merge(merged[key], value)
                    else:
                        merged[key] = value
        
        print(f"Merged keys: {list(merged.keys())}")
        
        # Write fixed version
        output = json.dumps(merged, ensure_ascii=False, indent=2)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(output)
        print(f"Fixed {filepath} written!")
        return True
        
    except json.JSONDecodeError as e:
        print(f"Failed to parse: {e}")
        print(f"Error at position {e.pos}: {e.msg}")
        # Show context around error
        start = max(0, e.pos - 50)
        end = min(len(fixed), e.pos + 50)
        print(f"Context: {repr(fixed[start:end])}")
        return False

# Fix both files
fix_json_manual('src/locales/ko/translation.json', 'Korean')
fix_json_manual('src/locales/en/translation.json', 'English')

# Verify both
for lang, path in [('Korean', 'src/locales/ko/translation.json'), ('English', 'src/locales/en/translation.json')]:
    with open(path, 'r', encoding='utf-8-sig') as f:
        try:
            data = json.load(f)
            print(f"\n{lang} verification: OK - {len(data)} keys: {list(data.keys())}")
        except json.JSONDecodeError as e:
            print(f"{lang} verification FAILED: {e}")