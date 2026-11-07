import { useState, useRef, useEffect, useCallback } from 'react';
import { IconMic, IconStop, IconCheck } from './Icons';
import heroCoupleImg from '../assets/hero-couple.jpg';
import { 
  isSpeechRecognitionSupported, 
  createSpeechRecognizer, 
  speakText, 
  stopSpeech 
} from '../utils/speech';
import { sendChatMessage } from '../utils/api';
import { parseReminderFromVoice, saveReminder } from '../utils/reminderParser';
import { handleGlobalVoiceCommand } from '../utils/voiceNavigator';

export function DesktopHero({ 
  lang, 
  setLang,
  t, 
  slowerSpeech = false, 
  onSelectTab, 
  setFontSizeMode,
  toggleContrast,
  messages = [], 
  setMessages 
}) {
  const [dialogueState, setDialogueState] = useState('idle'); // 'idle' | 'listening' | 'thinking' | 'speaking' | 'waiting_reply'
  const [currentUserUtterance, setCurrentUserUtterance] = useState('');
  const [currentAssistantReply, setCurrentAssistantReply] = useState('');
  const [lastAddedReminder, setLastAddedReminder] = useState(null);
  const [speechError, setSpeechError] = useState(null);
  const [continuousMode] = useState(true);

  const recognizerRef = useRef(null);
  const continuousModeRef = useRef(continuousMode);
  const startListeningRef = useRef(null);

  useEffect(() => {
    continuousModeRef.current = continuousMode;
  }, [continuousMode]);

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
          setCurrentUserUtterance(cleanText);
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

          // 1. Check if user said "Thank you" or exit phrase
          const lower = cleanText.toLowerCase();
          const isExitPhrase = 
            lower.includes('നന്ദി') || 
            lower.includes('ശരി നന്ദി') || 
            lower.includes('stop') || 
            lower.includes('thank you') || 
            lower.includes('bye') ||
            lower.includes('മതി');

          if (isExitPhrase) {
            const exitReply = lang === 'ml'
              ? 'സന്തോഷം! എപ്പോൾ വേണമെങ്കിലും ഞാൻ കൂടെയുണ്ട്.'
              : 'You are welcome! I am always here whenever you need me.';
            setCurrentAssistantReply(exitReply);
            setDialogueState('speaking');

            const asstMsg = {
              id: (Date.now() + 1).toString(),
              sender: 'assistant',
              text: exitReply,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              isAiGenerated: true
            };
            if (setMessages) {
              setMessages((prev) => [...prev, asstMsg]);
            }

            speakText(exitReply, lang, slowerSpeech, null, () => {
              setDialogueState('idle');
            });
            return;
          }

          // 2. Check for Global Voice Navigation & Accessibility commands
          const navCommand = handleGlobalVoiceCommand(cleanText, lang, {
            setActiveTab: onSelectTab,
            setLang,
            setFontSizeMode,
            toggleContrast
          });

          if (navCommand) {
            setCurrentAssistantReply(navCommand.voiceReply);
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

            speakText(
              navCommand.voiceReply,
              lang,
              slowerSpeech,
              () => setDialogueState('speaking'),
              handleAssistantSpoke,
              () => handleAssistantSpoke()
            );
            return;
          }

          // 3. Check for reminder command in voice input
          const parsedReminder = parseReminderFromVoice(cleanText, lang);
          let localReminderSaved = null;
          if (parsedReminder) {
            localReminderSaved = saveReminder(parsedReminder);
            if (localReminderSaved) {
              setLastAddedReminder(localReminderSaved);
            }
          }

          // 4. Call backend Gemini AI
          try {
            const response = await sendChatMessage(cleanText, lang, messages);
            let replyText = '';

            if (response.success) {
              replyText = response.reply;
              if (response.reminderAction && !localReminderSaved) {
                const backendRem = saveReminder(response.reminderAction);
                if (backendRem) setLastAddedReminder(backendRem);
              }
            } else {
              if (localReminderSaved) {
                replyText = lang === 'ml'
                  ? `ശരി, ഞാൻ ${localReminderSaved.time} ന് "${localReminderSaved.title}" ഓർമ്മപ്പെടുത്തലുകളിൽ ചേർത്തു.`
                  : `Sure, I have scheduled "${localReminderSaved.title}" at ${localReminderSaved.time} in your reminders.`;
              } else {
                replyText = lang === 'ml'
                  ? `നിങ്ങൾ പറഞ്ഞത് ഞാൻ ശ്രദ്ധിച്ചു: "${cleanText}". ഞാൻ സഹായിക്കാൻ തയ്യാറാണ്.`
                  : `I heard: "${cleanText}". I am here to help you.`;
              }
            }

            if (localReminderSaved && !replyText.includes(localReminderSaved.time)) {
              const confirmClause = lang === 'ml'
                ? ` ഞാൻ ${localReminderSaved.time} ന് "${localReminderSaved.title}" ഓർമ്മപ്പെടുത്തലുകളിൽ ചേർത്തിട്ടുണ്ട്.`
                : ` I have also added "${localReminderSaved.title}" at ${localReminderSaved.time} to your reminders.`;
              replyText = `${replyText} ${confirmClause}`.trim();
            }

            setCurrentAssistantReply(replyText);
            setDialogueState('speaking');

            const assistantMsg = {
              id: (Date.now() + 1).toString(),
              sender: 'assistant',
              text: replyText,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              isAiGenerated: response.isAiGenerated || false
            };
            if (setMessages) {
              setMessages((prev) => [...prev, assistantMsg]);
            }

            speakText(
              replyText,
              lang,
              slowerSpeech,
              () => setDialogueState('speaking'),
              handleAssistantSpoke,
              () => handleAssistantSpoke()
            );

          } catch {
            const fallbackReply = lang === 'ml'
              ? `നിങ്ങൾ പറഞ്ഞത് ലഭിച്ചു. എന്തെങ്കിലും സംശയമുണ്ടെങ്കിൽ വീണ്ടും ചോദിക്കാം.`
              : `I received your voice message. Feel free to ask anything.`;
            setCurrentAssistantReply(fallbackReply);
            setDialogueState('speaking');
            speakText(fallbackReply, lang, slowerSpeech, null, handleAssistantSpoke);
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

  useEffect(() => {
    startListeningRef.current = startListening;
  });

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
    const el = document.querySelector('.desktop-feature-cards-row');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const isActive = dialogueState !== 'idle';
  const isSpeaking = dialogueState === 'speaking';
  const isListening = dialogueState === 'listening' || dialogueState === 'waiting_reply';

  return (
    <section className="desktop-hero-card-v2" aria-labelledby="hero-main-heading">
      <div className="hero-content-split">
        {/* Left Column: Greeting, Main Title, Subtitle, Description & Action Buttons */}
        <div className="hero-typography-col">
          <div className="hero-greeting-badge">
            <span className="greeting-text-green">
              {lang === 'ml' ? 'നമസ്കാരം' : 'Namaskaram'}
            </span>
            <span className="waving-hand-emoji" aria-hidden="true">👋</span>
          </div>

          <h1 id="hero-main-heading" className="hero-headline-large">
            {lang === 'ml' ? "I'm here for you." : "I'm here for you."}
          </h1>

          <div className="hero-lime-accent-line" aria-hidden="true" />

          <h2 className="hero-subhead-bold">
            {lang === 'ml' 
              ? 'Your everyday companion,\nin your language.' 
              : 'Your everyday companion,\nin your language.'}
          </h2>

          <p className="hero-paragraph-text">
            {lang === 'ml'
              ? 'Talk to Sahaayi in Malayalam or English. Get help reading medicine labels, understanding documents, and managing everyday tasks.'
              : 'Talk to Sahaayi in Malayalam or English. Get help reading medicine labels, understanding documents, and managing everyday tasks.'}
          </p>

          {/* Action Buttons matching Reference Image 1 */}
          <div className="hero-action-buttons-row">
            <button
              type="button"
              className={`hero-btn-primary ${isActive ? 'btn-is-listening' : ''}`}
              onClick={handleToggleListening}
              aria-label={isActive ? 'Stop talking' : 'Start talking'}
            >
              {isActive ? (
                <IconStop className="w-5 h-5" />
              ) : (
                <IconMic className="w-5 h-5" />
              )}
              <span>
                {dialogueState === 'listening' 
                  ? (lang === 'ml' ? 'കേൾക്കുന്നു...' : 'Listening...')
                  : dialogueState === 'speaking'
                  ? (lang === 'ml' ? 'സംസാരിക്കുന്നു...' : 'Speaking...')
                  : dialogueState === 'waiting_reply'
                  ? (lang === 'ml' ? 'മറുപടി പറയാം...' : 'Listening...')
                  : 'Start talking'}
              </span>
            </button>

            <button
              type="button"
              className="hero-btn-secondary"
              onClick={handleScrollToFeatures}
              aria-label="Explore features"
            >
              <svg className="w-4 h-4 play-triangle" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              <span>Explore features</span>
            </button>
          </div>

          {/* Live User Voice Feedback / Reminders */}
          {currentUserUtterance && isActive && (
            <div className="hero-live-transcript-box">
              <span className="transcript-speaker">{lang === 'ml' ? 'നിങ്ങൾ:' : 'You:'}</span>
              <p className="transcript-quote">"{currentUserUtterance}"</p>
            </div>
          )}

          {lastAddedReminder && (
            <div className="hero-live-reminder-tag">
              <IconCheck className="w-4 h-4 text-emerald-700" />
              <span>✓ {lastAddedReminder.title} ({lastAddedReminder.time})</span>
            </div>
          )}

          {speechError && (
            <div className="hero-speech-error-box" role="alert">
              <p>{speechError}</p>
            </div>
          )}
        </div>

        {/* Right Column: High-Resolution Photo of Elderly Couple with Glowing Phone & Speech Bubble */}
        <div className="hero-visual-col">
          <div className="hero-image-frame">
            <img 
              src={heroCoupleImg} 
              alt="Elderly Indian couple happily using Sahaayi AI on their smartphone" 
              className="hero-couple-photo"
            />

            {/* Glowing animated soundwaves from the phone */}
            <div className={`phone-soundwaves-glow ${isListening || isSpeaking ? 'active-waves' : ''}`} aria-hidden="true">
              <span className="glow-arc arc-1" />
              <span className="glow-arc arc-2" />
              <span className="glow-arc arc-3" />
            </div>

            {/* Floating Speech Bubble from the phone matching Reference Image 1 */}
            <div className="hero-phone-speech-bubble" role="status" aria-live="polite">
              <div className="bubble-icon-circle">
                <div className="bubble-audio-bars" aria-hidden="true">
                  <span className={`bar b1 ${isSpeaking ? 'animating' : ''}`} />
                  <span className={`bar b2 ${isSpeaking ? 'animating' : ''}`} />
                  <span className={`bar b3 ${isSpeaking ? 'animating' : ''}`} />
                </div>
              </div>
              <div className="bubble-text-content">
                <h4 className="bubble-title-brand">Sahaayi AI</h4>
                <p className="bubble-body-message">
                  {currentAssistantReply 
                    ? currentAssistantReply 
                    : 'നമസ്കാരം! എങ്ങനെ സഹായിക്കാം?'}
                </p>
              </div>
              {/* Little speech bubble pointer tail */}
              <div className="speech-bubble-tail" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
