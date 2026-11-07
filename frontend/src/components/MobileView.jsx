import { useState, useRef, useEffect, useCallback } from 'react';
import { SahaayiLogo } from './SahaayiLogo';
import heroCoupleImg from '../assets/hero-couple.jpg';
import { 
  IconPill, 
  IconDocument, 
  IconChat, 
  IconCalendarClock, 
  IconMic, 
  IconStop, 
  IconCheck,
  IconArrowRight,
  IconSparkle,
  IconHome,
  IconContrast,
  IconSettings
} from './Icons';
import { 
  isSpeechRecognitionSupported, 
  createSpeechRecognizer, 
  speakText, 
  stopSpeech 
} from '../utils/speech';
import { sendChatMessage } from '../utils/api';
import { parseReminderFromVoice, saveReminder } from '../utils/reminderParser';
import { handleGlobalVoiceCommand } from '../utils/voiceNavigator';

export function MobileView({
  lang,
  onToggleLang,
  fontSizeMode,
  onCycleFontSize,
  highContrast,
  onToggleContrast,
  onOpenSettings,
  activeTab,
  onSelectTab,
  _onVoiceInputReceived,
  slowerSpeech = false,
  messages = [],
  setMessages,
  t
}) {
  const [dialogueState, setDialogueState] = useState('idle'); // 'idle' | 'listening' | 'thinking' | 'speaking' | 'waiting_reply'
  const [userUtterance, setUserUtterance] = useState('');
  const [assistantReply, setAssistantReply] = useState('');
  const [lastAddedReminder, setLastAddedReminder] = useState(null);
  const [speechError, setSpeechError] = useState(null);
  const [continuousMode] = useState(true);

  const recognizerRef = useRef(null);
  const continuousModeRef = useRef(continuousMode);
  const startListeningRef = useRef(null);

  useEffect(() => {
    continuousModeRef.current = continuousMode;
  }, [continuousMode]);

  useEffect(() => {
    startListeningRef.current = startListening;
  });

  const supported = isSpeechRecognitionSupported();

  useEffect(() => {
    return () => {
      stopSpeech();
      if (recognizerRef.current) {
        try {
          recognizerRef.current.abort();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const handleAssistantSpoke = useCallback(() => {
    if (continuousModeRef.current) {
      setDialogueState('waiting_reply');
      setTimeout(() => {
        if (startListeningRef.current) {
          startListeningRef.current(true);
        }
      }, 700);
    } else {
      setDialogueState('idle');
    }
  }, []);

  function startListening(isFollowUp = false) {
    if (!supported) {
      setSpeechError(t.speechNotSupported);
      return;
    }

    stopSpeech();
    if (recognizerRef.current) {
      try {
        recognizerRef.current.abort();
      } catch {
        // ignore
      }
    }

    setSpeechError(null);
    setDialogueState(isFollowUp ? 'waiting_reply' : 'listening');

    try {
      const recognizer = createSpeechRecognizer(
        lang,
        async (recognizedText) => {
          if (!recognizedText || !recognizedText.trim()) {
            setDialogueState('idle');
            return;
          }

          const cleanText = recognizedText.trim();
          setUserUtterance(cleanText);
          setDialogueState('thinking');

          const userMsg = {
            id: Date.now().toString(),
            sender: 'user',
            text: cleanText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          if (setMessages) {
            setMessages((prev) => [...prev, userMsg]);
          }

          // Check if exit phrase
          const lower = cleanText.toLowerCase();
          const isExit = lower.includes('നന്ദി') || lower.includes('stop') || lower.includes('thank you') || lower.includes('മതി');
          if (isExit) {
            const exitText = lang === 'ml' ? 'സന്തോഷം! എപ്പോഴും ഞാൻ കൂടെയുണ്ട്.' : 'You are welcome! Always here for you.';
            setAssistantReply(exitText);
            setDialogueState('speaking');
            speakText(exitText, lang, slowerSpeech, null, () => setDialogueState('idle'));
            return;
          }

          // Check Global Voice Commands (e.g. open camera for medicine / documents)
          const navCommand = handleGlobalVoiceCommand(cleanText, lang, {
            setActiveTab: onSelectTab,
            setLang: onToggleLang,
            setFontSizeMode: onCycleFontSize,
            toggleContrast: onToggleContrast
          });

          if (navCommand) {
            setAssistantReply(navCommand.voiceReply);
            setDialogueState('speaking');

            const asstMsg = {
              id: (Date.now() + 1).toString(),
              sender: 'assistant',
              text: navCommand.voiceReply,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              isAiGenerated: true
            };
            if (setMessages) {
              setMessages((prev) => [...prev, asstMsg]);
            }

            speakText(navCommand.voiceReply, lang, slowerSpeech, null, () => {
              setDialogueState('idle');
            });
            return;
          }

          // Reminder check
          const parsedRem = parseReminderFromVoice(cleanText, lang);
          let localRem = null;
          if (parsedRem) {
            localRem = saveReminder(parsedRem);
            if (localRem) setLastAddedReminder(localRem);
          }

          // Call backend Gemini AI
          try {
            const response = await sendChatMessage(cleanText, lang, messages);
            let replyText = '';

            if (response.success) {
              replyText = response.reply;
              if (response.reminderAction && !localRem) {
                const bRem = saveReminder(response.reminderAction);
                if (bRem) setLastAddedReminder(bRem);
              }
            } else {
              replyText = lang === 'ml'
                ? `നിങ്ങൾ പറഞ്ഞത് ഞാൻ കേട്ടു: "${cleanText}". എനിക്ക് എങ്ങനെ സഹായിക്കാനാകും?`
                : `I heard: "${cleanText}". How can I help you?`;
            }

            setAssistantReply(replyText);
            setDialogueState('speaking');

            const asstMsg = {
              id: (Date.now() + 1).toString(),
              sender: 'assistant',
              text: replyText,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              isAiGenerated: response.success
            };
            if (setMessages) {
              setMessages((prev) => [...prev, asstMsg]);
            }

            speakText(replyText, lang, slowerSpeech, null, handleAssistantSpoke);
          } catch {
            const fallbackText = lang === 'ml'
              ? 'ക്ഷമിക്കണം, ബന്ധിപ്പിക്കുന്നതിൽ തടസ്സമുണ്ടായി. വീണ്ടും പറയൂ.'
              : 'Sorry, connection issue. Please try speaking again.';
            setAssistantReply(fallbackText);
            setDialogueState('speaking');
            speakText(fallbackText, lang, slowerSpeech, null, () => setDialogueState('idle'));
          }
        },
        (error) => {
          if (error === 'not-allowed') {
            setSpeechError(t.micPermissionDenied);
          }
          setDialogueState('idle');
        },
        () => {}
      );

      if (recognizer) {
        recognizerRef.current = recognizer;
        recognizer.start();
      }
    } catch (e) {
      setDialogueState('idle');
      setSpeechError(e.message || 'Error starting speech recognition');
    }
  }

  const stopConversation = () => {
    stopSpeech();
    if (recognizerRef.current) {
      try {
        recognizerRef.current.abort();
      } catch {
        // ignore
      }
    }
    setDialogueState('idle');
  };

  const handleToggleListening = () => {
    if (dialogueState !== 'idle') {
      stopConversation();
    } else {
      startListening(false);
    }
  };

  const handleScrollToFeatures = () => {
    const el = document.getElementById('mobile-features-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectSuggestedQuestion = (question) => {
    onSelectTab('chat');
    setTimeout(() => {
      const chatInput = document.querySelector('.chat-input-textarea');
      if (chatInput) {
        chatInput.value = question;
        chatInput.focus();
      }
    }, 150);
  };

  const isActive = dialogueState !== 'idle';
  const isSpeaking = dialogueState === 'speaking';
  const isListening = dialogueState === 'listening' || dialogueState === 'waiting_reply';

  return (
    <div className="mobile-shell">
      {/* 1. Top Mobile Brand & Settings Header matching Reference */}
      <header className="mobile-header" role="banner">
        <div className="mobile-brand-box">
          <SahaayiLogo isLight={false} isSmall={true} />
        </div>

        <div className="mobile-header-actions">
          {/* Language selector pill */}
          <button
            type="button"
            className="mobile-lang-pill"
            onClick={onToggleLang}
            aria-label="Change language"
          >
            <span>{lang === 'ml' ? 'മലയാളം' : 'English'}</span>
            <span className="dropdown-caret" aria-hidden="true">⌵</span>
          </button>

          {/* Text size button */}
          <button
            type="button"
            className={`mobile-circle-btn ${fontSizeMode > 0 ? 'active' : ''}`}
            onClick={onCycleFontSize}
            aria-label="Toggle text size"
            title="Text Size"
          >
            <span className="aa-text">AA</span>
          </button>

          {/* Contrast button */}
          <button
            type="button"
            className={`mobile-circle-btn ${highContrast ? 'active' : ''}`}
            onClick={onToggleContrast}
            aria-label="Toggle high contrast"
            title="Contrast"
          >
            <IconContrast className="w-4 h-4" width={18} height={18} />
          </button>

          {/* Settings button */}
          <button
            type="button"
            className="mobile-circle-btn"
            onClick={onOpenSettings}
            aria-label="Settings"
            title="Settings"
          >
            <IconSettings className="w-4 h-4" width={18} height={18} />
          </button>
        </div>
      </header>

      {/* 2. Main Scrollable Content matching Reference Image 2 */}
      <div className="mobile-scroll-body">
        {/* Mobile Hero Section */}
        <section className="mobile-hero-section">
          {/* Greeting Tag */}
          <div className="mobile-greeting-badge">
            <span className="mobile-greeting-text">
              {lang === 'ml' ? 'നമസ്കാരം' : 'Namaskaram'}
            </span>
            <span className="waving-emoji" aria-hidden="true">👋</span>
          </div>

          {/* Main Title */}
          <h1 className="mobile-hero-title">I'm here for you.</h1>

          {/* Lime Accent Divider */}
          <div className="mobile-lime-bar" aria-hidden="true" />

          {/* Subtitle */}
          <h2 className="mobile-hero-subhead">
            Your everyday companion,<br />in your language.
          </h2>

          {/* Description */}
          <p className="mobile-hero-desc">
            Talk to Sahaayi in Malayalam or English. Get help reading medicine labels, understanding documents, and managing everyday tasks.
          </p>

          {/* High Resolution Couple Image Frame with Overlay */}
          <div className="mobile-hero-image-wrap">
            <img 
              src={heroCoupleImg} 
              alt="Elderly couple happily using Sahaayi AI" 
              className="mobile-hero-img"
            />

            {/* Glowing soundwaves from phone */}
            <div className={`mobile-phone-soundwaves ${isListening || isSpeaking ? 'active-waves' : ''}`} aria-hidden="true">
              <span className="m-arc arc-1" />
              <span className="m-arc arc-2" />
              <span className="m-arc arc-3" />
            </div>

            {/* Speech Bubble Overlay */}
            <div className="mobile-speech-bubble" role="status" aria-live="polite">
              <div className="mobile-bubble-header">
                <div className="mobile-bubble-icon">
                  <span className={`bar b1 ${isSpeaking ? 'active' : ''}`} />
                  <span className={`bar b2 ${isSpeaking ? 'active' : ''}`} />
                  <span className={`bar b3 ${isSpeaking ? 'active' : ''}`} />
                </div>
                <span className="mobile-bubble-title">Sahaayi AI</span>
              </div>
              <p className="mobile-bubble-text">
                {assistantReply || (lang === 'ml' ? 'നമസ്കാരം! എങ്ങനെ സഹായിക്കാം?' : 'Hello! How can I help you today?')}
              </p>
            </div>
          </div>

          {/* Action Buttons: Big Green Voice Button + Secondary Explore Features */}
          <div className="mobile-hero-actions">
            <button
              type="button"
              className={`mobile-hero-btn-primary ${isActive ? 'btn-is-listening' : ''}`}
              onClick={handleToggleListening}
              aria-label={isActive ? 'Stop talking' : 'Start talking'}
            >
              {isActive ? (
                <IconStop className="w-5 h-5" width={20} height={20} />
              ) : (
                <IconMic className="w-5 h-5" width={20} height={20} />
              )}
              <span>
                {dialogueState === 'listening'
                  ? (lang === 'ml' ? 'കേൾക്കുന്നു...' : 'Listening...')
                  : dialogueState === 'speaking'
                  ? (lang === 'ml' ? 'സംസാരിക്കുന്നു...' : 'Speaking...')
                  : dialogueState === 'waiting_reply'
                  ? (lang === 'ml' ? 'മറുപടി പറയാം...' : 'Listening...')
                  : (lang === 'ml' ? 'സംസാരിക്കാൻ തുടങ്ങാം' : 'Start talking')}
              </span>
            </button>

            <button
              type="button"
              className="mobile-hero-btn-secondary"
              onClick={handleScrollToFeatures}
              aria-label="Explore features"
            >
              <svg className="w-4 h-4 play-triangle" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              <span>Explore features</span>
            </button>
          </div>

          {/* Live Transcript / Reminder feedback if active */}
          {userUtterance && isActive && (
            <div className="mobile-live-transcript-box">
              <span className="transcript-speaker">{lang === 'ml' ? 'നിങ്ങൾ:' : 'You:'}</span>
              <p className="transcript-quote">"{userUtterance}"</p>
            </div>
          )}

          {lastAddedReminder && (
            <div className="mobile-live-reminder-tag">
              <IconCheck className="w-4 h-4 text-emerald-700" width={16} height={16} />
              <span>✓ {lastAddedReminder.title} ({lastAddedReminder.time})</span>
            </div>
          )}

          {speechError && (
            <div className="mobile-speech-error-box" role="alert">
              <p>{speechError}</p>
            </div>
          )}

          {/* Carousel Indicator Dots */}
          <div className="mobile-carousel-dots" aria-hidden="true">
            <span className="dot dot-active" />
            <span className="dot" />
            <span className="dot" />
          </div>
        </section>

        {/* 3. Four Feature Cards (2x2 Grid) matching Reference Image 2 */}
        <section id="mobile-features-section" className="mobile-features-grid" aria-label="Features">
          {/* Card 1: Read Medicine (Mint Green) */}
          <div 
            className="mobile-feature-card card-mint"
            onClick={() => onSelectTab('medicine')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onSelectTab('medicine')}
          >
            <div className="m-card-icon-pill icon-mint">
              <IconPill className="w-5 h-5" width={22} height={22} />
            </div>
            <div className="m-card-body">
              <h3 className="m-card-title">{lang === 'ml' ? 'മരുന്ന് വായിക്കുക' : 'Read Medicine'}</h3>
              <p className="m-card-desc">{lang === 'ml' ? 'മരുന്ന് കവറുകൾ സ്കാൻ ചെയ്ത് മനസ്സിലാക്കുക' : 'Scan & explain medicine packaging'}</p>
            </div>
            <div className="m-card-footer">
              <div className="m-arrow-circle" aria-hidden="true">
                <IconArrowRight className="w-3.5 h-3.5" width={14} height={14} />
              </div>
            </div>
          </div>

          {/* Card 2: Read Documents (Peach/Apricot) */}
          <div 
            className="mobile-feature-card card-peach"
            onClick={() => onSelectTab('document')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onSelectTab('document')}
          >
            <div className="m-card-icon-pill icon-peach">
              <IconDocument className="w-5 h-5" width={22} height={22} />
            </div>
            <div className="m-card-body">
              <h3 className="m-card-title">{lang === 'ml' ? 'രേഖകൾ വായിക്കുക' : 'Read Documents'}</h3>
              <p className="m-card-desc">{lang === 'ml' ? 'കത്തുകൾ, ബില്ലുകൾ എന്നിവ വായിച്ചു കേൾക്കുക' : 'Read hospital letters & utility bills'}</p>
            </div>
            <div className="m-card-footer">
              <div className="m-arrow-circle" aria-hidden="true">
                <IconArrowRight className="w-3.5 h-3.5" width={14} height={14} />
              </div>
            </div>
          </div>

          {/* Card 3: Ask Sahaayi (Sky Blue) */}
          <div 
            className="mobile-feature-card card-blue"
            onClick={() => onSelectTab('chat')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onSelectTab('chat')}
          >
            <div className="m-card-icon-pill icon-blue">
              <IconChat className="w-5 h-5" width={22} height={22} />
            </div>
            <div className="m-card-body">
              <h3 className="m-card-title">{lang === 'ml' ? 'സഹായിയോട് ചോദിക്കാം' : 'Ask Sahaayi'}</h3>
              <p className="m-card-desc">{lang === 'ml' ? 'എന്തും സംശയം ചോദിക്കൂ, മറുപടി കേൾക്കൂ' : 'Ask everyday questions by voice'}</p>
            </div>
            <div className="m-card-footer">
              <div className="m-arrow-circle" aria-hidden="true">
                <IconArrowRight className="w-3.5 h-3.5" width={14} height={14} />
              </div>
            </div>
          </div>

          {/* Card 4: My Reminders (Lavender) */}
          <div 
            className="mobile-feature-card card-lavender"
            onClick={() => onSelectTab('reminders')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onSelectTab('reminders')}
          >
            <div className="m-card-icon-pill icon-lavender">
              <IconCalendarClock className="w-5 h-5" width={22} height={22} />
            </div>
            <div className="m-card-body">
              <h3 className="m-card-title">{lang === 'ml' ? 'എന്റെ ഓർമ്മപ്പെടുത്തലുകൾ' : 'My Reminders'}</h3>
              <p className="m-card-desc">{lang === 'ml' ? 'നിങ്ങളുടെ ദിനം ഓർമ്മപ്പെടുത്തലുകൾ ക്രമീകരിക്കുക' : 'Medicine & daily health alarms'}</p>
            </div>
            <div className="m-card-footer">
              <div className="m-arrow-circle" aria-hidden="true">
                <IconArrowRight className="w-3.5 h-3.5" width={14} height={14} />
              </div>
            </div>
          </div>
        </section>

        {/* 4. Suggested Questions Bar matching Reference Image 2 */}
        <section className="mobile-suggested-bar" aria-label="Suggested Questions">
          <div className="suggested-badge-label">
            <IconSparkle className="w-4 h-4 text-amber-600" width={16} height={16} />
            <span>{lang === 'ml' ? 'ചോദിച്ചു നോക്കൂ' : 'Try asking'}</span>
          </div>
          <div className="suggested-divider" aria-hidden="true">|</div>
          <div className="suggested-chips-scroll">
            <button
              type="button"
              className="m-chip"
              onClick={() => handleSelectSuggestedQuestion(lang === 'ml' ? 'ഈ മരുന്ന് എന്തിന്?' : 'What is this medicine used for?')}
            >
              💬 {lang === 'ml' ? 'ഈ മരുന്ന് എന്തിന്?' : 'What is this medicine?'}
            </button>
            <button
              type="button"
              className="m-chip"
              onClick={() => handleSelectSuggestedQuestion(lang === 'ml' ? 'ഈ രേഖ എന്താണ്?' : 'What is written in this document?')}
            >
              📄 {lang === 'ml' ? 'ഈ രേഖ എന്താണ്?' : 'What is this doc?'}
            </button>
            <button
              type="button"
              className="m-chip"
              onClick={() => handleSelectSuggestedQuestion(lang === 'ml' ? 'വൈകുന്നേരം 4 മണിക്ക് വെള്ളം കുടിക്കാൻ ഓർമ്മിപ്പിക്കുക' : 'Remind me to drink water at 4 PM')}
            >
              📅 {lang === 'ml' ? 'ഒരു ഓർമ്മപ്പെടുത്തൽ ചേർക്കാം' : 'Add reminder'}
            </button>
            <button
              type="button"
              className="m-chip"
              onClick={() => handleSelectSuggestedQuestion(lang === 'ml' ? 'നിങ്ങൾക്ക് എന്തെല്ലാം ചെയ്യാനാകും?' : 'What can Sahaayi do?')}
            >
              ❓ {lang === 'ml' ? 'എന്തെല്ലാം ചെയ്യാം?' : 'What can you do?'}
            </button>
          </div>
        </section>
      </div>

      {/* 5. Fixed Mobile Bottom Navigation matching Reference Image 2 */}
      <nav className="mobile-bottom-nav" aria-label="Mobile Navigation">
        <button
          type="button"
          className={`bottom-nav-item ${activeTab === 'home' ? 'nav-active' : ''}`}
          onClick={() => onSelectTab('home')}
        >
          <IconHome width={22} height={22} />
          <span className="nav-label">{lang === 'ml' ? 'ഹോം' : 'Home'}</span>
        </button>

        <button
          type="button"
          className={`bottom-nav-item ${activeTab === 'chat' ? 'nav-active' : ''}`}
          onClick={() => onSelectTab('chat')}
        >
          <IconChat width={22} height={22} />
          <span className="nav-label">{lang === 'ml' ? 'ചോദിക്കുക' : 'Ask'}</span>
        </button>

        <button
          type="button"
          className={`bottom-nav-item ${activeTab === 'reminders' ? 'nav-active' : ''}`}
          onClick={() => onSelectTab('reminders')}
        >
          <IconCalendarClock width={22} height={22} />
          <span className="nav-label">{lang === 'ml' ? 'ഓർമ്മപ്പെടുത്തലുകൾ' : 'Reminders'}</span>
        </button>
      </nav>
    </div>
  );
}
