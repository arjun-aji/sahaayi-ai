import { useState, useEffect, useRef } from 'react';
import { IconClock, IconPill, IconSpeaker, IconStop, IconTrash, IconCheck, IconMic, IconWhatsApp } from './Icons';
import { speakText, stopSpeech, isSpeechRecognitionSupported, createSpeechRecognizer } from '../utils/speech';
import { parseReminderFromVoice, saveReminder } from '../utils/reminderParser';
import { sendWhatsAppReminder, getCaregiverPhone } from '../utils/whatsapp';

const DEFAULT_REMINDERS = [
  {
    id: 'rem-1',
    title: 'Morning blood pressure tablet after breakfast',
    titleMl: 'പ്രഭാതഭക്ഷണത്തിന് ശേഷം പ്രഷർ ഗുളിക',
    time: '08:30',
    category: 'medicine'
  },
  {
    id: 'rem-2',
    title: 'Drink 1 glass of warm water',
    titleMl: 'ഒരു ഗ്ലാസ് ചൂടുവെള്ളം കുടിക്കുക',
    time: '11:00',
    category: 'daily'
  },
  {
    id: 'rem-3',
    title: 'Evening eye drops',
    titleMl: 'വൈകുന്നേരത്തെ കണ്ണ് മരുന്ന്',
    time: '18:00',
    category: 'medicine'
  }
];

