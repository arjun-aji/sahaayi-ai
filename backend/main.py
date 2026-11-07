import os
import sys
import json
import base64
import threading
import time
import subprocess
import re
from datetime import datetime
import urllib.request
import urllib.error
import urllib.parse
from typing import List, Optional, Tuple

# Automatically locate and add venv site-packages if running directly
_backend_dir = os.path.dirname(os.path.abspath(__file__))
_venv_pkgs = os.path.join(_backend_dir, "venv", "lib", "python3.13", "site-packages")
if os.path.exists(_venv_pkgs) and _venv_pkgs not in sys.path:
    sys.path.insert(0, _venv_pkgs)

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Automatically load .env file if present
def load_env_file():
    candidates = [
        os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env"),
        os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".env"),
        ".env",
        "backend/.env",
        "../.env"
    ]
    for p in candidates:
        if os.path.exists(p):
            try:
                with open(p, "r", encoding="utf-8") as f:
                    for line in f:
                        line = line.strip()
                        if line and not line.startswith("#") and "=" in line:
                            k, v = line.split("=", 1)
                            os.environ[k.strip()] = v.strip().strip('"').strip("'")
            except Exception:
                pass

load_env_file()

def get_api_key():
    load_env_file()
    return os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")

app = FastAPI(
    title="Sahaayi AI Backend",
    description="Voice-First Accessibility Companion API",
    version="1.0.0"
)

# Enable CORS for local frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ReminderModel(BaseModel):
    id: str
    title: str
    titleMl: Optional[str] = None
    time: str
    category: Optional[str] = "medicine"
    createdAt: Optional[str] = None

REMINDERS_FILE = os.path.join(_backend_dir, "reminders.json")

