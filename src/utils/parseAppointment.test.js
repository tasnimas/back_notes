import test from 'node:test';
import assert from 'node:assert/strict';
import { parseAppointment } from './parseAppointment.js';

test('extracts the details from a natural-language appointment message', () => {
  const parsed = parseAppointment(
    'My dentist appointment is Thursday at 4:30 PM in Amman, and I need to bring my insurance card.',
    new Date(2026, 10, 24),
  );

  assert.deepEqual(parsed, {
    title: 'dentist appointment',
    category: 'Doctors',
    date: '2026-11-26',
    time: '16:30',
    location: 'Amman',
    items: ['insurance card'],
    reminders: ['1 day before', '2 hours before'],
  });
});

test('leaves date and time unset when the message does not include them', () => {
  const parsed = parseAppointment('Pick up a package from the post office.');

  assert.equal(parsed.date, '');
  assert.equal(parsed.time, '');
  assert.equal(parsed.category, 'Personal');
});
