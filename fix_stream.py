import json

def fix_json_stream(filepath, lang_name):
    """Fix JSON by streaming parse and rebuilding correct structure"""
    with open(filepath, 'r', encoding='utf-8-sig') as f:
        raw = f.read()
    
    print(f"\n=== Stream fix for {lang_name} ===")
    
    # The issue: main object closes prematurely, creating multiple root objects
    # We need to parse all root objects and merge them
    
    # Approach: Use a custom parser that handles multiple root objects
    # by tracking brace depth and splitting at top-level boundaries
    
    def split_root_objects(text):
        """Split text into top-level JSON objects"""
        objects = []
        brace_depth = 0
        in_string = False
        escape_next = False
        start = 0
        
        for i, ch in enumerate(text):
            if not in_string:
                if ch == '{':
                    if brace_depth == 0:
                        start = i
                    brace_depth += 1
                elif ch == '}':
                    brace_depth -= 1
                    if brace_depth == 0:
                        # Found a complete root object
                        objects.append(text[start:i+1])
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
        
        return objects
    
    # Split into root objects
    root_objects = split_root_objects(raw)
    print(f"Found {len(root_objects)} root objects")
    
    # Parse each root object
    parsed_objects = []
    for i, obj_text in enumerate(root_objects):
        try:
            obj = json.loads(obj_text)
            parsed_objects.append(obj)
            print(f"  Object {i}: {list(obj_text.keys()) if isinstance(obj_text, dict) else 'non-dict'}")
        except json.JSONDecodeError as e:
            print(f"  Object {i} failed to parse: {e}")
            # Try to fix common issues
            # Add missing commas between properties
            fixed_text = obj_text
            # Add comma between } and " at top level
            import re
            fixed_text = re.sub(r'(\}\s*\n\s*)(")', r'\1,\2', fixed_text)
            try:
                obj = json.loads(fixed_text)
                parsed_objects.append(obj)
                print(f"  Object {i}: fixed and parsed")
            except:
                print(f"  Object {i}: FAILED permanently")
    
    # Merge all parsed objects
    def deep_merge(target, source):
        for key, value in source.items():
            if key in target and isinstance(target[key], dict) and isinstance(value, dict):
                deep_merge(target[key], value)
            else:
                target[key] = value
    
    merged = {}
    for obj in parsed_objects:
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

# Fix both files
fix_json_stream('src/locales/ko/translation.json', 'Korean')
fix_json_stream('src/locales/en/translation.json', 'English')

# Verify both
for lang, path in [('Korean', 'src/locales/ko/translation.json'), ('English', 'src/locales/en/translation.json')]:
    with open(path, 'r', encoding='utf-8-sig') as f:
        try:
            data = json.load(f)
            print(f"\n{lang} verification: OK - {len(data)} keys: {list(data.keys())}")
        except json.JSONDecodeError as e:
            print(f"{lang} verification FAILED: {e}")