def load_backend_reminders() -> List[dict]:
    if not os.path.exists(REMINDERS_FILE):
        return []
    try:
        with open(REMINDERS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return []

def save_backend_reminders(reminders: List[dict]):
    try:
        with open(REMINDERS_FILE, "w", encoding="utf-8") as f:
            json.dump(reminders, f, indent=2, ensure_ascii=False)
    except Exception as e:
        print(f"Error saving backend reminders: {e}")

def normalize_time_str(time_val: str) -> str:
    if not time_val:
        return "09:00"
    clean = str(time_val).strip().lower()
    m = re.search(r'(\d{1,2})([:.](\d{2}))?\s*(am|pm)?', clean)
    if not m:
        return "09:00"
    hours = int(m.group(1))
    minutes = int(m.group(3)) if m.group(3) else 0
    is_pm = 'pm' in clean or 'വൈകിട്ട്' in clean or 'വൈകുന്നേരം' in clean or 'രാത്രി' in clean or 'ഉച്ചയ്ക്ക്' in clean
    is_am = 'am' in clean or 'രാവിലെ' in clean
    if is_pm and hours < 12:
        hours += 12
    elif is_am and hours == 12:
        hours = 0
    return f"{hours:02d}:{minutes:02d}"

triggered_today_keys = set()

def trigger_macos_alarm(title: str, time_str: str):
    """Fires native macOS sound, banner notification, and voice alert even if browser is closed."""
    print(f"⏰ [Sahaayi Native Alarm Triggered]: {title} at {time_str}")
    # 1. Play Glass sound via macOS afplay
    try:
        subprocess.Popen(["afplay", "/System/Library/Sounds/Glass.aiff"])
    except Exception:
        pass

    # 2. Native macOS Notification Banner
    try:
        clean_title = title.replace('"', '\\"')
        script = f'display notification "{clean_title}" with title "Sahaayi AI (സഹായി)" subtitle "Time: {time_str}" sound name "Glass"'
        subprocess.Popen(["osascript", "-e", script])
    except Exception as e:
        print(f"Notification error: {e}")

    # 3. Native macOS Spoken Announcement
    try:
        speech_text = f"Reminder for {title}."
        subprocess.Popen(["say", speech_text])
    except Exception:
        pass

def reminder_background_daemon():
    """Background daemon loop: continuously monitors reminders every 3 seconds."""
    while True:
        try:
            now = datetime.now()
            current_hh_mm = now.strftime("%H:%M")
            today_date = now.strftime("%Y-%m-%d")

            reminders = load_backend_reminders()
            for rem in reminders:
                norm_time = normalize_time_str(rem.get("time", ""))
                if norm_time == current_hh_mm:
                    rem_id = rem.get("id", rem.get("title", ""))
                    trigger_key = f"{rem_id}-{today_date}-{current_hh_mm}"
                    if trigger_key not in triggered_today_keys:
                        triggered_today_keys.add(trigger_key)
                        title_text = rem.get("titleMl") or rem.get("title", "Medicine")
                        trigger_macos_alarm(title_text, current_hh_mm)
                        break
        except Exception as e:
            print(f"Daemon loop notice: {e}")
        time.sleep(3)

# Start background daemon on server startup
_daemon_thread = threading.Thread(target=reminder_background_daemon, daemon=True)
_daemon_thread.start()

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    language: Optional[str] = "en"  # "en" or "ml"
    history: Optional[List[ChatMessage]] = []

class ChatResponse(BaseModel):
    reply: str
    language: str
    is_ai_generated: bool
    model_status: str
    reminder_action: Optional[dict] = None

@app.get("/")
def root():
    api_key = get_api_key()
    return {
        "status": "online",
        "service": "Sahaayi AI Backend",
        "version": "1.0.0",
        "ai_model_configured": bool(api_key)
    }

@app.get("/health")
def health():
    api_key = get_api_key()
    return {
        "status": "healthy",
        "gemini_api_key_configured": bool(api_key)
    }

def chunk_text_for_tts(text: str, max_chars: int = 90) -> List[str]:
    """Split Malayalam or English text into natural spoken phrases <= max_chars for Google TTS."""
    # Clean brackets, quotes, markdown formatting
    cleaned = (
        text.replace("(", " ")
        .replace(")", " ")
        .replace('"', " ")
        .replace("'", " ")
        .replace("[", " ")
        .replace("]", " ")
        .replace("*", " ")
        .replace("#", " ")
    )

    # Split into raw sentence chunks by punctuation
    delimiters = [". ", "! ", "? ", ".\n", "!\n", "?\n", "\n"]
    raw_segments = [cleaned]
    for d in delimiters:
        next_segments = []
        for s in raw_segments:
            next_segments.extend(s.split(d))
        raw_segments = next_segments

    chunks = []
    for segment in raw_segments:
        segment = segment.strip()
        if not segment:
            continue
        if len(segment) <= max_chars:
            chunks.append(segment)
        else:
            # Further split long sentences by comma or space
            sub_segments = segment.split(", ")
            for sub in sub_segments:
                sub = sub.strip()
                if not sub:
                    continue
                if len(sub) <= max_chars:
                    chunks.append(sub)
                else:
                    words = sub.split(" ")
                    buf = ""
                    for w in words:
                        if not w:
                            continue
                        if len(buf) + len(w) + 1 <= max_chars:
                            buf = (buf + " " + w).strip()
                        else:
                            if buf:
                                chunks.append(buf)
                            buf = w
                    if buf:
                        chunks.append(buf)
    return chunks[:8]  # Up to 8 chunks (~600 chars) for smooth, natural audio playback

@app.get("/tts")
def tts_endpoint(text: str, lang: str = "ml"):
    """Server-side audio TTS proxy for authentic Malayalam speech audio."""
    if not text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")

    target_lang = "ml" if (lang == "ml" or any('\u0d00' <= c <= '\u0d7f' for c in text)) else "en"
    chunks = chunk_text_for_tts(text, max_chars=90)
    if not chunks:
        chunks = [text[:90].strip()]

    audio_stream = bytearray()
    for chunk in chunks:
        if not chunk.strip():
            continue
        encoded = urllib.parse.quote(chunk.strip())
        url = f"https://translate.google.com/translate_tts?ie=UTF-8&q={encoded}&tl={target_lang}&client=tw-ob"
        req = urllib.request.Request(
            url,
            headers={
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Referer": "https://translate.google.com/"
            }
        )
        try:
            with urllib.request.urlopen(req, timeout=6) as r:
                audio_stream.extend(r.read())
        except Exception as e:
            print(f"TTS fetch warning for chunk '{chunk[:30]}...': {e}")
            continue

    if not audio_stream:
        raise HTTPException(status_code=500, detail="Could not generate TTS audio")

    return Response(content=bytes(audio_stream), media_type="audio/mpeg")

def call_gemini_api(prompt: str, language: str) -> Tuple[Optional[str], Optional[str]]:
    """Call Google Gemini REST API. Returns (reply_text, error_message)."""
    api_key = get_api_key()
    if not api_key:
        return None, "No API key configured"

    # Try latest current models first
    models_to_try = ["gemini-3.8-flash", "gemini-3.5-flash-lite", "gemini-3.1-flash-lite", "gemini-2.5-flash", "gemini-1.5-flash"]
    last_err = None

    has_malayalam = any('\u0d00' <= char <= '\u0d7f' for char in prompt)
    is_malayalam_request = (language == "ml") or has_malayalam

    system_instruction = (
        "You are Sahaayi AI (സഹായി), a gentle, highly accessible healthcare and daily companion for senior citizens and low-vision individuals in Kerala. "
        "Keep answers concise, warm, clear, and reassuring (maximum 2-3 short sentences, ideal for text-to-speech audio). "
        "Never invent prescription dosages or provide formal medical diagnoses; advise consulting a physician when appropriate. "
        "REMINDER INSTRUCTION: If the user asks to set, create, or remember a reminder (e.g., 'remind me to take my medicine at 4 PM', 'വൈകിട്ട് 4 മണിക്ക് ഗുളിക കഴിക്കാൻ ഓർമ്മിപ്പിക്കുക', 'രാവിലെ 8 മണിക്ക് നടക്കുക'): "
        "1. Confirm warmly in your speech that you have scheduled this reminder for them. "
        "2. At the very end of your response on a new line, add: "
        "[REMINDER: {\"title\": \"<short title>\", \"time\": \"<HH:MM in 24hr format>\", \"category\": \"medicine|doctor|daily\"}] "
    )
    if is_malayalam_request:
        system_instruction += (
            "CRITICAL LANGUAGE INSTRUCTION: The user is communicating in Malayalam. "
            "You MUST respond ONLY in natural, fluent Malayalam script (മലയാളത്തിൽ മാത്രം മറുപടി നൽകുക). "
            "Do NOT reply in English."
        )
    else:
        system_instruction += "Respond in clear, friendly English."

    payload = {
        "contents": [
            {
                "parts": [
                    {"text": f"Instruction: {system_instruction}\n\nUser Question: {prompt}"}
                ]
            }
        ]
    }

    headers = {
        "Content-Type": "application/json",
        "x-goog-api-key": api_key
    }

    for model in models_to_try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
        try:
            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode("utf-8"),
                headers=headers
            )
            with urllib.request.urlopen(req, timeout=15) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                candidates = data.get("candidates", [])
                if candidates:
                    text_part = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                    return text_part.strip(), None
        except urllib.error.HTTPError as he:
            err_body = he.read().decode('utf-8', errors='ignore')
            print(f"Gemini API ({model}) HTTP Error {he.code}: {err_body}")
            try:
                parsed_err = json.loads(err_body)
                last_err = parsed_err.get("error", {}).get("message", err_body)
            except Exception:
                last_err = err_body
        except Exception as e:
            print(f"Error calling Gemini API ({model}): {e}")
            last_err = str(e)

    return None, last_err

