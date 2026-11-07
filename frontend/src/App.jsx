import { useState, useEffect, useRef } from 'react';
import { translations } from './translations';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { DesktopHero } from './components/DesktopHero';
import { DesktopFeatureCards } from './components/DesktopFeatureCards';
import { SuggestedQuestionsBar } from './components/SuggestedQuestionsBar';
import { MobileView } from './components/MobileView';
import { ChatSection } from './components/ChatSection';
import { MedicineReader } from './components/MedicineReader';
import { DocumentReader } from './components/DocumentReader';
import { RemindersSection } from './components/RemindersSection';
import { AccessibilityModal } from './components/AccessibilityModal';
import { FloatingVoiceAssistant } from './components/FloatingVoiceAssistant';
import { SafetyBanner } from './components/SafetyBanner';
import { IconClock, IconSpeaker, IconCheck, IconHome, IconChat, IconCalendarClock } from './components/Icons';
import { sendChatMessage } from './utils/api';
import { speakText, stopSpeech } from './utils/speech';
import { parseReminderFromVoice, saveReminder, normalizeTimeTo24h, playChimeSound } from './utils/reminderParser';
import './App.css';

function App() {
  // Language state
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('sahaayi_lang') || 'en';
  });

  // Active view: 'home' | 'chat' | 'medicine' | 'document' | 'reminders'
  const [activeTab, setActiveTab] = useState('home');

  // Font size mode: 0 = Normal, 1 = Large, 2 = Extra Large
  const [fontSizeMode, setFontSizeMode] = useState(() => {
    const saved = localStorage.getItem('sahaayi_font_mode');
    return saved ? parseInt(saved, 10) : 0;
  });

  // High contrast mode
  const [highContrast, setHighContrast] = useState(() => {
    return localStorage.getItem('sahaayi_high_contrast') === 'true';
  });

  // Accessibility settings
  const [accessibilityModalOpen, setAccessibilityModalOpen] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(() => {
    const saved = localStorage.getItem('sahaayi_auto_speak');
    return saved !== null ? saved === 'true' : true; // Enabled by default for elderly voice companion
  });
  const [slowerSpeech, setSlowerSpeech] = useState(() => {
    return localStorage.getItem('sahaayi_slower_speech') === 'true';
  });

  const t = translations[lang] || translations.en;

  // Persistence
  useEffect(() => {
    localStorage.setItem('sahaayi_lang', lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('sahaayi_font_mode', fontSizeMode.toString());
  }, [fontSizeMode]);

  useEffect(() => {
    localStorage.setItem('sahaayi_high_contrast', highContrast.toString());
  }, [highContrast]);

  useEffect(() => {
    localStorage.setItem('sahaayi_auto_speak', autoSpeak.toString());
  }, [autoSpeak]);

  useEffect(() => {
    localStorage.setItem('sahaayi_slower_speech', slowerSpeech.toString());
  }, [slowerSpeech]);

  // Active Reminder Alarm Alert for Seniors
  const [activeAlarm, setActiveAlarm] = useState(null);
  const triggeredRemindersRef = useRef(new Set());

  useEffect(() => {
    const checkReminders = () => {
      try {
        const saved = localStorage.getItem('sahaayi_reminders');
        if (!saved) return;
        const reminders = JSON.parse(saved);

        const now = new Date();
        const currentHours = String(now.getHours()).padStart(2, '0');
        const currentMinutes = String(now.getMinutes()).padStart(2, '0');
        const currentTimeStr = `${currentHours}:${currentMinutes}`;
        const todayDateStr = now.toISOString().slice(0, 10);

        for (const rem of reminders) {
          const normTime = normalizeTimeTo24h(rem.time);
          if (normTime === currentTimeStr) {
            const triggerKey = `${rem.id}-${todayDateStr}-${currentTimeStr}`;
            if (!triggeredRemindersRef.current.has(triggerKey)) {
              triggeredRemindersRef.current.add(triggerKey);
              setActiveAlarm(rem);

              // 1. Play crystal-clear chime sound
              playChimeSound();

              // 2. Play voice alert announcement after 400ms
              const titleToSpeak = lang === 'ml' && rem.titleMl ? rem.titleMl : rem.title;
              const alarmVoiceMsg = lang === 'ml'
                ? `ശ്രദ്ധിക്കുക! ഇപ്പോൾ സമയം ${rem.time} ആയി. ${titleToSpeak} സമയമാണ്.`
                : `Attention! It is now ${rem.time}. Time for: ${rem.title}.`;

              setTimeout(() => {
                speakText(alarmVoiceMsg, lang, slowerSpeech);
              }, 450);

              // 3. Desktop notification
              if (typeof window !== 'undefined' && 'Notification' in window) {
                if (Notification.permission === 'granted') {
                  new Notification(`Sahaayi AI: ${titleToSpeak}`, {
                    body: alarmVoiceMsg,
                    icon: '/favicon.ico'
                  });
                } else if (Notification.permission === 'default') {
                  Notification.requestPermission();
                }
              }
              break;
            }
          }
        }
      } catch (err) {
        console.error('Error checking reminders:', err);
      }
    };

    checkReminders();
    const interval = setInterval(checkReminders, 3000);
    return () => clearInterval(interval);
  }, [lang, slowerSpeech]);

  // Initial welcome message in chat
  const getWelcomeText = (language) => {
    return language === 'ml'
      ? 'നമസ്കാരം! ഞാൻ നിങ്ങളുടെ സഹായി AI. മരുന്നുകൾ വായിക്കാനും, രേഖകൾ പരിശോധിക്കാനും, സംശയങ്ങൾ ചോദിക്കാനും ഞാൻ കൂടെയുണ്ട്. ഇന്ന് ഞാൻ നിങ്ങളെ എങ്ങനെ സഹായിക്കണം?'
      : 'Hello! I am Sahaayi AI, your voice companion. You can ask me questions, upload medicine boxes, or set daily reminders. How can I help you today?';
  };

  const [messages, setMessages] = useState(() => [
    {
      id: 'welcome-msg',
      sender: 'assistant',
      text: getWelcomeText(lang),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMock: false
    }
  ]);

  const handleToggleLang = () => {
    const nextLang = lang === 'ml' ? 'en' : 'ml';
    setLang(nextLang);
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id === 'welcome-msg') {
        return [
          {
            ...prev[0],
            text: getWelcomeText(nextLang)
          }
        ];
      }
      return prev;
    });
  };

  const handleCycleFontSize = () => {
    setFontSizeMode((prev) => (prev + 1) % 3);
  };

  const handleToggleContrast = () => {
    setHighContrast((prev) => !prev);
  };

  const handleResetSettings = () => {
    setFontSizeMode(0);
    setHighContrast(false);
    setAutoSpeak(false);
    setSlowerSpeech(false);
  };

  const handleSelectTab = (tabId) => {
    if (tabId === 'settings') {
      setAccessibilityModalOpen(true);
    } else {
      setActiveTab(tabId);
    }
  };

  // When speech input is received from Hero or external voice triggers
  const handleVoiceInputReceived = async (recognizedText) => {
    if (!recognizedText) return;

    // Check if voice input contains a reminder
    const parsedRem = parseReminderFromVoice(recognizedText, lang);
    let localRem = null;
    if (parsedRem) {
      localRem = saveReminder(parsedRem);
    }

    const userMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: recognizedText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);

    const response = await sendChatMessage(recognizedText, lang, messages);
    let replyText = response.success
      ? response.reply
      : (lang === 'ml'
          ? `നിങ്ങൾ പറഞ്ഞത് ലഭിച്ചു: "${recognizedText}". സഹായി AI ഉത്തരം തയ്യാറാക്കുന്നു...`
          : `Received your voice: "${recognizedText}". Sahaayi AI is preparing a response...`);

    if (response.reminderAction && !localRem) {
      localRem = saveReminder(response.reminderAction);
    }

    if (localRem && !replyText.includes(localRem.time)) {
      const confirmClause = lang === 'ml'
        ? ` ഞാൻ ${localRem.time} ന് "${localRem.title}" ഓർമ്മപ്പെടുത്തലുകളിൽ ചേർത്തു.`
        : ` I have added "${localRem.title}" at ${localRem.time} to your reminders.`;
      replyText = `${replyText} ${confirmClause}`.trim();
    }

    const assistantMessage = {
      id: (Date.now() + 1).toString(),
      sender: 'assistant',
      text: replyText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isAiGenerated: response.isAiGenerated || false,
      isMock: !response.isAiGenerated
    };
    setMessages((prev) => [...prev, assistantMessage]);

    if (autoSpeak) {
      speakText(replyText, lang, slowerSpeech);
    }
  };

  // When a suggested prompt is clicked
  const handleSelectPrompt = async (promptText) => {
    setActiveTab('chat');

    const userMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: promptText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);

    const response = await sendChatMessage(promptText, lang, messages);
    const replyText = response.success
      ? response.reply
      : (lang === 'ml'
          ? `നിങ്ങൾ തിരഞ്ഞെടുത്ത ചോദ്യം: "${promptText}". സഹായി AI ബാക്കെൻഡ് റെഡിയാണ്.`
          : `Selected prompt: "${promptText}". Sahaayi AI backend is processing.`);

    const assistantMessage = {
      id: (Date.now() + 1).toString(),
      sender: 'assistant',
      text: replyText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isAiGenerated: response.isAiGenerated || false,
      isMock: !response.isAiGenerated
    };
    setMessages((prev) => [...prev, assistantMessage]);

    if (autoSpeak) {
      speakText(replyText, lang, slowerSpeech);
    }
  };

  const fontClass =
    fontSizeMode === 1
      ? 'large-text-mode'
      : fontSizeMode === 2
      ? 'extra-large-text-mode'
      : '';

  const contrastClass = highContrast ? 'high-contrast-mode' : '';

  return (
    <div className={`sahaayi-app-container ${fontClass} ${contrastClass}`}>
      {/* Screen reader skip link */}
      <a href="#main-desktop-content" className="sr-skip-link">
        Skip to main content
      </a>

      {/* Desktop Layout (Hidden on Mobile) */}
      <div className="desktop-layout-root">
        {/* Left Dark Forest-Green Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
          lang={lang}
          t={t}
        />

        {/* Right Main Content Panel */}
        <div className="desktop-right-area">
          <TopHeader
            lang={lang}
            onToggleLang={handleToggleLang}
            fontSizeMode={fontSizeMode}
            onCycleFontSize={handleCycleFontSize}
            highContrast={highContrast}
            onToggleContrast={handleToggleContrast}
            onOpenSettings={() => setAccessibilityModalOpen(true)}
          />

          <main id="main-desktop-content" className="desktop-main-viewport">
            {activeTab === 'home' && (
              <div className="desktop-home-scrollable">
                <DesktopHero
                  lang={lang}
                  setLang={setLang}
                  t={t}
                  slowerSpeech={slowerSpeech}
                  onSelectTab={handleSelectTab}
                  setFontSizeMode={setFontSizeMode}
                  toggleContrast={handleToggleContrast}
                  messages={messages}
                  setMessages={setMessages}
                  onVoiceInputReceived={handleVoiceInputReceived}
                />

                <DesktopFeatureCards
                  onSelectTab={handleSelectTab}
                  lang={lang}
                  t={t}
                />

                <SuggestedQuestionsBar
                  lang={lang}
                  onSelectPrompt={handleSelectPrompt}
                />
              </div>
            )}

            {activeTab === 'chat' && (
              <div className="desktop-feature-view">
                <div className="view-breadcrumb">
                  <button
                    type="button"
                    className="back-to-home-link"
                    onClick={() => setActiveTab('home')}
                  >
                    ← {lang === 'ml' ? 'ഹോമിലേക്ക് മടങ്ങുക' : 'Back to Home'}
                  </button>
                </div>
                <SafetyBanner t={t} />
                <div style={{ marginTop: '16px' }}>
                  <ChatSection
                    t={t}
                    lang={lang}
                    messages={messages}
                    setMessages={setMessages}
                    autoSpeak={autoSpeak}
                    slowerSpeech={slowerSpeech}
                  />
                </div>
              </div>
            )}

            {activeTab === 'medicine' && (
              <div className="desktop-feature-view">
                <div className="view-breadcrumb">
                  <button
                    type="button"
                    className="back-to-home-link"
                    onClick={() => setActiveTab('home')}
                  >
                    ← {lang === 'ml' ? 'ഹോമിലേക്ക് മടങ്ങുക' : 'Back to Home'}
                  </button>
                </div>
                <MedicineReader
                  t={t}
                  lang={lang}
                  slowerSpeech={slowerSpeech}
                />
              </div>
            )}

            {activeTab === 'document' && (
              <div className="desktop-feature-view">
                <div className="view-breadcrumb">
                  <button
                    type="button"
                    className="back-to-home-link"
                    onClick={() => setActiveTab('home')}
                  >
                    ← {lang === 'ml' ? 'ഹോമിലേക്ക് മടങ്ങുക' : 'Back to Home'}
                  </button>
                </div>
                <DocumentReader
                  t={t}
                  lang={lang}
                  slowerSpeech={slowerSpeech}
                />
              </div>
            )}

            {activeTab === 'reminders' && (
              <div className="desktop-feature-view">
                <div className="view-breadcrumb">
                  <button
                    type="button"
                    className="back-to-home-link"
                    onClick={() => setActiveTab('home')}
                  >
                    ← {lang === 'ml' ? 'ഹോമിലേക്ക് മടങ്ങുക' : 'Back to Home'}
                  </button>
                </div>
                <RemindersSection
                  t={t}
                  lang={lang}
                  slowerSpeech={slowerSpeech}
                />
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Layout (Hidden on Desktop) */}
      <div className="mobile-layout-root">
        {activeTab === 'home' ? (
          <MobileView
            lang={lang}
            onToggleLang={handleToggleLang}
            fontSizeMode={fontSizeMode}
            onCycleFontSize={handleCycleFontSize}
            highContrast={highContrast}
            onToggleContrast={handleToggleContrast}
            onOpenSettings={() => setAccessibilityModalOpen(true)}
            activeTab={activeTab}
            onSelectTab={handleSelectTab}
            onVoiceInputReceived={handleVoiceInputReceived}
            slowerSpeech={slowerSpeech}
            messages={messages}
            setMessages={setMessages}
            t={t}
          />
        ) : (
          <div className="mobile-subview-wrapper">
            <header className="mobile-subview-topbar">
              <button
                type="button"
                className="mobile-back-btn"
                onClick={() => setActiveTab('home')}
              >
                ← {lang === 'ml' ? 'ഹോം' : 'Home'}
              </button>
              <span className="mobile-subview-title">
                {activeTab === 'chat' && (lang === 'ml' ? 'സഹായി' : 'Ask Sahaayi')}
                {activeTab === 'medicine' && (lang === 'ml' ? 'മരുന്ന്' : 'Read Medicine')}
                {activeTab === 'document' && (lang === 'ml' ? 'രേഖകൾ' : 'Read Documents')}
                {activeTab === 'reminders' && (lang === 'ml' ? 'ഓർമ്മപ്പെടുത്തലുകൾ' : 'My Reminders')}
              </span>
              <button
                type="button"
                className="mobile-circle-btn"
                onClick={handleCycleFontSize}
                aria-label="Font size"
              >
                AA
              </button>
            </header>

            <div className="mobile-subview-content">
              {activeTab === 'chat' && (
                <ChatSection
                  t={t}
                  lang={lang}
                  messages={messages}
                  setMessages={setMessages}
                  autoSpeak={autoSpeak}
                  slowerSpeech={slowerSpeech}
                />
              )}

              {activeTab === 'medicine' && (
                <MedicineReader
                  t={t}
                  lang={lang}
                  slowerSpeech={slowerSpeech}
                />
              )}

              {activeTab === 'document' && (
                <DocumentReader
                  t={t}
                  lang={lang}
                  slowerSpeech={slowerSpeech}
                />
              )}

              {activeTab === 'reminders' && (
                <RemindersSection
                  t={t}
                  lang={lang}
                  slowerSpeech={slowerSpeech}
                />
              )}
            </div>

            {/* Mobile Bottom Navigation */}
            <nav className="mobile-bottom-nav" aria-label="Bottom Navigation">
              <button
                type="button"
                className={`bottom-nav-item ${activeTab === 'home' ? 'nav-active' : ''}`}
                onClick={() => setActiveTab('home')}
              >
                <IconHome className="w-5 h-5" width={20} height={20} />
                <span className="nav-label">{lang === 'ml' ? 'ഹോം' : 'Home'}</span>
              </button>
              <button
                type="button"
                className={`bottom-nav-item ${activeTab === 'chat' ? 'nav-active' : ''}`}
                onClick={() => setActiveTab('chat')}
              >
                <IconChat className="w-5 h-5" width={20} height={20} />
                <span className="nav-label">{lang === 'ml' ? 'ചോദിക്കുക' : 'Ask'}</span>
              </button>
              <button
                type="button"
                className={`bottom-nav-item ${activeTab === 'reminders' ? 'nav-active' : ''}`}
                onClick={() => setActiveTab('reminders')}
              >
                <IconCalendarClock className="w-5 h-5" width={20} height={20} />
                <span className="nav-label">{lang === 'ml' ? 'ഓർമ്മപ്പെടുത്തലുകൾ' : 'Reminders'}</span>
              </button>
            </nav>
          </div>
        )}
      </div>

      {/* Active Reminder Alarm Popup Modal for Senior Citizens */}
      {activeAlarm && (
        <div className="active-reminder-alert-overlay" role="alertdialog" aria-modal="true">
          <div className="active-reminder-alert-card">
            <div className="alert-alarm-icon-ring">
              <IconClock className="alarm-icon-lg animate-bounce" />
            </div>
            <h3 className="alert-alarm-heading">
              {lang === 'ml' ? '🔔 സമയമായി! ഓർമ്മപ്പെടുത്തൽ' : '🔔 Reminder Alert!'}
            </h3>
            <p className="alert-alarm-time">{activeAlarm.time}</p>
            <p className="alert-alarm-title">
              {lang === 'ml' && activeAlarm.titleMl ? activeAlarm.titleMl : activeAlarm.title}
            </p>
            <div className="alert-alarm-actions">
              <button
                type="button"
                className="alert-repeat-btn"
                onClick={() => {
                  const titleToSpeak = lang === 'ml' && activeAlarm.titleMl ? activeAlarm.titleMl : activeAlarm.title;
                  const msg = lang === 'ml'
                    ? `ഇപ്പോൾ സമയം ${activeAlarm.time}. ${titleToSpeak}`
                    : `Reminder at ${activeAlarm.time}: ${activeAlarm.title}`;
                  speakText(msg, lang, slowerSpeech);
                }}
              >
                <IconSpeaker className="w-5 h-5" />
                <span>{lang === 'ml' ? 'വീണ്ടും കേൾക്കുക' : 'Read Again'}</span>
              </button>
              <button
                type="button"
                className="alert-dismiss-btn"
                onClick={() => {
                  stopSpeech();
                  setActiveAlarm(null);
                }}
              >
                <IconCheck className="w-5 h-5" />
                <span>{lang === 'ml' ? 'കഴിഞ്ഞു / ശരി' : 'Done / Dismiss'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Persistent Global Floating Voice Navigator (Works on all pages) */}
      <FloatingVoiceAssistant
        lang={lang}
        setLang={setLang}
        activeTab={activeTab}
        setActiveTab={handleSelectTab}
        fontSizeMode={fontSizeMode}
        setFontSizeMode={setFontSizeMode}
        highContrast={highContrast}
        toggleContrast={() => setHighContrast(!highContrast)}
        slowerSpeech={slowerSpeech}
        messages={messages}
        setMessages={setMessages}
        t={t}
      />

      {/* Accessibility & Settings Modal */}
      <AccessibilityModal
        isOpen={accessibilityModalOpen}
        onClose={() => setAccessibilityModalOpen(false)}
        t={t}
        largeText={fontSizeMode > 0}
        setLargeText={(val) => setFontSizeMode(val ? 1 : 0)}
        highContrast={highContrast}
        setHighContrast={setHighContrast}
        autoSpeak={autoSpeak}
        setAutoSpeak={setAutoSpeak}
        slowerSpeech={slowerSpeech}
        setSlowerSpeech={setSlowerSpeech}
        onReset={handleResetSettings}
      />
    </div>
  );
}

export default App;
