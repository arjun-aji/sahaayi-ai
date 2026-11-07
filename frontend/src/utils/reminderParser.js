// Sahaayi AI - Intelligent Voice Reminder Parser (Bilingual Malayalam & English)

const MALAYALAM_NUMBERS = {
  'ഒരു': 1, 'ഒന്ന്': 1,
  'രണ്ട്': 2, 'രണ്ടര': 2.5,
  'മൂന്ന്': 3, 'മൂന്നര': 3.5,
  'നാല്': 4, 'നാലര': 4.5,
  'അഞ്ച്': 5, 'അഞ്ചര': 5.5,
  'ആറ്': 6, 'ആറര': 6.5,
  'ഏഴ്': 7, 'ഏഴര': 7.5,
  'എട്ട്': 8, 'എട്ടര': 8.5,
  'ഒൻപത്': 9, 'ഒമ്പത്': 9,
  'പത്ത്': 10, 'പത്തര': 10.5,
  'പതിനൊന്ന്': 11, 'പതിനൊന്നര': 11.5,
  'പന്ത്രണ്ട്': 12
};

/**
 * Parses spoken voice input to detect reminder intent, time, category, and title.
 * @param {string} text - Spoken text in Malayalam or English
 * @param {string} lang - 'ml' | 'en'
 * @returns {object|null} - { isReminder: boolean, title: string, time: string, category: string, rawText: string }
 */
export function parseReminderFromVoice(text, lang = 'ml') {
  if (!text || typeof text !== 'string') return null;
  const raw = text.trim();
  const lower = raw.toLowerCase();

  // 1. Detect reminder trigger keywords
  const mlTriggers = ['ഓർമ്മിപ്പിക്കുക', 'ഓർമ്മപ്പെടുത്തുക', 'ഓർമ്മിപ്പിക്കണം', 'ഓർമ്മപ്പെടുത്തണം', 'ഓർമ്മിക്കണം', 'ഓർമ്മിപ്പിക്ക്', 'റിമൈൻഡർ', 'ഓർമ്മ'];
  const enTriggers = ['remind me', 'set a reminder', 'add a reminder', 'reminder for', 'reminder to', 'remind', 'reminder'];

  const hasMlTrigger = mlTriggers.some(t => raw.includes(t));
  const hasEnTrigger = enTriggers.some(t => lower.includes(t));

  // Time triggers like "മണിക്ക്" (at X o'clock)
  const hasMlTimeIndicator = raw.includes('മണിക്ക്') || raw.includes('മണി') || raw.includes('രാവിലെ') || raw.includes('വൈകിട്ട്') || raw.includes('വൈകുന്നേരം') || raw.includes('ഉച്ചയ്ക്ക്') || raw.includes('രാത്രി');
  const hasEnTimeIndicator = /\b(at|in|every)\s+(\d{1,2}(:\d{2})?\s*(am|pm)?)/i.test(lower);

  const isReminder = hasMlTrigger || hasEnTrigger || (hasMlTimeIndicator && (raw.includes('ഗുളിക') || raw.includes('മരുന്ന്') || raw.includes('വെള്ളം'))) || (hasEnTimeIndicator && (lower.includes('medicine') || lower.includes('pill') || lower.includes('water')));

  if (!isReminder) {
    return null;
  }

  // 2. Extract Category
  let category = 'daily';
  if (
    raw.includes('മരുന്ന്') || 
    raw.includes('ഗുളിക') || 
    raw.includes('തുള്ളിമരുന്ന്') || 
    raw.includes('ഇൻസുലിൻ') ||
    lower.includes('medicine') || 
    lower.includes('pill') || 
    lower.includes('tablet') || 
    lower.includes('drops') || 
    lower.includes('insulin') ||
    lower.includes('bp') ||
    lower.includes('sugar')
  ) {
    category = 'medicine';
  } else if (
    raw.includes('ഡോക്ടർ') || 
    raw.includes('ആശുപത്രി') || 
    raw.includes('ക്ലിനിക്ക്') || 
    raw.includes('ഹോസ്പിറ്റൽ') ||
    lower.includes('doctor') || 
    lower.includes('hospital') || 
    lower.includes('clinic') || 
    lower.includes('appointment')
  ) {
    category = 'doctor';
  }

  // 3. Extract Time (target format: "HH:MM" 24-hr)
  let time = '09:00'; // default fallback
  let isPm = false;
  let isAm = false;

  // Malayalam period checks
  if (raw.includes('വൈകിട്ട്') || raw.includes('വൈകുന്നേരം') || raw.includes('രാത്രി') || raw.includes('ഉച്ചയ്ക്ക്')) {
    isPm = true;
  }
  if (raw.includes('രാവിലെ') || raw.includes('പുലർച്ചെ')) {
    isAm = true;
  }

  // English period checks
  if (lower.includes('pm') || lower.includes('evening') || lower.includes('night') || lower.includes('afternoon')) {
    isPm = true;
  }
  if (lower.includes('am') || lower.includes('morning')) {
    isAm = true;
  }

  // Look for numeric patterns like "4:30", "1.27", "4", "04:00", "1.27 pm"
  const digitsMatch = raw.match(/(\d{1,2})([:.](\d{2}))?\s*(am|pm|മണിക്ക്|മണി)?/i);
  if (digitsMatch) {
    let hours = parseInt(digitsMatch[1], 10);
    let minutes = digitsMatch[3] ? parseInt(digitsMatch[3], 10) : 0;
    const tag = (digitsMatch[4] || '').toLowerCase();

    if (tag === 'pm' || lower.includes('pm')) isPm = true;
    if (tag === 'am' || lower.includes('am')) isAm = true;

    if (isPm && hours < 12) {
      hours += 12;
    } else if (isAm && hours === 12) {
      hours = 0;
    }

    const hh = String(hours).padStart(2, '0');
    const mm = String(minutes).padStart(2, '0');
    time = `${hh}:${mm}`;
  } else {
    // Check Malayalam word numbers (e.g., നാല് മണിക്ക് -> 4 o'clock)
    for (const [w, val] of Object.entries(MALAYALAM_NUMBERS)) {
      if (raw.includes(w)) {
        let hours = Math.floor(val);
        let minutes = (val % 1 !== 0) ? 30 : 0;
        if (isPm && hours < 12) {
          hours += 12;
        }
        time = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
        break;
      }
    }
  }

  // 4. Formulate Clean Title
  let cleanTitle = raw;
  // Remove trigger phrases
  const stripWords = [
    'ഓർമ്മിപ്പിക്കുക', 'ഓർമ്മപ്പെടുത്തുക', 'ഓർമ്മിപ്പിക്കണം', 'ഓർമ്മപ്പെടുത്തണം', 
    'ഓർമ്മിപ്പിക്ക്', 'ഓർമ്മിക്കണം', 'എന്നെ ഓർമ്മിപ്പിക്കുക', 'എനിക്ക്', 'ദയവായി',
    'remind me to', 'remind me', 'set a reminder for', 'set a reminder to', 'add a reminder for',
    'please remind me', 'reminder to', 'reminder for'
  ];

  for (const sw of stripWords) {
    cleanTitle = cleanTitle.replace(new RegExp(sw, 'gi'), ' ');
  }

  // Remove time mentions from title to keep it concise
  cleanTitle = cleanTitle
    .replace(/\b\d{1,2}(:\d{2})?\s*(am|pm)?\b/gi, ' ')
    .replace(/(രാവിലെ|വൈകിട്ട്|വൈകുന്നേരം|ഉച്ചയ്ക്ക്|രാത്രി)?\s*\d{1,2}\s*മണിക്ക്/g, ' ')
    .replace(/മണിക്ക്/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleanTitle || cleanTitle.length < 2) {
    if (category === 'medicine') {
      cleanTitle = lang === 'ml' ? 'മരുന്ന് കഴിക്കുക' : 'Take medicine';
    } else if (category === 'doctor') {
      cleanTitle = lang === 'ml' ? 'ഡോക്ടറെ കാണുക' : 'Doctor appointment';
    } else {
      cleanTitle = lang === 'ml' ? 'ഓർമ്മപ്പെടുത്തൽ' : 'Daily reminder';
    }
  }

  return {
    isReminder: true,
    title: cleanTitle,
    time: time,
    category: category,
    rawText: raw
  };
}

