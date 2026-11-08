import { EQUIPMENT, type Equipment } from '@/domain/room';
type Props = { attendees: string; equipment: readonly Equipment[]; onAttendees: (value: string) => void;
  onEquipment: (item: Equipment) => void; onReset: () => void };
export function RoomFilters({ attendees, equipment, onAttendees, onEquipment, onReset }: Props) {
  const valid = Number.isInteger(Number(attendees)) && Number(attendees) >= 1;
  return <section className="panel" aria-labelledby="requirements-title">
    <div className="section-heading"><h2 id="requirements-title">01 / Your requirements</h2>
      <button className="text-button" onClick={onReset}>Reset filters</button></div>
    <label className="field"><span>Attendees</span><input id="attendees" type="number" min="1" step="1" value={attendees}
      aria-invalid={!valid} aria-describedby={!valid ? 'attendees-error' : undefined} onChange={e => onAttendees(e.target.value)} /></label>
    {!valid && <p id="attendees-error" className="error-text">Enter a whole number of at least 1.</p>}
    <fieldset><legend>Required equipment <span className="muted">(all selected items)</span></legend>
      <div className="equipment-options">{EQUIPMENT.map(item => <label key={item} className="equipment-option">
        <input type="checkbox" checked={equipment.includes(item)} onChange={() => onEquipment(item)} />
        <span>{item}</span></label>)}</div></fieldset>
  </section>;
}