export function RemindersSection({ t, lang, slowerSpeech }) {
  const [reminders, setReminders] = useState(() => {
    try {
      const saved = localStorage.getItem('sahaayi_reminders');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return DEFAULT_REMINDERS;
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('09:00');
  const [newCategory, setNewCategory] = useState('medicine');
  const [speakingReminderId, setSpeakingReminderId] = useState(null);

  // Voice Reminder Dictation state
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [voiceFeedback, setVoiceFeedback] = useState(null);
  const recognizerRef = useRef(null);

  const speechSupported = isSpeechRecognitionSupported();

  // Listen for storage / custom events when voice reminders are added elsewhere
  useEffect(() => {
    const handleUpdate = () => {
      try {
        const saved = localStorage.getItem('sahaayi_reminders');
        if (saved) {
          setReminders(JSON.parse(saved));
        }
      } catch {
        // ignore
      }
    };

    window.addEventListener('sahaayi_reminders_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('sahaayi_reminders_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
      if (recognizerRef.current) {
        try {
          recognizerRef.current.abort();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  // Sync with localStorage
  useEffect(() => {
    try {
      localStorage.setItem('sahaayi_reminders', JSON.stringify(reminders));
    } catch {
      // ignore
    }
  }, [reminders]);

  const handleAddReminder = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newRem = {
      id: `rem-${Date.now()}`,
      title: newTitle.trim(),
      titleMl: newTitle.trim(),
      time: newTime || '09:00',
      category: newCategory
    };

    setReminders((prev) => [newRem, ...prev]);
    setNewTitle('');
    setShowAddForm(false);
  };

  const handleDeleteReminder = (id) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
    if (speakingReminderId === id) {
      stopSpeech();
      setSpeakingReminderId(null);
    }
  };

  const handleSpeakReminder = (item) => {
    if (speakingReminderId === item.id) {
      stopSpeech();
      setSpeakingReminderId(null);
      return;
    }

    const text = lang === 'ml'
      ? `ഓർമ്മപ്പെടുത്തൽ സമയം ${item.time}. കാര്യം: ${item.titleMl || item.title}`
      : `Reminder at ${item.time}: ${item.title}`;

    setSpeakingReminderId(item.id);
    speakText(
      text,
      lang,
      slowerSpeech,
      () => setSpeakingReminderId(item.id),
      () => setSpeakingReminderId(null),
      () => setSpeakingReminderId(null)
    );
  };

  // Voice Command for Reminders
  const handleToggleVoiceReminder = () => {
    if (isVoiceRecording) {
      if (recognizerRef.current) {
        recognizerRef.current.stop();
      }
      setIsVoiceRecording(false);
      return;
    }

    setVoiceTranscript('');
    setVoiceFeedback(null);

    const recognizer = createSpeechRecognizer(
      lang,
      (recognized) => {
        setIsVoiceRecording(false);
        setVoiceTranscript(recognized);

        // Parse reminder from speech
        const parsed = parseReminderFromVoice(recognized, lang);
        if (parsed) {
          const saved = saveReminder(parsed);
          if (saved) {
            setReminders((prev) => [saved, ...prev]);
            const successMsg = lang === 'ml'
              ? `ഓർമ്മപ്പെടുത്തൽ വിജയകരമായി ചേർത്തു: ${saved.title}, സമയം ${saved.time}`
              : `Reminder added successfully: ${saved.title} at ${saved.time}`;
            setVoiceFeedback({ type: 'success', message: successMsg });

            // Automatically speak confirmation aloud!
            speakText(successMsg, lang, slowerSpeech);
          }
        } else {
          // If no specific time was recognized, still create it with default time or prompt
          const fallback = {
            title: recognized,
            time: '09:00',
            category: 'medicine'
          };
          const saved = saveReminder(fallback);
          if (saved) {
            setReminders((prev) => [saved, ...prev]);
            const msg = lang === 'ml'
              ? `ഓർമ്മപ്പെടുത്തൽ ചേർത്തു: ${recognized}`
              : `Reminder added: ${recognized}`;
            setVoiceFeedback({ type: 'success', message: msg });
            speakText(msg, lang, slowerSpeech);
          }
        }
      },
      (err) => {
        setIsVoiceRecording(false);
        if (err !== 'no-speech') {
          setVoiceFeedback({ type: 'error', message: `Microphone notice: ${err}` });
        }
      },
      () => setIsVoiceRecording(false)
    );

    if (recognizer) {
      recognizerRef.current = recognizer;
      recognizer.start();
      setIsVoiceRecording(true);
    }
  };

  const getCategoryLabel = (cat) => {
    if (cat === 'medicine') return t.catMedicine;
    if (cat === 'doctor') return t.catDoctor;
    return t.catDaily;
  };

  return (
    <section className="feature-panel reminders-panel" aria-labelledby="reminders-title">
      <div className="panel-header">
        <div className="panel-title-group">
          <div className="panel-icon-wrap" aria-hidden="true">
            <IconClock className="panel-header-icon" />
          </div>
          <div>
            <h2 id="reminders-title" className="panel-heading">{t.remindersHeading}</h2>
            <p className="panel-subheading">{t.remindersSubtitle}</p>
          </div>
        </div>

        <div className="reminders-header-actions">
          {/* Prominent Voice Reminder Button */}
          {speechSupported && (
            <button
              type="button"
              className={`voice-add-reminder-btn ${isVoiceRecording ? 'is-recording' : ''}`}
              onClick={handleToggleVoiceReminder}
              aria-label={isVoiceRecording ? t.stopListening : (t.addVoiceReminderBtn || 'Add by Voice')}
            >
              {isVoiceRecording ? (
                <IconStop className="btn-mic-icon" />
              ) : (
                <IconMic className="btn-mic-icon" />
              )}
              <span>
                {isVoiceRecording ? (t.listening || 'Listening...') : (t.addVoiceReminderBtn || 'Add by Voice')}
              </span>
            </button>
          )}

          <button
            type="button"
            className="add-reminder-btn"
            onClick={() => setShowAddForm(!showAddForm)}
            aria-expanded={showAddForm}
          >
            {showAddForm ? t.cancelBtn : `+ ${t.addReminderBtn}`}
          </button>
        </div>
      </div>

      {/* Voice Dictation Active Banner / Feedback Card */}
      {(isVoiceRecording || voiceTranscript || voiceFeedback) && (
        <div className={`voice-reminder-card ${isVoiceRecording ? 'pulsing-card' : ''}`} role="region" aria-live="polite">
          <div className="voice-reminder-card-content">
            <div className="voice-card-mic-col">
              <div className={`voice-card-mic-circle ${isVoiceRecording ? 'anim-pulse' : ''}`}>
                <IconMic className="w-6 h-6" />
              </div>
            </div>
            <div className="voice-card-text-col">
              <h4 className="voice-card-heading">
                {isVoiceRecording
                  ? (lang === 'ml' ? 'ശ്രദ്ധിച്ചു കേൾക്കുന്നു... പറയൂ' : 'Listening... Speak now')
                  : (t.voiceReminderModalTitle || 'Voice Reminder')}
              </h4>
              <p className="voice-card-hint">
                {t.voiceReminderHint || 'Speak e.g.: "Remind me to take blood pressure pill at 4 PM"'}
              </p>
              {voiceTranscript && (
                <p className="voice-card-heard">
                  <strong>{lang === 'ml' ? 'കേട്ടത്:' : 'Heard:'}</strong> "{voiceTranscript}"
                </p>
              )}
              {voiceFeedback && (
                <div className={`voice-card-status status-${voiceFeedback.type}`}>
                  <span>{voiceFeedback.message}</span>
                </div>
              )}
            </div>
            {isVoiceRecording && (
              <button
                type="button"
                className="voice-card-stop-btn"
                onClick={handleToggleVoiceReminder}
              >
                {t.stopListening}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Disclaimers about notifications vs browser storage */}
      <div className="offline-notice-box reminders-storage-notice" role="note">
        <span className="notice-icon">💾</span>
        <p className="notice-text">{t.reminderDisclaimer}</p>
      </div>

      {/* Add Reminder Form */}
      {showAddForm && (
        <form className="add-reminder-card" onSubmit={handleAddReminder}>
          <h3 className="form-title">{t.addReminderBtn}</h3>

          <div className="form-group">
            <label htmlFor="reminder-title-input" className="form-label">
              {t.reminderTitleLabel}
            </label>
            <div className="input-with-mic-wrap">
              <input
                id="reminder-title-input"
                type="text"
                required
                className="form-input"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder={t.reminderTitlePlaceholder}
              />
              {speechSupported && (
                <button
                  type="button"
                  className="input-dictate-btn"
                  onClick={handleToggleVoiceReminder}
                  title="Dictate with voice"
                  aria-label="Dictate with voice"
                >
                  <IconMic className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          <div className="form-row-two-col">
            <div className="form-group">
              <label htmlFor="reminder-time-input" className="form-label">
                {t.reminderTimeLabel}
              </label>
              <input
                id="reminder-time-input"
                type="time"
                required
                className="form-input time-input"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="reminder-category-select" className="form-label">
                {t.reminderCategoryLabel}
              </label>
              <select
                id="reminder-category-select"
                className="form-input select-input"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              >
                <option value="medicine">{t.catMedicine}</option>
                <option value="doctor">{t.catDoctor}</option>
                <option value="daily">{t.catDaily}</option>
              </select>
            </div>
          </div>

          <div className="form-button-row">
            <button type="submit" className="save-btn">
              <IconCheck className="w-5 h-5" />
              <span>{t.saveReminderBtn}</span>
            </button>
            <button
              type="button"
              className="cancel-form-btn"
              onClick={() => setShowAddForm(false)}
            >
              {t.cancelBtn}
            </button>
          </div>
        </form>
      )}

      {/* Reminders list */}
      <div className="reminders-list" role="list">
        {reminders.length === 0 ? (
          <div className="reminders-empty-card">
            <p>{t.noReminders}</p>
          </div>
        ) : (
          reminders.map((item) => {
            const isSpeakingThis = speakingReminderId === item.id;
            const displayTitle = lang === 'ml' && item.titleMl ? item.titleMl : item.title;

            return (
              <div key={item.id} className="reminder-item-card" role="listitem">
                <div className="reminder-time-badge">
                  <IconClock className="w-5 h-5" />
                  <span className="time-text">{item.time}</span>
                </div>

                <div className="reminder-info-col">
                  <div className="reminder-cat-pill">
                    {item.category === 'medicine' ? (
                      <IconPill className="w-4 h-4" />
                    ) : (
                      <IconClock className="w-4 h-4" />
                    )}
                    <span>{getCategoryLabel(item.category)}</span>
                  </div>
                  <h4 className="reminder-title-text">{displayTitle}</h4>
                </div>

                <div className="reminder-actions-col">
                  <button
                    type="button"
                    className="item-whatsapp-btn"
                    onClick={() => sendWhatsAppReminder(item, lang)}
                    aria-label={`${lang === 'ml' ? 'മക്കൾക്ക് WhatsApp അയക്കുക' : 'Send WhatsApp to family'}: ${displayTitle}`}
                    title={lang === 'ml' ? `മക്കൾക്ക് WhatsApp അയക്കുക (${getCaregiverPhone()})` : `Send WhatsApp to son/daughter (${getCaregiverPhone()})`}
                  >
                    <IconWhatsApp className="w-5 h-5" />
                    <span className="btn-label-text">
                      {lang === 'ml' ? 'അറിയിക്കുക' : 'WhatsApp'}
                    </span>
                  </button>

                  <button
                    type="button"
                    className={`item-speak-btn ${isSpeakingThis ? 'speaking-active' : ''}`}
                    onClick={() => handleSpeakReminder(item)}
                    aria-label={`${t.listenReminder}: ${displayTitle}`}
                    title={t.listenReminder}
                  >
                    {isSpeakingThis ? (
                      <IconStop className="w-5 h-5" />
                    ) : (
                      <IconSpeaker className="w-5 h-5" />
                    )}
                    <span className="btn-label-text">
                      {isSpeakingThis ? t.stopSpeakingBtn : t.listenReminder}
                    </span>
                  </button>

                  <button
                    type="button"
                    className="item-delete-btn"
                    onClick={() => handleDeleteReminder(item.id)}
                    aria-label={`${t.deleteReminder}: ${displayTitle}`}
                    title={t.deleteReminder}
                  >
                    <IconTrash className="w-5 h-5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
