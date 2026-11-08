import type { Room } from '@/domain/room';
import { formatTime } from '@/lib/presentation';
export function BookingList({ room }: { room: Room }) {
  const sorted = [...room.bookings].sort((a, b) => a.start - b.start);
  return <section className="panel schedule" aria-labelledby="schedule-title">
    <div className="section-heading"><h2 id="schedule-title">Room schedule</h2><span className="count">27 Oct</span></div>
    <h3>{room.name}</h3><p className="section-note">Fictional bookings for this room only.</p>
    {room.blocked && <p className="blocked-note">This room is blocked for maintenance.</p>}
    {sorted.length === 0 ? <p>No bookings today.</p> : <ul>{sorted.map(b => <li key={b.id}>
      <span className="schedule-dot" /><div><strong>{b.owner}</strong><span>{formatTime(b.start)} – {formatTime(b.end)}</span></div></li>)}</ul>}
    <div className="schedule-rule"><strong>Touching times are OK</strong><p>A request may end when a booking starts, or start when it ends.</p></div>
  </section>;
}