def call_gemini_vision(image_bytes: bytes, mime_type: str, instruction: str) -> Tuple[Optional[str], Optional[str]]:
    """Multimodal vision call to Gemini. Returns (analysis_text, error_message)."""
    api_key = get_api_key()
    if not api_key:
        return None, "No API key configured"

    vision_models = ["gemini-3.8-flash", "gemini-3.5-flash-lite", "gemini-1.5-flash"]
    b64_image = base64.b64encode(image_bytes).decode("utf-8")

    payload = {
        "contents": [
            {
                "parts": [
                    {"text": instruction},
                    {
                        "inline_data": {
                            "mime_type": mime_type or "image/jpeg",
                            "data": b64_image
                        }
                    }
                ]
            }
        ]
    }

    headers = {
        "Content-Type": "application/json",
        "x-goog-api-key": api_key
    }

    for model in vision_models:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
        try:
            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode("utf-8"),
                headers=headers
            )
            with urllib.request.urlopen(req, timeout=20) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                candidates = data.get("candidates", [])
                if candidates:
                    text_part = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                    return text_part.strip(), None
        except urllib.error.HTTPError as he:
            err_body = he.read().decode('utf-8', errors='ignore')
            print(f"Gemini Vision ({model}) HTTP Error {he.code}: {err_body}")
        except Exception as e:
            print(f"Error calling Gemini Vision API ({model}): {e}")

    return None, "Vision analysis could not be completed"

