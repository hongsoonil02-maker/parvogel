import json
import re

def fix_json_precise(filepath, lang_name):
    """Precisely fix the JSON by removing extra } and adding missing commas"""
    with open(filepath, 'r', encoding='utf-8-sig') as f:
        raw = f.read()
    
    print(f"\n=== Precise fix for {lang_name} ===")
    
    # The issue: main object closes prematurely after testimonials
    # This creates multiple root objects: main, order, faq, footer
    # We need to:
    # 1. Remove the extra } that closes main prematurely
    # 2. Add commas between top-level properties
    
    # Let's work with the raw string and fix surgically
    fixed = raw
    
    # Step 1: Fix the specific pattern where main object closes prematurely
    # The pattern: testimonials ends with }\n}\n  "order":
    # Should be: }\n  },\n  "order":
    # The extra } is the one that closes main prematurely
    
    # Pattern: }\n}\n  "order":  ->  }\n  },\n  "order":
    fixed = re.sub(r'(\}\s*\n)\s*(\}\s*\n\s*"order":)', r'\1  \2', fixed)
    
    # Same for faq
    fixed = re.sub(r'(\}\s*\n)\s*(\}\s*\n\s*"faq":)', r'\1  \2', fixed)
    
    # Same for footer
    fixed = re.sub(r'(\}\s*\n)\s*(\}\s*\n\s*"footer":)', r'\1  \2', fixed)
    
    # Now add missing commas between top-level properties
    # Pattern: }\n  "key":  ->  },\n  "key":
    fixed = re.sub(r'(\}\s*\n\s*)(")', r'\1,\2', fixed)
    
    # But be careful not to add double commas
    # Only add comma if not already present
    fixed = re.sub(r'(\}\s*\n\s*),?\s*(")', r'\1,\2', fixed)
    
    # Also fix the case where there's already a comma but extra }
    # Pattern: }\n}\n  " -> }\n  },\n  "
    fixed = re.sub(r'(\}\s*\n)\s*(\}\s*\n\s*")', r'\1  \2', fixed)
    
    # Now try to parse
    try:
        # Wrap in array to handle multiple roots
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
                deep_merge(merged, obj)
        
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
        start = max(0, e.pos - 50)
        end = min(len(fixed), e.pos + 50)
        print(f"Context: {repr(fixed[start:end])}")
        return False

# Fix both files
fix_json_precise('src/locales/ko/translation.json', 'Korean')
fix_json_precise('src/locales/en/translation.json', 'English')

# Verify both
for lang, path in [('Korean', 'src/locales/ko/translation.json'), ('English', 'src/locales/en/translation.json')]:
    with open(path, 'r', encoding='utf-8-sig') as f:
        try:
            data = json.load(f)
            print(f"\n{lang} verification: OK - {len(data)} keys: {list(data.keys())}")
        except json.JSONDecodeError as e:
            print(f"{lang} verification FAILED: {e}")