"""Reproduce structural metrics; functional counts come from actual saved logs."""
import json
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
metrics = {}
for version in ['initial', 'final']:
    src = ROOT / version / 'src'
    modules = sorted(p.relative_to(src).as_posix() for p in src.rglob('*')
                     if p.suffix in ['.ts', '.tsx'] and '.test.' not in p.name and not p.name.endswith('.d.ts'))
    metrics[version] = {
        'production_ts_modules': len(modules), 'modules': modules,
        'datetime_input_render_locations': sum(p.read_text().count('type="datetime-local"')
            for p in src.rglob('*.tsx') if '.test.' not in p.name),
    }
metrics['duplicate_datetime_render_locations_removed'] = metrics['initial']['datetime_input_render_locations'] - metrics['final']['datetime_input_render_locations']
metrics['baseline_tests'] = {'passed': 26, 'total': 26}
metrics['final_tests'] = {'passed': 61, 'total': 61, 'original_retained': 26, 'new_pure': 23, 'new_mounted_ui': 12}
checks = json.loads((ROOT / 'evidence/07-browser-checks.json').read_text())
metrics['browser_checks'] = {'passed': sum(c['passed'] for c in checks), 'total': len(checks)}
assert '26 passed (26)' in (ROOT / 'evidence/01-baseline-tests.txt').read_text()
assert '61 passed (61)' in (ROOT / 'evidence/02-final-tests.txt').read_text()
output = ROOT / 'evidence/quality-metrics.json'
output.write_text(json.dumps(metrics, indent=2) + '\n')
print(json.dumps(metrics, indent=2))
