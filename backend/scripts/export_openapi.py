import json
from pathlib import Path

from main import app

output = Path(__file__).resolve().parents[2] / "docs" / "openapi.json"
output.write_text(json.dumps(app.openapi(), indent=2, sort_keys=True) + "\n", encoding="utf-8")
print(output)
