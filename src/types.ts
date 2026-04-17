export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  createdAt: any;
}

export type Subject = 'General' | 'Math' | 'Science' | 'English' | 'History';

export interface ChatSession {
  id: string;
  userId: string;
  title: string;
  subject: Subject;
  createdAt: any;
  lastMessageAt: any;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  userId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: any;
}
