'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, PenTool, Mic, BookOpen, LogOut, Menu, X, User, MessageSquare } from 'lucide-react';

interface AppShellProps {
  children: React.ReactNode;
}

export function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export default function AppShell({ children }: AppShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [userName, setUserName] = useState<string>('User');
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const payload = parseJwt(token);
    if (!payload || (payload.exp && payload.exp * 1000 < Date.now())) {
      localStorage.removeItem('token');
      router.push('/login');
      return;
    }

    setUserName(payload.name || payload.email || 'IELTS Learner');
    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const navItems = [
    { name: 'Dashboard', href: '/progress', icon: LayoutDashboard },
    { name: 'Writing Practice', href: '/writing', icon: PenTool },
    { name: 'Speaking Practice', href: '/speaking', icon: Mic },
    { name: 'Voice Chat', href: '/voice-chat', icon: MessageSquare },
    { name: 'Vocabulary', href: '/vocab', icon: BookOpen },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          <p className="text-zinc-400 font-medium animate-pulse">Loading coaching panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark text-white flex flex-col md:flex-row">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex md:w-64 flex-col fixed inset-y-0 left-0 bg-dark-card border-r border-dark-border z-20">
        <div className="p-6 flex items-center gap-2 border-b border-dark-border">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-violet flex items-center justify-center font-display font-extrabold text-dark text-sm">
            AI
          </div>
          <span className="font-display font-bold text-xl tracking-tight">
            IELTS<span className="text-primary">Coach</span>
          </span>
        </div>

        {/* User Profile */}
        <div className="p-6 border-b border-dark-border flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-dark-light border border-dark-border flex items-center justify-center text-primary">
            <User className="w-5 h-5" />
          </div>
          <div className="overflow-hidden">
            <p className="font-semibold text-sm text-white truncate">{userName}</p>
            <p className="text-xs text-zinc-500 font-medium">Candidate</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary text-dark font-bold shadow-glow-primary'
                    : 'text-zinc-400 hover:text-white hover:bg-dark-light/50'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-dark' : 'text-zinc-400 group-hover:text-white'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-dark-border">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-rose hover:bg-rose-subtle hover:text-white transition-all"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between px-6 py-4 bg-dark-card border-b border-dark-border sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-violet flex items-center justify-center font-display font-extrabold text-dark text-sm">
            AI
          </div>
          <span className="font-display font-bold text-lg tracking-tight">
            IELTS<span className="text-primary">Coach</span>
          </span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg bg-dark-light border border-dark-border text-zinc-400 hover:text-white"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Mobile Drawer Navigation */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={() => setSidebarOpen(false)}>
          <aside
            className="w-64 h-full bg-dark-card border-r border-dark-border flex flex-col p-6 space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-dark-border pb-4">
              <span className="font-display font-bold text-lg">Menu</span>
              <button onClick={() => setSidebarOpen(false)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 space-y-1.5">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-primary text-dark font-bold shadow-glow-primary'
                        : 'text-zinc-400 hover:text-white hover:bg-dark-light/50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            <div className="border-t border-dark-border pt-4">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-rose hover:bg-rose-subtle hover:text-white transition-all"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 md:pl-64 min-h-screen flex flex-col">
        <div className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
