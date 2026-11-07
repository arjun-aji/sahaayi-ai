import { IconShield } from './Icons';

export function SafetyBanner({ t }) {
  return (
    <aside className="safety-banner" role="complementary" aria-label="Medical safety notice">
      <div className="safety-icon-wrap" aria-hidden="true">
        <IconShield className="safety-icon" />
      </div>
      <p className="safety-text">{t.safetyNotice}</p>
    </aside>
  );
}

