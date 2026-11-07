import { IconSettings, IconHeartPulse } from './Icons';

export function Header({ lang, setLang, t, onOpenSettings, hasActiveSettings }) {
  return (
    <header className="app-header" role="banner">
      <div className="header-brand">
        <div className="brand-logo" aria-hidden="true">
          <IconHeartPulse className="logo-icon" />
        </div>
        <div className="brand-text">
          <h1 className="brand-title">{t.appTitle}</h1>
          <p className="brand-subtitle">{t.appTagline}</p>
        </div>
      </div>

      <div className="header-controls">
        {/* Language selector */}
        <div className="lang-switcher" role="group" aria-label={t.language}>
          <button
            type="button"
            className={`lang-btn ${lang === 'ml' ? 'active' : ''}`}
            onClick={() => setLang('ml')}
            aria-pressed={lang === 'ml'}
            title="സ്വിച്ച് മലയാളം"
          >
            മലയാളം
          </button>
          <button
            type="button"
            className={`lang-btn ${lang === 'en' ? 'active' : ''}`}
            onClick={() => setLang('en')}
            aria-pressed={lang === 'en'}
            title="Switch to English"
          >
            English
          </button>
        </div>

        {/* Accessibility settings button */}
        <button
          type="button"
          className={`settings-btn ${hasActiveSettings ? 'has-active' : ''}`}
          onClick={onOpenSettings}
          aria-label={t.accessibilityBtn}
          title={t.accessibilityBtn}
        >
          <IconSettings className="w-6 h-6" />
          <span className="settings-btn-text">{t.accessibilityBtn}</span>
          {hasActiveSettings && <span className="active-dot" aria-label="Settings modified" />}
        </button>
      </div>
    </header>
  );
}

