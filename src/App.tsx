/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/Layout';
import Home from './views/Home';
import Chat from './views/Chat';
import Dashboard from './views/Dashboard';
import { Loader2 } from 'lucide-react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { validateFirestoreConnection } from './lib/connectionTest';

function AppContent() {
  const { loading, user } = useAuth();
  const [activeView, setActiveView] = useState<'home' | 'chat' | 'dashboard'>('home');
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  useEffect(() => {
    validateFirestoreConnection();
  }, []);

  const handleSessionSelect = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    setActiveView('chat');
  };

  const handleViewChange = (view: 'home' | 'chat' | 'dashboard') => {
    setActiveView(view);
    if (view !== 'chat') {
      setSelectedSessionId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-blue-600" size={40} />
          <p className="text-sm font-medium text-zinc-500">Initializing GehlotAI...</p>
        </div>
      </div>
    );
  }

  return (
    <Layout activeView={activeView} onViewChange={handleViewChange}>
      {activeView === 'home' && (
        <Home onStartChat={() => handleViewChange('chat')} />
      )}
      {activeView === 'chat' && (
        <Chat key={selectedSessionId || 'new'} initialSessionId={selectedSessionId} />
      )}
      {activeView === 'dashboard' && (
        <Dashboard onSessionSelect={handleSessionSelect} />
      )}
    </Layout>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
