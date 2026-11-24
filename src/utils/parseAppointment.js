const WEEKDAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
const categoryWords = [
  { words: ['dentist', 'doctor', 'clinic', 'medical', 'doctor'], category: 'Doctors' },
  { words: ['government', 'passport', 'license', 'municipality', 'visa'], category: 'Government' },
  { words: ['university', 'campus', 'lecture', 'professor'], category: 'University' },
  { words: ['car', 'vehicle', 'mechanic', 'maintenance', 'garage'], category: 'Car care' },
  { words: ['salon', 'haircut', 'hair', 'nails'], category: 'Salon' },
  { words: ['interview', 'recruiter', 'job'], category: 'Interviews' },
];

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function findDate(text, referenceDate = new Date()) {
  const lower = text.toLowerCase();
  const weekdayMatch = lower.match(/\b(next\s+)?(sunday|monday|tuesday|wednesday|thursday|friday|saturday)\b/);
  let date;

  if (weekdayMatch) {
    const targetDay = WEEKDAYS.indexOf(weekdayMatch[2]);
    let daysAhead = (targetDay - referenceDate.getDay() + 7) % 7;
    if (daysAhead === 0 || weekdayMatch[1]) daysAhead += 7;
    date = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate() + daysAhead);
  } else if (/\btomorrow\b/.test(lower)) {
    date = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate() + 1);
  } else if (/\btoday\b/.test(lower)) {
    date = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());
  } else {
    const monthMatch = lower.match(/\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})(?:,?\s+(\d{4}))?\b/);
    if (monthMatch) {
      const month = MONTHS.indexOf(monthMatch[1]);
      const day = Number(monthMatch[2]);
      let year = monthMatch[3] ? Number(monthMatch[3]) : referenceDate.getFullYear();
      date = new Date(year, month, day);
      if (!monthMatch[3] && date < new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate())) {
        year += 1;
        date = new Date(year, month, day);
      }
      if (date.getMonth() !== month || date.getDate() !== day) date = undefined;
    }
  }

  return date ? formatDate(date) : '';
}

function findTime(text) {
  const match = text.match(/\b(?:at\s*)?(\d{1,2})(?::(\d{2}))?\s*(a\.?m\.?|p\.?m\.?)\b/i);
  if (!match) return '';
  let hours = Number(match[1]);
  const minutes = Number(match[2] || 0);
  if (hours > 12 || minutes > 59) return '';
  const meridiem = match[3].toLowerCase().replace(/\./g, '');
  if (meridiem === 'pm' && hours !== 12) hours += 12;
  if (meridiem === 'am' && hours === 12) hours = 0;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function findLocation(text) {
  const match = text.match(/\b(?:in|at)\s+([A-Z][\w'-]*(?:\s+[A-Z][\w'-]*){0,3})(?=,|\s+(?:and|on|for|to|i\b)|[.!?]|$)/i);
  return match ? match[1].trim() : '';
}

function findItems(text) {
  const match = text.match(/\b(?:bring|need to bring|take)\s+(.+?)(?=,?\s+(?:and\s+)?(?:remind|at\s+\d|on\s+(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday))\b|[.!?]|$)/i);
  if (!match) return [];
  return match[1].replace(/^(?:my|the)\s+/i, '').split(/\s*,\s*|\s+and\s+/i).map((item) => item.trim()).filter(Boolean);
}

function findTitle(text) {
  let title = text.trim()
    .replace(/^(?:my|i have|i've got|there is|there's)\s+/i, '')
    .replace(/\s+(?:is|will be|happens)\s+(?:(?:on\s+)?(?:next\s+)?(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday|today|tomorrow)|(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2}).*$/i, '')
    .replace(/\s+(?:on\s+)?(?:next\s+)?(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday|today|tomorrow)\b.*$/i, '')
    .replace(/\s+(?:at\s+)?\d{1,2}(?::\d{2})?\s*(?:a\.?m\.?|p\.?m\.?).*$/i, '')
    .replace(/[,.!?]+$/, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!title) title = text.trim().split(/[,.!?]/)[0].slice(0, 120);
  title = title.replace(/\bappointment$/i, '').trim();
  if (title && !/\bappointment\b/i.test(title) && !/\binterview\b/i.test(title) && !/\bmaintenance\b/i.test(title)) {
    title = `${title} appointment`;
  }
  return title.slice(0, 120);
}

function findCategory(text) {
  const lower = text.toLowerCase();
  const found = categoryWords.find(({ words }) => words.some((word) => lower.includes(word)));
  return found?.category || 'Personal';
}

export function parseAppointment(text, referenceDate = new Date()) {
  const cleaned = text.trim();
  return {
    title: findTitle(cleaned),
    category: findCategory(cleaned),
    date: findDate(cleaned, referenceDate),
    time: findTime(cleaned),
    location: findLocation(cleaned),
    items: findItems(cleaned),
    reminders: ['1 day before', '2 hours before'],
  };
}
