// Web Speech API utilities for Sahaayi AI

export const isSpeechSynthesisSupported = () => {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
};

export const isSpeechRecognitionSupported = () => {
  if (typeof window === 'undefined') return false;
  return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
};

export const getAvailableVoices = () => {
  if (!isSpeechSynthesisSupported()) return [];
  return window.speechSynthesis.getVoices();
};

// Global tracker for HTML5 audio playback (Malayalam TTS stream)
const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000';
let currentAudio = null;
let currentObjectUrl = null;

// Pre-warm voices list on browser load
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    window.speechSynthesis.getVoices();
  };
}

export const stopSpeech = () => {
  if (isSpeechSynthesisSupported()) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }
  }
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    } catch {
      // ignore
    }
    currentAudio = null;
  }
  if (currentObjectUrl) {
    try {
      URL.revokeObjectURL(currentObjectUrl);
    } catch {
      // ignore
    }
    currentObjectUrl = null;
  }
};

const playNativeSpeech = (text, isMalayalam, mlVoice, voices, isSlow, onStart, onEnd, onError) => {
  if (!isSpeechSynthesisSupported()) {
    if (onError) onError('Speech synthesis not supported in this browser.');
    return;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = isSlow ? 0.8 : 1.0;
  utterance.pitch = 1.0;
  utterance.lang = isMalayalam ? 'ml-IN' : 'en-US';

  if (voices.length > 0) {
    if (isMalayalam && mlVoice) {
      utterance.voice = mlVoice;
    } else if (!isMalayalam) {
      const enVoice = voices.find(v => 
        v.lang.toLowerCase().replace('_', '-') === 'en-in' ||
        v.lang.toLowerCase().startsWith('en')
      );
      if (enVoice) {
        utterance.voice = enVoice;
      }
    }
  }

  if (onStart) utterance.onstart = onStart;
  utterance.onend = () => {
    if (onEnd) onEnd();
  };
  utterance.onerror = (e) => {
    if (e.error !== 'canceled' && onError) {
      onError(e.error);
    }
  };

  try {
    window.speechSynthesis.speak(utterance);
  } catch (err) {
    if (onError) onError(err);
  }
};

export const speakText = (text, lang = 'en', isSlow = false, onStart, onEnd, onError) => {
  // Always stop existing speech or audio first
  stopSpeech();

  if (!text || text.trim() === '') return;

  // Detect Malayalam characters in the text
  const hasMalayalamScript = /[\u0D00-\u0D7F]/.test(text);
  const isMalayalam = lang === 'ml' || hasMalayalamScript;

  const voices = typeof window !== 'undefined' && 'speechSynthesis' in window
    ? window.speechSynthesis.getVoices()
    : [];

  // Check if browser has a native Malayalam voice installed
  const mlVoice = isMalayalam && voices.length > 0
    ? voices.find(v => 
        v.lang.toLowerCase().startsWith('ml') ||
        v.name.toLowerCase().includes('malayalam') ||
        v.name.includes('മലയാളം')
      )
    : null;

  // If Malayalam text: always prefer authentic high-quality Malayalam audio from backend
  if (isMalayalam) {
    const playAudioStream = async () => {
      try {
        const query = `text=${encodeURIComponent(text.slice(0, 500))}&lang=ml`;
        let res = await fetch(`/tts?${query}`).catch(() => null);

        // Fallback to direct backend URL if proxy returned HTML or failed
        if (!res || !res.ok || res.headers.get('content-type')?.includes('text/html')) {
          res = await fetch(`${BACKEND_BASE_URL}/tts?${query}`).catch(() => null);
        }

        if (res && res.ok && !res.headers.get('content-type')?.includes('text/html')) {
          const blob = await res.blob();
          const objectUrl = URL.createObjectURL(blob);
          currentObjectUrl = objectUrl;

          const audio = new Audio(objectUrl);
          currentAudio = audio;

          if (isSlow) {
            audio.playbackRate = 0.85;
          }

          audio.onplay = () => {
            if (onStart) onStart();
          };

          audio.onended = () => {
            if (currentObjectUrl) {
              URL.revokeObjectURL(currentObjectUrl);
              currentObjectUrl = null;
            }
            currentAudio = null;
            if (onEnd) onEnd();
          };

          audio.onerror = () => {
            if (currentObjectUrl) {
              URL.revokeObjectURL(currentObjectUrl);
              currentObjectUrl = null;
            }
            currentAudio = null;
            // Fallback to native synthesis if audio decode failed
            playNativeSpeech(text, isMalayalam, mlVoice, voices, isSlow, onStart, onEnd, onError);
          };

          try {
            await audio.play();
            return;
          } catch {
            // Autoplay policy or playback blocked; fallback to speech synthesis
            playNativeSpeech(text, isMalayalam, mlVoice, voices, isSlow, onStart, onEnd, onError);
            return;
          }
        }
      } catch {
        // network or fetch error
      }

      // If backend TTS couldn't be loaded, use native speech
      playNativeSpeech(text, isMalayalam, mlVoice, voices, isSlow, onStart, onEnd, onError);
    };

    playAudioStream();
    return;
  }

  // English or other languages
  playNativeSpeech(text, isMalayalam, mlVoice, voices, isSlow, onStart, onEnd, onError);
};

export const createSpeechRecognizer = (lang = 'en', onResult, onError, onEnd) => {
  if (!isSpeechRecognitionSupported()) {
    return null;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  // Set language
  recognition.lang = lang === 'ml' ? 'ml-IN' : 'en-IN';

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    if (onResult) onResult(transcript);
  };

  recognition.onerror = (event) => {
    if (onError) onError(event.error);
  };

  recognition.onend = () => {
    if (onEnd) onEnd();
  };

  return recognition;
};

