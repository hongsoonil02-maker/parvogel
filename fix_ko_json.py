import json

# Read the broken file
with open('src/locales/ko/translation.json', 'r', encoding='utf-8-sig') as f:
    content = f.read()

# The issue: main object closes after testimonials (position ~10008)
# We need to ensure order and faq are properties of the main object
# Let's parse the English version (which works) and use it as structure template

with open('src/locales/en/translation.json', 'r', encoding='utf-8-sig') as f:
    en_content = f.read()

en_data = json.loads(en_content)

# Now manually fix the Korean file by reconstructing it properly
# The Korean file has the right content but wrong structure
# Let's extract the Korean data and rebuild with correct structure

# First, let's try to fix by removing the extra closing brace
# The problem is at position 10008 where there's an extra }

# Read as raw string and fix
with open('src/locales/ko/translation.json', 'r', encoding='utf-8-sig') as f:
    raw = f.read()

# Find the testimonials closing and the extra }
# The structure should be:
# "testimonials": { ... },
# "order": { ... },
# "faq": { ... },
# "footer": { ... }
# }

# The issue: after testimonials there's an extra } that closes the main object
# Let's find the pattern: "  },\n  \"order\":" should be "  },\n  \"order\":"
# But there's an extra } before it

# Let's do a targeted fix: replace the problematic section
# The broken part looks like:
#   }\n},\n  "order":
# Should be:
#   }\n  },\n  "order":

# Actually, looking at the raw chars:
# 10006: } (closes t5Content)
# 10007: \n
# 10008: } (closes testimonials) 
# 10009: , (comma after testimonials)
# 10010: \n
# 10011-10012: two spaces
# 10013: " (start of "order")

# This looks correct! The issue must be earlier.
# Let me check if there's an extra } before testimonials

# Let's try a different approach: parse the English structure and map Korean content to it
print("English keys:", list(en_data.keys()))
print("English order keys:", list(en_data.get('order', {}).keys()))
print("English faq keys:", list(en_data.get('faq', {}).keys()))

# The English has: nav, hero, about, features, clinical, tech, experts, target, products, testimonials, order, faq, footer
# Korean should have the same

# Let's try to load the Korean as JSON with a custom decoder that handles multiple roots
# Or better: manually reconstruct the Korean JSON using English structure

# Extract Korean content by parsing the broken JSON piece by piece
import re

# Strategy: Use the English structure as template, fill with Korean content
# We'll parse the Korean file as a series of JSON objects and merge them

# First, let's get all the top-level keys from the Korean file by regex
# The Korean file has 11 root objects according to our analysis
# Object 0: main (nav through testimonials)
# Object 1: order (badge, title)
# Object 2: faq (badge, title, subtitle, q1, a1, ...)
# Object 3: faq.badge (medication, safety, etc.)
# Object 4: faq.cta (kakao, phone)
# Object 5: faq.notice (title, parvogel, monsmecta, guide)
# Object 6: products.puppy (name, dosage, etc.)
# Object 7: clinical.card3 (virus data)
# Object 8: clinical.virusTable (vg1-vg5)
# Object 9: clinical.virusDesc (v1-v5)
# Object 10: ???

# This is too fragmented. Let's try a different approach:
# Use the English JSON as skeleton, and for each key, extract Korean content from the broken file

# Actually, the simplest fix: the Korean file has the right content but an extra } at position 10008
# Let's just remove that extra } by editing the raw string

with open('src/locales/ko/translation.json', 'r', encoding='utf-8-sig') as f:
    raw = f.read()

# The issue: at position 10008 there's a } that closes the main object
# But looking at the structure, position 10008 should close testimonials
# The main object should continue until the end

# Let's find the exact bytes and fix
# Position 10008 is a } that should NOT close the main object
# The main object should close at the very end

# Actually, the problem might be that there's a missing { for the main object
# or an extra } somewhere before testimonials

# Let's try a brute force fix: ensure the file has exactly one root object
# by wrapping everything in a single object if needed

# Count braces
open_braces = raw.count('{')
close_braces = raw.count('}')
print(f"Open braces: {open_braces}, Close braces: {close_braces}")

# If they match, the issue is nesting
# If close > open, there's an extra }

# Let's try to parse with json.loads after fixing the known issue
# The known issue: after testimonials there's an extra } before order

# Find the pattern: "  },\n  \"order\":" should not have an extra } before it
# The broken pattern: "  }\n},\n  \"order\":"
# Fixed pattern: "  }\n  },\n  \"order\":"

# Let's do a targeted string replacement
# Find the testimonials closing followed by extra }

# The testimonials object ends with:
#   }\n},\n  "order":
# Should be:
#   }\n  },\n  "order":

# Let's locate and fix
target_broken = '  }\n},\n  "order":'
target_fixed = '  }\n  },\n  "order":'

if target_broken in raw:
    print("Found broken pattern!")
    raw = raw.replace(target_broken, target_fixed)
    print("Fixed!")
else:
    print("Broken pattern not found, trying alternative...")
    # Try with different spacing
    target_broken2 = '}\n},\n  "order":'
    target_fixed2 = '}\n  },\n  "order":'
    if target_broken2 in raw:
        print("Found broken pattern 2!")
        raw = raw.replace(target_broken2, target_fixed2)
        print("Fixed!")
    else:
        print("Pattern not found, trying regex...")
        # Use regex to find the pattern
        import re
        pattern = r'(\s*\}\s*\n\s*\}\s*\n\s*"order":)'
        match = re.search(pattern, raw)
        if match:
            print(f"Found with regex: {match.group()}")
            raw = re.sub(pattern, r'\1  },\n  "order":', raw)  # This won't work directly
            print("Attempted regex fix")

# Write the fixed version
with open('src/locales/ko/translation.json', 'w', encoding='utf-8') as f:
    f.write(raw)

print("Written fixed version")

# Test if it parses now
try:
    json.loads(raw)
    print("SUCCESS: JSON parses correctly!")
except json.JSONDecodeError as e:
    print(f"STILL BROKEN: {e}")
    print(f"Error at position {e.pos}: {e.msg}")