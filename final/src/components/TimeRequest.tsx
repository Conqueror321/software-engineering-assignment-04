import { formatTime } from '@/lib/presentation';
import { NOW } from '@/data/campus';
export function TimeField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="field"><span>{label}</span><input type="datetime-local" value={value} onChange={e => onChange(e.target.value)} /></label>;
}
export function TimeRequest({ start, end, onTime, onCheck, disabled }: {
  start: string; end: string; onTime: (field: 'start' | 'end', value: string) => void; onCheck: () => void; disabled: boolean;
}) {
  const duration = (new Date(end).getTime() - new Date(start).getTime()) / 60000;
  return <section className="panel" aria-labelledby="time-title"><h2 id="time-title">03 / Check your time</h2>
    <p className="section-note">Fixed demo clock: 27 Oct 2026, {formatTime(NOW)} (local). Maximum 120 minutes.</p>
    <div className="time-grid"><TimeField label="Start time" value={start} onChange={v => onTime('start', v)} />
      <TimeField label="End time" value={end} onChange={v => onTime('end', v)} /></div>
    <div className="check-row"><p className="muted">{Number.isFinite(duration) && duration > 0 ? `${duration} minutes requested` : 'Choose a valid time range'}</p>
      <button className="primary-button" disabled={disabled} onClick={onCheck}>Check availability <span aria-hidden="true">↗</span></button></div>
  </section>;
}
