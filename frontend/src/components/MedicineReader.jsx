import { useState, useRef, useEffect, useCallback } from 'react';
import { IconCamera, IconPill, IconShield, IconSpeaker, IconStop } from './Icons';
import { speakText, stopSpeech } from '../utils/speech';
import { uploadMedicineImage } from '../utils/api';

export function MedicineReader({ t, lang, slowerSpeech }) {
  const [cameraError, setCameraError] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  // Automatically start live camera on mount
  useEffect(() => {
    let isMounted = true;

    async function initCamera() {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        if (isMounted) {
          setCameraError(
            lang === 'ml'
              ? 'ഈ ബ്രൗസറിൽ തത്സമയ ക്യാമറ ലഭ്യമല്ല. ദയവായി താഴെയുള്ള ഫയൽ അപ്‌ലോഡ് ബട്ടൺ ഉപയോഗിക്കുക.'
              : 'Live camera is not supported in this browser. Please use the file upload option below.'
          );
        }
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        });

        if (!isMounted) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      } catch {
        if (isMounted) {
          setCameraError(
            lang === 'ml'
              ? 'ക്യാമറ അനുമതി നൽകിയിട്ടില്ല. ബ്രൗസറിൽ ക്യാമറ അനുവദിക്കുക അല്ലെങ്കിൽ ഫോട്ടോ തിരഞ്ഞെടുക്കുക.'
              : 'Camera permission denied or camera unavailable. Please allow camera access or upload an image.'
          );
        }
      }
    }

    initCamera();

    return () => {
      isMounted = false;
      stopCamera();
      stopSpeech();
    };
  }, [lang, stopCamera]);

  // Analyze an image blob with backend Gemini Vision
  const analyzeImageBlob = useCallback(async (blob, previewDataUrl) => {
    setCapturedImage(previewDataUrl);
    stopCamera();
    setIsProcessing(true);
    setAnalysisResult(null);

    const analyzingVoice = lang === 'ml'
      ? 'ഫോട്ടോ ലഭിച്ചു! മരുന്ന് പരിശോധിക്കുന്നു, ഒരു നിമിഷം...'
      : 'Photo captured! Analyzing your medicine packaging, one moment...';
    speakText(analyzingVoice, lang, slowerSpeech);

    try {
      const file = new File([blob], 'captured_medicine.jpg', { type: 'image/jpeg' });
      const res = await uploadMedicineImage(file, lang);

      setIsProcessing(false);

      let textResult = '';
      if (res.success && res.data) {
        textResult = res.data.analysis || res.data.message;
      } else {
        textResult = lang === 'ml'
          ? 'മരുന്ന് വിവരണം തയ്യാറാക്കാൻ സാധിച്ചില്ല. വീണ്ടും വ്യക്തമായി ഫോട്ടോ എടുക്കാൻ ശ്രമിക്കുക.'
          : 'Could not analyze medicine. Please try capturing a clearer photo.';
      }

      setAnalysisResult(textResult);

      // Automatically speak the full Gemini analysis aloud!
      setIsSpeaking(true);
      speakText(
        textResult,
        lang,
        slowerSpeech,
        () => setIsSpeaking(true),
        () => setIsSpeaking(false),
        () => setIsSpeaking(false)
      );

    } catch {
      setIsProcessing(false);
      const errMsg = lang === 'ml'
        ? 'ബാക്കെൻഡ് ബന്ധിപ്പിക്കുന്നതിൽ തടസ്സമുണ്ടായി. വീണ്ടും ശ്രമിക്കുക.'
        : 'Error communicating with AI backend. Please try again.';
      setAnalysisResult(errMsg);
      speakText(errMsg, lang, slowerSpeech);
    }
  }, [lang, slowerSpeech, stopCamera]);

  // Click shutter to capture current video frame
  const handleCapturePhoto = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const previewUrl = canvas.toDataURL('image/jpeg', 0.9);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          analyzeImageBlob(blob, previewUrl);
        }
      },
      'image/jpeg',
      0.9
    );
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        analyzeImageBlob(file, reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRetake = () => {
    stopSpeech();
    setIsSpeaking(false);
    setCameraError(null);
    setCapturedImage(null);
    setAnalysisResult(null);
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false
      }).then((stream) => {
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      }).catch(() => {});
    }
  };

  const handleToggleSpeak = () => {
    if (isSpeaking) {
      stopSpeech();
      setIsSpeaking(false);
      return;
    }

    if (analysisResult) {
      setIsSpeaking(true);
      speakText(
        analysisResult,
        lang,
        slowerSpeech,
        () => setIsSpeaking(true),
        () => setIsSpeaking(false),
        () => setIsSpeaking(false)
      );
    }
  };

  return (
    <section className="feature-panel medicine-panel" aria-labelledby="medicine-title">
      <div className="panel-header">
        <div className="panel-title-group">
          <div className="panel-icon-wrap" aria-hidden="true">
            <IconPill className="panel-header-icon" />
          </div>
          <div>
            <h2 id="medicine-title" className="panel-heading">{t.medicineHeading}</h2>
            <p className="panel-subheading">{t.medicineSubtitle}</p>
          </div>
        </div>

        <div className="medicine-header-actions">
          {capturedImage && (
            <button
              type="button"
              className="retake-photo-btn"
              onClick={handleRetake}
            >
              <IconCamera className="w-5 h-5" />
              <span>{lang === 'ml' ? 'മറ്റൊരു ഫോട്ടോ എടുക്കുക' : 'Take Another Photo'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Camera Viewfinder or Captured Preview Card */}
      <div className="camera-viewfinder-card">
        {!capturedImage ? (
          <div className="live-camera-wrapper">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="camera-video-stream"
            />
            {/* Camera Target Guidelines Overlay */}
            <div className="camera-targeting-reticle" aria-hidden="true">
              <span className="reticle-corner corner-tl" />
              <span className="reticle-corner corner-tr" />
              <span className="reticle-corner corner-bl" />
              <span className="reticle-corner corner-br" />
              <p className="reticle-hint-text">
                {lang === 'ml' 
                  ? 'ക്യാമറയ്ക്ക് മുന്നിൽ മരുന്ന് കവർ കാണിക്കുക' 
                  : 'Place medicine strip or bottle inside the box'}
              </p>
            </div>

            {/* Shutter Button Bar */}
            <div className="camera-controls-bar">
              <button
                type="button"
                className="big-shutter-btn"
                onClick={handleCapturePhoto}
                aria-label="Capture Photo"
              >
                <div className="shutter-inner-ring">
                  <IconCamera className="shutter-icon" />
                </div>
                <span className="shutter-label">
                  {lang === 'ml' ? 'ഫോട്ടോ എടുക്കുക' : 'Capture & Analyze'}
                </span>
              </button>
            </div>
          </div>
        ) : (
          <div className="captured-photo-wrapper">
            <img
              src={capturedImage}
              alt="Captured medicine packaging"
              className="captured-preview-img"
            />
            {isProcessing && (
              <div className="analyzing-overlay-badge" aria-live="polite">
                <div className="spinner-ring" />
                <span>
                  {lang === 'ml' 
                    ? 'സഹായി AI മരുന്ന് പരിശോധിക്കുന്നു...' 
                    : 'Sahaayi AI is analyzing the medicine...'}
                </span>
              </div>
            )}
          </div>
        )}

        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>

      {/* Fallback File Upload Bar */}
      {!capturedImage && (
        <div className="camera-fallback-bar">
          <label htmlFor="medicine-file-upload" className="file-upload-link-btn">
            <span>📁 {lang === 'ml' ? 'ഫോട്ടോ ഫയലിൽ നിന്ന് തിരഞ്ഞെടുക്കാം' : 'Upload photo from files instead'}</span>
            <input
              id="medicine-file-upload"
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="sr-only"
              onChange={handleFileUpload}
            />
          </label>
          {cameraError && <p className="camera-error-hint">{cameraError}</p>}
        </div>
      )}

      {/* Analysis Result Card with Voice Playback */}
      {analysisResult && (
        <div className="analysis-result-panel" role="region" aria-live="polite">
          <div className="analysis-card-header">
            <div className="analysis-card-title-group">
              <div className="analysis-icon-pill">
                <IconPill className="w-5 h-5 text-emerald-800" width={22} height={22} />
              </div>
              <div>
                <h3 className="analysis-heading">
                  {lang === 'ml' ? 'മരുന്ന് വിവരങ്ങൾ' : 'Medicine Explanation'}
                </h3>
                <span className="analysis-tagline">
                  {lang === 'ml' ? 'സഹായി AI തത്സമയം തയ്യാറാക്കിയത്' : 'Powered by Gemini 3.8 Flash'}
                </span>
              </div>
            </div>

            <button
              type="button"
              className={`analysis-speak-btn ${isSpeaking ? 'is-speaking' : ''}`}
              onClick={handleToggleSpeak}
              aria-label={isSpeaking ? t.stopSpeakingBtn : t.speakBtn}
            >
              {isSpeaking ? (
                <IconStop className="w-5 h-5" width={20} height={20} />
              ) : (
                <IconSpeaker className="w-5 h-5" width={20} height={20} />
              )}
              <span>{isSpeaking ? (lang === 'ml' ? 'ശബ്ദം നിർത്തുക' : 'Stop Voice') : (lang === 'ml' ? 'വീണ്ടും കേൾക്കുക' : 'Read Aloud')}</span>
            </button>
          </div>

          <div className="analysis-text-content">
            <p className="analysis-body-text">{analysisResult}</p>
          </div>

          <div className="analysis-safety-footer">
            <IconShield className="w-5 h-5 text-amber-700 flex-shrink-0" width={22} height={22} />
            <p className="safety-footer-text">
              {lang === 'ml'
                ? 'പ്രധാനം: മരുന്നിന്റെ കൃത്യമായ അളവ് നിങ്ങളുടെ ഡോക്ടറുടെ നിർദ്ദേശപ്രകാരം മാത്രം കഴിക്കുക.'
                : 'Important: Always confirm medication dosages with your certified doctor or pharmacist.'}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
