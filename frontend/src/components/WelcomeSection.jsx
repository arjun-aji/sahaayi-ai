import { useState, useRef, useEffect } from 'react';
import { IconMic, IconStop } from './Icons';
import { isSpeechRecognitionSupported, createSpeechRecognizer } from '../utils/speech';

export function WelcomeSection({ t, lang, onVoiceInputReceived }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [speechError, setSpeechError] = useState(null);
  const recognizerRef = useRef(null);

  const supported = isSpeechRecognitionSupported();

  useEffect(() => {
    return () => {
      if (recognizerRef.current) {
        try {
          recognizerRef.current.abort();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const handleToggleListening = () => {
    if (!supported) {
      setSpeechError(t.speechNotSupported);
      return;
    }

    if (isListening) {
      if (recognizerRef.current) {
        recognizerRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    setSpeechError(null);
    setTranscript('');

    try {
      const recognizer = createSpeechRecognizer(
        lang,
        (text) => {
          setTranscript(text);
          setIsListening(false);
          if (onVoiceInputReceived) {
            onVoiceInputReceived(text);
          }
        },
        (error) => {
          setIsListening(false);
          if (error === 'not-allowed') {
            setSpeechError(t.micPermissionDenied);
          } else if (error === 'no-speech') {
            setSpeechError(null);
          } else {
            setSpeechError(`Microphone notice: ${error}`);
          }
        },
        () => {
          setIsListening(false);
        }
      );

      if (recognizer) {
        recognizerRef.current = recognizer;
        recognizer.start();
        setIsListening(true);
      }
    } catch (err) {
      setIsListening(false);
      setSpeechError(err.message || 'Error starting speech recognition');
    }
  };

  return (
    <section className="welcome-section" aria-labelledby="welcome-heading">
      <div className="welcome-content">
        <h2 id="welcome-heading" className="welcome-title">{t.welcomeHeading}</h2>
        <p className="welcome-subtitle">{t.welcomeSubtitle}</p>

        <div className="voice-cta-container">
          <button
            type="button"
            className={`large-voice-btn ${isListening ? 'listening' : ''}`}
            onClick={handleToggleListening}
            aria-live="polite"
            aria-label={isListening ? t.stopListening : t.tapToSpeak}
          >
            <div className="voice-icon-wrapper" aria-hidden="true">
              {isListening ? (
                <IconStop className="voice-btn-icon" />
              ) : (
                <IconMic className="voice-btn-icon" />
              )}
            </div>
            <span className="voice-btn-label">
              {isListening ? t.listening : t.tapToSpeak}
            </span>
            {isListening && (
              <span className="pulse-ring" aria-hidden="true" />
            )}
          </button>
        </div>

        {isListening && (
          <div className="live-transcript" aria-live="assertive">
            <span className="listening-badge">{t.listening}</span>
            <p className="listening-prompt">
              {lang === 'ml' ? 'നിങ്ങളുടെ ചോദ്യം പറയുക...' : 'Speak your question or request now...'}
            </p>
          </div>
        )}

        {transcript && (
          <div className="voice-result-box" aria-live="polite">
            <span className="result-label">
              {lang === 'ml' ? 'കേട്ടത്:' : 'Heard:'}
            </span>
            <span className="result-text">"{transcript}"</span>
          </div>
        )}

        {speechError && (
          <div className="voice-error-banner" role="alert">
            <p>{speechError}</p>
          </div>
        )}

        {!supported && (
          <p className="voice-unsupported-note" role="note">
            ℹ️ {t.speechNotSupported}
          </p>
        )}
      </div>
    </section>
  );
}

