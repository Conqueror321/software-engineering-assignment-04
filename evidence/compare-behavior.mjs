import assert from 'node:assert/strict';
import { isAvailable as before } from '../initial/src/lib/availability.ts';
import { isAvailable as after } from '../final/src/lib/availability.ts';
const now = Date.parse('2026-10-27T10:00:00');
const minute = 60000;
const fixtureSets = [[], [{ id: 'b', start: now + 60*minute, end: now + 90*minute, owner: 'Demo' }],
  [{id:'later', start:now+240*minute,end:now+300*minute,owner:'Demo'},
   {id:'earlier', start:now+60*minute,end:now+90*minute,owner:'Demo'}]];
let count = 0;
for (const fixtures of fixtureSets) {
 for (let start=-60; start<=360; start+=5) {
  for (const duration of [-30,0,1,5,30,60,119,120,121,150,180]) {
   for (const roomBlocked of [false,true]) {
    const bookings=fixtures.map(b=>Object.freeze({...b})); Object.freeze(bookings);
    const snapshot=JSON.stringify(bookings);
    const input={start:now+start*minute,end:now+(start+duration)*minute,now,bookings,roomBlocked};
    assert.deepEqual(after(input),before(input));
    assert.equal(JSON.stringify(bookings),snapshot);
    count++;
   }
  }
 }
}
console.log(`PASS: ${count} before/after decisions match; frozen fixtures unchanged.`);
