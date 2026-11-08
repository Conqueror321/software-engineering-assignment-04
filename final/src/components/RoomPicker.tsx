import type { Room } from '@/domain/room';
export function RoomPicker({ rooms, selectedId, onSelect }: {
  rooms: readonly Room[]; selectedId?: string; onSelect: (id: string) => void;
}) {
  return <section className="panel" aria-labelledby="rooms-title">
    <div className="section-heading"><h2 id="rooms-title">02 / Choose a room</h2><span className="count">{rooms.length} matching</span></div>
    {rooms.length === 0 ? <div className="empty-state" role="status"><h3>No rooms match your requirements</h3>
      <p>Try fewer attendees or remove an equipment requirement.</p></div> :
      <div className="room-grid" role="group" aria-label="Matching rooms">{rooms.map(room =>
        <button key={room.id} className={`room-card ${selectedId === room.id ? 'selected' : ''}`}
          aria-pressed={selectedId === room.id} onClick={() => onSelect(room.id)} data-room-id={room.id}>
          <span className="room-top"><span className="room-id">{room.id}</span>
            <span className={`badge ${room.blocked ? 'blocked' : ''}`}>{room.blocked ? 'Blocked' : 'Open'}</span></span>
          <strong>{room.name}</strong><span className="room-capacity">Up to {room.capacity} people</span>
          <span className="room-equipment">{room.equipment.join(' · ')}</span></button>)}</div>}
  </section>;
}
