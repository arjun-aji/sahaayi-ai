import { useEffect, useRef } from 'react';
import { IconSettings } from './Icons';

export function AccessibilityModal({
  isOpen,
  onClose,
  t,
  largeText,
  setLargeText,
  highContrast,
  setHighContrast,
  autoSpeak,
  setAutoSpeak,
  slowerSpeech,
  setSlowerSpeech,
  onReset
}) {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="accessibility-settings-title"
    >
      <div
        className="modal-card"
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="modal-title-group">
            <IconSettings className="w-7 h-7 text-emerald-700" />
            <h2 id="accessibility-settings-title" className="modal-title">
              {t.settingsTitle}
            </h2>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label={t.closeBtn}
          >
            ✕
          </button>
        </div>

        <div className="modal-body">
          {/* Large text toggle */}
          <div className="setting-toggle-item">
            <div className="toggle-text-col">
              <label htmlFor="large-text-switch" className="toggle-label">
                {t.largeTextLabel}
              </label>
              <p className="toggle-desc">{t.largeTextDesc}</p>
            </div>
            <button
              id="large-text-switch"
              type="button"
              role="switch"
              aria-checked={largeText}
              className={`toggle-switch-btn ${largeText ? 'switch-on' : 'switch-off'}`}
              onClick={() => setLargeText(!largeText)}
            >
              <span className="switch-thumb" />
              <span className="sr-only">{t.largeTextLabel}</span>
            </button>
          </div>

          {/* High contrast toggle */}
          <div className="setting-toggle-item">
            <div className="toggle-text-col">
              <label htmlFor="high-contrast-switch" className="toggle-label">
                {t.highContrastLabel}
              </label>
              <p className="toggle-desc">{t.highContrastDesc}</p>
            </div>
            <button
              id="high-contrast-switch"
              type="button"
              role="switch"
              aria-checked={highContrast}
              className={`toggle-switch-btn ${highContrast ? 'switch-on' : 'switch-off'}`}
              onClick={() => setHighContrast(!highContrast)}
            >
              <span className="switch-thumb" />
              <span className="sr-only">{t.highContrastLabel}</span>
            </button>
          </div>

          {/* Auto speak responses */}
          <div className="setting-toggle-item">
            <div className="toggle-text-col">
              <label htmlFor="auto-speak-switch" className="toggle-label">
                {t.autoSpeakLabel}
              </label>
              <p className="toggle-desc">{t.autoSpeakDesc}</p>
            </div>
            <button
              id="auto-speak-switch"
              type="button"
              role="switch"
              aria-checked={autoSpeak}
              className={`toggle-switch-btn ${autoSpeak ? 'switch-on' : 'switch-off'}`}
              onClick={() => setAutoSpeak(!autoSpeak)}
            >
              <span className="switch-thumb" />
              <span className="sr-only">{t.autoSpeakLabel}</span>
            </button>
          </div>

          {/* Slower speech rate */}
          <div className="setting-toggle-item">
            <div className="toggle-text-col">
              <label htmlFor="slower-speech-switch" className="toggle-label">
                {t.slowerSpeechLabel}
              </label>
              <p className="toggle-desc">{t.slowerSpeechDesc}</p>
            </div>
            <button
              id="slower-speech-switch"
              type="button"
              role="switch"
              aria-checked={slowerSpeech}
              className={`toggle-switch-btn ${slowerSpeech ? 'switch-on' : 'switch-off'}`}
              onClick={() => setSlowerSpeech(!slowerSpeech)}
            >
              <span className="switch-thumb" />
              <span className="sr-only">{t.slowerSpeechLabel}</span>
            </button>
          </div>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="reset-btn"
            onClick={onReset}
          >
            {t.resetSettings}
          </button>
          <button
            type="button"
            className="modal-done-btn"
            onClick={onClose}
          >
            {t.closeBtn}
          </button>
        </div>
      </div>
    </div>
  );
}

