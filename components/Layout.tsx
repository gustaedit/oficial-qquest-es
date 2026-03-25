import React, { useState, useEffect } from 'react';
import { Target, BarChart3, Shield, Package, LogOut, Sun, Moon, Crosshair, Wifi, WifiOff } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  setCurrentPage: (page: string) => void;
  connectionStatus?: 'online' | 'offline' | 'error';
}

const PAGE_LABELS: Record<string, string> = {
  'performance': 'Desempenho',
  'free-study': 'Estudo Livre',
  'my-packages': 'Simulados',
};

export const Layout: React.FC<LayoutProps> = ({
  children, currentPage, setCurrentPage, connectionStatus
}) => {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'light') {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    setIsDark(prev => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
      return next;
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <div className="flex h-screen bg-[#E9ECEF] dark:bg-[#0A0A0A] text-gray-900 dark:text-white overflow-hidden flex-col md:flex-row transition-colors duration-300">

      {/* ── SIDEBAR DESKTOP ── */}
      <aside className="hidden md:flex w-24 bg-[#F1F5F9] dark:bg-black border-r border-gray-300 dark:border-white/10 flex-col items-center py-8 z-30 shadow-sm dark:shadow-[4px_0px_20px_rgba(0,0,0,0.5)]">

        {/* Logo */}
        <div className="mb-12 group cursor-pointer" onClick={() => setCurrentPage('performance')}>
          <div className="w-14 h-14 bg-primary flex items-center justify-center rounded-3xl transition-all hover:rounded-2xl active:scale-90 shadow-lg shadow-primary/20">
            <Shield className="text-black w-7 h-7 stroke-[2.5px]" />
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 flex flex-col gap-8">
          <SidebarIcon
            active={currentPage === 'free-study'}
            onClick={() => setCurrentPage('free-study')}
            icon={<Target />}
            label="Missão"
          />
          <SidebarIcon
            active={currentPage === 'my-packages'}
            onClick={() => setCurrentPage('my-packages')}
            icon={<Package />}
            label="Simulados"
          />
          <SidebarIcon
            active={currentPage === 'performance'}
            onClick={() => setCurrentPage('performance')}
            icon={<BarChart3 />}
            label="Status"
          />
        </nav>

        {/* Footer da sidebar */}
        <div className="mt-auto flex flex-col items-center gap-6">
          <button
            onClick={toggleTheme}
            className="p-3 bg-gray-200 dark:bg-white/5 rounded-2xl text-gray-600 dark:text-gray-400 hover:text-primary transition-all"
          >
            {isDark ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
          </button>
          <button
            onClick={handleLogout}
            title="Sair"
            className="p-4 text-gray-400 hover:text-red-500 transition-colors"
          >
            <LogOut className="w-6 h-6" />
          </button>
        </div>
      </aside>

      {/* ── BOTTOM NAV MOBILE ── */}
      <nav className="md:hidden fixed bottom-4 left-4 right-4 h-16 bg-white/95 dark:bg-black/90 backdrop-blur-xl border border-gray-300 dark:border-white/10 z-50 flex items-center justify-around px-2 rounded-3xl shadow-2xl">
        <MobileIcon active={currentPage === 'free-study'}  onClick={() => setCurrentPage('free-study')}  icon={<Target />}   label="Missão" />
        <MobileIcon active={currentPage === 'my-packages'} onClick={() => setCurrentPage('my-packages')} icon={<Package />}  label="Simulados" />
        <MobileIcon active={currentPage === 'performance'} onClick={() => setCurrentPage('performance')} icon={<BarChart3 />} label="Status" />
        <MobileIcon active={false} onClick={handleLogout} icon={<LogOut />} label="Sair" />
      </nav>

      {/* ── CONTEÚDO PRINCIPAL ── */}
      <main className="flex-1 flex flex-col relative mb-24 md:mb-0 overflow-hidden">

        {/* Header */}
        <header className="h-16 md:h-20 px-4 md:px-10 flex items-center justify-between border-b border-gray-300 dark:border-white/5 bg-[#F1F5F9]/80 dark:bg-black/50 backdrop-blur-md sticky top-0 z-40 transition-colors">
          <h2 className="text-[10px] md:text-sm font-bold uppercase tracking-[0.3em] text-primary italic drop-shadow-sm">
            {PAGE_LABELS[currentPage] ?? currentPage}
          </h2>

          <div className="flex items-center gap-4 md:gap-8">
            {/* Status de conexão */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${
              connectionStatus === 'online'
                ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-500'
                : connectionStatus === 'error'
                  ? 'border-red-500/30 bg-red-500/5 text-red-500'
                  : 'border-gray-500/30 bg-gray-500/5 text-gray-500'
            }`}>
              {connectionStatus === 'online'
                ? <Wifi className="w-3 h-3" />
                : <WifiOff className="w-3 h-3" />
              }
              <span className="text-[8px] font-black uppercase tracking-widest hidden sm:inline">
                {connectionStatus === 'online' ? 'Sincronizado' : connectionStatus === 'error' ? 'Erro SQL' : 'Offline'}
              </span>
            </div>

            {/* Badge PC-BA */}
            <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-gray-200 dark:bg-white/5 border border-gray-400 dark:border-white/10 rounded-full italic">
              <Crosshair className="w-3.5 h-3.5 text-primary animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-widest text-gray-700 dark:text-white/60">Operacional PC BA</span>
            </div>

            {/* Avatar */}
            <div className="w-10 h-10 rounded-2xl border-2 border-primary/30 flex items-center justify-center bg-gray-300 dark:bg-white/5 shadow-sm">
              <span className="font-bold text-xs text-primary">BA</span>
            </div>
          </div>
        </header>

        {/* Área scrollável */}
        <section className="flex-1 overflow-y-auto p-4 md:p-12 scroll-smooth">
          <div className="max-w-6xl mx-auto pb-12 md:pb-0">
            {children}
          </div>
        </section>
      </main>
    </div>
  );
};

const SidebarIcon = ({ active, onClick, icon, label }: any) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center gap-2 group transition-all ${
      active ? 'text-primary' : 'text-gray-600 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white'
    }`}
  >
    <div className={`p-4 rounded-2xl transition-all ${
      active ? 'bg-primary/10 shadow-lg shadow-primary/5' : 'group-hover:bg-gray-200 dark:group-hover:bg-white/5'
    }`}>
      {React.cloneElement(icon, { className: 'w-6 h-6' })}
    </div>
    <span className="text-[10px] font-bold uppercase tracking-widest scale-0 group-hover:scale-100 transition-all origin-top">
      {label}
    </span>
  </button>
);

const MobileIcon = ({ active, onClick, icon, label }: any) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-all ${
      active ? 'text-primary scale-110' : 'text-gray-600 dark:text-gray-500'
    }`}
  >
    {React.cloneElement(icon, { className: 'w-5 h-5' })}
    <span className="text-[8px] font-black uppercase tracking-tighter">{label}</span>
  </button>
);