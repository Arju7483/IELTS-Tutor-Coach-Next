'use client';

import React, { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import { BookOpen, Sparkles, AlertCircle, Plus, Trash2, ArrowLeft, ArrowRight, RotateCw, Volume2 } from 'lucide-react';

interface VocabWord {
  _id: string;
  word: string;
  phonetic: string | null;
  partOfSpeech: string | null;
  definition: string;
  example: string;
  synonyms: string[];
  difficulty: 'band7' | 'band8' | 'band9';
  userId?: string;
}

export default function VocabPage() {
  const [words, setWords] = useState<VocabWord[]>([]);
  const [filterDifficulty, setFilterDifficulty] = useState<string>(''); // empty means All
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination / Deck traversal
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // AI Vocabulary Generator Modal
  const [showGenModal, setShowGenModal] = useState(false);
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState<'band7' | 'band8' | 'band9'>('band8');
  const [cardCount, setCardCount] = useState(5);
  const [generating, setGenerating] = useState(false);

  // Manual Creation Modal
  const [showManualModal, setShowManualModal] = useState(false);
  const [newWord, setNewWord] = useState({
    word: '',
    phonetic: '',
    partOfSpeech: 'noun',
    definition: '',
    example: '',
    synonyms: '',
    difficulty: 'band8' as 'band7' | 'band8' | 'band9',
  });
  const [savingManual, setSavingManual] = useState(false);

  useEffect(() => {
    fetchVocab();
  }, []);

  const fetchVocab = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/vocab', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error('Failed to load vocabulary list.');
      }

      const data = await res.json();
      setWords(data);
      setCurrentIndex(0);
      setIsFlipped(false);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch cards.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setGenerating(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/vocab/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          topic,
          difficulty,
          count: cardCount,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to generate vocabulary cards.');
      }

      const data = await res.json();
      setShowGenModal(false);
      setTopic('');
      
      // Prepend or Append new words
      setWords((prev) => [...data.words, ...prev]);
      setCurrentIndex(0);
      setIsFlipped(false);
    } catch (err: any) {
      setError(err.message || 'Generation failed.');
    } finally {
      setGenerating(false);
    }
  };

  const handleCreateManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWord.word.trim() || !newWord.definition.trim()) return;

    setSavingManual(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/vocab', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...newWord,
          synonyms: newWord.synonyms.split(',').map((s) => s.trim()).filter(Boolean),
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to create vocabulary word.');
      }

      const created = await res.json();
      setWords((prev) => [created, ...prev]);
      setShowManualModal(false);
      setNewWord({
        word: '',
        phonetic: '',
        partOfSpeech: 'noun',
        definition: '',
        example: '',
        synonyms: '',
        difficulty: 'band8',
      });
      setCurrentIndex(0);
      setIsFlipped(false);
    } catch (err: any) {
      setError(err.message || 'Failed to save card.');
    } finally {
      setSavingManual(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this custom flashcard?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/vocab/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error('Failed to delete vocabulary card.');
      }

      setWords((prev) => prev.filter((w) => w._id !== id));
      // Adjust currentIndex if necessary
      setCurrentIndex((prev) => {
        if (prev >= words.length - 1) {
          return Math.max(0, words.length - 2);
        }
        return prev;
      });
      setIsFlipped(false);
    } catch (err: any) {
      setError(err.message || 'Delete failed.');
    }
  };

  // Text-to-speech speaker output
  const handleSpeak = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  const filteredWords = words.filter((w) => {
    if (!filterDifficulty) return true;
    return w.difficulty === filterDifficulty;
  });

  const activeCard = filteredWords[currentIndex];

  const handleNext = () => {
    if (currentIndex < filteredWords.length - 1) {
      setIsFlipped(false);
      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
      }, 150);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setTimeout(() => {
        setCurrentIndex((prev) => prev - 1);
      }, 150);
    }
  };

  const getDifficultyLabel = (diff: string) => {
    switch (diff) {
      case 'band7':
        return 'Band 7 (Good)';
      case 'band8':
        return 'Band 8 (Very Good)';
      case 'band9':
        return 'Band 9 (Expert)';
      default:
        return diff;
    }
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'band7':
        return 'text-accent border-accent/20 bg-accent-subtle';
      case 'band8':
        return 'text-violet border-violet/20 bg-violet-subtle';
      case 'band9':
        return 'text-primary border-primary/20 bg-primary-subtle';
      default:
        return 'text-zinc-400 border-zinc-700 bg-zinc-800';
    }
  };

  return (
    <AppShell>
      <div className="space-y-8 animate-slide-up">
        {/* Title */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl font-extrabold text-white flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-primary animate-float" />
              Smart Vocabulary Cards
            </h1>
            <p className="text-zinc-400 mt-2">Practice flipping flashcards and generate theme-focused Band 7/8/9 vocabulary</p>
          </div>
          <div className="flex items-center gap-3 self-start sm:self-auto">
            <button
              onClick={() => setShowManualModal(true)}
              className="px-4 py-3 rounded-2xl glass-card border-zinc-700 hover:border-zinc-500 font-semibold text-sm text-zinc-300 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Word
            </button>
            <button
              onClick={() => setShowGenModal(true)}
              className="px-5 py-3 rounded-2xl bg-primary text-dark font-bold text-sm hover:scale-105 transition-all shadow-glow-primary flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" /> AI Generator
            </button>
          </div>
        </div>

        {/* Filter controls */}
        <div className="glass-card p-4 rounded-2xl flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider pl-2">Filter Level:</span>
            <button
              onClick={() => {
                setFilterDifficulty('');
                setCurrentIndex(0);
                setIsFlipped(false);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                filterDifficulty === ''
                  ? 'bg-zinc-100 text-dark border-zinc-200'
                  : 'bg-zinc-800/40 text-zinc-400 border-zinc-700/50 hover:text-white'
              }`}
            >
              All Words
            </button>
            <button
              onClick={() => {
                setFilterDifficulty('band7');
                setCurrentIndex(0);
                setIsFlipped(false);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                filterDifficulty === 'band7'
                  ? 'bg-accent text-dark border-accent'
                  : 'bg-accent-subtle/20 text-accent border-accent/20 hover:bg-accent-subtle/40'
              }`}
            >
              Band 7
            </button>
            <button
              onClick={() => {
                setFilterDifficulty('band8');
                setCurrentIndex(0);
                setIsFlipped(false);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                filterDifficulty === 'band8'
                  ? 'bg-violet text-white border-violet shadow-glow-violet'
                  : 'bg-violet-subtle/20 text-violet border-violet/20 hover:bg-violet-subtle/40'
              }`}
            >
              Band 8
            </button>
            <button
              onClick={() => {
                setFilterDifficulty('band9');
                setCurrentIndex(0);
                setIsFlipped(false);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                filterDifficulty === 'band9'
                  ? 'bg-primary text-dark border-primary shadow-glow-primary'
                  : 'bg-primary-subtle/20 text-primary border-primary/20 hover:bg-primary-subtle/40'
              }`}
            >
              Band 9
            </button>
          </div>
          <div className="text-xs font-bold text-zinc-500 px-2 uppercase tracking-widest">
            Total Cards: {filteredWords.length}
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-subtle border border-rose/30 text-rose flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-semibold">{error}</span>
          </div>
        )}

        {loading ? (
          <div className="h-96 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
          </div>
        ) : filteredWords.length === 0 ? (
          <div className="glass-card p-12 rounded-3xl text-center space-y-4">
            <BookOpen className="w-12 h-12 text-zinc-600 mx-auto" />
            <h3 className="font-display font-bold text-xl text-white">No flashcards found</h3>
            <p className="text-zinc-500 text-sm max-w-sm mx-auto">
              No vocabulary words match the selected level. Try resetting filters or generate custom cards using the AI Generator.
            </p>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Flashcard Frame */}
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className="w-full h-96 relative cursor-pointer perspective-1000 group"
            >
              <div
                className={`w-full h-full duration-500 preserve-3d absolute transition-transform ${
                  isFlipped ? 'rotate-y-180' : ''
                }`}
              >
                {/* Front Side */}
                <div className="absolute w-full h-full backface-hidden glass-card p-8 md:p-10 rounded-3xl flex flex-col justify-between border border-dark-border bg-gradient-to-tr from-dark-card to-zinc-900/10">
                  {/* Top line */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${getDifficultyColor(
                        activeCard.difficulty
                      )}`}
                    >
                      {getDifficultyLabel(activeCard.difficulty)}
                    </span>
                    {activeCard.userId && activeCard.userId !== 'system' && (
                      <button
                        onClick={(e) => handleDelete(activeCard._id, e)}
                        className="p-2.5 rounded-xl bg-rose-subtle text-rose hover:bg-rose hover:text-white transition-colors border border-rose/10"
                        title="Delete custom word"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Word Content */}
                  <div className="text-center space-y-3">
                    <h2 className="font-display text-4xl md:text-5xl font-extrabold text-white tracking-tight">
                      {activeCard.word}
                    </h2>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-zinc-500 font-mono text-md">{activeCard.phonetic}</span>
                      {activeCard.phonetic && (
                        <button
                          onClick={(e) => handleSpeak(activeCard.word, e)}
                          className="p-1 rounded bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                          title="Listen pronunciation"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    {activeCard.partOfSpeech && (
                      <span className="inline-block text-xs font-bold font-mono text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded italic">
                        {activeCard.partOfSpeech}
                      </span>
                    )}
                  </div>

                  {/* Tap prompt */}
                  <div className="text-center text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center justify-center gap-2">
                    <RotateCw className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} /> Tap Card to Flip
                  </div>
                </div>

                {/* Back Side */}
                <div className="absolute w-full h-full backface-hidden rotate-y-180 glass-card p-8 md:p-10 rounded-3xl flex flex-col justify-between border border-primary/20 bg-gradient-to-tr from-dark-card to-primary-subtle/10">
                  {/* Top */}
                  <div className="flex justify-between items-center">
                    <span className="text-xs uppercase font-extrabold tracking-widest text-primary">Definition & Context</span>
                    <span className="text-xs font-semibold text-zinc-500">IELTS Score Assist</span>
                  </div>

                  {/* Body details */}
                  <div className="space-y-4 text-left overflow-y-auto max-h-[200px] pr-2">
                    <div>
                      <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-1">Definition:</p>
                      <p className="text-white text-md font-medium leading-relaxed">{activeCard.definition}</p>
                    </div>

                    {activeCard.example && (
                      <div>
                        <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-1">IELTS Style Example:</p>
                        <p className="text-zinc-200 text-sm leading-relaxed border-l-2 border-primary/40 pl-3 italic">
                          &ldquo;{activeCard.example}&rdquo;
                        </p>
                      </div>
                    )}

                    {activeCard.synonyms && activeCard.synonyms.length > 0 && (
                      <div>
                        <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-1">Synonyms:</p>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {activeCard.synonyms.map((s) => (
                            <span key={s} className="px-2 py-1 rounded bg-dark-light/50 border border-zinc-700/40 text-zinc-300 text-xs font-medium">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Bottom tap prompt */}
                  <div className="text-center text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center justify-center gap-2">
                    <RotateCw className="w-3.5 h-3.5" /> Tap Card to Flip back
                  </div>
                </div>
              </div>
            </div>

            {/* Deck Navigators */}
            <div className="flex items-center justify-between px-2">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="p-4 rounded-full bg-dark-light border border-zinc-700 hover:border-zinc-500 disabled:opacity-30 disabled:pointer-events-none transition-all"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>

              <span className="text-sm font-semibold text-zinc-400 font-mono">
                {currentIndex + 1} / {filteredWords.length}
              </span>

              <button
                onClick={handleNext}
                disabled={currentIndex === filteredWords.length - 1}
                className="p-4 rounded-full bg-dark-light border border-zinc-700 hover:border-zinc-500 disabled:opacity-30 disabled:pointer-events-none transition-all"
              >
                <ArrowRight className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        )}

        {/* AI Vocab generator Modal */}
        {showGenModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-50">
            <div className="w-full max-w-md bg-dark-card p-8 rounded-3xl border border-primary/30 shadow-2xl relative animate-scale-in" onClick={(e) => e.stopPropagation()}>
              <h2 className="font-display font-extrabold text-2xl text-white mb-2 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-primary" />
                AI Vocabulary Generator
              </h2>
              <p className="text-zinc-400 text-sm mb-6 font-medium">
                Enter an IELTS prompt or subject theme (e.g. &ldquo;Artificial Intelligence&rdquo;) to generate contextual cards.
              </p>

              <form onSubmit={handleGenerate} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Vocabulary Theme</label>
                  <input
                    type="text"
                    required
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. Climate Change, Urbanization, Globalization"
                    className="w-full glass-input"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Band level</label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value as any)}
                      className="w-full glass-input"
                    >
                      <option value="band7">Band 7 Words</option>
                      <option value="band8">Band 8 Words</option>
                      <option value="band9">Band 9 Words</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Word Count</label>
                    <input
                      type="number"
                      min="3"
                      max="15"
                      required
                      value={cardCount}
                      onChange={(e) => setCardCount(parseInt(e.target.value) || 5)}
                      className="w-full glass-input"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowGenModal(false)}
                    className="flex-1 py-3.5 rounded-xl border border-zinc-700 hover:bg-zinc-800 font-semibold text-sm text-zinc-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={generating}
                    className="flex-1 py-3.5 rounded-xl bg-primary text-dark font-bold text-sm hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                  >
                    {generating ? (
                      <span className="w-5 h-5 border-2 border-dark border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      'Generate Cards'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add manual Modal */}
        {showManualModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-50">
            <div className="w-full max-w-lg bg-dark-card p-8 rounded-3xl border border-dark-border shadow-2xl relative animate-scale-in" onClick={(e) => e.stopPropagation()}>
              <h2 className="font-display font-extrabold text-2xl text-white mb-6">Create Custom Word</h2>

              <form onSubmit={handleCreateManual} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Word</label>
                    <input
                      type="text"
                      required
                      value={newWord.word}
                      onChange={(e) => setNewWord({ ...newWord, word: e.target.value })}
                      placeholder="e.g. Ephemeral"
                      className="w-full glass-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Phonetic</label>
                    <input
                      type="text"
                      value={newWord.phonetic}
                      onChange={(e) => setNewWord({ ...newWord, phonetic: e.target.value })}
                      placeholder="/ɪˈfemərəl/"
                      className="w-full glass-input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Part Of Speech</label>
                    <select
                      value={newWord.partOfSpeech}
                      onChange={(e) => setNewWord({ ...newWord, partOfSpeech: e.target.value })}
                      className="w-full glass-input"
                    >
                      <option value="noun">Noun</option>
                      <option value="verb">Verb</option>
                      <option value="adjective">Adjective</option>
                      <option value="adverb">Adverb</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Target Band</label>
                    <select
                      value={newWord.difficulty}
                      onChange={(e) => setNewWord({ ...newWord, difficulty: e.target.value as any })}
                      className="w-full glass-input"
                    >
                      <option value="band7">Band 7</option>
                      <option value="band8">Band 8</option>
                      <option value="band9">Band 9</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Definition</label>
                  <textarea
                    required
                    rows={2}
                    value={newWord.definition}
                    onChange={(e) => setNewWord({ ...newWord, definition: e.target.value })}
                    placeholder="Provide definition here..."
                    className="w-full glass-input resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">IELTS Style Example Sentence</label>
                  <textarea
                    rows={2}
                    value={newWord.example}
                    onChange={(e) => setNewWord({ ...newWord, example: e.target.value })}
                    placeholder="Use the word in an academic IELTS style context..."
                    className="w-full glass-input resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Synonyms (Comma-separated)</label>
                  <input
                    type="text"
                    value={newWord.synonyms}
                    onChange={(e) => setNewWord({ ...newWord, synonyms: e.target.value })}
                    placeholder="e.g. transient, fleeting, short-lived"
                    className="w-full glass-input"
                  />
                </div>

                <div className="flex gap-4 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowManualModal(false)}
                    className="flex-1 py-3.5 rounded-xl border border-zinc-700 hover:bg-zinc-800 font-semibold text-sm text-zinc-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingManual}
                    className="flex-1 py-3.5 rounded-xl bg-primary text-dark font-bold text-sm hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                  >
                    {savingManual ? (
                      <span className="w-5 h-5 border-2 border-dark border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      'Save Flashcard'
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
