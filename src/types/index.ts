export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: 'user' | 'agent' | 'admin';
  photoURL?: string;
  createdAt: Date;
  isOnline?: boolean;
  lastActive?: Date;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  submitter: string;
  submitterName: string;
  assignedTo?: string;
  assignedToName?: string;
  assignedAgentId?: string;
  assignedAgentName?: string;
  assignedAgentEmail?: string;
  createdAt: Date;
  updatedAt: Date;
  aiSummary?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  suggestedReply?: string;
}

export interface Agent {
  uid: string;
  email: string;
  displayName: string;
  skills: string[];
  currentLoad: number;
  maxLoad: number;
  isAvailable: boolean;
  seniorLevel: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: Date;
  ticketId?: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}