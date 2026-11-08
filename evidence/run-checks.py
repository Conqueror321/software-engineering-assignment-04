"""Run and log the final functional/static/build checks; no third-party Python deps."""
import json
from pathlib import Path
import subprocess
ROOT = Path(__file__).resolve().parents[1]
checks = [
    ('02-final-tests.txt', ['npm', 'test', '--', '--reporter=verbose'], ROOT/'final'),
    ('03-typecheck.txt', ['npm', 'run', 'typecheck'], ROOT/'final'),
    ('04-lint.txt', ['npm', 'run', 'lint'], ROOT/'final'),
    ('05-build.txt', ['npm', 'run', 'build'], ROOT/'final'),
    ('06-behavior-equivalence.txt', ['node', '--experimental-strip-types', 'evidence/compare-behavior.mjs'], ROOT),
]
results = []
for filename, command, cwd in checks:
    result = subprocess.run(command, cwd=cwd, text=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    (ROOT/'evidence'/filename).write_text('$ '+' '.join(command)+'\n'+result.stdout+f'\nExit code: {result.returncode}\n')
    results.append({'command': command, 'cwd': cwd.relative_to(ROOT).as_posix(), 'exit_code': result.returncode, 'log': filename})
    print(f'{filename}: exit {result.returncode}')
    if result.returncode:
        raise SystemExit(result.stdout)
(ROOT/'evidence/09-command-results.json').write_text(json.dumps(results,indent=2)+'\n')