@app.post("/chat", response_model=ChatResponse)
def chat_endpoint(request: ChatRequest):
    user_msg = request.message.strip()
    if not user_msg:
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    has_ml = any('\u0d00' <= char <= '\u0d7f' for char in user_msg)
    is_ml = (request.language == "ml") or has_ml
    lang_to_use = "ml" if is_ml else (request.language or "en")
    api_key = get_api_key()

    # If GEMINI_API_KEY is configured, call the live model
    if api_key:
        ai_reply, err = call_gemini_api(user_msg, lang_to_use)
        if ai_reply:
            reminder_action = None
            # Check if Gemini included [REMINDER: {...}]
            import re
            rem_match = re.search(r'\[REMINDER:\s*(\{.*?\})\]', ai_reply, re.DOTALL)
            if rem_match:
                try:
                    reminder_action = json.loads(rem_match.group(1))
                    # Strip the tag from the spoken reply
                    ai_reply = re.sub(r'\[REMINDER:\s*\{.*?\}\]', '', ai_reply, flags=re.DOTALL).strip()
                except Exception as parse_err:
                    print(f"Failed to parse reminder JSON: {parse_err}")

            return ChatResponse(
                reply=ai_reply,
                language=lang_to_use,
                is_ai_generated=True,
                model_status="configured",
                reminder_action=reminder_action
            )
        else:
            # If Google API returned an error, report it clearly
            if is_ml:
                error_reply = (
                    f"ഗൂഗിൾ ജെമിനി എപിഐ ബന്ധിപ്പിക്കാൻ ശ്രമിച്ചപ്പോൾ ഒരു തടസ്സമുണ്ടായി: {err}. "
                    "ദയവായി https://aistudio.google.com/app/apikey സന്ദർശിച്ച് എപിഐ കീ പരിശോധിക്കുക."
                )
            else:
                error_reply = (
                    f"Gemini API returned an error: {err}. "
                    "Please check your API key at https://aistudio.google.com/app/apikey"
                )
            return ChatResponse(
                reply=error_reply,
                language=lang_to_use,
                is_ai_generated=False,
                model_status="error"
            )

    # When no external AI API key is configured
    if is_ml:
        notice_reply = (
            f"നിങ്ങളുടെ സന്ദേശം ലഭിച്ചു: \"{user_msg}\". "
            "ഫാസ്റ്റ്എപിഐ (FastAPI) ബാക്കെൻഡ് വിജയകരമായി കണക്ട് ചെയ്തിട്ടുണ്ട്. "
            "സെർവറിൽ GEMINI_API_KEY നൽകിയാൽ തത്സമയ AI മോഡൽ ഉത്തരങ്ങൾ ലഭ്യമാകും."
        )
    else:
        notice_reply = (
            f"Received your message: \"{user_msg}\". "
            "The FastAPI backend is connected and working! "
            "Once a GEMINI_API_KEY is provided in .env, Sahaayi AI will deliver live generated responses."
        )

    return ChatResponse(
        reply=notice_reply,
        language=lang_to_use,
        is_ai_generated=False,
        model_status="unconfigured"
    )

