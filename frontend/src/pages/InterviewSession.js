import React, { useEffect, useMemo, useRef, useState } from "react";
import GlassCard from "../components/GlassCard";
import ScoreMeter from "../components/ScoreMeter";
import LoadingSpinner from "../components/LoadingSpinner";
import { api } from "../api";

const InterviewSession = () => {
  const [answer, setAnswer] = useState("");
  const [timeLeft, setTimeLeft] = useState(150);
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState({ sessionId: null, questions: [] });
  const [activeIndex, setActiveIndex] = useState(0);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState("");
  const [skills, setSkills] = useState([]);
  const [timerRunning, setTimerRunning] = useState(true);
  const [aiMode, setAiMode] = useState("classic");
  const [streamingText, setStreamingText] = useState("");
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceError, setVoiceError] = useState("");
  const [visionSupported, setVisionSupported] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [faceConfidence, setFaceConfidence] = useState(0);
  const [faceStatus, setFaceStatus] = useState("Camera off");
  const recognitionRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const detectorRef = useRef(null);
  const detectTimerRef = useRef(null);

  useEffect(() => {
    const canUse = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
    setVoiceSupported(canUse);
    setVisionSupported(!!window.FaceDetector);
  }, []);

  useEffect(() => {
    if (!voiceSupported) return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      let finalText = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        if (result.isFinal) {
          finalText += result[0].transcript;
        }
      }
      if (finalText) {
        setAnswer((prev) => `${prev}${prev ? " " : ""}${finalText.trim()}`);
      }
    };

    recognition.onerror = (event) => {
      setVoiceError(event.error || "Voice input error.");
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;
  }, [voiceSupported]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 && timerRunning ? prev - 1 : prev));
    }, 1000);
    return () => clearInterval(timer);
  }, [timerRunning]);

  useEffect(() => {
    api.resumeSkills()
      .then((data) => {
        setSkills(data.skills || []);
        return api.startInterview({ sessionType: "technical", skills: data.skills || [], aiMode });
      })
      .then((data) => {
        setSession(data);
        setActiveIndex(0);
      })
      .catch((err) => setError(err.message));
  }, [aiMode]);

  useEffect(() => {
    return () => {
      if (detectTimerRef.current) {
        clearInterval(detectTimerRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const activeQuestion = session.questions[activeIndex];
  const progress = session.questions.length
    ? Math.round(((activeIndex + 1) / session.questions.length) * 100)
    : 0;

  const keywords = useMemo(() => {
    return activeQuestion?.keywordsFound || [];
  }, [activeQuestion]);

  const handleSubmit = async () => {
    if (!activeQuestion) return;
    setLoading(true);
    setError("");
    setStreamingText("");
    try {
      if (aiMode === "llm") {
        await api.submitAnswerStream(
          {
            sessionId: session.sessionId,
            questionId: activeQuestion.questionId,
            userAnswer: answer,
            timeSpent: 150 - timeLeft
          },
          (delta) => {
            setStreamingText((prev) => prev + delta);
          },
          (done) => {
            setAnalysis(done);
            setTimerRunning(false);
          }
        );
      } else {
        const result = await api.submitAnswer({
          sessionId: session.sessionId,
          questionId: activeQuestion.questionId,
          userAnswer: answer,
          timeSpent: 150 - timeLeft,
          aiMode
        });
        setAnalysis(result);
        setTimerRunning(false);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const nextQuestion = () => {
    setAnswer("");
    setAnalysis(null);
    setStreamingText("");
    setActiveIndex((prev) => Math.min(session.questions.length - 1, prev + 1));
    setTimeLeft(150);
    setTimerRunning(true);
  };

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    setVoiceError("");
    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      recognitionRef.current.start();
      setListening(true);
    }
  };

  const stopCamera = () => {
    if (detectTimerRef.current) {
      clearInterval(detectTimerRef.current);
      detectTimerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraOn(false);
    setFaceStatus("Camera off");
    setFaceConfidence(0);
  };

  const startCamera = async () => {
    if (!visionSupported) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      detectorRef.current = new window.FaceDetector({ fastMode: true, maxDetectedFaces: 1 });
      setCameraOn(true);
      setFaceStatus("Scanning...");

      if (detectTimerRef.current) clearInterval(detectTimerRef.current);
      detectTimerRef.current = setInterval(async () => {
        if (!videoRef.current || !detectorRef.current) return;
        try {
          const faces = await detectorRef.current.detect(videoRef.current);
          if (!faces.length) {
            setFaceStatus("No face detected");
            setFaceConfidence((prev) => Math.max(0, prev - 5));
            return;
          }
          const face = faces[0];
          const box = face.boundingBox;
          const videoWidth = videoRef.current.videoWidth || 1;
          const videoHeight = videoRef.current.videoHeight || 1;

          const faceArea = (box.width * box.height) / (videoWidth * videoHeight);
          const centerX = (box.x + box.width / 2) / videoWidth;
          const centerY = (box.y + box.height / 2) / videoHeight;
          const centerScore = 1 - Math.min(1, Math.abs(centerX - 0.5) + Math.abs(centerY - 0.5));
          const sizeScore = Math.min(1, Math.max(0, (faceArea - 0.05) / 0.25));
          const rawScore = Math.round((centerScore * 0.5 + sizeScore * 0.5) * 100);

          setFaceConfidence(rawScore);
          setFaceStatus(rawScore >= 70 ? "Confident presence" : rawScore >= 45 ? "Steady presence" : "Needs focus");
        } catch {
          setFaceStatus("Scanning...");
        }
      }, 900);
    } catch (err) {
      setFaceStatus("Camera permission denied");
      setCameraOn(false);
    }
  };

  const minutes = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const seconds = String(timeLeft % 60).padStart(2, "0");

  return (
    <div>
      <section className="section">
        <GlassCard>
          <div className="section-caption">Skill Focus</div>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {skills.map((skill) => (
              <span className="badge" key={skill.skill || skill}>#{skill.skill || skill}</span>
            ))}
          </div>
        </GlassCard>
      </section>

      <section className="section">
        <GlassCard>
          <div className="section-caption">AI Mode</div>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "12px" }}>
            <button
              className={aiMode === "classic" ? "primary-button" : "secondary-button"}
              onClick={() => setAiMode("classic")}
            >
              Classic Scoring
            </button>
            <button
              className={aiMode === "llm" ? "primary-button" : "secondary-button"}
              onClick={() => setAiMode("llm")}
            >
              AI Feedback
            </button>
          </div>
          <h2>Interview Session #{session.sessionId?.slice(-4) || "123"}</h2>
          <div className="section-caption">Question {activeIndex + 1} of {session.questions.length || 1}</div>
          <div className="progress-bar" style={{ marginTop: "10px" }}>
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <h3 style={{ marginTop: "16px" }}>{activeQuestion?.questionText || "Preparing your question set..."}</h3>
          <div className="input-group">
            <label>Your Answer</label>
            <textarea
              className="textarea-field"
              rows="5"
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              placeholder="Type your answer here..."
            />
            <div className="section-caption">{answer.length} characters</div>
            {voiceSupported && (
              <div className="voice-controls">
                <button
                  className={listening ? "primary-button" : "secondary-button"}
                  type="button"
                  onClick={toggleListening}
                >
                  {listening ? "Stop Voice" : "Start Voice"}
                </button>
                <span className="section-caption">
                  {listening ? "Listening... Speak clearly." : "Use voice to answer hands-free."}
                </span>
              </div>
            )}
            {voiceError && (
              <div className="badge" style={{ background: "rgba(239, 68, 68, 0.2)" }}>{voiceError}</div>
            )}
            {!voiceSupported && (
              <div className="section-caption">Voice input not supported in this browser.</div>
            )}
          </div>
          <div className="badge">Time Remaining: {minutes}:{seconds}</div>
          {error && <div className="badge" style={{ background: "rgba(239, 68, 68, 0.2)" }}>{error}</div>}
          <div style={{ marginTop: "16px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <button className="primary-button" onClick={handleSubmit} disabled={loading || !activeQuestion}>
              Submit Answer
            </button>
            <button className="secondary-button" onClick={nextQuestion} disabled={activeIndex >= session.questions.length - 1}>
              Next Question
            </button>
          </div>
          {loading && (
            <div style={{ marginTop: "16px" }}>
              <LoadingSpinner />
            </div>
          )}
        </GlassCard>
      </section>

      <section className="section">
        <GlassCard>
          <h3>Confidence Check (Camera)</h3>
          <div className="section-caption">Your camera feed stays on your device. Nothing is uploaded.</div>
          <div className="face-check">
            <div className="face-video">
              <video ref={videoRef} muted playsInline />
            </div>
            <div className="face-panel">
              <div className="section-caption">Status</div>
              <div className="face-status">{faceStatus}</div>
              <div className="section-caption" style={{ marginTop: "12px" }}>Confidence Meter</div>
              <div className="face-meter">
                <div className="face-meter-fill" style={{ width: `${faceConfidence}%` }} />
              </div>
              <div className="section-caption">{faceConfidence}%</div>
              <div style={{ marginTop: "12px" }}>
                {!cameraOn ? (
                  <button
                    className="secondary-button"
                    onClick={startCamera}
                    disabled={!visionSupported}
                  >
                    {visionSupported ? "Enable Camera" : "Face detection not supported"}
                  </button>
                ) : (
                  <button className="secondary-button" onClick={stopCamera}>
                    Stop Camera
                  </button>
                )}
              </div>
            </div>
          </div>
        </GlassCard>
      </section>

      <section className="section">
        <GlassCard>
          <h3>AI Analysis</h3>
          <ScoreMeter label="Similarity Score" value={analysis?.similarityScore || 0} />
          <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", marginTop: "20px" }}>
            <div className="confidence-orb">
              <div className="confidence-level">{analysis?.confidenceScore ? `${analysis.confidenceScore}%` : "-"}</div>
            </div>
            <div>
              <div className="section-caption">Feedback</div>
              <p>{analysis?.feedback || streamingText || "Submit an answer to receive feedback."}</p>
              <div className="section-caption">Keywords Detected</div>
              {(analysis?.keywordsFound || keywords || []).map((keyword) => (
                <span className="badge" key={keyword}>{keyword}</span>
              ))}
            </div>
          </div>
        </GlassCard>
      </section>
    </div>
  );
};

export default InterviewSession;
