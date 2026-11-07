import { IconContrast, IconSettings } from './Icons';

export function TopHeader({
  lang,
  onToggleLang,
  fontSizeMode,
  onCycleFontSize,
  highContrast,
  onToggleContrast,
  onOpenSettings
}) {
  return (
    <header className="desktop-top-header" role="banner">
      <div className="top-header-spacer" />
      <div className="top-header-actions">
        {/* Language selector pill */}
        <button
          type="button"
          className="header-pill-btn lang-pill-btn"
          onClick={onToggleLang}
          aria-label={lang === 'ml' ? 'സ്വിച്ച് ഇംഗ്ലീഷ് / Switch to English' : 'Switch to Malayalam / മലയാളം'}
        >
          <span>{lang === 'ml' ? 'മലയാളം' : 'English'}</span>
          <span className="lang-divider">/</span>
          <span className="lang-alt">{lang === 'ml' ? 'English' : 'മലയാളം'}</span>
          <span className="dropdown-caret" aria-hidden="true">⌄</span>
        </button>

        {/* Text size AA button */}
        <button
          type="button"
          className={`header-circle-btn text-size-btn ${fontSizeMode > 0 ? 'active' : ''}`}
          onClick={onCycleFontSize}
          aria-label="Toggle text size"
          title={`Text Size: ${fontSizeMode === 0 ? 'Normal' : fontSizeMode === 1 ? 'Large' : 'Extra Large'}`}
        >
          <span className="aa-text">AA</span>
          {fontSizeMode > 0 && <span className="size-badge-indicator" />}
        </button>

        {/* Contrast toggle button */}
        <button
          type="button"
          className={`header-circle-btn contrast-btn ${highContrast ? 'active' : ''}`}
          onClick={onToggleContrast}
          aria-label="Toggle high contrast"
          title="Toggle High Contrast"
          aria-pressed={highContrast}
        >
          <IconContrast className="w-5 h-5" />
        </button>

        {/* Settings button */}
        <button
          type="button"
          className="header-circle-btn settings-circle-btn"
          onClick={onOpenSettings}
          aria-label="Accessibility & App Settings"
          title="Accessibility & App Settings"
        >
          <IconSettings className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}

