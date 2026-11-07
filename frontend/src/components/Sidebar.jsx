import { SahaayiLogo } from './SahaayiLogo';
import { KeralaLandscape } from './KeralaLandscape';
import { 
  IconHome, 
  IconChat, 
  IconPill, 
  IconDocument, 
  IconCalendarClock, 
  IconSettings 
} from './Icons';

export function Sidebar({ activeTab, onSelectTab, lang }) {
  const navItems = [
    {
      id: 'home',
      label: lang === 'ml' ? 'ഹോം (Home)' : 'Home',
      icon: IconHome
    },
    {
      id: 'chat',
      label: lang === 'ml' ? 'സഹായിയോട് ചോദിക്കാം' : 'Ask Sahaayi',
      icon: IconChat
    },
    {
      id: 'medicine',
      label: lang === 'ml' ? 'മരുന്ന് വായിക്കും' : 'Read Medicine',
      icon: IconPill
    },
    {
      id: 'document',
      label: lang === 'ml' ? 'രേഖകൾ വായിക്കൂ' : 'Read Documents',
      icon: IconDocument
    },
    {
      id: 'reminders',
      label: lang === 'ml' ? 'എന്റെ ഓർമ്മപ്പെടുത്തലുകൾ' : 'My Reminders',
      icon: IconCalendarClock
    },
    {
      id: 'settings',
      label: lang === 'ml' ? 'സെറ്റിംഗ്സ്' : 'Settings',
      icon: IconSettings
    }
  ];

  return (
    <aside className="app-sidebar" aria-label="Main Navigation">
      <div className="sidebar-header">
        <SahaayiLogo isLight={true} />
      </div>

      <nav className="sidebar-nav" aria-label="Primary">
        <ul className="sidebar-menu">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.id;

            return (
              <li key={item.id} className="sidebar-item">
                <button
                  type="button"
                  className={`sidebar-link ${isActive ? 'active' : ''}`}
                  onClick={() => onSelectTab(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <IconComponent className="sidebar-icon" />
                  <span className="sidebar-label">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Decorative Kerala Backwater with coconut palms & traditional kettuvallam houseboat at bottom of sidebar */}
      <div className="sidebar-kerala-landscape" aria-hidden="true">
        <KeralaLandscape variant="dark" />
      </div>
    </aside>
  );
}
