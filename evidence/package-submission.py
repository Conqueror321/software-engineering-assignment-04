"""Create an integrity-checked submission archive without dependencies or caches."""
import hashlib
import json
from pathlib import Path
import zipfile
ROOT = Path(__file__).resolve().parents[1]
EXCLUDE = {'node_modules', 'dist', '.git', '__pycache__', 'tmp', '.DS_Store', '.vite'}
def included():
    return sorted(p for p in ROOT.rglob('*') if p.is_file() and not p.is_symlink()
                  and not any(part in EXCLUDE for part in p.relative_to(ROOT).parts))
manifest = {p.relative_to(ROOT).as_posix(): hashlib.sha256(p.read_bytes()).hexdigest()
            for p in included() if p != ROOT/'evidence/SHA256.json'}
(ROOT/'evidence/SHA256.json').write_text(json.dumps(manifest, indent=2)+'\n')
archive = ROOT.parent/'Assignment_04_Dastan_Karbuzov_24B031050_Submission.zip'
with zipfile.ZipFile(archive, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as output:
    for path in included(): output.write(path, 'Assignment_04/'+path.relative_to(ROOT).as_posix())
with zipfile.ZipFile(archive) as result:
    assert result.testzip() is None
    for name, expected in manifest.items():
        assert hashlib.sha256(result.read('Assignment_04/'+name)).hexdigest() == expected, name
    assert not any('/node_modules/' in name or '/dist/' in name or '/tmp/' in name for name in result.namelist())
    print(f'PASS: {len(result.namelist())} ZIP entries verified, {len(manifest)} file hashes match.')
print(f'{archive}\n{archive.stat().st_size:,} bytes')
