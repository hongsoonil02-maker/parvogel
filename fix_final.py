import json

def fix_json_complete(filepath, lang_name):
    """Complete fix: parse all root objects and merge into single object"""
    with open(filepath, 'r', encoding='utf-8-sig') as f:
        raw = f.read()
    
    print(f"\n=== Complete fix for {lang_name} ===")
    
    # Strategy: Parse as multiple root objects by wrapping in array
    # Then merge all objects recursively
    
    # First, try to parse as JSON Lines (each root object on its own)
    # But the file is not JSON Lines. Let's try wrapping in array.
    
    # The issue: raw has multiple root objects because of premature closures
    # When we wrap in [], we get an array of objects
    # But there are syntax errors (missing commas between roots)
    
    # Let's fix the syntax errors first by adding commas between root objects
    # Root objects are separated by }\n{ or }\n  "
    
    # Add commas between root objects
    fixed_raw = raw
    
    # Pattern: }\n{ -> },\n{
    # Pattern: }\n  " -> },\n  "
    import re
    
    # Fix missing commas between root objects
    # Pattern: } followed by newline and { or "
    fixed_raw = re.sub(r'(\})\s*\n\s*(\{)', r'\1,\n\2', fixed_raw)
    fixed_raw = re.sub(r'(\})\s*\n\s*(")', r'\1,\n\2', fixed_raw)
    
    # Now wrap in array and parse
    try:
        wrapped = '[' + fixed_raw + ']'
        parsed = json.loads(wrapped)
        print(f"Parsed {len(parsed)} root objects")
        
        # Merge all root objects into one
        def deep_merge(target, source):
            """Recursively merge source into target"""
            for key, value in source.items():
                if key in target and isinstance(target[key], dict) and isinstance(value, dict):
                    deep_merge(target[key], value)
                else:
                    target[key] = value
        
        merged = {}
        for obj in parsed:
            if isinstance(obj, dict):
                deep_merge(merged, obj)
        
        print(f"Merged keys: {list(merged.keys())}")
        
        # Verify all expected keys present
        expected_keys = ['nav', 'hero', 'about', 'features', 'clinical', 'tech', 'experts', 'target', 'products', 'testimonials', 'order', 'faq', 'footer']
        for key in expected_keys:
            if key not in merged:
                print(f"WARNING: Missing key '{key}'")
        
        # Write fixed version
        output = json.dumps(merged, ensure_ascii=False, indent=2)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(output)
        print(f"Fixed {lang_name} written!")
        return True
        
    except json.JSONDecodeError as e:
        print(f"Failed to parse: {e}")
        # Try more aggressive fixing
        return False

# Fix both files
fix_json_complete('src/locales/ko/translation.json', 'Korean')
fix_json_complete('src/locales/en/translation.json', 'English')

# Verify both
for lang, path in [('Korean', 'src/locales/ko/translation.json'), ('English', 'src/locales/en/translation.json')]:
    with open(path, 'r', encoding='utf-8-sig') as f:
        try:
            data = json.load(f)
            print(f"\n{lang} verification: OK - {len(data)} keys: {list(data.keys())}")
        except json.JSONDecodeError as e:
            print(f"{lang} verification FAILED: {e}")