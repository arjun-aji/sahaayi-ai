// WhatsApp Integration Utility for Sahaayi AI
// Allows seniors to notify their son/daughter/caregiver directly via WhatsApp

export const DEFAULT_CAREGIVER_PHONE = '+91 7356568307';

/**
 * Get saved caregiver phone number or return default
 */
export function getCaregiverPhone() {
  try {
    const saved = localStorage.getItem('sahaayi_caregiver_phone');
    if (saved && saved.trim()) {
      return saved.trim();
    }
  } catch {
    // ignore
  }
  return DEFAULT_CAREGIVER_PHONE;
}

/**
 * Save caregiver phone number
 */
export function setCaregiverPhone(phone) {
  try {
    if (phone) {
      localStorage.setItem('sahaayi_caregiver_phone', phone.trim());
    }
  } catch {
    // ignore
  }
}

/**
 * Clean phone number to WhatsApp international standard (e.g. 917356568307)
 */
export function cleanPhoneNumber(phone) {
  const digits = (phone || DEFAULT_CAREGIVER_PHONE).replace(/\D/g, '');
  // If 10 digits without country code, assume India +91
  if (digits.length === 10) {
    return `91${digits}`;
  }
  return digits;
}

/**
 * Build WhatsApp click-to-chat URL with pre-filled message
 */
export function getWhatsAppReminderUrl(reminder, lang = 'ml') {
  const phone = cleanPhoneNumber(getCaregiverPhone());
  const displayTitle = lang === 'ml' && reminder.titleMl ? reminder.titleMl : (reminder.title || '');
  const time = reminder.time || 'ഇപ്പോൾ';

  let message = '';
  if (lang === 'ml') {
    message = 
`🔔 *സഹായി AI (Sahaayi) - ഓർമ്മപ്പെടുത്തൽ*
---------------------------------------
⏰ *സമയം:* ${time}
💊 *കാര്യം:* ${displayTitle}

അച്ഛൻ / അമ്മയുടെ ഓർമ്മപ്പെടുത്തൽ സമയമായിട്ടുണ്ട്.
(Sahaayi AI Senior Alert for Family)`;
  } else {
    message = 
`🔔 *Sahaayi AI - Senior Reminder Alert*
---------------------------------------
⏰ *Time:* ${time}
💊 *Task / Medicine:* ${displayTitle}

Notice sent to family member via Sahaayi AI Senior Companion.`;
  }

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

/**
 * Direct 1-tap WhatsApp trigger
 */
export function sendWhatsAppReminder(reminder, lang = 'ml') {
  const url = getWhatsAppReminderUrl(reminder, lang);
  window.open(url, '_blank', 'noopener,noreferrer');
}
