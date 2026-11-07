import { useState, useRef, useEffect } from 'react';
import { IconSend, IconMic, IconSpeaker, IconStop } from './Icons';
import { 
  speakText, 
  stopSpeech, 
  isSpeechRecognitionSupported, 
  createSpeechRecognizer 
} from '../utils/speech';
import { sendChatMessage } from '../utils/api';

export function ChatSection({ 
  t, 
  lang, 
  messages, 
  setMessages, 
  autoSpeak, 
  slowerSpeech 
}) {
  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isDictating, setIsDictating] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState(null);
  const [chatError, setChatError] = useState(null);

  const messagesEndRef = useRef(null);
  const recognizerRef = useRef(null);

  const speechRecognitionSupported = isSpeechRecognitionSupported();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  // Clean up speech on unmount
  useEffect(() => {
    return () => {
      stopSpeech();
      if (recognizerRef.current) {
        try {
          recognizerRef.current.abort();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const handleSpeakMessage = (msgId, text) => {
    if (speakingMessageId === msgId) {
      stopSpeech();
      setSpeakingMessageId(null);
      return;
    }

    setSpeakingMessageId(msgId);
    speakText(
      text,
      lang,
      slowerSpeech,
      () => setSpeakingMessageId(msgId),
      () => setSpeakingMessageId(null),
      (err) => {
        setSpeakingMessageId(null);
        setChatError(`Audio playback notice: ${err}`);
      }
    );
  };

  const handleStopAllSpeech = () => {
    stopSpeech();
    setSpeakingMessageId(null);
  };

  const generateMockAssistantResponse = (userPrompt) => {
    const isMl = lang === 'ml';
    const lower = userPrompt.toLowerCase();

    let reply = '';
    if (lower.includes('മരുന്ന്') || lower.includes('medicine') || lower.includes('tablet')) {
      reply = isMl
        ? `നിങ്ങൾ മരുന്നിനെക്കുറിച്ചാണ് ചോദിച്ചത്. പ്രധാനം: കൃത്യമായ സമയം നിങ്ങളുടെ ഡോക്ടറുടെ കുറിപ്പടി നോക്കി തീരുമാനിക്കുക. മരുന്ന് കവറിന്റെ ഫോട്ടോ എടുത്ത് പരിശോധിക്കാൻ മുകളിലുള്ള 'മരുന്ന് വായിക്കുക' ഓപ്ഷൻ ഉപയോഗിക്കാം.`
        : `You inquired about medication. Please note: exact dosage and times must follow your doctor's prescription. You can also use the 'Read Medicine' feature to examine medicine strips.`;
    } else if (lower.includes('വെള്ളം') || lower.includes('water')) {
      reply = isMl
        ? `ധാരാളം ശുദ്ധജലം കുടിക്കുന്നത് ആരോഗ്യത്തിന് നല്ലതാണ്. നിങ്ങളുടെ ഓർമ്മപ്പെടുത്തലുകളിൽ വെള്ളം കുടിക്കാനുള്ള സമയം ഞങ്ങൾ ചേർക്കാൻ സഹായിക്കാം.`
        : `Drinking plenty of clean water is great for health. You can add a hydration reminder in the 'My Reminders' section.`;
    } else if (lower.includes('രേഖ') || lower.includes('document') || lower.includes('letter')) {
      reply = isMl
        ? `കത്തുകളോ ആശുപത്രി രേഖകളോ വായിക്കാൻ മുകളിലെ 'രേഖകൾ വായിക്കുക' കാർഡ് അമർത്തി ഫോട്ടോ അപ്‌ലോഡ് ചെയ്യുക.`
        : `To read letters or hospital slips, tap the 'Read Document' card above and upload a photo.`;
    } else {
      reply = isMl
        ? `നിങ്ങൾ പറഞ്ഞത് ഞാൻ ശ്രദ്ധിച്ചു: "${userPrompt}". നിലവിൽ AI ബാക്കെൻഡ് ബന്ധിപ്പിച്ചിട്ടില്ലാത്തതിനാൽ ഇത് ഒരു ഡെമോ മറുപടിയാണ്. ബാക്കെൻഡ് കണക്ട് ചെയ്യുമ്പോൾ നിങ്ങളുടെ ചോദ്യങ്ങൾക്ക് തത്സമയം വിശദമായ ഉത്തരം ലഭിക്കും.`
        : `I received your message: "${userPrompt}". Currently the AI backend is not connected, so this is a demonstration response. Once connected, Sahaayi will provide full conversational assistance.`;
    }

    return {
      id: Date.now().toString(),
      sender: 'assistant',
      text: reply,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMock: true
    };
  };

  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    setChatError(null);

    const userMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsThinking(true);

    try {
      const response = await sendChatMessage(text, lang, messages);

      let replyText = '';
      let isAiGenerated = false;

      if (response.success) {
        replyText = response.reply;
        isAiGenerated = response.isAiGenerated;
      } else {
        setChatError(`Backend status: ${response.error}. Using local fallback.`);
        const fallback = generateMockAssistantResponse(text);
        replyText = fallback.text;
      }

      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isAiGenerated: isAiGenerated,
        isMock: !isAiGenerated
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsThinking(false);

      if (autoSpeak) {
        handleSpeakMessage(assistantMessage.id, assistantMessage.text);
      }
    } catch (err) {
      setIsThinking(false);
      setChatError(`Error sending message: ${err.message}`);
    }
  };

  const handleToggleDictation = () => {
    if (!speechRecognitionSupported) {
      setChatError(t.speechNotSupported);
      return;
    }

    if (isDictating) {
      if (recognizerRef.current) {
        recognizerRef.current.stop();
      }
      setIsDictating(false);
      return;
    }

    setChatError(null);
    try {
      const recognizer = createSpeechRecognizer(
        lang,
        (recognized) => {
          setIsDictating(false);
          setInputText((prev) => (prev ? `${prev} ${recognized}` : recognized));
        },
        (error) => {
          setIsDictating(false);
          if (error === 'not-allowed') {
            setChatError(t.micPermissionDenied);
          } else if (error !== 'no-speech') {
            setChatError(`Microphone notice: ${error}`);
          }
        },
        () => setIsDictating(false)
      );

      if (recognizer) {
        recognizerRef.current = recognizer;
        recognizer.start();
        setIsDictating(true);
      }
    } catch (e) {
      setIsDictating(false);
      setChatError(e.message || 'Error initializing dictation');
    }
  };

  const quickPrompts = [
    t.prompt1,
    t.prompt2,
    t.prompt3,
    t.prompt4
  ];

  return (
    <section className="chat-section" aria-labelledby="chat-heading">
      <div className="section-header-bar">
        <div>
          <h2 id="chat-heading" className="section-title">{t.chatHeading}</h2>
          <p className="section-subtitle">{t.actionChatDesc}</p>
        </div>
        {speakingMessageId && (
          <button
            type="button"
            className="stop-speech-global-btn"
            onClick={handleStopAllSpeech}
            aria-label={t.stopSpeakingBtn}
          >
            <IconStop className="w-5 h-5" />
            <span>{t.stopSpeakingBtn}</span>
          </button>
        )}
      </div>

      {/* Suggested quick questions */}
      <div className="quick-prompts-wrapper" aria-label={t.quickPromptsHeading}>
        <span className="quick-prompts-title">{t.quickPromptsHeading}</span>
        <div className="quick-prompts-list">
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              className="prompt-chip"
              onClick={() => handleSendMessage(prompt)}
            >
              💬 {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Message history */}
      <div className="chat-messages-container" role="log" aria-live="polite">
        {messages.length === 0 ? (
          <div className="chat-empty-state">
            <p>{t.chatEmptyState}</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isAssistant = msg.sender === 'assistant';
            const isSpeakingThis = speakingMessageId === msg.id;

            return (
              <div
                key={msg.id}
                className={`chat-bubble-row ${isAssistant ? 'assistant-row' : 'user-row'}`}
              >
                <div className={`chat-bubble ${isAssistant ? 'bubble-assistant' : 'bubble-user'}`}>
                  <div className="bubble-header">
                    <span className="sender-name">
                      {isAssistant ? (lang === 'ml' ? 'സഹായി AI' : 'Sahaayi AI') : (lang === 'ml' ? 'നിങ്ങൾ' : 'You')}
                    </span>
                    <span className="timestamp">{msg.timestamp}</span>
                  </div>

                  <p className="bubble-text">{msg.text}</p>

                  {isAssistant && msg.isMock && (
                    <div className="mock-badge" role="note">
                      ⚠️ {t.mockNotice}
                    </div>
                  )}

                  {isAssistant && (
                    <div className="bubble-actions">
                      <button
                        type="button"
                        className={`speak-btn ${isSpeakingThis ? 'speaking-active' : ''}`}
                        onClick={() => handleSpeakMessage(msg.id, msg.text)}
                        aria-label={isSpeakingThis ? t.stopSpeakingBtn : t.speakBtn}
                      >
                        {isSpeakingThis ? (
                          <>
                            <IconStop className="w-5 h-5" />
                            <span>{t.speakingNow}</span>
                          </>
                        ) : (
                          <>
                            <IconSpeaker className="w-5 h-5" />
                            <span>{t.speakBtn}</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}

        {isThinking && (
          <div className="chat-bubble-row assistant-row">
            <div className="chat-bubble bubble-assistant thinking-bubble">
              <span className="thinking-dots" aria-hidden="true">● ● ●</span>
              <span>{t.thinking}</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat error notice */}
      {chatError && (
        <div className="chat-error-bar" role="alert">
          <p>{chatError}</p>
          <button 
            type="button" 
            className="dismiss-btn"
            onClick={() => setChatError(null)}
          >
            ×
          </button>
        </div>
      )}

      {/* Chat input form */}
      <form
        className="chat-input-form"
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
      >
        <div className="input-group">
          <input
            type="text"
            className="chat-text-input"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={isDictating ? t.listening : t.chatPlaceholder}
            aria-label={t.chatPlaceholder}
          />

          {speechRecognitionSupported && (
            <button
              type="button"
              className={`mic-btn ${isDictating ? 'dictating' : ''}`}
              onClick={handleToggleDictation}
              title={isDictating ? t.stopListening : t.tapToSpeak}
              aria-label={isDictating ? t.stopListening : t.tapToSpeak}
            >
              {isDictating ? (
                <IconStop className="w-6 h-6" />
              ) : (
                <IconMic className="w-6 h-6" />
              )}
            </button>
          )}

          <button
            type="submit"
            className="send-btn"
            disabled={!inputText.trim() || isThinking}
            aria-label={t.sendBtn}
          >
            <IconSend className="w-6 h-6" />
            <span className="send-btn-text">{t.sendBtn}</span>
          </button>
        </div>
      </form>
    </section>
  );
}

