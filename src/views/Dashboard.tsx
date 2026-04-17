import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, where, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { ChatSession } from '../types';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, Trash2, Calendar, BookOpen, ChevronRight, GraduationCap } from 'lucide-react';
import { motion } from 'motion/react';

interface DashboardProps {
  onSessionSelect: (sessionId: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onSessionSelect }) => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'chat_sessions'),
      where('userId', '==', user.uid),
      orderBy('lastMessageAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const sess = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatSession));
      setSessions(sess);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'chat_sessions');
    });

    return unsubscribe;
  }, [user]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this chat session?')) return;
    try {
      await deleteDoc(doc(db, 'chat_sessions', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `chat_sessions/${id}`);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Workspace</h1>
          <p className="text-zinc-500">Pick up where you left off or review your history.</p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-xl border border-blue-100 dark:border-blue-900/50 flex items-center gap-2">
          <GraduationCap className="text-blue-600" size={20} />
          <span className="text-sm font-bold text-blue-700 dark:text-blue-400">{sessions.length} Sessions</span>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-20 bg-zinc-50 dark:bg-zinc-900 rounded-[2.5rem] border border-dashed border-zinc-200 dark:border-zinc-800">
          <MessageSquare className="mx-auto text-zinc-300 mb-4" size={48} />
          <h3 className="text-xl font-bold">No chats yet</h3>
          <p className="text-zinc-500 mb-6">Start your first conversation with GehlotAI!</p>
          <button 
             onClick={() => onSessionSelect('')}
             className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition"
          >
            New Session
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sessions.map((session, i) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => onSessionSelect(session.id)}
              className="group relative p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl hover:border-blue-600 transition-all cursor-pointer shadow-sm hover:shadow-md dark:hover:bg-zinc-800/50"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                    <MessageSquare size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-zinc-900 dark:text-white line-clamp-1">{session.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium">
                      <BookOpen size={12} /> {session.subject}
                    </div>
                  </div>
                </div>
                <button
                  onClick={(e) => handleDelete(e, session.id)}
                  className="p-2 opacity-0 group-hover:opacity-100 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              
              <div className="flex items-center justify-between text-xs text-zinc-400 border-t border-zinc-100 dark:border-zinc-800 pt-4 mt-auto">
                <div className="flex items-center gap-1.5">
                  <Calendar size={12} />
                  {session.lastMessageAt ? formatDistanceToNow(session.lastMessageAt?.toDate(), { addSuffix: true }) : 'Just now'}
                </div>
                <div className="flex items-center gap-1 text-blue-600 font-bold uppercase tracking-wider group-hover:translate-x-1 transition-transform">
                  Continue <ChevronRight size={14} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
