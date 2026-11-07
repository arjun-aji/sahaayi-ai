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

please verify that your parent set the correct remainder

Notice sent to family member via Sahaayi AI Senior Companion.`;
  }

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

/**
 * Direct 1-tap WhatsApp trigger for reminders
 */
export function sendWhatsAppReminder(reminder, lang = 'ml') {
  const url = getWhatsAppReminderUrl(reminder, lang);
  window.open(url, '_blank', 'noopener,noreferrer');
}

/**
 * Build WhatsApp click-to-chat URL for requesting daughter/family to buy medicine
 */
export function getWhatsAppMedicineOrderUrl({
  medicineText = '',
  count = 1,
  unit = 'സ്ട്രിപ്പ് (Strip)',
  note = 'തീരാറായി, ഉടൻ വാങ്ങിത്തരണം',
  lang = 'ml',
  phone
}) {
  const targetPhone = cleanPhoneNumber(phone || getCaregiverPhone());

  // Clean and trim the text summary for WhatsApp readability
  let cleanSummary = medicineText.trim();
  if (cleanSummary.length > 350) {
    cleanSummary = cleanSummary.slice(0, 350) + '...';
  }

  let message = '';
  if (lang === 'ml') {
    message =
      `🛒 *സഹായി AI (Sahaayi) - മരുന്ന് വാങ്ങിത്തരാനുള്ള അപേക്ഷ*
--------------------------------------------------
💊 *മരുന്ന് വിവരങ്ങൾ:*
${cleanSummary}

🔢 *ആവശ്യമായ എണ്ണം (Quantity):* ${count} ${unit}
📝 *കുറിപ്പ്:* ${note}

അച്ഛൻ / അമ്മ Sahaayi AI വഴി സ്കാൻ ചെയ്ത് വാങ്ങിത്തരാൻ ആവശ്യപ്പെട്ടതാണ്.
(Sahaayi AI Senior Healthcare Companion)`;
  } else {
    message =
      `🛒 *Sahaayi AI - Medicine Purchase Request*
--------------------------------------------------
💊 *Medicine Details:*
${cleanSummary}

🔢 *Quantity / Count:* ${count} ${unit}
📝 *Note:* ${note}

Request sent by senior via Sahaayi AI Companion. Please purchase this medicine for them.`;
  }

  return `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Direct 1-tap WhatsApp trigger for requesting daughter to buy medicine
 */
export function sendWhatsAppMedicineOrder(params) {
  const url = getWhatsAppMedicineOrderUrl(params);
  window.open(url, '_blank', 'noopener,noreferrer');
}


