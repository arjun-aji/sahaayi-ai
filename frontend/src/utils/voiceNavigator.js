// Sahaayi AI - Global Voice Navigation & Accessibility Commander
import { parseReminderFromVoice, saveReminder } from './reminderParser';

/**
 * Parses user speech for navigation, accessibility, reminder, or general commands.
 * Returns { type: 'navigate' | 'accessibility' | 'reminder' | 'query', action: ..., feedback: ... }
 */
export function handleGlobalVoiceCommand(text, lang, actions) {
  if (!text || typeof text !== 'string') return null;
  const raw = text.trim();
  const lower = raw.toLowerCase();

  const isMl = lang === 'ml' || anyMalayalam(raw);

  // 1. Navigation Commands
  // Home
  if (
    lower.includes('home') || 
    lower.includes('go home') || 
    lower.includes('main page') ||
    raw.includes('ഹോം') || 
    raw.includes('തുടക്കം') || 
    raw.includes('ആദ്യ പേജ്') ||
    raw.includes('തിരികെ')
  ) {
    if (actions.setActiveTab) actions.setActiveTab('home');
    return {
      type: 'navigate',
      target: 'home',
      voiceReply: isMl ? 'ശരി, ഹോം പേജിലേക്ക് എത്തിയിരിക്കുന്നു.' : 'Navigating back to the Home page.'
    };
  }

  // Medicine Reader & Live Camera
  if (
    lower.includes('medicine') || 
    lower.includes('read medicine') || 
    lower.includes('medicine reader') || 
    lower.includes('scan medicine') ||
    lower.includes('open medicine') ||
    lower.includes('know about this medicine') ||
    lower.includes('know about medicine') ||
    lower.includes('tell me about this medicine') ||
    lower.includes('what is this medicine') ||
    lower.includes('tablet') ||
    lower.includes('pill') ||
    raw.includes('മരുന്ന്') || 
    raw.includes('മരുന്ന് വായിക്കുക') || 
    raw.includes('മരുന്ന് സ്കാൻ') ||
    raw.includes('മരുന്ന് അറിയണം') ||
    raw.includes('ഈ മരുന്ന്') ||
    raw.includes('ഗുളിക അറിയണം') ||
    raw.includes('മരുന്ന് പേജ്')
  ) {
    if (actions.setActiveTab) actions.setActiveTab('medicine');
    return {
      type: 'navigate',
      target: 'medicine',
      voiceReply: isMl 
        ? 'തീർച്ചയായും! ക്യാമറ തുറക്കുന്നു. മരുന്നിന്റെ ഫോട്ടോ എടുത്താൽ ഞാൻ വായിച്ചു പറഞ്ഞുതരാം.' 
        : 'Sure! Opening camera now. Capture a photo of the medicine and I will explain it.'
    };
  }

  // Document Reader & Live Camera
  if (
    lower.includes('document') || 
    lower.includes('read document') || 
    lower.includes('document reader') || 
    lower.includes('scan document') ||
    lower.includes('letters') ||
    lower.includes('prescription') ||
    lower.includes('know about this document') ||
    lower.includes('know about document') ||
    lower.includes('tell me about this document') ||
    lower.includes('what is this document') ||
    raw.includes('രേഖ') || 
    raw.includes('രേഖകൾ') || 
    raw.includes('കത്ത്') ||
    raw.includes('കുറിപ്പടി') ||
    raw.includes('രേഖകൾ വായിക്കുക') || 
    raw.includes('കത്ത് വായിക്കുക') ||
    raw.includes('രേഖ അറിയണം') ||
    raw.includes('ഈ രേഖ') ||
    raw.includes('രേഖകൾ പേജ്')
  ) {
    if (actions.setActiveTab) actions.setActiveTab('document');
    return {
      type: 'navigate',
      target: 'document',
      voiceReply: isMl 
        ? 'ശരി! ക്യാമറ തുറക്കുന്നു. രേഖയുടെയോ കുറിപ്പടിയുടെയോ ഫോട്ടോ എടുക്കൂ, ഞാൻ വായിച്ചു തരാം.' 
        : 'Sure! Opening camera now. Capture a photo of the document and I will read and explain it.'
    };
  }

  // Reminders Page
  if (
    (lower.includes('reminder') && (lower.includes('page') || lower.includes('open') || lower.includes('show') || lower.includes('view') || lower.includes('list'))) ||
    (raw.includes('ഓർമ്മപ്പെടുത്തൽ') && (raw.includes('പേജ്') || raw.includes('തുറക്കുക') || raw.includes('ലിസ്റ്റ്') || raw.includes('കാണിക്കുക')))
  ) {
    if (actions.setActiveTab) actions.setActiveTab('reminders');
    return {
      type: 'navigate',
      target: 'reminders',
      voiceReply: isMl ? 'നിങ്ങളുടെ ഓർമ്മപ്പെടുത്തലുകളുടെ ലിസ്റ്റ് തുറന്നു.' : 'Opened your Daily Reminders list.'
    };
  }

  // Chat Page
  if (
    lower.includes('open chat') || 
    lower.includes('ask sahaayi') || 
    lower.includes('conversation') ||
    raw.includes('സഹായിയോട് ചോദിക്കാം') || 
    raw.includes('സംഭാഷണം പേജ്')
  ) {
    if (actions.setActiveTab) actions.setActiveTab('chat');
    return {
      type: 'navigate',
      target: 'chat',
      voiceReply: isMl ? 'സഹായി സംഭാഷണം തുറന്നു.' : 'Opened AI Conversation.'
    };
  }

  // 2. Accessibility Controls
  // Switch to Malayalam
  if (lower.includes('malayalam') || lower.includes('speak malayalam') || raw.includes('മലയാളം സംസാരിക്കുക') || raw.includes('മലയാളം ആക്കുക')) {
    if (actions.setLang) actions.setLang('ml');
    return {
      type: 'accessibility',
      action: 'lang_ml',
      voiceReply: 'തീർച്ചയായും, ഭാഷ മലയാളത്തിലേക്ക് മാറ്റിയിരിക്കുന്നു. എനിക്ക് എങ്ങനെ സഹായിക്കണം?'
    };
  }

  // Switch to English
  if (lower.includes('english') || lower.includes('speak english') || raw.includes('ഇംഗ്ലീഷ് ആക്കുക')) {
    if (actions.setLang) actions.setLang('en');
    return {
      type: 'accessibility',
      action: 'lang_en',
      voiceReply: 'Language switched to English. How can I assist you today?'
    };
  }

  // Text Size Large
  if (lower.includes('large text') || lower.includes('bigger text') || lower.includes('large font') || raw.includes('വലിയ അക്ഷരങ്ങൾ') || raw.includes('അക്ഷരം വലുതാക്കുക')) {
    if (actions.setFontSizeMode) actions.setFontSizeMode(1);
    return {
      type: 'accessibility',
      action: 'font_large',
      voiceReply: isMl ? 'വായിക്കാൻ എളുപ്പത്തിനായി അക്ഷരങ്ങളുടെ വലുപ്പം കൂട്ടിയിട്ടുണ്ട്.' : 'Text size has been enlarged for easier reading.'
    };
  }

  // Text Size Extra Large
  if (lower.includes('extra large') || lower.includes('huge text') || raw.includes('ഏറ്റവും വലിയ അക്ഷരങ്ങൾ')) {
    if (actions.setFontSizeMode) actions.setFontSizeMode(2);
    return {
      type: 'accessibility',
      action: 'font_xl',
      voiceReply: isMl ? 'അക്ഷരങ്ങൾ ഏറ്റവും വലിയ വലുപ്പത്തിലേക്ക് മാറ്റി.' : 'Text size increased to extra large.'
    };
  }

  // Normal text size
  if (lower.includes('normal text') || lower.includes('default font') || raw.includes('സാധാരണ അക്ഷരങ്ങൾ')) {
    if (actions.setFontSizeMode) actions.setFontSizeMode(0);
    return {
      type: 'accessibility',
      action: 'font_normal',
      voiceReply: isMl ? 'അക്ഷരങ്ങൾ സാധാരണ നിലയിലേക്ക് മാറ്റി.' : 'Text size set to default normal.'
    };
  }

  // High Contrast
  if (lower.includes('high contrast') || raw.includes('കൂടിയ തെളിച്ചം') || raw.includes('ഹൈ കോൺട്രാസ്റ്റ്')) {
    if (actions.toggleContrast) actions.toggleContrast();
    return {
      type: 'accessibility',
      action: 'contrast',
      voiceReply: isMl ? 'കൂടിയ തെളിച്ചമുള്ള ഹൈ-കോൺട്രാസ്റ്റ് മോഡ് മാറ്റി.' : 'High contrast mode adjusted.'
    };
  }

  // 3. Reminder Creation Command
  const reminderParsed = parseReminderFromVoice(raw, lang);
  if (reminderParsed) {
    const saved = saveReminder(reminderParsed);
    if (saved) {
      return {
        type: 'reminder',
        reminder: saved,
        voiceReply: isMl 
          ? `ശരി, ഞാൻ ${saved.time} ന് "${saved.title}" ഓർമ്മപ്പെടുത്തലുകളിൽ ചേർത്തിട്ടുണ്ട്.` 
          : `Understood! I have scheduled "${saved.title}" at ${saved.time} in your reminders.`
      };
    }
  }

  // General query (pass through to Gemini AI)
  return null;
}

function anyMalayalam(str) {
  return /[\u0D00-\u0D7F]/.test(str);
}