/**
 * Saves a new reminder to browser localStorage and dispatches an update event.
 */
export function saveReminder(reminder) {
  try {
    const existing = JSON.parse(localStorage.getItem('sahaayi_reminders') || '[]');
    const newRem = {
      id: `rem-${Date.now()}`,
      title: reminder.title,
      titleMl: reminder.title,
      time: reminder.time || '09:00',
      category: reminder.category || 'medicine',
      createdAt: new Date().toISOString()
    };
    const updated = [newRem, ...existing];
    localStorage.setItem('sahaayi_reminders', JSON.stringify(updated));

    // Dispatch custom event for real-time reactive sync across components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sahaayi_reminders_updated', { detail: newRem }));
    }
    return newRem;
  } catch (e) {
    console.error('Failed to save reminder:', e);
    return null;
  }
}



/**
 * Normalizes any time representation (e.g. "1.27 pm", "1:27 PM", "13:27") to 24-hr "HH:MM".
 */
export function normalizeTimeTo24h(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return '09:00';
  const clean = timeStr.trim().toLowerCase();
  const match = clean.match(/(\d{1,2})([:.](\d{2}))?\s*(am|pm)?/i);
  if (!match) return '09:00';
  let hours = parseInt(match[1], 10);
  const minutes = match[3] ? parseInt(match[3], 10) : 0;
  const isPm = clean.includes('pm') || clean.includes('വൈകിട്ട്') || clean.includes('വൈകുന്നേരം') || clean.includes('രാത്രി') || clean.includes('ഉച്ചയ്ക്ക്');
  const isAm = clean.includes('am') || clean.includes('രാവിലെ');

  if (isPm && hours < 12) {
    hours += 12;
  } else if (isAm && hours === 12) {
    hours = 0;
  }
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

/**
 * Plays a pleasant hospital/smart-assistant style notification chime using Web Audio API.
 */
export function playChimeSound() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const playTone = (freq, startTime, duration) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0.35, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    const now = ctx.currentTime;
    playTone(587.33, now, 0.35);        // D5
    playTone(739.99, now + 0.2, 0.35);  // F#5
    playTone(880.00, now + 0.4, 0.7);   // A5
  } catch (e) {
    console.error('Audio chime error:', e);
  }
}
