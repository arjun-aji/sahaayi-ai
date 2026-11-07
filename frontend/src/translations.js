// Sahaayi AI - Bilingual Translations (English & Malayalam)

export const translations = {
  en: {
    appTitle: "Sahaayi AI",
    appTagline: "Accessible Voice-First Healthcare & Daily Companion",
    language: "Language",
    langMalayalam: "മലയാളം",
    langEnglish: "English",
    accessibilityBtn: "Accessibility Settings",
    closeBtn: "Close",
    
    // Safety Banner
    safetyNotice: "Accessibility & Voice Companion Only: Sahaayi AI is designed to help with reading and navigation. It does not provide medical diagnosis or alter prescriptions. Always consult your doctor or pharmacist.",
    
    // Welcome
    welcomeHeading: "How can I help you today?",
    welcomeSubtitle: "Talk to me in Malayalam or English. I can help read medicines, documents, answer questions, or keep reminders for you.",
    tapToSpeak: "Tap to Speak",
    listening: "Listening... Speak now",
    stopListening: "Stop Listening",
    continuousVoiceMode: "Hands-Free Voice Mode",
    stopConversation: "Stop Conversation",
    listeningForReply: "Listening for your reply... Speak now",
    assistantSpeaking: "Sahaayi is speaking...",
    sahaayiThinking: "Sahaayi is thinking...",
    speechNotSupported: "Speech recognition is not supported in this browser. You can type your question below.",
    micPermissionDenied: "Microphone access was denied. Please allow microphone access in your browser settings.",
    
    // Quick Actions
    actionMedicine: "Read Medicine",
    actionMedicineDesc: "Upload medicine strips or bottles to hear instructions read aloud.",
    actionDocument: "Read Document",
    actionDocumentDesc: "Upload letters, notices, or bills to listen to the contents.",
    actionChat: "Ask AI Assistant",
    actionChatDesc: "Ask any everyday or health query in your preferred language.",
    actionReminders: "My Reminders",
    actionRemindersDesc: "Set and hear voice reminders for medicines and daily routines.",
    
    // Chat
    chatHeading: "AI Conversation",
    chatEmptyState: "No messages yet. Ask a question or use the microphone to talk with Sahaayi.",
    chatPlaceholder: "Type your message here or press the microphone...",
    sendBtn: "Send",
    speakBtn: "Read Aloud",
    stopSpeakingBtn: "Stop Voice",
    speakingNow: "Reading aloud...",
    thinking: "Thinking...",
    mockNotice: "Notice: Backend AI is not yet connected. This is a local mock response demonstrating the interface.",
    quickPromptsHeading: "Suggested questions:",
    prompt1: "When should I take my morning medicines?",
    prompt2: "Can you help me read this doctor's slip?",
    prompt3: "Remind me to drink warm water at 4 PM.",
    prompt4: "മലയാളത്തിൽ സംസാരിക്കാമോ?",
    
    // Medicine Reader
    medicineHeading: "Read Medicine Strips & Bottles",
    medicineSubtitle: "Upload a clear photo of your medicine box, strip, or bottle.",
    uploadLabel: "Select or Take Photo",
    captureHint: "Supports camera capture on mobile or image file upload.",
    readAndExplainBtn: "Read and Explain",
    analyzingMedicine: "Preparing image...",
    medicinePreview: "Medicine Image Preview",
    removeImage: "Remove Photo",
    medicinePlaceholderTitle: "Medicine Reader Output Preview",
    medicinePlaceholderDesc: "Image understanding & OCR model is not connected yet. Once connected to the backend, Sahaayi AI will read the medicine name, usage instructions, and safety warnings aloud.",
    medicineSampleName: "Sample Medicine: Paracetamol 500mg",
    medicineSampleDosage: "Dosage instructions must always be confirmed with your doctor or prescription.",
    medicineDisclaimer: "Important: Never change your dosage without consulting a licensed physician.",
    
    // Document Reader
    documentHeading: "Read Letters & Documents",
    documentSubtitle: "Upload hospital slips, official letters, or utility bills to read aloud.",
    documentUploadLabel: "Upload Document or Photo",
    readDocumentBtn: "Read Document",
    documentPreview: "Document Preview",
    documentPlaceholderTitle: "Document Reader Output Preview",
    documentPlaceholderDesc: "OCR text extraction is not connected yet. When connected to the backend, extracted text will appear here and can be read aloud with speech synthesis.",
    
    // Reminders
    remindersHeading: "My Daily Reminders",
    remindersSubtitle: "Keep track of medicines and daily routines. Saved safely in your browser.",
    addReminderBtn: "Add New Reminder",
    addVoiceReminderBtn: "Add with Voice",
    voiceReminderModalTitle: "Add Reminder with Voice",
    voiceReminderHint: "Say e.g.: 'Remind me to take BP medicine at 4 PM' or 'Drink warm water at 11 AM'",
    reminderSavedSuccess: "Reminder added successfully!",
    reminderTitleLabel: "What do you need to be reminded of?",
    reminderTitlePlaceholder: "e.g., Blood pressure medicine after breakfast",
    reminderTimeLabel: "Reminder Time",
    reminderCategoryLabel: "Category",
    catMedicine: "Medicine",
    catDoctor: "Doctor Visit",
    catDaily: "Daily Routine",
    saveReminderBtn: "Save Reminder",
    cancelBtn: "Cancel",
    noReminders: "No reminders set yet. Tap 'Add New Reminder' above to create one.",
    deleteReminder: "Delete",
    listenReminder: "Read Reminder",
    reminderDisclaimer: "Saved in your browser local storage. Background push notifications will be activated when notification backend is connected.",
    
    // Accessibility Settings Modal
    settingsTitle: "Accessibility Settings",
    largeTextLabel: "Large Text Mode",
    largeTextDesc: "Increases text and button sizes for easier reading.",
    highContrastLabel: "High Contrast Mode",
    highContrastDesc: "Increases contrast with bold outlines and clear colors.",
    autoSpeakLabel: "Auto-Read Responses Aloud",
    autoSpeakDesc: "Automatically reads out new assistant messages using speech synthesis.",
    slowerSpeechLabel: "Slower Speech Rate",
    slowerSpeechDesc: "Slows down the spoken voice for better comprehension.",
    activeBadges: "Active adjustments",
    
    // Status & Fallbacks
    ttsNotSupported: "Text-to-speech is not supported in this browser.",
    ttsLanguageNotice: "Malayalam voice may vary depending on device voice packs. If unavailable, system English voice will be used.",
    resetSettings: "Reset to Default"
  },
  
  ml: {
    appTitle: "സഹായി AI",
    appTagline: "മുതിർന്നവർക്കും കാഴ്ചപരിമിതിയുള്ളവർക്കുമുള്ള ശബ്ദ സഹായി",
    language: "ഭാഷ",
    langMalayalam: "മലയാളം",
    langEnglish: "English",
    accessibilityBtn: "പ്രവേശന ക്രമീകരണങ്ങൾ (Settings)",
    closeBtn: "അടയ്ക്കുക",
    
    // Safety Banner
    safetyNotice: "പ്രത്യേക അറിയിപ്പ്: സഹായി AI ഒരു പ്രവേശന-സഹായ സംവിധാനമാണ്. ഇത് രോഗനിർണ്ണയം നടത്തുകയോ മരുന്നുകളുടെ അളവ് മാറ്റുകയോ ചെയ്യില്ല. ആരോഗ്യ കാര്യങ്ങൾക്ക് ഡോക്ടറുമായി സംസാരിക്കുക.",
    
    // Welcome
    welcomeHeading: "ഇന്ന് ഞാൻ നിങ്ങളെ എങ്ങനെ സഹായിക്കണം?",
    welcomeSubtitle: "മലയാളത്തിലോ ഇംഗ്ലീഷിലോ സംസാരിക്കാം. മരുന്നുകൾ വായിക്കാനും രേഖകൾ മനസ്സിലാക്കാനും ഓർമ്മപ്പെടുത്തലുകൾ നൽകാനും ഞാൻ സഹായിക്കാം.",
    tapToSpeak: "സംസാരിക്കാൻ അമർത്തുക",
    listening: "കേൾക്കുന്നു... സംസാരിക്കൂ",
    stopListening: "നിർത്തുക",
    continuousVoiceMode: "തുടർച്ചയായ സംഭാഷണം (ഹാൻഡ്സ്-ഫ്രീ)",
    stopConversation: "സംഭാഷണം നിർത്തുക",
    listeningForReply: "സഹായി കേൾക്കുന്നു... മറുപടി പറയാം",
    assistantSpeaking: "സഹായി സംസാരിക്കുന്നു...",
    sahaayiThinking: "സഹായി ആലോചിക്കുന്നു...",
    speechNotSupported: "ഈ ബ്രൗസറിൽ സംസാരം തിരിച്ചറിയൽ ലഭ്യമല്ല. ദയവായി താഴെ ടൈപ്പ് ചെയ്യുക.",
    micPermissionDenied: "മൈക്രോഫോൺ അനുമതി നിരസിച്ചു. ബ്രൗസർ സെറ്റിംഗ്സിൽ മൈക്രോഫോൺ അനുവദിക്കുക.",
    
    // Quick Actions
    actionMedicine: "മരുന്ന് വായിക്കുക",
    actionMedicineDesc: "മരുന്ന് സ്ട്രിപ്പുകളുടെയോ കുപ്പികളുടെയോ ഫോട്ടോ എടുത്ത് വായിച്ചു കേൾക്കുക.",
    actionDocument: "രേഖകൾ വായിക്കുക",
    actionDocumentDesc: "കത്തുകളോ ആശുപത്രി രേഖകളോ ഫോട്ടോ എടുത്ത് ഉള്ളടക്കം കേൾക്കുക.",
    actionChat: "സഹായിയോട് ചോദിക്കാം",
    actionChatDesc: "ദൈനംദിന കാര്യങ്ങളും സംശയങ്ങളും ചോദിച്ചറിയുക.",
    actionReminders: "ഓർമ്മപ്പെടുത്തലുകൾ",
    actionRemindersDesc: "മരുന്നും മറ്റ് ആവശ്യങ്ങളും ഓർമ്മിപ്പിക്കാൻ സമയം ക്രമീകരിക്കുക.",
    
    // Chat
    chatHeading: "സഹായി സംഭാഷണം",
    chatEmptyState: "സന്ദേശങ്ങൾ ഒന്നുമില്ല. മൈക്രോഫോൺ അമർത്തി സംസാരിക്കുകയോ താഴെ ടൈപ്പ് ചെയ്യുകയോ ചെയ്യുക.",
    chatPlaceholder: "ഇവിടെ ടൈപ്പ് ചെയ്യുക അല്ലെങ്കിൽ മൈക്രോഫോൺ അമർത്തുക...",
    sendBtn: "അയക്കുക",
    speakBtn: "വായിച്ചു കേൾക്കുക",
    stopSpeakingBtn: "ശബ്ദം നിർത്തുക",
    speakingNow: "വായിക്കുന്നു...",
    thinking: "ചിന്തിക്കുന്നു...",
    mockNotice: "ശ്രദ്ധിക്കുക: AI ബാക്കെൻഡ് നിലവിൽ ബന്ധിപ്പിച്ചിട്ടില്ല. ഇത് ഒരു ഡെമോ മറുപടിയാണ്.",
    quickPromptsHeading: "ചോദിക്കാവുന്ന ചോദ്യങ്ങൾ:",
    prompt1: "രാവിലത്തെ മരുന്ന് എപ്പോഴാണ് കഴിക്കേണ്ടത്?",
    prompt2: "ഈ കുറിപ്പടി വായിക്കാൻ സഹായിക്കാമോ?",
    prompt3: "വൈകുന്നേരം 4 മണിക്ക് വെള്ളം കുടിക്കാൻ ഓർമ്മിപ്പിക്കുക.",
    prompt4: "Can you speak in English too?",
    
    // Medicine Reader
    medicineHeading: "മരുന്ന് കവറുകൾ വായിക്കുക",
    medicineSubtitle: "നിങ്ങളുടെ മരുന്നിന്റെ ഫോട്ടോ അപ്‌ലോഡ് ചെയ്യുക.",
    uploadLabel: "ഫോട്ടോ എടുക്കുക അല്ലെങ്കിൽ തിരഞ്ഞെടുക്കുക",
    captureHint: "മൊബൈൽ ക്യാമറയോ ഫയലോ ഉപയോഗിക്കാം.",
    readAndExplainBtn: "വായിച്ചു വിശദീകരിക്കുക",
    analyzingMedicine: "ചിത്രം തയ്യാറാക്കുന്നു...",
    medicinePreview: "മരുന്നിന്റെ ചിത്രം",
    removeImage: "ചിത്രം മാറ്റുക",
    medicinePlaceholderTitle: "മരുന്ന് വിവരങ്ങൾ (പ്രിവ്യൂ)",
    medicinePlaceholderDesc: "ഇമേജ് പ്രോസസ്സിംഗ് മോഡൽ ബാക്കെൻഡുമായി ഇതുവരെ ബന്ധിപ്പിച്ചിട്ടില്ല. ബന്ധിപ്പിച്ചുകഴിഞ്ഞാൽ മരുന്നിന്റെ പേരും കഴിക്കേണ്ട വിധവും ശബ്ദത്തിൽ കേൾക്കാം.",
    medicineSampleName: "ഉദാഹരണം: പാരസെറ്റമോൾ 500mg",
    medicineSampleDosage: "മരുന്നിന്റെ അളവ് കൃത്യമായി ഡോക്ടറുടെ നിർദ്ദേശപ്രകാരം മാത്രം കഴിക്കുക.",
    medicineDisclaimer: "പ്രധാനം: ഡോക്ടറുടെ നിർദ്ദേശമില്ലാതെ മരുന്നുകളുടെ അളവ് സ്വയം മാറ്റരുത്.",
    
    // Document Reader
    documentHeading: "കത്തുകളും രേഖകളും വായിക്കുക",
    documentSubtitle: "ആശുപത്രി രേഖകളോ കത്തുകളോ അപ്‌ലോഡ് ചെയ്ത് വായിച്ചു കേൾക്കുക.",
    documentUploadLabel: "രേഖ അപ്‌ലോഡ് ചെയ്യുക",
    readDocumentBtn: "രേഖ വായിക്കുക",
    documentPreview: "രേഖയുടെ ചിത്രം",
    documentPlaceholderTitle: "രേഖയുടെ വിവരങ്ങൾ (പ്രിവ്യൂ)",
    documentPlaceholderDesc: "ഒ.സി.ആർ ബാക്കെൻഡ് ഇപ്പോൾ ബന്ധിപ്പിച്ചിട്ടില്ല. ബന്ധിപ്പിച്ചു കഴിഞ്ഞാൽ ഉള്ളടക്കം ഇവിടെ വരികയും വായിച്ചു കേൾപ്പിക്കുകയും ചെയ്യും.",
    
    // Reminders
    remindersHeading: "എന്റെ ഓർമ്മപ്പെടുത്തലുകൾ",
    remindersSubtitle: "മരുന്നുകളും ദിവസേനയുള്ള കാര്യങ്ങളും ബ്രൗസറിൽ സുരക്ഷിതമായി ഓർമ്മിപ്പിക്കുന്നു.",
    addReminderBtn: "പുതിയ ഓർമ്മപ്പെടുത്തൽ",
    addVoiceReminderBtn: "ശബ്ദം വഴി ചേർക്കുക",
    voiceReminderModalTitle: "ശബ്ദത്തിലൂടെ ഓർമ്മപ്പെടുത്തൽ ചേർക്കുക",
    voiceReminderHint: "പറയൂ: 'വൈകിട്ട് 4 മണിക്ക് പ്രഷർ ഗുളിക' അല്ലെങ്കിൽ 'രാവിലെ 8 മണിക്ക് നടക്കുക'",
    reminderSavedSuccess: "ഓർമ്മപ്പെടുത്തൽ വിജയകരമായി ചേർത്തു!",
    reminderTitleLabel: "എന്താണ് ഓർമ്മിപ്പിക്കേണ്ടത്?",
    reminderTitlePlaceholder: "ഉദാഹരണത്തിന്: പ്രഭാതഭക്ഷണത്തിന് ശേഷം പ്രഷർ ഗുളിക",
    reminderTimeLabel: "സമയം",
    reminderCategoryLabel: "വിഭാഗം",
    catMedicine: "മരുന്ന്",
    catDoctor: "ഡോക്ടറെ കാണൽ",
    catDaily: "ദൈനംദിന കാര്യം",
    saveReminderBtn: "സൂക്ഷിക്കുക",
    cancelBtn: "റദ്ദാക്കുക",
    noReminders: "ഓർമ്മപ്പെടുത്തലുകൾ ഒന്നും ചേർത്തിട്ടില്ല. മുകളിലുള്ള ബട്ടൺ അമർത്തുക.",
    deleteReminder: "ഒഴിവാക്കുക",
    listenReminder: "കേൾക്കുക",
    reminderDisclaimer: "ഈ വിവരങ്ങൾ നിങ്ങളുടെ ബ്രൗസറിൽ സൂക്ഷിച്ചിരിക്കുന്നു. നോട്ടിഫിക്കേഷൻ ബാക്കെൻഡ് വരുമ്പോൾ ഫോൺ അറിയിപ്പുകൾ ലഭിക്കും.",
    
    // Accessibility Settings Modal
    settingsTitle: "പ്രവേശനക്ഷമത ക്രമീകരണങ്ങൾ",
    largeTextLabel: "വലിയ അക്ഷരങ്ങൾ (Large Text)",
    largeTextDesc: "എളുപ്പത്തിൽ വായിക്കാൻ അക്ഷരങ്ങളുടെ വലുപ്പം കൂട്ടുന്നു.",
    highContrastLabel: "കൂടിയ തെളിച്ചം (High Contrast)",
    highContrastDesc: "വ്യക്തതയോടെ കാണാൻ ബോർഡറുകളും നിറങ്ങളും മാറ്റുന്നു.",
    autoSpeakLabel: "മറുപടികൾ സ്വയം വായിക്കുക (Auto-Speak)",
    autoSpeakDesc: "സഹായിയുടെ മറുപടികൾ ശബ്ദത്തിൽ തന്നെ വായിച്ചു കേൾപ്പിക്കുന്നു.",
    slowerSpeechLabel: "പതുക്കെയുള്ള സംസാരം (Slower Voice)",
    slowerSpeechDesc: "വ്യക്തമായി മനസ്സിലാക്കാൻ ശബ്ദത്തിന്റെ വേഗത കുറയ്ക്കുന്നു.",
    activeBadges: "സജീവമായ ക്രമീകരണങ്ങൾ",
    
    // Status & Fallbacks
    ttsNotSupported: "ഈ ബ്രൗസറിൽ ശബ്ദം കേൾപ്പിക്കൽ ലഭ്യമല്ല.",
    ttsLanguageNotice: "ഫോണിലെ വോയ്‌സ് പാക്ക് അനുസരിച്ച് മലയാളം ശബ്ദം മാറാം. ലഭ്യമല്ലെങ്കിൽ ഇംഗ്ലീഷ് ശബ്ദത്തിൽ വായിക്കും.",
    resetSettings: "യഥാർത്ഥ നിലയിലേക്ക് മാറ്റുക"
  }
};

