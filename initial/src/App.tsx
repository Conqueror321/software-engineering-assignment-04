import { useMemo, useState } from 'react';
import { CalendarClock, CheckCircle2, XCircle, Clock, DoorClosed } from 'lucide-react';
import {
  isAvailable,
  type Booking,
} from '@/lib/availability';
import { REASON_MESSAGES, formatTime, toLocalInput } from '@/lib/presentation';
import { ROOM_NAME, NOW, INITIAL_BOOKINGS } from '@/data/campus';


function App() {
  const [bookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [roomBlocked, setRoomBlocked] = useState(false);
  const [startTime, setStartTime] = useState(toLocalInput(NOW + 30 * 60 * 1000));
  const [endTime, setEndTime] = useState(toLocalInput(NOW + 60 * 60 * 1000));
  const [result, setResult] = useState<ReturnType<typeof isAvailable> | null>(null);

  const todayLabel = new Date(NOW).toLocaleDateString([], {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const sortedBookings = useMemo(
    () => [...bookings].sort((a, b) => a.start - b.start),
    [bookings]
  );

  function handleCheck() {
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();
    setResult(isAvailable({ start, end, now: NOW, bookings, roomBlocked }));
  }

  const startMs = new Date(startTime).getTime();
  const endMs = new Date(endTime).getTime();
  const durationMin = Math.round((endMs - startMs) / 60000);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
        <header className="mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-600 text-white">
              <CalendarClock className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Smart Campus
              </h1>
              <p className="text-sm text-slate-500">Room availability checker</p>
            </div>
          </div>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center gap-2 text-slate-700">
            <DoorClosed className="h-5 w-5 text-sky-600" />
            <div>
              <p className="font-semibold">{ROOM_NAME}</p>
              <p className="text-xs text-slate-500">
                {todayLabel} &middot; Now is {formatTime(NOW)}
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Start time</span>
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => { setStartTime(e.target.value); setResult(null); }}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">End time</span>
              <input
                type="datetime-local"
                value={endTime}
                onChange={(e) => { setEndTime(e.target.value); setResult(null); }}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </label>
          </div>

          {Number.isFinite(durationMin) && durationMin > 0 && (
            <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
              <Clock className="h-3.5 w-3.5" /> Requested duration: {durationMin} min
            </p>
          )}

          <label className="mt-4 flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={roomBlocked}
              onChange={(e) => { setRoomBlocked(e.target.checked); setResult(null); }}
              className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
            />
            Mark room as blocked
          </label>

          <button
            onClick={handleCheck}
            className="mt-5 w-full rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700 active:bg-sky-800 sm:w-auto"
          >
            Check availability
          </button>

          {result && (
            <div
              role="status"
              aria-live="polite"
              className={`mt-5 flex items-start gap-3 rounded-xl p-4 ${
                result.available
                  ? 'border border-emerald-200 bg-emerald-50 text-emerald-800'
                  : 'border border-rose-200 bg-rose-50 text-rose-800'
              }`}
            >
              {result.available ? (
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0" />
              ) : (
                <XCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
              )}
              <div className="text-sm">
                <p className="font-semibold">
                  {result.available ? 'Available' : 'Unavailable'}
                </p>
                {!result.available && <p>{REASON_MESSAGES[result.reason]}</p>}
                {result.available && (
                  <p>
                    {ROOM_NAME} is free from {formatTime(startMs)} to {formatTime(endMs)}.
                  </p>
                )}
              </div>
            </div>
          )}
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="mb-3 text-sm font-semibold text-slate-700">Existing bookings today</h2>
          {sortedBookings.length === 0 ? (
            <p className="text-sm text-slate-500">No bookings yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {sortedBookings.map((b) => (
                <li key={b.id} className="flex items-center justify-between py-2 text-sm">
                  <span className="text-slate-700">{b.owner}</span>
                  <span className="font-mono text-xs text-slate-500">
                    {formatTime(b.start)} – {formatTime(b.end)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <footer className="mt-6 text-center text-xs text-slate-400">
          No login required &middot; Demo data &middot; Bookings are not modified when checking
        </footer>
      </div>
    </div>
  );
}

export default App;
