# Sahaayi AI (സഹായി) — Accessible Voice-First Healthcare Companion

[![React](https://img.shields.io/badge/Frontend-React%2019%20+%20Vite-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Gemini](https://img.shields.io/badge/AI-Google%20Gemini%20Flash-4285F4?logo=google&logoColor=white)](https://aistudio.google.com/)

**Sahaayi AI** (*"സഹായി"*, meaning *"Companion"* or *"Helper"* in Malayalam) is an accessible, voice-first healthcare and daily companion built for senior citizens, low-vision individuals, and anyone who finds small smartphone typography or English-only medical labels difficult to navigate.

---

## 🌟 Key Features

1. **Hands-Free Conversational Voice Loop**:
   - **Automatic Audio Replies**: Sahaayi speaks back aloud automatically using authentic Malayalam audio streaming (`/tts`).
   - **Continuous Follow-Up Listening**: Re-activates the microphone automatically after finished speaking, enabling natural back-and-forth conversation without pressing buttons repeatedly.
   - Saying *"നന്ദി"* (Thank you) or *"Stop"* pauses the dialogue cleanly.

2. **Full Voice Website Navigation**:
   - Navigate the entire app purely with spoken voice commands in Malayalam or English:
     - *"ഹോം"* / *"Go Home"* $\rightarrow$ Navigates to Home screen.
     - *"മരുന്ന് വായിക്കുക"* / *"Read Medicine"* $\rightarrow$ Opens Medicine scanner.
     - *"രേഖകൾ വായിക്കുക"* / *"Read Document"* $\rightarrow$ Opens Document scanner.
     - *"ഓർമ്മപ്പെടുത്തലുകൾ"* / *"View Reminders"* $\rightarrow$ Opens Daily Reminders list.
     - *"സഹായിയോട് ചോദിക്കാം"* / *"Open Chat"* $\rightarrow$ Opens AI Conversation.
   - Every navigation action speaks a clear confirmation aloud so low-vision users always know where they are.

3. **Persistent Floating Voice Assistant**:
   - An accessible floating **`🎙️ ശബ്ദ കമാൻഡ്`** button is available in the bottom-right corner of every screen, allowing seniors to jump between sections or ask questions anytime without looking for back buttons.

4. **Real-Time Active Reminder Alarms & WhatsApp Alerts**:
   - **3-Second Background Polling**: Continuously checks system time against reminders.
   - **Flexible Time Parsing**: Recognizes dot & colon formats (e.g. `1.27 pm`, `1:27 PM`, `13:27`, *"വൈകിട്ട് 4 മണിക്ക്"*).
   - **Musical Chime 🔔**: Plays a crystal-clear hospital-grade audio chime via Web Audio API.
   - **Live Spoken Alert**: Sahaayi announces: *"ശ്രദ്ധിക്കുക! ഇപ്പോൾ സമയം 13:27 ആയി. [Title] സമയമാണ്."*
   - **High-Contrast Alert Popup**: Fullscreen popup with large text, *"Read Again"*, *"Done / Dismiss"*, and **1-tap WhatsApp alert**.
   - **Caregiver WhatsApp Integration**: 1-tap **"മക്കൾക്ക് WhatsApp അയക്കാം"** button sends pre-composed reminder alerts directly to the son or daughter's WhatsApp (`+91 7356568307`).

5. **Voice-Controlled Reminders**:
   - Speak e.g.: *"വൈകിട്ട് 4 മണിക്ക് ഗുളിക കഴിക്കാൻ ഓർമ്മിപ്പിക്കുക"* or *"Remind me to drink warm water at 11 AM"*.
   - Automatically calculates 24-hr time, categorizes (*medicine*, *doctor*, *daily*), saves to storage, and confirms by voice.
   - Dedicated **`🎙️ ശബ്ദം വഴി ചേർക്കുക` (Add by Voice)** button in the Reminders section.
   - Direct WhatsApp share button on every reminder card in the list.

6. **Medicine Strip & Bottle Reader + 1-Tap Purchase Request**:
   - Camera capture (`capture="environment"`) and image upload for medicine boxes and prescription strips.
   - Multimodal **Gemini 3.8 Flash Vision** processing for identifying brand names, active strengths, directions, and **clinical use of tablets in simple Malayalam**.
   - **1-Tap WhatsApp Buy Request for Daughter**: Scanned medicine image preview, quantity stepper (1, 2, 3... strips/bottles/boxes), urgency notes (*"ഗുളിക തീരാറായി, ഉടൻ വാങ്ങിത്തരണം"*), and 1-tap WhatsApp send to daughter (`+91 7356568307`).
   - Medical safety disclaimers: always advises consulting certified physicians and never fabricates unverified dosages.

7. **Document & Hospital Slip Reader**:
   - Upload letters, hospital slips, or utility bills to extract and summarize key points.
   - Audio readout for low-vision individuals.

8. **Accessibility & Cultural Design**:
   - **Extra-Large Home Voice Orb**: 170px glowing green orb with animated soundwaves.
   - **Large Text Mode**: Dynamically scales typography across the entire interface.
   - **High Contrast Mode**: Applies bold high-contrast outlines and clear borders.
   - **Kerala Cultural Aesthetics**: Warm ivory background (`#FFF9EF`), forest green palette (`#064F38`, `#B8ED65`), and backwater vector illustration.

---

## 🚀 Quickstart Guide

### Prerequisites
- Node.js >= 18
- Python >= 3.10

### 1. Backend Setup (FastAPI)
```bash
# From project root
PYTHONPATH=backend/venv/lib/python3.13/site-packages python3.13 -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
*(The `.env` file containing your `GEMINI_API_KEY` is loaded automatically)*

### 2. Frontend Setup (React 19 + Vite)
```bash
cd frontend
npm install
npm run dev
```

Visit [`http://localhost:5173`](http://localhost:5173) in your browser.

---

## 🌐 Production Cloud Deployment

### 1. Backend on Render
- **Blueprint Setup**: Render automatically detects the root [`render.yaml`](render.yaml) file.
- **Manual Setup**:
  - **Root Directory**: `backend`
  - **Runtime**: Python 3
  - **Build Command**: `pip install -r requirements.txt`
  - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
  - **Environment Variables**: Add `GEMINI_API_KEY`.

### 2. Frontend on Vercel
- **Root Directory**: `frontend`
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Environment Variable**: `VITE_BACKEND_URL` = `https://<your-render-service>.onrender.com`

---

## 📄 License
Built for accessible healthcare and assistive technology.
