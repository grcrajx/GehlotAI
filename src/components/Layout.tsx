import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Sun, Moon, GraduationCap, LayoutDashboard, MessageSquare } from 'lucide-react';
import { cn } from '../lib/utils';

interface LayoutProps {
  children: React.ReactNode;
  activeView: 'home' | 'chat' | 'dashboard';
  onViewChange: (view: 'home' | 'chat' | 'dashboard') => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeView, onViewChange }) => {
  const { user, profile, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-200">
      <header className="sticky top-0 z-40 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => onViewChange('home')}
          >
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white group-hover:bg-blue-700 transition-colors">
              <GraduationCap size={24} />
            </div>
            <span className="text-xl font-bold tracking-tight">GehlotAI</span>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <button 
              onClick={() => onViewChange('home')}
              className={cn(
                "text-sm font-medium transition-colors hover:text-blue-600",
                activeView === 'home' ? "text-blue-600" : "text-zinc-500"
              )}
            >
              Home
            </button>
            <button 
              onClick={() => onViewChange('chat')}
              className={cn(
                "text-sm font-medium transition-colors hover:text-blue-600",
                activeView === 'chat' ? "text-blue-600" : "text-zinc-500"
              )}
            >
              Chat
            </button>
            <button 
              onClick={() => onViewChange('dashboard')}
              className={cn(
                "text-sm font-medium transition-colors hover:text-blue-600",
                activeView === 'dashboard' ? "text-blue-600" : "text-zinc-500"
              )}
            >
              Dashboard
            </button>
          </nav>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            {user && (
              <div className="flex items-center gap-3 pl-4 border-l border-zinc-200 dark:border-zinc-800">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-sm font-semibold">{profile?.displayName}</span>
                  <span className="text-xs text-zinc-500">Student</span>
                </div>
                <img 
                  src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} 
                  alt="Avatar"
                  className="w-10 h-10 rounded-full border border-zinc-200 dark:border-zinc-800"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {children}
      </main>

      {/* Mobile nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 px-4 h-16 flex items-center justify-around">
        <button 
          onClick={() => onViewChange('home')}
          className={cn(
            "flex flex-col items-center gap-1",
            activeView === 'home' ? "text-blue-600" : "text-zinc-500"
          )}
        >
          <GraduationCap size={20} />
          <span className="text-[10px] uppercase font-bold tracking-wider">Home</span>
        </button>
        <button 
          onClick={() => onViewChange('chat')}
          className={cn(
            "flex flex-col items-center gap-1",
            activeView === 'chat' ? "text-blue-600" : "text-zinc-500"
          )}
        >
          <MessageSquare size={20} />
          <span className="text-[10px] uppercase font-bold tracking-wider">Chat</span>
        </button>
        <button 
          onClick={() => onViewChange('dashboard')}
          className={cn(
            "flex flex-col items-center gap-1",
            activeView === 'dashboard' ? "text-blue-600" : "text-zinc-500"
          )}
        >
          <LayoutDashboard size={20} />
          <span className="text-[10px] uppercase font-bold tracking-wider">Dashboard</span>
        </button>
      </nav>
    </div>
  );
};

export default Layout;
