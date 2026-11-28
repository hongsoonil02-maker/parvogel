import json

def fix_json_file(filepath, lang_name):
    """Fix a JSON file by ensuring single root object with all keys"""
    with open(filepath, 'r', encoding='utf-8-sig') as f:
        raw = f.read()
    
    print(f"\n=== Fixing {lang_name} ({filepath}) ===")
    print(f"Length: {len(raw)}, Open braces: {raw.count('{')}, Close braces: {raw.count('}')}")
    
    # Parse as lenient JSON by wrapping in array to handle multiple roots
    # First, try to parse as JSON5-like by wrapping in []
    try:
        # Wrap in array to parse multiple root objects
        wrapped = '[' + raw + ']'
        parsed = json.loads(wrapped)
        print(f"Parsed {len(parsed)} root objects")
        
        # Merge all root objects into one
        merged = {}
        for obj in parsed:
            if isinstance(obj, dict):
                merged.update(obj)
        
        print(f"Merged keys: {list(merged.keys())}")
        
        # Ensure all expected keys are present
        expected_keys = ['nav', 'hero', 'about', 'features', 'clinical', 'tech', 'experts', 'target', 'products', 'testimonials', 'order', 'faq', 'footer']
        for key in expected_keys:
            if key not in merged:
                print(f"WARNING: Missing key '{key}'")
        
        # Write fixed version
        fixed = json.dumps(merged, ensure_ascii=False, indent=2)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(fixed)
        print(f"Fixed {lang_name} written!")
        return True
        
    except json.JSONDecodeError as e:
        print(f"Failed to parse even wrapped: {e}")
        return False

# Fix both files
fix_json_file('src/locales/ko/translation.json', 'Korean')
fix_json_file('src/locales/en/translation.json', 'English')

# Verify both
for lang, path in [('Korean', 'src/locales/ko/translation.json'), ('English', 'src/locales/en/translation.json')]:
    with open(path, 'r', encoding='utf-8-sig') as f:
        try:
            data = json.load(f)
            print(f"\n{lang} verification: OK - {len(data)} keys: {list(data.keys())}")
        except json.JSONDecodeError as e:
            print(f"{lang} verification FAILED: {e}")