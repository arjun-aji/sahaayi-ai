// API Client for Sahaayi AI Backend

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000';

export async function sendChatMessage(message, language = 'en', history = []) {
  const payload = {
    message,
    language,
    history: history.map((m) => ({
      role: m.sender === 'user' ? 'user' : 'assistant',
      content: m.text
    }))
  };

  try {
    // Try relative URL first (works with Vite proxy)
    let response = await fetch('/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(() => null);

    // If relative failed, try direct backend URL
    if (!response || !response.ok) {
      response = await fetch(`${BACKEND_BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    }

    if (!response.ok) {
      throw new Error(`Server returned status ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      reply: data.reply,
      isAiGenerated: data.is_ai_generated,
      modelStatus: data.model_status,
      reminderAction: data.reminder_action || null
    };
  } catch (err) {
    return {
      success: false,
      error: err.message || 'Could not connect to FastAPI backend'
    };
  }
}

export async function uploadMedicineImage(file, language = 'ml') {
  const formData = new FormData();
  formData.append('file', file);

  const query = `?language=${encodeURIComponent(language)}`;

  try {
    let response = await fetch(`/read-medicine${query}`, {
      method: 'POST',
      body: formData
    }).catch(() => null);

    if (!response || !response.ok) {
      response = await fetch(`${BACKEND_BASE_URL}/read-medicine${query}`, {
        method: 'POST',
        body: formData
      });
    }

    if (!response.ok) {
      throw new Error(`Server returned status ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      data
    };
  } catch (err) {
    return {
      success: false,
      error: err.message || 'Could not connect to FastAPI backend'
    };
  }
}


export async function uploadDocumentFile(file, language = 'ml') {
  const formData = new FormData();
  formData.append('file', file);

  const query = `?language=${encodeURIComponent(language)}`;

  try {
    let response = await fetch(`/read-document${query}`, {
      method: 'POST',
      body: formData
    }).catch(() => null);

    if (!response || !response.ok) {
      response = await fetch(`${BACKEND_BASE_URL}/read-document${query}`, {
        method: 'POST',
        body: formData
      });
    }

    if (!response.ok) {
      throw new Error(`Server returned status ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      data
    };
  } catch (err) {
    return {
      success: false,
      error: err.message || 'Could not connect to FastAPI backend'
    };
  }
}
