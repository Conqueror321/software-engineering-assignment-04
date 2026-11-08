import { useState } from 'react';
import { ROOMS } from '@/data/rooms';
import { NOW } from '@/data/campus';
import type { Equipment } from '@/domain/room';
import { filterRooms, selectVisibleRoom } from '@/lib/filtering';
import { checkRoom } from '@/lib/roomAvailability';
import { toLocalInput } from '@/lib/presentation';
import { RoomFilters } from '@/components/RoomFilters';
import { RoomPicker } from '@/components/RoomPicker';
import { TimeRequest } from '@/components/TimeRequest';
import { AvailabilityFeedback } from '@/components/AvailabilityFeedback';
import { BookingList } from '@/components/BookingList';

function App() {
  const [attendees, setAttendees] = useState('1');
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [preferredRoomId, setPreferredRoomId] = useState(ROOMS[0].id);
  const [times, setTimes] = useState({
    start: toLocalInput(NOW + 30 * 60000), end: toLocalInput(NOW + 60 * 60000),
  });
  const [checked, setChecked] = useState(false);
  const visibleRooms = filterRooms(ROOMS, { attendees: Number(attendees), equipment });
  const selectedRoom = selectVisibleRoom(visibleRooms, preferredRoomId);
  const start = new Date(times.start).getTime();
  const end = new Date(times.end).getTime();
  const result = checked && selectedRoom ? checkRoom(selectedRoom, start, end, NOW) : null;

  function toggleEquipment(item: Equipment) {
    setEquipment(current => current.includes(item) ? current.filter(value => value !== item) : [...current, item]);
  }
  function changeTime(field: 'start' | 'end', value: string) {
    setTimes(current => ({ ...current, [field]: value }));
    setChecked(false);
  }
  return <div className="app-shell">
    <header className="site-header"><a href="#main" className="brand"><span className="brand-mark" aria-hidden="true">SC</span>
      <span>Smart Campus<span className="brand-subtitle">Spaces for your next idea</span></span></a>
      <span className="demo-tag"><span /> Fictional campus · Demo</span></header>
    <main id="main">
      <div className="page-intro"><p className="eyebrow">ROOM AVAILABILITY</p><h1>Find your space.</h1>
        <p>Choose what you need. Find a room that fits. Check a time.</p></div>
      <div className="workspace"><div className="main-column">
        <RoomFilters attendees={attendees} equipment={equipment} onAttendees={setAttendees}
          onEquipment={toggleEquipment} onReset={() => { setAttendees('1'); setEquipment([]); }} />
        <RoomPicker rooms={visibleRooms} selectedId={selectedRoom?.id} onSelect={setPreferredRoomId} />
        <TimeRequest start={times.start} end={times.end} onTime={changeTime}
          onCheck={() => setChecked(true)} disabled={!selectedRoom} />
        {result && selectedRoom && <AvailabilityFeedback result={result} roomName={selectedRoom.name} start={start} end={end} />}
      </div><aside>{selectedRoom ? <BookingList room={selectedRoom} /> : <section className="panel aside-empty"><h2>No room selected</h2><p>A matching room's schedule will appear here.</p></section>}
        <div className="demo-note"><strong>A quick note</strong><p>This checker uses a fixed clock and sample bookings. It does not reserve rooms or change the schedule.</p></div>
      </aside></div>
    </main>
    <footer>Software Engineering / Assignment 04 <span>Dastan Karbuzov · 24B031050</span></footer>
  </div>;
}
export default App;
