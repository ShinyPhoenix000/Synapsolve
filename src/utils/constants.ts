// Application constants
export const APP_CONSTANTS = {
  // Ticket priorities
  PRIORITIES: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    URGENT: 'urgent',
  } as const,

  // Ticket statuses
  STATUSES: {
    OPEN: 'open',
    IN_PROGRESS: 'in-progress',
    RESOLVED: 'resolved',
    CLOSED: 'closed',
  } as const,

  // User roles
  ROLES: {
    USER: 'user',
    AGENT: 'agent',
    ADMIN: 'admin',
  } as const,

  // Sentiment types
  SENTIMENTS: {
    POSITIVE: 'positive',
    NEUTRAL: 'neutral',
    NEGATIVE: 'negative',
  } as const,

  // Notification types
  NOTIFICATION_TYPES: {
    INFO: 'info',
    SUCCESS: 'success',
    WARNING: 'warning',
    ERROR: 'error',
  } as const,

  // Ticket categories
  CATEGORIES: [
    'Technical Support',
    'Billing',
    'Account Issues',
    'Feature Request',
    'Bug Report',
    'General Inquiry',
  ],

  // Animation durations (in milliseconds)
  ANIMATIONS: {
    FAST: 200,
    NORMAL: 300,
    SLOW: 500,
  },

  // API endpoints
  ENDPOINTS: {
    TICKETS: '/api/tickets',
    USERS: '/api/users',
    AGENTS: '/api/agents',
    NOTIFICATIONS: '/api/notifications',
  },

  // Local storage keys
  STORAGE_KEYS: {
    THEME: 'synapsolve-theme',
    USER_PREFERENCES: 'synapsolve-user-prefs',
    AUTH_TOKEN: 'synapsolve-auth-token',
  },
} as const;

// Type exports for better TypeScript support
export type Priority = typeof APP_CONSTANTS.PRIORITIES[keyof typeof APP_CONSTANTS.PRIORITIES];
export type Status = typeof APP_CONSTANTS.STATUSES[keyof typeof APP_CONSTANTS.STATUSES];
export type Role = typeof APP_CONSTANTS.ROLES[keyof typeof APP_CONSTANTS.ROLES];
export type Sentiment = typeof APP_CONSTANTS.SENTIMENTS[keyof typeof APP_CONSTANTS.SENTIMENTS];
export type NotificationType = typeof APP_CONSTANTS.NOTIFICATION_TYPES[keyof typeof APP_CONSTANTS.NOTIFICATION_TYPES];