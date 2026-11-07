import { 
  IconPill, 
  IconDocument, 
  IconChat, 
  IconCalendarClock, 
  IconArrowRight 
} from './Icons';

export function DesktopFeatureCards({ onSelectTab, lang }) {
  const cards = [
    {
      id: 'medicine',
      title: lang === 'ml' ? 'മരുന്ന് വായിക്കൂ' : 'Read Medicine',
      desc: lang === 'ml' ? 'മരുന്ന് കവറുകൾ സ്കാൻ ചെയ്തു മനസ്സിലാക്കുക' : 'Scan and understand medicine labels',
      theme: 'theme-medicine',
      icon: IconPill,
      badgeColor: '#2E8B57'
    },
    {
      id: 'document',
      title: lang === 'ml' ? 'രേഖകൾ വായിക്കൂ' : 'Read Documents',
      desc: lang === 'ml' ? 'കത്തുകൾ, ബില്ലുകൾ എന്നിവ വായിച്ചു കേൾക്കുക' : 'Read letters and bills aloud',
      theme: 'theme-documents',
      icon: IconDocument,
      badgeColor: '#D97706'
    },
    {
      id: 'chat',
      title: lang === 'ml' ? 'സഹായിയോട് ചോദിക്കാം' : 'Ask Sahaayi',
      desc: lang === 'ml' ? 'എന്തും സംശയം ചോദിക്കൂ, മറുപടി കേൾക്കുക' : 'Ask any questions and listen to answers',
      theme: 'theme-chat',
      icon: IconChat,
      badgeColor: '#0284C7'
    },
    {
      id: 'reminders',
      title: lang === 'ml' ? 'എന്റെ ഓർമ്മപ്പെടുത്തലുകൾ' : 'My Reminders',
      desc: lang === 'ml' ? 'നിങ്ങളുടെ ദൈനംദിന ഓർമ്മപ്പെടുത്തലുകൾ ക്രമീകരിക്കൂ' : 'Manage your daily reminders',
      theme: 'theme-reminders',
      icon: IconCalendarClock,
      badgeColor: '#7C3AED'
    }
  ];

  return (
    <section className="desktop-feature-cards-row" aria-label="Feature Cards">
      {cards.map((card) => {
        const IconComponent = card.icon;

        return (
          <div
            key={card.id}
            className={`pastel-feature-card ${card.theme}`}
            onClick={() => onSelectTab(card.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelectTab(card.id);
              }
            }}
          >
            <div className="card-header-icon-box">
              <IconComponent className="card-top-icon" />
            </div>

            <div className="card-text-body">
              <h3 className="card-heading-title">{card.title}</h3>
              <p className="card-sub-description">{card.desc}</p>
            </div>

            <div className="card-bottom-action">
              <div className="card-circle-arrow-btn" aria-hidden="true">
                <IconArrowRight className="arrow-icon" />
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
}
