'use client';

import React, { useEffect, useState, useRef } from 'react';
import AppShell from '@/components/AppShell';
import { Mic, Square, CheckCircle, RefreshCw, AlertCircle, Sparkles, User, FileAudio, Play, Pause } from 'lucide-react';

interface SpeakingQuestion {
  _id: string;
  topic: string;
  part: string;
  difficulty: string;
  prompt: string;
}

interface Evaluation {
  band: number;
  fluency: number;
  pronunciation: number;
  vocab: number;
  grammar: number;
  comment: string;
}

export default function SpeakingPage() {
  const [metadata, setMetadata] = useState<{ topics: string[]; parts: string[]; difficulties: string[] } | null>(null);
  const [topic, setTopic] = useState('');
  const [part, setPart] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState<SpeakingQuestion | null>(null);

  // States for AI Prompt generator
  const [customTopic, setCustomTopic] = useState('');
  const [customPart, setCustomPart] = useState('Part 2');
  const [showGenModal, setShowGenModal] = useState(false);
  const [generatingQuestions, setGeneratingQuestions] = useState(false);

  // Audio recording states
  const [permission, setPermission] = useState<boolean | null>(null);
  const [recordingState, setRecordingState] = useState<'idle' | 'recording' | 'paused'>('idle');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0); // in seconds
  const [playbackState, setPlaybackState] = useState<'idle' | 'playing' | 'paused'>('idle');

  // Recording time limit based on question part:
  // Part 1: 1 min (60s), Part 2: 2 mins (120s), Part 3: 4 mins (240s)
  const getMaxSpeakingLimit = (partName?: string) => {
    if (!partName) return 240;
    const p = partName.toLowerCase();
    if (p.includes('2') || p.includes('two')) return 120; // 2 minutes (Part 2)
    if (p.includes('3') || p.includes('three')) return 240; // 4 minutes (Part 3)
    if (p.includes('1') || p.includes('one')) return 60;  // 1 minute (Part 1)
    return 240;
  };

  const maxSpeakingLimit = getMaxSpeakingLimit(currentQuestion?.part || part);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioPlaybackRef = useRef<HTMLAudioElement | null>(null);

  const [fetchingQuestion, setFetchingQuestion] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [evalError, setEvalError] = useState<string | null>(null);
  const [loaderText, setLoaderText] = useState('Opening secure audio link...');

  useEffect(() => {
    // Fetch filter metadata
    const fetchMetadata = async () => {
      try {
        const res = await fetch('/api/speaking-questions/metadata');
        if (res.ok) {
          const data = await res.json();
          setMetadata(data);
        }
      } catch (err) {
        console.error('Failed to load metadata', err);
      }
    };
    fetchMetadata();
    fetchQuestion();

    // Check microphone permission
    if (typeof window !== 'undefined' && navigator.mediaDevices) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(() => setPermission(true))
        .catch(() => setPermission(false));
    }
  }, []);

  useEffect(() => {
    // Handle timer for recording
    if (recordingState === 'recording') {
      timerRef.current = setInterval(() => {
        setElapsedTime((prev) => {
          if (prev + 1 >= maxSpeakingLimit) {
            handleStopRecording();
            return maxSpeakingLimit;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [recordingState, maxSpeakingLimit]);

  useEffect(() => {
    if (!evaluating) return;
    const texts = [
      'Extracting vocal waveforms...',
      'De-noising background environment audio...',
      'Transcribing speeches using Google Cloud speech filters...',
      'Analyzing lexical diversity and sentence coherence...',
      'Evaluating pronunciation, pauses, and speech delivery rate...',
      'Checking syntactic structures and grammar accuracies...',
      'Synthesizing verbal comments and computing final IELTS Speaking Band...',
    ];
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % texts.length;
      setLoaderText(texts[index]);
    }, 3500);

    return () => clearInterval(interval);
  }, [evaluating]);

  const fetchQuestion = async () => {
    setFetchingQuestion(true);
    setEvalError(null);
    setEvaluation(null);
    setAudioUrl(null);
    setAudioBlob(null);
    setElapsedTime(0);
    setRecordingState('idle');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/speaking-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          topic: topic || undefined,
          part: part || undefined,
          difficulty: difficulty || undefined,
        }),
      });

      if (!res.ok) {
        throw new Error('No unseen speaking cards match selection.');
      }

      const q = await res.json();
      setCurrentQuestion(q);
    } catch (err: any) {
      setEvalError(err.message || 'Error loading card.');
    } finally {
      setFetchingQuestion(false);
    }
  };

  const handleGenerateQuestions = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneratingQuestions(true);
    setEvalError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/speaking-questions/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          topic: customTopic || undefined,
          part: customPart || undefined,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to generate prompts via Gemini.');
      }

      setShowGenModal(false);
      setCustomTopic('');
      await fetchQuestion(); // Refresh
    } catch (err: any) {
      setEvalError(err.message || 'Error generating prompts.');
    } finally {
      setGeneratingQuestions(false);
    }
  };

  const handleStartRecording = async () => {
    if (!permission) {
      alert('Microphone permission is required to practice speaking.');
      return;
    }

    setAudioUrl(null);
    setAudioBlob(null);
    setElapsedTime(0);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioBlob(audioBlob);
        setAudioUrl(audioUrl);
      };

      mediaRecorder.start();
      setRecordingState('recording');
    } catch (err) {
      console.error('Error starting MediaRecorder:', err);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      // Stop all tracks on the stream to release the mic icon in the browser
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
    }
    setRecordingState('idle');
  };

  const handlePauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setRecordingState('paused');
    }
  };

  const handleResumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setRecordingState('recording');
    }
  };

  const handlePlayback = () => {
    if (!audioUrl) return;

    if (!audioPlaybackRef.current) {
      const audio = new Audio(audioUrl);
      audio.onended = () => setPlaybackState('idle');
      audioPlaybackRef.current = audio;
    }

    if (playbackState === 'playing') {
      audioPlaybackRef.current.pause();
      setPlaybackState('paused');
    } else {
      audioPlaybackRef.current.play();
      setPlaybackState('playing');
    }
  };

  const handleSubmitSpeech = async () => {
    if (!audioBlob || !currentQuestion) return;

    setEvaluating(true);
    setEvalError(null);
    setEvaluation(null);

    const reader = new FileReader();
    reader.readAsDataURL(audioBlob);
    reader.onloadend = async () => {
      try {
        const base64Audio = (reader.result as string).split(',')[1];
        const token = localStorage.getItem('token');
        const res = await fetch('/api/evaluate-speaking', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            audioBase64: base64Audio,
            mimeType: 'audio/webm',
            questionId: currentQuestion._id,
            questionPrompt: currentQuestion.prompt,
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Fluency evaluation failed.');
        }

        const data = await res.json();
        setEvaluation(data);
      } catch (err: any) {
        setEvalError(err.message || 'Speech evaluation failed.');
      } finally {
        setEvaluating(false);
      }
    };
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 7.5) return 'text-primary border-primary/20 bg-primary-subtle';
    if (score >= 6.5) return 'text-violet border-violet/20 bg-violet-subtle';
    if (score >= 5.5) return 'text-accent border-accent/20 bg-accent-subtle';
    return 'text-rose border-rose/20 bg-rose-subtle';
  };

  return (
    <AppShell>
      <div className="space-y-8 animate-slide-up">
        {/* Page title & actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl font-extrabold text-white flex items-center gap-3">
              <Mic className="w-8 h-8 text-primary" />
              Speaking Practice
            </h1>
            <p className="text-zinc-400 mt-2">Record speeches (Part 2: 2 mins, Part 3: 4 mins) and receive instant, criterion feedback</p>
          </div>
          <button
            onClick={() => setShowGenModal(true)}
            className="self-start sm:self-auto px-5 py-3 rounded-2xl glass-card text-primary font-semibold text-sm hover:border-primary/40 flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            AI Prompt Generator
          </button>
        </div>

        {/* Filters */}
        <div className="glass-card p-6 rounded-2xl flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[150px] space-y-1.5">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Select Topic</span>
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={recordingState !== 'idle'}
              className="w-full glass-input disabled:opacity-50"
            >
              <option value="">All Topics</option>
              {metadata?.topics.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-[150px] space-y-1.5">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Select Part</span>
            <select
              value={part}
              onChange={(e) => setPart(e.target.value)}
              disabled={recordingState !== 'idle'}
              className="w-full glass-input disabled:opacity-50"
            >
              <option value="">All Parts</option>
              {metadata?.parts.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={fetchQuestion}
            disabled={fetchingQuestion || recordingState !== 'idle'}
            className="self-end px-6 py-3.5 rounded-xl bg-dark-light hover:bg-dark-border text-white border border-dark-border font-semibold flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${fetchingQuestion ? 'animate-spin' : ''}`} />
            Get New Card
          </button>
        </div>

        {evalError && (
          <div className="p-4 rounded-xl bg-rose-subtle border border-rose/30 text-rose flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-semibold">{evalError}</span>
          </div>
        )}

        {/* Question Prompt Card */}
        {currentQuestion && (
          <div className="glass-card p-6 md:p-8 rounded-3xl space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary-subtle text-primary border border-primary/10">
                {currentQuestion.topic}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-violet-subtle text-violet border border-violet/10">
                {currentQuestion.part}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-zinc-800 text-zinc-400">
                {currentQuestion.difficulty}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-accent-subtle text-accent border border-accent/20">
                {formatTime(maxSpeakingLimit)} limit
              </span>
            </div>
            <div className="space-y-3">
              <p className="text-xs uppercase font-bold text-zinc-500 tracking-widest">Candidate Cue Prompt:</p>
              <h2 className="font-display font-bold text-xl md:text-2xl text-white leading-relaxed whitespace-pre-line">
                {currentQuestion.prompt}
              </h2>
            </div>
          </div>
        )}

        {/* Recorder interface */}
        {currentQuestion && !evaluation && !evaluating && (
          <div className="glass-card p-8 rounded-3xl flex flex-col items-center justify-center space-y-6 text-center">
            {/* Circle Wave Graphic */}
            <div className="relative flex items-center justify-center w-36 h-36">
              <div
                className={`absolute inset-0 rounded-full bg-primary/10 border border-primary/20 transition-all duration-700 ${
                  recordingState === 'recording' ? 'scale-125 opacity-100 animate-pulse-glow' : 'scale-100'
                }`}
              ></div>
              <div
                className={`absolute w-28 h-28 rounded-full bg-dark flex flex-col items-center justify-center border-2 ${
                  recordingState === 'recording'
                    ? 'border-primary'
                    : recordingState === 'paused'
                    ? 'border-accent'
                    : 'border-zinc-700'
                }`}
              ></div>
              <Mic
                className={`relative w-10 h-10 z-10 ${
                  recordingState === 'recording'
                    ? 'text-primary'
                    : recordingState === 'paused'
                    ? 'text-accent'
                    : 'text-zinc-400'
                }`}
              />
            </div>

            {/* Time progress */}
            <div className="space-y-2">
              <div className="text-2xl font-mono font-bold text-white">
                {formatTime(elapsedTime)} <span className="text-zinc-500 text-sm">/ {formatTime(maxSpeakingLimit)}</span>
              </div>
              <p className="text-xs text-zinc-400 font-medium">
                {recordingState === 'recording'
                  ? 'Speak clearly into your microphone...'
                  : recordingState === 'paused'
                  ? 'Recording paused. Press resume to continue.'
                  : audioBlob
                  ? 'Speech recorded successfully. Listen to preview or submit.'
                  : 'Press the microphone icon below to start speaking.'}
              </p>
            </div>

            {/* Buttons control */}
            <div className="flex items-center gap-4">
              {recordingState === 'idle' && !audioBlob && (
                <button
                  onClick={handleStartRecording}
                  className="px-6 py-3.5 rounded-2xl bg-primary text-dark font-bold hover:scale-105 transition-all shadow-glow-primary flex items-center gap-2"
                >
                  <Mic className="w-5 h-5" /> Start Recording
                </button>
              )}

              {recordingState === 'recording' && (
                <>
                  <button
                    onClick={handlePauseRecording}
                    className="p-4 rounded-full bg-zinc-800 hover:bg-zinc-700 text-accent flex items-center justify-center transition-all border border-zinc-700"
                    title="Pause Recording"
                  >
                    <Pause className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleStopRecording}
                    className="px-6 py-3.5 rounded-2xl bg-rose text-white font-bold hover:scale-105 transition-all shadow-glow-rose flex items-center gap-2"
                  >
                    <Square className="w-5 h-5" /> Stop
                  </button>
                </>
              )}

              {recordingState === 'paused' && (
                <>
                  <button
                    onClick={handleResumeRecording}
                    className="px-6 py-3.5 rounded-2xl bg-primary text-dark font-bold hover:scale-105 transition-all shadow-glow-primary flex items-center gap-2"
                  >
                    <Mic className="w-5 h-5" /> Resume
                  </button>
                  <button
                    onClick={handleStopRecording}
                    className="px-6 py-3.5 rounded-2xl bg-rose text-white font-bold hover:scale-105 transition-all shadow-glow-rose flex items-center gap-2"
                  >
                    <Square className="w-5 h-5" /> Finish
                  </button>
                </>
              )}
            </div>

            {/* Audio Preview and submit */}
            {audioBlob && recordingState === 'idle' && (
              <div className="w-full max-w-md pt-4 border-t border-dark-border space-y-4">
                <div className="flex items-center justify-between p-4 bg-dark-light/40 border border-dark-border rounded-2xl">
                  <div className="flex items-center gap-3">
                    <FileAudio className="w-6 h-6 text-violet animate-float" />
                    <div className="text-left">
                      <p className="text-sm font-semibold text-white">Speeches.webm</p>
                      <p className="text-xs text-zinc-500 font-mono">
                        Approx: {Math.round(audioBlob.size / 1024)} KB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handlePlayback}
                    className="p-3 rounded-full bg-zinc-800 text-white hover:bg-zinc-700 transition-colors"
                  >
                    {playbackState === 'playing' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={handleStartRecording}
                    className="flex-1 py-3.5 rounded-xl border border-zinc-700 hover:bg-zinc-800 font-semibold text-sm text-zinc-300"
                  >
                    Record Again
                  </button>
                  <button
                    onClick={handleSubmitSpeech}
                    className="flex-1 py-3.5 rounded-xl bg-primary text-dark font-bold text-sm hover:scale-[1.02] transition-all flex items-center justify-center gap-2 shadow-glow-primary"
                  >
                    Analyze Speech
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Loading overlay */}
        {evaluating && (
          <div className="glass-card p-12 rounded-3xl flex flex-col items-center justify-center text-center space-y-6">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 rounded-full border-4 border-violet/20"></div>
              <div className="absolute inset-0 rounded-full border-4 border-violet border-t-transparent animate-spin"></div>
            </div>
            <div className="space-y-2 max-w-md">
              <h3 className="font-display font-extrabold text-xl text-white">Analyzing Speech Recording</h3>
              <p className="text-zinc-400 text-sm font-medium animate-pulse">{loaderText}</p>
            </div>
          </div>
        )}

        {/* Evaluation Output */}
        {evaluation && !evaluating && (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-b border-dark-border pb-6">
              <div>
                <h2 className="font-display font-extrabold text-2xl text-white">Speech Critique Summary</h2>
                <p className="text-zinc-400 text-sm mt-1">Based on IELTS vocal grading rubrics</p>
              </div>
              <button
                onClick={() => {
                  setEvaluation(null);
                  setAudioUrl(null);
                  setAudioBlob(null);
                  setElapsedTime(0);
                }}
                className="self-start md:self-auto px-5 py-3 rounded-2xl bg-dark-light hover:bg-dark-border border border-dark-border font-semibold text-sm transition-all"
              >
                Attempt Another Topic
              </button>
            </div>

            {/* Overall Score */}
            <div className="glass-card p-8 rounded-3xl flex flex-col sm:flex-row items-center gap-8 bg-gradient-to-r from-dark-card to-violet-subtle/20 border border-violet/20">
              <div className="w-28 h-28 rounded-full border-4 border-violet flex items-center justify-center flex-shrink-0 shadow-glow-violet bg-dark">
                <span className="font-display font-extrabold text-4xl text-violet">{evaluation.band}</span>
              </div>
              <div className="space-y-2 text-center sm:text-left">
                <h3 className="font-display font-extrabold text-2xl text-white">Overall Band Score</h3>
                <p className="text-zinc-400 text-sm leading-relaxed max-w-xl">
                  Gemini verified your overall verbal delivery. To boost your scores, examine the fluency, pronunciation, grammar and vocabulary feedback criteria.
                </p>
              </div>
            </div>

            {/* Criteria Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="glass-card p-6 rounded-2xl border border-dark-border space-y-3">
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Fluency & Coherence</p>
                <div className={`inline-flex px-3 py-1.5 rounded-lg text-sm font-extrabold border ${getScoreColor(evaluation.fluency)}`}>
                  Band {evaluation.fluency}
                </div>
                <p className="text-zinc-400 text-xs leading-relaxed">Speech delivery rate, pauses, self-correction, and flow.</p>
              </div>

              <div className="glass-card p-6 rounded-2xl border border-dark-border space-y-3">
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Pronunciation</p>
                <div className={`inline-flex px-3 py-1.5 rounded-lg text-sm font-extrabold border ${getScoreColor(evaluation.pronunciation)}`}>
                  Band {evaluation.pronunciation}
                </div>
                <p className="text-zinc-400 text-xs leading-relaxed">Word stress, vowels clarity, accents, and comprehensibility.</p>
              </div>

              <div className="glass-card p-6 rounded-2xl border border-dark-border space-y-3">
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Lexical Resource</p>
                <div className={`inline-flex px-3 py-1.5 rounded-lg text-sm font-extrabold border ${getScoreColor(evaluation.vocab)}`}>
                  Band {evaluation.vocab}
                </div>
                <p className="text-zinc-400 text-xs leading-relaxed">Idioms, precise vocabulary choices, and paraphrasing.</p>
              </div>

              <div className="glass-card p-6 rounded-2xl border border-dark-border space-y-3">
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Grammatical Precision</p>
                <div className={`inline-flex px-3 py-1.5 rounded-lg text-sm font-extrabold border ${getScoreColor(evaluation.grammar)}`}>
                  Band {evaluation.grammar}
                </div>
                <p className="text-zinc-400 text-xs leading-relaxed">Sentence complexity, verb structures, and systematic errors.</p>
              </div>
            </div>

            {/* Critique Details */}
            <div className="glass-card p-6 md:p-8 rounded-3xl border border-violet/10">
              <h3 className="font-display font-extrabold text-lg text-violet mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Examiner Critiques & Suggestions
              </h3>
              <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-line">{evaluation.comment}</p>
            </div>
          </div>
        )}

        {/* AI Prompt Modal */}
        {showGenModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-50">
            <div className="w-full max-w-md bg-dark-card p-8 rounded-3xl border border-violet/30 shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
              <h2 className="font-display font-extrabold text-2xl text-white mb-2 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-violet" />
                AI speaking prompt
              </h2>
              <p className="text-zinc-400 text-sm mb-6 font-medium">
                Provide a topic name, and Gemini will generate a new set of Part 1, Part 2, or Part 3 questions.
              </p>

              <form onSubmit={handleGenerateQuestions} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Speaking Topic Theme</label>
                  <input
                    type="text"
                    required
                    value={customTopic}
                    onChange={(e) => setCustomTopic(e.target.value)}
                    placeholder="e.g. Traditional Festivals, Local Cuisine, Urban Transport"
                    className="w-full glass-input"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">IELTS Speaking Part</label>
                  <select
                    value={customPart}
                    onChange={(e) => setCustomPart(e.target.value)}
                    className="w-full glass-input"
                  >
                    <option value="Part 1">Part 1 (Short Q&A - 1 min limit)</option>
                    <option value="Part 2">Part 2 (Long Turn Cue Card - 2 mins limit)</option>
                    <option value="Part 3">Part 3 (Analytical Discussion - 4 mins limit)</option>
                  </select>
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setShowGenModal(false)}
                    className="flex-1 py-3.5 rounded-xl border border-zinc-700 hover:bg-zinc-800 font-semibold text-sm text-zinc-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={generatingQuestions}
                    className="flex-1 py-3.5 rounded-xl bg-violet text-white font-bold text-sm hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                  >
                    {generatingQuestions ? (
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      'Generate Now'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
