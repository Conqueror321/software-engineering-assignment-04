"""Verify all SHA256-listed submission files from any extracted package location."""
import hashlib
import json
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
manifest = json.loads((ROOT / 'evidence/SHA256.json').read_text())
for name, expected in manifest.items():
    path = ROOT / name
    assert path.is_file(), f'Missing: {name}'
    actual = hashlib.sha256(path.read_bytes()).hexdigest()
    assert actual == expected, f'Modified: {name}'
print(f'PASS: {len(manifest)} file SHA256 hashes match.')
