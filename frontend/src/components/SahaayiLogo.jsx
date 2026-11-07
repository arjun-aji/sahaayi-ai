export function SahaayiLogo({ isLight = false, isSmall = false }) {
  return (
    <div className={`sahaayi-logo-group ${isLight ? 'logo-light' : 'logo-dark'}`}>
      <div className="logo-icon-bars" aria-hidden="true">
        <span className="bar bar-1" />
        <span className="bar bar-2" />
        <span className="bar bar-3" />
        <span className="bar bar-4" />
        <span className="bar bar-5" />
      </div>
      <div className="logo-text-block">
        <div className="logo-main-text">
          <span className="logo-title">sahaayi</span>
          <span className="logo-ai-badge">AI</span>
        </div>
        {!isSmall && (
          <span className="logo-tagline">YOUR VOICE. YOUR COMPANION.</span>
        )}
      </div>
    </div>
  );
}

