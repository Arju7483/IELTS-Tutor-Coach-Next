'use client';

import React, { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import { PenTool, CheckCircle, RefreshCw, Send, AlertCircle, Sparkles, BookOpen, AlertTriangle } from 'lucide-react';

interface Question {
  _id: string;
  topic: string;
  difficulty: string;
  taskType: string;
  prompt: string;
}

interface Evaluation {
  band: number;
  taskAchievement: number;
  coherence: number;
  lexical: number;
  grammar: number;
  strengths: string;
  improvements: string;
}

export default function WritingPage() {
  const [metadata, setMetadata] = useState<{ topics: string[]; difficulties: string[]; taskTypes: string[] } | null>(null);
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [essay, setEssay] = useState('');
  const [wordCount, setWordCount] = useState(0);

  // States for fetching and evaluation
  const [fetchingQuestion, setFetchingQuestion] = useState(false);
  const [generatingQuestions, setGeneratingQuestions] = useState(false);
  const [customTopic, setCustomTopic] = useState('');
  const [showGenModal, setShowGenModal] = useState(false);

  const [evaluating, setEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [evalError, setEvalError] = useState<string | null>(null);

  // Loader texts rotation
  const [loaderText, setLoaderText] = useState('Initializing AI IELTS Examiner...');

  useEffect(() => {
    // Count words in essay
    const words = essay.trim() === '' ? 0 : essay.trim().split(/\s+/).length;
    setWordCount(words);
  }, [essay]);

  useEffect(() => {
    // Fetch filter metadata
    const fetchMetadata = async () => {
      try {
        const res = await fetch('/api/writing-task2/metadata');
        if (res.ok) {
          const data = await res.json();
          setMetadata(data);
        }
      } catch (err) {
        console.error('Failed to load metadata', err);
      }
    };
    fetchMetadata();
    fetchQuestion(); // Load initial question
  }, []);

  useEffect(() => {
    if (!evaluating) return;
    const texts = [
      'Initializing AI IELTS Examiner...',
      'Reading and parsing essay...',
      'Evaluating Task Achievement and Response Relevance...',
      'Analyzing Coherence, Cohesion, and paragraph structures...',
      'Assessing Lexical Resource and vocabulary density...',
      'Checking Grammatical Range and syntactical accuracy...',
      'Synthesizing examiner critiques and finalizing Band score...',
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
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/writing-task2/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ topic: topic || undefined, difficulty: difficulty || undefined }),
      });

      if (!res.ok) {
        throw new Error('Could not find or fetch questions matching selection.');
      }

      const q = await res.json();
      setCurrentQuestion(q);
      setEssay('');
    } catch (err: any) {
      setEvalError(err.message || 'Error loading question.');
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
      const res = await fetch('/api/writing-task2/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ topic: customTopic || undefined }),
      });

      if (!res.ok) {
        throw new Error('Failed to generate prompts via Gemini AI.');
      }

      setShowGenModal(false);
      setCustomTopic('');
      await fetchQuestion(); // Refresh with new generated question
    } catch (err: any) {
      setEvalError(err.message || 'Error generating prompt.');
    } finally {
      setGeneratingQuestions(false);
    }
  };

  const handleSubmitEssay = async () => {
    if (!currentQuestion) return;
    if (wordCount < 20) {
      setEvalError('Your essay must be at least 20 characters/words before submission.');
      return;
    }

    setEvaluating(true);
    setEvalError(null);
    setEvaluation(null);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/evaluate-writing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          essay,
          prompt: currentQuestion.prompt,
          questionId: currentQuestion._id,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Evaluation failed.');
      }

      const data = await res.json();
      setEvaluation(data);
    } catch (err: any) {
      setEvalError(err.message || 'Failed to analyze essay.');
    } finally {
      setEvaluating(false);
    }
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
              <PenTool className="w-8 h-8 text-primary" />
              Writing Task 2 Coach
            </h1>
            <p className="text-zinc-400 mt-2">Practice essay prompts and receive detailed criteria evaluations</p>
          </div>
          <button
            onClick={() => setShowGenModal(true)}
            className="self-start sm:self-auto px-5 py-3 rounded-2xl glass-card text-primary font-semibold text-sm hover:border-primary/40 flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            AI Prompt Generator
          </button>
        </div>

        {/* Filters and Controls */}
        <div className="glass-card p-6 rounded-2xl flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px] space-y-1.5">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Select Topic</span>
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full glass-input"
            >
              <option value="">All Topics</option>
              {metadata?.topics.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-[200px] space-y-1.5">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Select Difficulty</span>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full glass-input"
            >
              <option value="">All Difficulties</option>
              {metadata?.difficulties.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={fetchQuestion}
            disabled={fetchingQuestion}
            className="self-end px-6 py-3.5 rounded-xl bg-dark-light hover:bg-dark-border text-white border border-dark-border font-semibold flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${fetchingQuestion ? 'animate-spin' : ''}`} />
            Get New Question
          </button>
        </div>

        {evalError && (
          <div className="p-4 rounded-xl bg-rose-subtle border border-rose/30 text-rose flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-semibold">{evalError}</span>
          </div>
        )}

        {/* Prompt Card */}
        {currentQuestion && (
          <div className="glass-card p-6 md:p-8 rounded-3xl space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary-subtle text-primary border border-primary/10">
                {currentQuestion.topic}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-violet-subtle text-violet border border-violet/10">
                {currentQuestion.difficulty}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-zinc-800 text-zinc-400">
                {currentQuestion.taskType}
              </span>
            </div>
            <h2 className="font-display font-bold text-xl md:text-2xl text-white leading-snug">
              {currentQuestion.prompt}
            </h2>
          </div>
        )}

        {/* Main interactive area */}
        {currentQuestion && !evaluation && !evaluating && (
          <div className="space-y-4">
            <div className="flex justify-between items-center px-2">
              <span className="text-sm text-zinc-400 font-medium">Write your response in the box below:</span>
              <span
                className={`text-sm font-bold ${
                  wordCount >= 250 ? 'text-primary' : 'text-zinc-500'
                }`}
              >
                {wordCount} / 250 words
              </span>
            </div>

            {/* Word count progress bar */}
            <div className="w-full h-1 bg-dark-border rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  wordCount >= 250 ? 'bg-primary' : 'bg-violet'
                }`}
                style={{ width: `${Math.min((wordCount / 250) * 100, 100)}%` }}
              ></div>
            </div>

            <textarea
              value={essay}
              onChange={(e) => setEssay(e.target.value)}
              placeholder="Start typing your IELTS Task 2 essay response... Make sure to introduce the topic, present supporting paragraphs, and conclude. Aim for at least 250 words."
              className="w-full h-96 p-6 glass-card border border-dark-border rounded-3xl focus:outline-none focus:border-primary/50 text-white font-sans text-md leading-relaxed resize-y placeholder-zinc-600"
            />

            <div className="flex justify-end">
              <button
                onClick={handleSubmitEssay}
                disabled={wordCount < 20}
                className="px-8 py-4 rounded-2xl bg-primary text-dark font-bold text-md hover:scale-105 transition-all shadow-glow-primary flex items-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
              >
                Submit for Evaluation
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Loading Overlay state */}
        {evaluating && (
          <div className="glass-card p-12 rounded-3xl flex flex-col items-center justify-center text-center space-y-6">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
              <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
            </div>
            <div className="space-y-2 max-w-md">
              <h3 className="font-display font-extrabold text-xl text-white">Evaluating Essay</h3>
              <p className="text-zinc-400 text-sm font-medium animate-pulse">{loaderText}</p>
            </div>
          </div>
        )}

        {/* Evaluation Output */}
        {evaluation && !evaluating && (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-b border-dark-border pb-6">
              <div>
                <h2 className="font-display font-extrabold text-2xl text-white">Evaluation Score Breakdown</h2>
                <p className="text-zinc-400 text-sm mt-1">Based on global IELTS scoring guidelines</p>
              </div>
              <button
                onClick={() => {
                  setEvaluation(null);
                  setEssay('');
                }}
                className="self-start md:self-auto px-5 py-3 rounded-2xl bg-dark-light hover:bg-dark-border border border-dark-border font-semibold text-sm transition-all"
              >
                Practice Another Essay
              </button>
            </div>

            {/* Overall Score */}
            <div className="glass-card p-8 rounded-3xl flex flex-col sm:flex-row items-center gap-8 bg-gradient-to-r from-dark-card to-primary-subtle/20 border border-primary/20">
              <div className="w-28 h-28 rounded-full border-4 border-primary flex items-center justify-center flex-shrink-0 shadow-glow-primary bg-dark">
                <span className="font-display font-extrabold text-4xl text-primary">{evaluation.band}</span>
              </div>
              <div className="space-y-2 text-center sm:text-left">
                <h3 className="font-display font-extrabold text-2xl text-white">Overall Estimated Band</h3>
                <p className="text-zinc-400 text-sm leading-relaxed max-w-xl">
                  Your response demonstrates consistent performance across the scoring dimensions. Refer to the criteria averages below to address grammatical issues and boost vocabulary.
                </p>
              </div>
            </div>

            {/* Criteria Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="glass-card p-6 rounded-2xl border border-dark-border space-y-3">
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Task Achievement</p>
                <div className={`inline-flex px-3 py-1.5 rounded-lg text-sm font-extrabold border ${getScoreColor(evaluation.taskAchievement)}`}>
                  Band {evaluation.taskAchievement}
                </div>
                <p className="text-zinc-400 text-xs leading-relaxed">Response depth, supporting claims, and question relevance.</p>
              </div>

              <div className="glass-card p-6 rounded-2xl border border-dark-border space-y-3">
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Coherence & Cohesion</p>
                <div className={`inline-flex px-3 py-1.5 rounded-lg text-sm font-extrabold border ${getScoreColor(evaluation.coherence)}`}>
                  Band {evaluation.coherence}
                </div>
                <p className="text-zinc-400 text-xs leading-relaxed">Paragraph structure, linking phrases, and logical sequence.</p>
              </div>

              <div className="glass-card p-6 rounded-2xl border border-dark-border space-y-3">
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Lexical Resource</p>
                <div className={`inline-flex px-3 py-1.5 rounded-lg text-sm font-extrabold border ${getScoreColor(evaluation.lexical)}`}>
                  Band {evaluation.lexical}
                </div>
                <p className="text-zinc-400 text-xs leading-relaxed">Vocabulary range, precise phrasing, and advanced collocations.</p>
              </div>

              <div className="glass-card p-6 rounded-2xl border border-dark-border space-y-3">
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Grammar & Accuracy</p>
                <div className={`inline-flex px-3 py-1.5 rounded-lg text-sm font-extrabold border ${getScoreColor(evaluation.grammar)}`}>
                  Band {evaluation.grammar}
                </div>
                <p className="text-zinc-400 text-xs leading-relaxed">Sentence complexity, verb tenses, and punctuation errors.</p>
              </div>
            </div>

            {/* Critique Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="glass-card p-6 md:p-8 rounded-3xl border border-primary/10">
                <h3 className="font-display font-extrabold text-lg text-primary mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Key Strengths
                </h3>
                <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-line">{evaluation.strengths}</p>
              </div>

              <div className="glass-card p-6 md:p-8 rounded-3xl border border-rose/10">
                <h3 className="font-display font-extrabold text-lg text-rose mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Recommended Improvements
                </h3>
                <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-line">{evaluation.improvements}</p>
              </div>
            </div>
          </div>
        )}

        {/* AI Prompt Generator Modal */}
        {showGenModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-50">
            <div className="w-full max-w-md bg-dark-card p-8 rounded-3xl border border-primary/30 shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
              <h2 className="font-display font-extrabold text-2xl text-white mb-2 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-primary" />
                AI Prompt Builder
              </h2>
              <p className="text-zinc-400 text-sm mb-6">
                Tell Gemini what topic area you want to practice, and it will append new certified prompts to your selection.
              </p>

              <form onSubmit={handleGenerateQuestions} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Topic Theme</label>
                  <input
                    type="text"
                    required
                    value={customTopic}
                    onChange={(e) => setCustomTopic(e.target.value)}
                    placeholder="e.g. Space Exploration, Digital Privacy, Work-Life Balance"
                    className="w-full glass-input"
                  />
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
                    className="flex-1 py-3.5 rounded-xl bg-primary text-dark font-bold text-sm hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                  >
                    {generatingQuestions ? (
                      <span className="w-5 h-5 border-2 border-dark border-t-transparent rounded-full animate-spin"></span>
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
