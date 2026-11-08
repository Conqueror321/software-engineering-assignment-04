"""Repeatable real-browser checks through the user's required gstack /browse skill.
Start initial on :5183 and final on :5184 first. BROWSE_BIN may override the path.
"""
import json
import os
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[1]
BROWSE = os.environ.get('BROWSE_BIN', '/Users/dastan/.agents/skills/gstack/browse/dist/browse')
checks = []
transcript = []

def browse(*args):
    result = subprocess.run([BROWSE, *args], cwd=ROOT.parent, text=True, capture_output=True, check=True)
    transcript.append({'command': [BROWSE, *args], 'stdout': result.stdout, 'stderr': result.stderr, 'exit': result.returncode})
    return result.stdout.strip()

def check(name, expression):
    actual = browse('js', expression)
    passed = actual == 'true'
    checks.append({'name': name, 'passed': passed, 'actual': actual, 'expression': expression})
    if not passed:
        raise AssertionError(f'{name}: {actual}')

def shot(name):
    browse('screenshot', str(ROOT / 'screenshots' / name))

try:
    browse('viewport', '1440x1000')
    browse('goto', 'http://127.0.0.1:5183')
    check('original single-room UI renders', "document.body.textContent.includes('Library Study Room A')")
    shot('01-initial-desktop.png')
    browse('goto', 'http://127.0.0.1:5184')
    check('catalog contains four room controls', "document.querySelectorAll('[data-room-id]').length === 4")
    check('desktop has no horizontal overflow', 'document.documentElement.scrollWidth <= innerWidth')
    browse('click', '.primary-button')
    check('library available at 10:30-11:00', "document.querySelector('.result').textContent.includes('Available · Library Study Room A')")
    shot('02-final-desktop-available.png')
    browse('click', '[data-room-id="innovation"]')
    check('switch immediately refreshes to room-specific overlap', "document.querySelector('.result').textContent.includes('Unavailable · Innovation Studio') && document.querySelector('.result').textContent.includes('overlaps')")
    check('schedule switches to selected room only', "document.querySelector('.schedule').textContent.includes('Robotics Society') && !document.querySelector('.schedule').textContent.includes('Prof. Lane')")
    shot('03-room-switch-overlap.png')
    browse('fill', '#attendees', '20')
    browse('click', '.equipment-option:nth-child(1) input')
    browse('click', '.equipment-option:nth-child(2) input')
    check('combined capacity and ALL-equipment filter leaves only Innovation', "document.querySelectorAll('[data-room-id]').length === 1 && !!document.querySelector('[data-room-id=innovation]')")
    shot('04-successful-filters.png')
    browse('fill', '#attendees', '41')
    check('empty state, no stale result, disabled checking', "document.body.textContent.includes('No rooms match your requirements') && !document.querySelector('.result') && document.querySelector('.primary-button').disabled")
    shot('05-empty-state.png')
    browse('click', '.text-button')
    browse('viewport', '390x844')
    browse('click', '[data-room-id="seminar-hall"]')
    browse('click', '.primary-button')
    check('mobile blocked room cannot be available', "document.querySelector('.result').textContent.includes('Unavailable · Seminar Hall') && document.querySelector('.result').textContent.includes('blocked')")
    check('390px mobile has no horizontal overflow', 'document.documentElement.scrollWidth <= innerWidth')
    shot('06-mobile-blocked.png')
    browse('viewport', '320x812')
    check('320px narrow viewport has no horizontal overflow', 'document.documentElement.scrollWidth <= innerWidth')
    browse('viewport', '768x1024')
    check('768px tablet has no horizontal overflow', 'document.documentElement.scrollWidth <= innerWidth')
    browse('viewport', '390x844')
    browse('click', '[data-room-id="computer-lab"]')
    check('mobile switch refreshes blocked result to available lab', "document.querySelector('.result').textContent.includes('Available · Computing Lab')")
    shot('07-mobile-available.png')
    browse('viewport', '1440x1000')
    browse('click', '[data-room-id="library-a"]')
    errors = browse('console', '--errors')
    (ROOT / 'evidence' / '08-browser-console.txt').write_text(errors + '\n')
finally:
    (ROOT / 'evidence' / '07-browser-checks.json').write_text(json.dumps(checks, indent=2, ensure_ascii=False) + '\n')
    (ROOT / 'evidence' / '07-browser-transcript.json').write_text(json.dumps(transcript, indent=2, ensure_ascii=False) + '\n')
    summary = f'{sum(c["passed"] for c in checks)}/{len(checks)} real-browser assertions passed.'
    (ROOT / 'evidence' / '07-browser-summary.txt').write_text(summary + '\n')
    print(summary)
