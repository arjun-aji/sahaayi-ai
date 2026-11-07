import { useState, useEffect, useRef } from 'react';
import { IconSettings, IconWhatsApp } from './Icons';
import { getCaregiverPhone, setCaregiverPhone } from '../utils/whatsapp';

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
  const [caregiverPhone, setPhoneState] = useState(getCaregiverPhone);

  useEffect(() => {
    if (isOpen) {
      setPhoneState(getCaregiverPhone());
    }
  }, [isOpen]);

  const handlePhoneChange = (val) => {
    setPhoneState(val);
    setCaregiverPhone(val);
  };

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

          {/* Caregiver Son/Daughter WhatsApp Phone */}
          <div className="setting-input-item">
            <div className="toggle-text-col">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <IconWhatsApp className="w-5 h-5 text-emerald-600" width={20} height={20} />
                <label htmlFor="caregiver-phone-input" className="toggle-label" style={{ margin: 0 }}>
                  {t.caregiverPhoneLabel || 'മക്കളുടെ WhatsApp നമ്പർ (Son/Daughter Phone)'}
                </label>
              </div>
              <p className="toggle-desc">
                {t.caregiverPhoneDesc || 'ഓർമ്മപ്പെടുത്തലുകൾ അറിയിക്കാനുള്ള വാട്സാപ്പ് നമ്പർ.'}
              </p>
            </div>
            <input
              id="caregiver-phone-input"
              type="tel"
              className="caregiver-phone-input"
              value={caregiverPhone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder="+91 7356568307"
            />
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

