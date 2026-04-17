import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  serverTimestamp,
  doc,
  updateDoc,
  getDoc
} from 'firebase/firestore';
import { ChatMessage, ChatSession, Subject } from '../types';
import { getChatResponse } from '../services/geminiService';
import { Send, Sparkles, Wand2, Loader2, User, Bot, BookOpen, GraduationCap } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { handleFirestoreError, OperationType } from '../lib/firebase';

interface ChatProps {
  initialSessionId?: string | null;
}

const Chat: React.FC<ChatProps> = ({ initialSessionId }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(initialSessionId || null);
  const [subject, setSubject] = useState<Subject>('General');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const subjects: Subject[] = ['General', 'Math', 'Science', 'English', 'History'];

  useEffect(() => {
    if (!user || !initialSessionId) return;

    // Load initial session subject correctly
    const loadSession = async () => {
      try {
        const sDoc = await getDoc(doc(db, 'chat_sessions', initialSessionId));
        if (sDoc.exists()) {
          const data = sDoc.data() as ChatSession;
          setSubject(data.subject);
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `chat_sessions/${initialSessionId}`);
      }
    };
    loadSession();
  }, [user, initialSessionId]);

  useEffect(() => {
    if (!currentSessionId) return;

    const q = query(
      collection(db, 'chat_sessions', currentSessionId, 'messages'),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatMessage));
      setMessages(msgs);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `chat_sessions/${currentSessionId}/messages`);
    });

    return unsubscribe;
  }, [currentSessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startOrGetSession = async () => {
    if (currentSessionId) return currentSessionId;

    const sessionData = {
      userId: user!.uid,
      title: 'New Chat',
      subject,
      createdAt: serverTimestamp(),
      lastMessageAt: serverTimestamp(),
    };

    try {
      const docRef = await addDoc(collection(db, 'chat_sessions'), sessionData);
      setCurrentSessionId(docRef.id);
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'chat_sessions');
      throw error;
    }
  };

  const handleSend = async (mode?: 'eli5' | 'summarize') => {
    if ((!input.trim() && !mode) || loading || !user) return;

    const sessionId = await startOrGetSession();
    const userMessage = input.trim() || (mode === 'eli5' ? 'Explain like I\'m 5' : 'Summarize');
    
    setLoading(true);
    setInput('');

    try {
      const messagesPath = `chat_sessions/${sessionId}/messages`;
      // 1. Add user message to Firestore
      await addDoc(collection(db, messagesPath), {
        sessionId,
        userId: user.uid,
        role: 'user',
        content: userMessage,
        createdAt: serverTimestamp(),
      });

      // Update session status
      await updateDoc(doc(db, 'chat_sessions', sessionId), {
        lastMessageAt: serverTimestamp(),
        title: userMessage.slice(0, 50),
      });

      // 2. Get AI response
      const aiResponse = await getChatResponse(userMessage, messages, subject, mode);

      // 3. Add AI message to Firestore
      await addDoc(collection(db, messagesPath), {
        sessionId,
        userId: user.uid,
        role: 'assistant',
        content: aiResponse,
        createdAt: serverTimestamp(),
      });

      await updateDoc(doc(db, 'chat_sessions', sessionId), {
        lastMessageAt: serverTimestamp(),
      });

    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `chat_sessions/${sessionId}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={32} />
        <p className="text-zinc-500">Preparing your tutor workspace...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-12rem)]">
      {/* Header / Subject Picker */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div className="flex items-center gap-2">
          <BookOpen size={20} className="text-blue-600" />
          <span className="font-semibold">Current Subject:</span>
          <select 
            value={subject}
            onChange={(e) => setSubject(e.target.value as Subject)}
            className="bg-zinc-100 dark:bg-zinc-800 border-none rounded-lg px-3 py-1 text-sm font-medium focus:ring-2 focus:ring-blue-600"
          >
            {subjects.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        
        <div className="flex gap-2">
           <button 
            disabled={loading}
            onClick={() => handleSend('eli5')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-500 text-xs font-bold border border-yellow-200 dark:border-yellow-900/50 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors"
           >
            <Sparkles size={14} />
            ELi5
           </button>
           <button 
            disabled={loading}
            onClick={() => handleSend('summarize')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-500 text-xs font-bold border border-purple-200 dark:border-purple-900/50 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
           >
            <Wand2 size={14} />
            Summarize
           </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto space-y-6 pr-2 mb-6 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-50 space-y-4 py-20">
            <Bot size={48} className="text-blue-600 animate-pulse" />
            <div>
              <p className="text-lg font-medium">I'm ready to help!</p>
              <p className="text-sm">Ask me anything about your lessons or homework.</p>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex gap-4 max-w-[85%]",
                msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border",
                msg.role === 'user' 
                  ? "bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700" 
                  : "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20"
              )}>
                {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
              </div>
              <div className={cn(
                "p-4 rounded-2xl text-sm leading-relaxed",
                msg.role === 'user' 
                  ? "bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900" 
                  : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100"
              )}>
                <div className="prose dark:prose-invert prose-sm max-w-none">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </div>
            </motion.div>
          ))
        )}
        {loading && (
          <div className="flex gap-4 mr-auto max-w-[85%]">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0 text-white">
              <Bot size={20} />
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center gap-2">
              <Loader2 className="animate-spin text-blue-600" size={16} />
              <span className="text-xs font-medium text-zinc-500">GehlotAI is thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="relative">
        <textarea
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder={`Ask about ${subject}...`}
          className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-4 pr-14 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm transition-all resize-none"
        />
        <button
          onClick={() => handleSend()}
          disabled={!input.trim() || loading}
          className="absolute right-3 top-3 p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:hover:bg-blue-600 transition-all active:scale-95"
        >
          <Send size={20} />
        </button>
      </div>
      <p className="text-[10px] text-zinc-400 text-center mt-3 uppercase tracking-widest font-bold">
        GehlotAI can make mistakes. Always check important info.
      </p>
    </div>
  );
};

export default Chat;
