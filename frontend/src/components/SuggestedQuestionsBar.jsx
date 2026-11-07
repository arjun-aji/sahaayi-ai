import { IconSparkle, IconChat, IconPill, IconDocument, IconCalendarClock } from './Icons';

export function SuggestedQuestionsBar({ lang, onSelectPrompt }) {
  const suggestions = [
    {
      label: lang === 'ml' ? 'ഈ മരുന്ന് എന്തിന്?' : 'What is this medicine for?',
      prompt: lang === 'ml' ? 'ഈ മരുന്ന് എന്തിനാണ് കഴിക്കുന്നത്?' : 'What is this medicine used for?',
      icon: IconChat
    },
    {
      label: lang === 'ml' ? 'ഈ രേഖ എന്താണ്?' : 'What is this document?',
      prompt: lang === 'ml' ? 'ഈ രേഖയിലെ വിവരങ്ങൾ എന്താണെന്ന് പറയാമോ?' : 'Can you explain what this document says?',
      icon: IconDocument
    },
    {
      label: lang === 'ml' ? 'ഒരു ഓർമ്മപ്പെടുത്തൽ ചേർക്കാം' : 'Add a reminder',
      prompt: lang === 'ml' ? 'വൈകുന്നേരം 4 മണിക്ക് ഗുളിക കഴിക്കാൻ ഓർമ്മിപ്പിക്കുക' : 'Remind me to take medicine at 4 PM',
      icon: IconCalendarClock
    },
    {
      label: lang === 'ml' ? 'നിങ്ങൾക്ക് എന്തെല്ലാം ചെയ്യാനാകും?' : 'What can you do?',
      prompt: lang === 'ml' ? 'സഹായി AI നിങ്ങൾക്ക് എന്തെല്ലാം ചെയ്യാൻ കഴിയും?' : 'What can Sahaayi AI help me with?',
      icon: IconPill
    }
  ];

  return (
    <footer className="suggested-questions-bar" aria-label="Suggested Prompts">
      <div className="try-asking-group">
        <IconSparkle className="sparkle-icon" />
        <span className="try-asking-text">{lang === 'ml' ? 'ചോദിച്ചുനോക്കൂ' : 'Try asking'}</span>
        <span className="try-asking-divider" aria-hidden="true">|</span>
      </div>

      <div className="suggestions-scroll-container">
        {suggestions.map((item, index) => {
          const IconComp = item.icon;
          return (
            <button
              key={index}
              type="button"
              className="suggestion-chip-pill"
              onClick={() => onSelectPrompt(item.prompt)}
            >
              <IconComp className="chip-icon" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </footer>
  );
}
