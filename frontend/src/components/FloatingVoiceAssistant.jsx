import { useState, useRef, useEffect, useCallback } from 'react';
import { IconMic, IconStop, IconSpeaker } from './Icons';
import { 
  isSpeechRecognitionSupported, 
  createSpeechRecognizer, 
  speakText, 
  stopSpeech 
} from '../utils/speech';
import { handleGlobalVoiceCommand } from '../utils/voiceNavigator';
import { sendChatMessage } from '../utils/api';

export function FloatingVoiceAssistant({
  lang,
  setLang,
  _activeTab,
  setActiveTab,
  _fontSizeMode,
  setFontSizeMode,
  _highContrast,
  toggleContrast,
  slowerSpeech,
  messages,
  setMessages,
  _t
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, setState] = useState('idle'); // 'idle' | 'listening' | 'thinking' | 'speaking'
  const [transcript, setTranscript] = useState('');
  const [assistantReply, setAssistantReply] = useState('');
  const recognizerRef = useRef(null);
  const startListeningRef = useRef(null);

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
    setState('idle');
  }, []);

  function startListening() {
    if (!supported) return;

    stopSpeech();
    if (recognizerRef.current) {
      try {
        recognizerRef.current.abort();
      } catch {
        // ignore
      }
    }

    setTranscript('');
    setAssistantReply('');
    setState('listening');
    setIsOpen(true);

    const recognizer = createSpeechRecognizer(
      lang,
      async (recognizedText) => {
        if (!recognizedText || !recognizedText.trim()) {
          setState('idle');
          return;
        }

        const cleanText = recognizedText.trim();
        setTranscript(cleanText);
        setState('thinking');

        // Check if recognizedText is a global navigation or accessibility command
        const commandResult = handleGlobalVoiceCommand(cleanText, lang, {
          setActiveTab,
          setLang,
          setFontSizeMode,
          toggleContrast
        });

        if (commandResult) {
          setAssistantReply(commandResult.voiceReply);
          setState('speaking');

          speakText(
            commandResult.voiceReply,
            lang,
            slowerSpeech,
            () => setState('speaking'),
            handleAssistantSpoke,
            () => handleAssistantSpoke()
          );
          return;
        }

        // Otherwise pass to Gemini AI conversational chat
        try {
          const response = await sendChatMessage(cleanText, lang, messages);
          const reply = response.success
            ? response.reply
            : (lang === 'ml' ? 'നിങ്ങൾ പറഞ്ഞത് ലഭിച്ചു. സഹായി കൂടെയുണ്ട്.' : 'Received your message.');

          setAssistantReply(reply);
          setState('speaking');

          const asstMsg = {
            id: Date.now().toString(),
            sender: 'assistant',
            text: reply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isAiGenerated: response.isAiGenerated || false
          };
          if (setMessages) {
            setMessages((prev) => [...prev, asstMsg]);
          }

          speakText(
            reply,
            lang,
            slowerSpeech,
            () => setState('speaking'),
            handleAssistantSpoke,
            () => handleAssistantSpoke()
          );
        } catch {
          setState('idle');
        }
      },
      () => {
        setState('idle');
      },
      () => {}
    );

    if (recognizer) {
      recognizerRef.current = recognizer;
      recognizer.start();
    }
  }

  useEffect(() => {
    startListeningRef.current = startListening;
  });

  const toggleVoice = () => {
    if (state !== 'idle') {
      stopSpeech();
      if (recognizerRef.current) {
        try {
          recognizerRef.current.abort();
        } catch {
          // ignore
        }
      }
      setState('idle');
      setIsOpen(false);
    } else {
      startListening();
    }
  };

  if (!supported) return null;

  return (
    <aside className="global-voice-widget" aria-label="Global Voice Navigator">
      {/* Expanded Voice Dialogue Bar */}
      {isOpen && (
        <div className="voice-widget-card" role="region" aria-live="polite">
          <div className="voice-widget-header">
            <span className={`voice-widget-status-dot ${state}`} />
            <span className="voice-widget-title">
              {state === 'listening' && (lang === 'ml' ? 'കേൾക്കുന്നു... കമാൻഡ് പറയൂ' : 'Listening... Say a command')}
              {state === 'thinking' && (lang === 'ml' ? 'സഹായി ആലോചിക്കുന്നു...' : 'Processing...')}
              {state === 'speaking' && (lang === 'ml' ? 'സഹായി സംസാരിക്കുന്നു...' : 'Speaking...')}
              {state === 'idle' && (lang === 'ml' ? 'ശബ്ദ നാവിഗേഷൻ റെഡിയാണ്' : 'Voice Navigation Ready')}
            </span>
            <button
              type="button"
              className="widget-close-btn"
              onClick={() => {
                stopSpeech();
                setState('idle');
                setIsOpen(false);
              }}
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          {transcript && (
            <p className="widget-user-text">
              <strong>{lang === 'ml' ? 'നിങ്ങൾ:' : 'You:'}</strong> "{transcript}"
            </p>
          )}

          {assistantReply && (
            <div className="widget-reply-box">
              <IconSpeaker className="w-4 h-4 text-emerald-700 animate-pulse" />
              <p className="widget-reply-text">{assistantReply}</p>
            </div>
          )}

          <div className="widget-hints-row">
            <span className="hint-pill">"ഹോം"</span>
            <span className="hint-pill">"മരുന്ന് വായിക്കുക"</span>
            <span className="hint-pill">"രേഖകൾ"</span>
            <span className="hint-pill">"ഓർമ്മപ്പെടുത്തലുകൾ"</span>
            <span className="hint-pill">"വലിയ അക്ഷരങ്ങൾ"</span>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        type="button"
        className={`global-voice-fab ${state !== 'idle' ? 'fab-active' : ''}`}
        onClick={toggleVoice}
        aria-label={state !== 'idle' ? 'Stop Voice' : 'Global Voice Control'}
        title={lang === 'ml' ? 'ശബ്ദ നാവിഗേഷൻ (Voice Control)' : 'Voice Navigation'}
      >
        {state !== 'idle' ? (
          <IconStop className="w-8 h-8 text-white" />
        ) : (
          <IconMic className="w-8 h-8 text-white" />
        )}
        <span className="fab-label">
          {state !== 'idle' ? (lang === 'ml' ? 'നിർത്തുക' : 'Stop') : (lang === 'ml' ? 'ശബ്ദ കമാൻഡ്' : 'Voice Command')}
        </span>
      </button>
    </aside>
  );
}
