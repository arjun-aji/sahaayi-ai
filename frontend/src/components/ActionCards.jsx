import { IconPill, IconDocument, IconChat, IconClock } from './Icons';

export function ActionCards({ t, activeTab, onSelectTab }) {
  const cards = [
    {
      id: 'medicine',
      title: t.actionMedicine,
      description: t.actionMedicineDesc,
      icon: IconPill,
      accentColor: 'card-medicine'
    },
    {
      id: 'document',
      title: t.actionDocument,
      description: t.actionDocumentDesc,
      icon: IconDocument,
      accentColor: 'card-document'
    },
    {
      id: 'chat',
      title: t.actionChat,
      description: t.actionChatDesc,
      icon: IconChat,
      accentColor: 'card-chat'
    },
    {
      id: 'reminders',
      title: t.actionReminders,
      description: t.actionRemindersDesc,
      icon: IconClock,
      accentColor: 'card-reminders'
    }
  ];

  return (
    <nav className="action-cards-grid" aria-label="Main features">
      {cards.map((card) => {
        const IconComponent = card.icon;
        const isActive = activeTab === card.id;

        return (
          <button
            key={card.id}
            type="button"
            className={`feature-card ${card.accentColor} ${isActive ? 'selected' : ''}`}
            onClick={() => onSelectTab(card.id)}
            aria-current={isActive ? 'page' : undefined}
          >
            <div className="card-header-row">
              <div className="card-icon-box" aria-hidden="true">
                <IconComponent className="card-icon" />
              </div>
              {isActive && (
                <span className="current-badge" aria-label="Currently active">
                  ✓
                </span>
              )}
            </div>
            <h3 className="card-title">{card.title}</h3>
            <p className="card-desc">{card.description}</p>
          </button>
        );
      })}
    </nav>
  );
}

