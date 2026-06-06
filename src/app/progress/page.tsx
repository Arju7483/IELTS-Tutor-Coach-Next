'use client';

import React, { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import { PenTool, Mic, Award, BarChart3, Clock, AlertCircle } from 'lucide-react';

interface Attempt {
  _id: string;
  type: 'writing' | 'speaking';
  score: number;
  date: string;
}

interface Stats {
  writingAvg: number;
  speakingAvg: number;
  totalSessions: number;
  bestScore: number;
  recentHistory: Attempt[];
}

export default function ProgressPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const res = await fetch('/api/history/stats', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error('Failed to fetch progress stats');
        }

        const data = await res.json();
        setStats(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load progress.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Helper to generate SVG sparkline with separate lines for writing and speaking
  const renderChart = (history: Attempt[]) => {
    if (!history || history.length < 2) {
      return (
        <div className="h-48 flex items-center justify-center text-zinc-500 text-sm">
          Complete at least 2 sessions to generate progress chart.
        </div>
      );
    }

    const items = [...history].reverse(); // oldest to newest
    const maxScore = 9;
    const paddingX = 40;
    const paddingY = 20;
    const width = 600;
    const height = 180;

    const chartWidth = width - paddingX * 2;
    const chartHeight = height - paddingY * 2;

    // Separate writing and speaking attempts
    const writingAttempts = items.filter(item => item.type === 'writing');
    const speakingAttempts = items.filter(item => item.type === 'speaking');

    // Create a time-based x-axis mapping
    const allDates = items.map(item => new Date(item.date).getTime());
    const minTime = Math.min(...allDates);
    const maxTime = Math.max(...allDates);
    const timeRange = maxTime - minTime || 1;

    // Helper to convert attempt to point
    const attemptToPoint = (item: Attempt) => {
      const time = new Date(item.date).getTime();
      const x = paddingX + ((time - minTime) / timeRange) * chartWidth;
      const y = height - paddingY - (item.score / maxScore) * chartHeight;
      return { x, y, ...item };
    };

    // Generate points for each type
    const writingPoints = writingAttempts.map(attemptToPoint);
    const speakingPoints = speakingAttempts.map(attemptToPoint);

    // Generate path data for each line
    const writingPathData = writingPoints.length > 0 
      ? writingPoints.reduce((path, pt, i) => (i === 0 ? `M ${pt.x} ${pt.y}` : `${path} L ${pt.x} ${pt.y}`), '')
      : '';

    const speakingPathData = speakingPoints.length > 0
      ? speakingPoints.reduce((path, pt, i) => (i === 0 ? `M ${pt.x} ${pt.y}` : `${path} L ${pt.x} ${pt.y}`), '')
      : '';

    return (
      <div className="w-full overflow-x-auto">
        <div className="flex items-center justify-end gap-6 mb-4 px-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-primary"></div>
            <span className="text-xs font-semibold text-zinc-400">Writing</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-violet"></div>
            <span className="text-xs font-semibold text-zinc-400">Speaking</span>
          </div>
        </div>
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[500px] h-auto overflow-visible">
          {/* Grid lines */}
          {[3, 4.5, 6, 7.5, 9].map((band) => {
            const y = height - paddingY - (band / maxScore) * chartHeight;
            return (
              <g key={band}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  stroke="#1e2d47"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingX - 10}
                  y={y + 4}
                  fill="#64748b"
                  fontSize="10"
                  textAnchor="end"
                  className="font-mono"
                >
                  {band}
                </text>
              </g>
            );
          })}

          {/* Writing gradient area */}
          {writingPoints.length > 0 && (
            <path
              d={`${writingPathData} L ${writingPoints[writingPoints.length - 1].x} ${height - paddingY} L ${writingPoints[0].x} ${height - paddingY} Z`}
              fill="url(#writing-gradient)"
              opacity="0.12"
            />
          )}

          {/* Speaking gradient area */}
          {speakingPoints.length > 0 && (
            <path
              d={`${speakingPathData} L ${speakingPoints[speakingPoints.length - 1].x} ${height - paddingY} L ${speakingPoints[0].x} ${height - paddingY} Z`}
              fill="url(#speaking-gradient)"
              opacity="0.12"
            />
          )}

          {/* Writing line */}
          {writingPoints.length > 0 && (
            <path 
              d={writingPathData} 
              fill="none" 
              stroke="#00d4aa" 
              strokeWidth="3" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />
          )}

          {/* Speaking line */}
          {speakingPoints.length > 0 && (
            <path 
              d={speakingPathData} 
              fill="none" 
              stroke="#8b5cf6" 
              strokeWidth="3" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />
          )}

          {/* Writing dots */}
          {writingPoints.map((pt, i) => (
            <g key={`writing-${pt._id || i}`} className="group cursor-pointer">
              <circle
                cx={pt.x}
                cy={pt.y}
                r="5"
                fill="#00d4aa"
                stroke="#0a0f1e"
                strokeWidth="2"
              />
              <circle
                cx={pt.x}
                cy={pt.y}
                r="9"
                fill="#00d4aa"
                opacity="0"
                className="hover:opacity-30 transition-opacity"
              />
              <title>Writing: Band {pt.score} - {new Date(pt.date).toLocaleDateString()}</title>
            </g>
          ))}

          {/* Speaking dots */}
          {speakingPoints.map((pt, i) => (
            <g key={`speaking-${pt._id || i}`} className="group cursor-pointer">
              <circle
                cx={pt.x}
                cy={pt.y}
                r="5"
                fill="#8b5cf6"
                stroke="#0a0f1e"
                strokeWidth="2"
              />
              <circle
                cx={pt.x}
                cy={pt.y}
                r="9"
                fill="#8b5cf6"
                opacity="0"
                className="hover:opacity-30 transition-opacity"
              />
              <title>Speaking: Band {pt.score} - {new Date(pt.date).toLocaleDateString()}</title>
            </g>
          ))}

          {/* Definitions */}
          <defs>
            <linearGradient id="writing-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00d4aa" />
              <stop offset="100%" stopColor="#00d4aa" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="speaking-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  };

  return (
    <AppShell>
      <div className="space-y-8 animate-slide-up">
        {/* Header */}
        <div>
          <h1 className="font-display text-4xl font-extrabold text-white">Performance Dashboard</h1>
          <p className="text-zinc-400 mt-2">Monitor your preparation trajectory and AI critiques</p>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-subtle border border-rose/30 flex items-center gap-3 text-rose">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-semibold">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
          </div>
        ) : stats ? (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Card 1: Writing Avg */}
              <div className="glass-card p-6 rounded-2xl relative overflow-hidden flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Writing Average</p>
                  <p className="text-3xl font-extrabold text-white">{stats.writingAvg || 'N/A'}</p>
                  <p className="text-xs text-primary font-semibold">Band Level</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-primary-subtle border border-primary/20 flex items-center justify-center text-primary">
                  <PenTool className="w-6 h-6" />
                </div>
              </div>

              {/* Card 2: Speaking Avg */}
              <div className="glass-card p-6 rounded-2xl relative overflow-hidden flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Speaking Average</p>
                  <p className="text-3xl font-extrabold text-white">{stats.speakingAvg || 'N/A'}</p>
                  <p className="text-xs text-violet font-semibold">Band Level</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-violet-subtle border border-violet/20 flex items-center justify-center text-violet">
                  <Mic className="w-6 h-6" />
                </div>
              </div>

              {/* Card 3: Best Score */}
              <div className="glass-card p-6 rounded-2xl relative overflow-hidden flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Peak Band</p>
                  <p className="text-3xl font-extrabold text-white">Band {stats.bestScore || '0'}</p>
                  <p className="text-xs text-accent font-semibold">Personal Record</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-accent-subtle border border-accent/20 flex items-center justify-center text-accent">
                  <Award className="w-6 h-6" />
                </div>
              </div>

              {/* Card 4: Total Sessions */}
              <div className="glass-card p-6 rounded-2xl relative overflow-hidden flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Total Attempts</p>
                  <p className="text-3xl font-extrabold text-white">{stats.totalSessions}</p>
                  <p className="text-xs text-zinc-500 font-semibold">Completed Sessions</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-zinc-800/40 border border-zinc-700/50 flex items-center justify-center text-zinc-400">
                  <BarChart3 className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Chart Section */}
            <div className="glass-card p-6 md:p-8 rounded-3xl">
              <h2 className="font-display font-extrabold text-xl mb-6 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Progress Trajectory
              </h2>
              {renderChart(stats.recentHistory)}
            </div>

            {/* History Table */}
            <div className="glass-card p-6 md:p-8 rounded-3xl">
              <h2 className="font-display font-extrabold text-xl mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5 text-violet" />
                Recent Practice Logs
              </h2>
              {stats.recentHistory.length === 0 ? (
                <div className="text-center py-12 text-zinc-500">
                  No sessions logged yet. Start practicing in the Writing or Speaking modules!
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-dark-border text-xs font-semibold uppercase tracking-wider text-zinc-500">
                        <th className="pb-4">Section</th>
                        <th className="pb-4">Date & Time</th>
                        <th className="pb-4 text-right">Achieved Band</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-border text-sm">
                      {stats.recentHistory.map((attempt) => (
                        <tr key={attempt._id} className="hover:bg-dark-light/20 transition-colors">
                          <td className="py-4 font-semibold flex items-center gap-2">
                            {attempt.type === 'writing' ? (
                              <>
                                <PenTool className="w-4 h-4 text-primary" />
                                <span>Writing Task 2</span>
                              </>
                            ) : (
                              <>
                                <Mic className="w-4 h-4 text-violet" />
                                <span>Speaking Critique</span>
                              </>
                            )}
                          </td>
                          <td className="py-4 text-zinc-400">
                            {new Date(attempt.date).toLocaleString([], {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>
                          <td className="py-4 text-right font-bold text-white">
                            <span
                              className={`px-3 py-1 rounded-lg text-xs ${attempt.score >= 7.5
                                  ? 'bg-primary-subtle text-primary border border-primary/20'
                                  : attempt.score >= 6.5
                                    ? 'bg-violet-subtle text-violet border border-violet/20'
                                    : 'bg-zinc-800 text-zinc-400'
                                }`}
                            >
                              Band {attempt.score}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-12 text-zinc-500">No data available.</div>
        )}
      </div>
    </AppShell>
  );
}