@app.post("/read-medicine")
async def read_medicine_endpoint(file: UploadFile = File(...), language: Optional[str] = "ml"):
    """Receives a medicine image. If Gemini API key is present, runs multimodal vision analysis."""
    contents = await file.read()
    file_size_kb = round(len(contents) / 1024, 1)
    api_key = get_api_key()

    is_ml = (language == "ml")

    if api_key:
        if is_ml:
            vision_prompt = (
                "You are Sahaayi AI (സഹായി), a gentle, expert, and accessible healthcare companion for senior citizens in Kerala. "
                "Examine this medicine packaging, strip, tablet, or bottle photo carefully. "
                "You MUST identify the medicine and use your medical knowledge to explicitly explain WHAT THIS TABLET IS COMMONLY USED FOR in simple, reassuring Malayalam that an elderly grandmother or grandfather can easily understand. "
                "Structure your reply naturally in 3 to 4 clear sentences: "
                "1. മരുന്നിന്റെ പേര്: Identify the brand name and strength (e.g. 'ഇത് ഫിബേറ്റർ 5 (Fibator 5) ഗുളികയാണ്'). "
                "2. എന്തിനുള്ള മരുന്ന് (PRIMARY USE - CRITICAL): Clearly state what condition, symptom, or disease this tablet is prescribed for in everyday Malayalam words (e.g. 'ഇത് എന്തിനുള്ള മരുന്നാണ്: കൊളസ്ട്രോളും രക്തത്തിലെ കൊഴുപ്പും കുറയ്ക്കാനാണ് ഈ ഗുളിക സാധാരണയായി കഴിക്കുന്നത്' / 'ഇത് രക്തസമ്മർദ്ദം (പ്രഷർ) നിയന്ത്രിക്കാനാണ്' / 'ഇത് പ്രമേഹം (ഷുഗർ) കുറയ്ക്കാനാണ്' / 'ഇത് പനിയും ശരീരവേദനയും മാറാനാണ്' / 'ഇത് ഗ്യാസും അസിഡിറ്റിയും കുറയ്ക്കാനാണ്'). "
                "3. ഘടകങ്ങൾ (Active Salt): Mention the main active chemical salts simply. "
                "4. നിർദ്ദേശം: Remind them to take it only according to their doctor's prescribed dosage and timing. "
                "IMPORTANT: You MUST explain the use of the tablet clearly so the senior knows why it is taken. Reply entirely in natural, reassuring Malayalam."
            )
        else:
            vision_prompt = (
                "You are Sahaayi AI, a gentle and accessible healthcare companion for senior citizens. "
                "Examine this medicine packaging, strip, or bottle carefully. "
                "Identify the medicine and use your medical knowledge to explicitly explain WHAT THIS TABLET IS COMMONLY USED FOR in simple, clear language: "
                "1. Medicine Name & Strength. "
                "2. Primary Use / Purpose (CRITICAL): Clearly explain what condition or symptom this tablet treats (e.g. used to lower cholesterol and triglycerides, control high blood pressure, manage diabetes, relieve fever and pain, or treat acidity) so an elderly person clearly understands why it is taken. "
                "3. Active Ingredients. "
                "4. Doctor's Advice: Remind them to always take it according to their doctor's exact prescription. "
                "Keep it clear and reassuring in 3 to 4 sentences."
            )

        analysis, err = call_gemini_vision(contents, file.content_type, vision_prompt)
        if analysis:
            return {
                "status": "success",
                "filename": file.filename,
                "content_type": file.content_type,
                "size_kb": file_size_kb,
                "vision_model_configured": True,
                "analysis": analysis,
                "message": analysis
            }

    return {
        "status": "success",
        "filename": file.filename,
        "content_type": file.content_type,
        "size_kb": file_size_kb,
        "vision_model_configured": bool(api_key),
        "message": (
            (f"മരുന്ന് ഫോട്ടോ '{file.filename}' ലഭിച്ചു. സെർവറിൽ GEMINI_API_KEY നൽകിയാൽ തത്സമയ വിവരണം ലഭിക്കും." if is_ml else f"Medicine photo '{file.filename}' ({file_size_kb} KB) received.")
        )
    }

