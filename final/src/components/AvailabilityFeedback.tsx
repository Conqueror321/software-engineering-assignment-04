import type { AvailabilityResult } from '@/lib/availability';
import { REASON_MESSAGES, formatTime } from '@/lib/presentation';
export function AvailabilityFeedback({ result, roomName, start, end }: {
  result: AvailabilityResult; roomName: string; start: number; end: number;
}) {
  return <div role="status" aria-live="polite" className={`result ${result.available ? 'success' : 'failure'}`}>
    <span className="result-symbol" aria-hidden="true">{result.available ? '✓' : '×'}</span>
    <div><h3>{result.available ? 'Available' : 'Unavailable'} · {roomName}</h3>
      <p>{result.available ? `Free from ${formatTime(start)} to ${formatTime(end)}. Checking does not create a booking.` : REASON_MESSAGES[result.reason]}</p></div></div>;
}
