import json
from pathlib import Path
from collections import Counter

# Load the detect result
with open('graphify-out/.graphify_python') as f:
    python_path = f.read().strip()

import sys
sys.path.insert(0, python_path)

from graphify.detect import detect
result = detect(Path('.'))

dirs = Counter()
for f in result['files']['code'] + result['files']['document']:
    p = Path(f)
    # Get the first-level subdirectory under root
    parts = p.parts
    if len(parts) >= 2:
        # e.g., apps, docs, packages
        dirs[parts[1]] += 1

print("Top 5 subdirectories by file count:")
for d, c in dirs.most_common(5):
    print(f"  {d}: {c} files")