@app.post("/read-document")
async def read_document_endpoint(file: UploadFile = File(...), language: Optional[str] = "ml"):
    """Receives a document file. If Gemini API key is present, extracts and summarizes text."""
    contents = await file.read()
    file_size_kb = round(len(contents) / 1024, 1)
    api_key = get_api_key()

    is_ml = (language == "ml")

    if api_key and file.content_type.startswith("image/"):
        doc_prompt = (
            "You are Sahaayi AI document reading assistant for low-vision senior citizens. "
            "Read and summarize the text in this document clearly: main subject, key dates/numbers/hospital names, and next steps. "
            "Keep it clear and reassuring (2-4 sentences)."
        )
        if is_ml:
            doc_prompt += (
                " CRITICAL LANGUAGE INSTRUCTION: You MUST reply entirely in natural, fluent Malayalam script (മലയാളത്തിൽ മാത്രം വിശദീകരിക്കുക). "
                "Do NOT reply in English."
            )

        analysis, err = call_gemini_vision(contents, file.content_type, doc_prompt)
        if analysis:
            return {
                "status": "success",
                "filename": file.filename,
                "content_type": file.content_type,
                "size_kb": file_size_kb,
                "ocr_model_configured": True,
                "analysis": analysis,
                "message": analysis
            }
        analysis, err = call_gemini_vision(contents, file.content_type, doc_prompt)
        if analysis:
            return {
                "status": "success",
                "filename": file.filename,
                "content_type": file.content_type,
                "size_kb": file_size_kb,
                "ocr_model_configured": True,
                "analysis": analysis,
                "message": analysis
            }

    return {
        "status": "success",
        "filename": file.filename,
        "content_type": file.content_type,
        "size_kb": file_size_kb,
        "ocr_model_configured": bool(api_key),
        "message": (
            f"Document '{file.filename}' ({file_size_kb} KB) received by FastAPI backend. "
            + ("OCR model is configured." if api_key else "OCR text extraction is not configured yet in the backend (set GEMINI_API_KEY). No document text was fabricated.")
        )
    }


class WhatsAppReminderRequest(BaseModel):
    phone: Optional[str] = "+91 7356568307"
    title: str
    time: str
    lang: Optional[str] = "ml"


@app.post("/api/whatsapp-reminder")
def whatsapp_reminder_endpoint(payload: WhatsAppReminderRequest):
    """
    Prepares and logs WhatsApp alert for son/daughter/caregiver.
    """
    raw_phone = payload.phone or "+91 7356568307"
    clean_digits = "".join(filter(str.isdigit, raw_phone))
    if len(clean_digits) == 10:
        clean_digits = "91" + clean_digits

    if payload.lang == "ml":
        msg = (
            f"🔔 *സഹായി AI (Sahaayi) - ഓർമ്മപ്പെടുത്തൽ*\n"
            f"---------------------------------------\n"
            f"⏰ *സമയം:* {payload.time}\n"
            f"💊 *കാര്യം:* {payload.title}\n\n"
            f"അച്ഛൻ / അമ്മയുടെ ഓർമ്മപ്പെടുത്തൽ സമയമായിട്ടുണ്ട്.\n"
            f"(Sahaayi AI Senior Alert for Family)"
        )
    else:
        msg = (
            f"🔔 *Sahaayi AI - Senior Reminder Alert*\n"
            f"---------------------------------------\n"
            f"⏰ *Time:* {payload.time}\n"
            f"💊 *Task / Medicine:* {payload.title}\n\n"
            f"Senior reminder alert sent via Sahaayi AI Companion."
        )

    wa_url = f"https://wa.me/{clean_digits}?text={urllib.parse.quote(msg)}"
    print(f"[WhatsApp Alert] Prepared reminder notification for {clean_digits}: {payload.title} at {payload.time}")

    return {
        "status": "success",
        "phone": clean_digits,
        "whatsapp_url": wa_url,
        "message": msg
    }


if __name__ == "__main__":
    import uvicorn
    is_in_backend = os.path.basename(os.getcwd()) == "backend"
    target = "main:app" if is_in_backend else "backend.main:app"
    print("Starting Sahaayi AI server on http://127.0.0.1:8000 ...")
    uvicorn.run(target, host="127.0.0.1", port=8000, reload=True)
