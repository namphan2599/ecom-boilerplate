import json
from graphify.detect import detect
from pathlib import Path

result = detect(Path('apps/backend'))
print(json.dumps(result))