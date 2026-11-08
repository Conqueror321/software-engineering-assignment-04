import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import App from './App';
import { ROOMS } from '@/data/rooms';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
let host: HTMLDivElement;
let root: Root;
function click(selector: string) {
  const node = host.querySelector<HTMLButtonElement>(selector);
  if (!node) throw new Error(`Missing control: ${selector}`);
  act(() => node.click());
}
function input(selector: string, value: string) {
  const node = host.querySelector<HTMLInputElement>(selector);
  if (!node) throw new Error(`Missing input: ${selector}`);
  act(() => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(node, value);
    node.dispatchEvent(new Event('input', { bubbles: true }));
  });
}
const cards = () => [...host.querySelectorAll<HTMLElement>('[data-room-id]')].map(n => n.dataset.roomId);
const status = () => host.querySelector('.result')?.textContent;
const equipment = (name: string) => {
  const label = [...host.querySelectorAll('label')].find(l => l.textContent === name);
  if (!label) throw new Error(`Missing equipment ${name}`);
  act(() => label.querySelector('input')!.click());
};

beforeEach(() => { host = document.createElement('div'); document.body.append(host); root = createRoot(host); act(() => root.render(<App />)); });
afterEach(() => { act(() => root.unmount()); host.remove(); });

describe('mounted React integration: actual controls, state, result and schedule', () => {
  it('shows four rooms and no unchecked availability claim', () => { expect(cards()).toHaveLength(4); expect(status()).toBeUndefined(); });
  it('F1 filters through the attendees input at exact and insufficient capacity', () => {
    input('#attendees', '8'); expect(cards()).toContain('library-a');
    input('#attendees', '9'); expect(cards()).not.toContain('library-a');
  });
  it('F2 applies all selected checkbox requirements', () => {
    equipment('Projector'); equipment('Video conferencing');
    expect(cards()).toEqual(['innovation', 'seminar-hall']);
  });
  it('F4 empty state removes selection, clears old feedback and disables checking', () => {
    click('.primary-button'); expect(status()).toContain('Available'); input('#attendees', '41');
    expect(cards()).toEqual([]); expect(host.textContent).toContain('No rooms match your requirements');
    expect(status()).toBeUndefined(); expect(host.querySelector<HTMLButtonElement>('.primary-button')!.disabled).toBe(true);
    expect(host.querySelector('[aria-pressed="true"]')).toBeNull();
  });
  it('F5 switching after a check refreshes both result and own schedule', () => {
    click('.primary-button'); expect(status()).toContain('Available · Library Study Room A');
    click('[data-room-id="innovation"]'); expect(status()).toContain('Unavailable · Innovation Studio');
    expect(status()).toContain('overlaps'); expect(host.querySelector('.schedule')!.textContent).toContain('Robotics Society');
    expect(host.querySelector('.schedule')!.textContent).not.toContain('Prof. Lane');
    click('[data-room-id="computer-lab"]'); expect(status()).toContain('Available · Computing Lab');
  });
  it('F3 selecting a blocked matching room reports blocked feedback', () => {
    click('[data-room-id="seminar-hall"]'); click('.primary-button');
    expect(status()).toContain('Unavailable · Seminar Hall'); expect(status()).toContain('blocked');
  });
  it('F5 filters out checked room and recomputes for visible fallback', () => {
    click('.primary-button'); input('#attendees', '9');
    expect(host.querySelector('[aria-pressed="true"]')?.getAttribute('data-room-id')).toBe('innovation');
    expect(status()).toContain('Unavailable · Innovation Studio');
  });
  it('AC6 editing time clears an old result; next check applies new time', () => {
    click('.primary-button'); input('input[type="datetime-local"]', '2026-10-27T11:00');
    expect(status()).toBeUndefined(); click('.primary-button'); expect(status()).toContain('End time must be after');
  });
  it('AC1 missing datetime gets clear feedback', () => {
    input('input[type="datetime-local"]', ''); click('.primary-button'); expect(status()).toContain('End time must be after');
  });
  it('invalid attendee input has an accessible error and recovers', () => {
    input('#attendees', ''); expect(host.querySelector('#attendees')?.getAttribute('aria-invalid')).toBe('true');
    expect(cards()).toHaveLength(0); click('.text-button'); expect(cards()).toHaveLength(4);
    expect(host.querySelector('#attendees')?.getAttribute('aria-invalid')).toBe('false');
  });
  it('reset filters restores all rooms from an impossible equipment combination', () => {
    equipment('Computers'); equipment('Projector'); expect(cards()).toHaveLength(0);
    click('.text-button'); expect(cards()).toHaveLength(4);
    expect([...host.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')].every(n => !n.checked)).toBe(true);
  });
  it('AC5 repeated UI checks and switching never create or alter bookings', () => {
    const before = JSON.stringify(ROOMS);
    click('.primary-button'); click('[data-room-id="innovation"]'); click('.primary-button');
    click('[data-room-id="library-a"]'); click('.primary-button'); expect(JSON.stringify(ROOMS)).toBe(before);
  });
});
