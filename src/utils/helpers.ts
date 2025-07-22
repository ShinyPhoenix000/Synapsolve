// Utility helper functions
import { APP_CONSTANTS } from './constants';
import type { Priority, Status, Sentiment } from './constants';

/**
 * Format date to readable string
 */
export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Get relative time string (e.g., "2 hours ago")
 */
export const getRelativeTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  
  return formatDate(d);
};

/**
 * Get color classes for priority levels
 */
export const getPriorityColor = (priority: Priority): string => {
  switch (priority) {
    case APP_CONSTANTS.PRIORITIES.URGENT:
      return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400';
    case APP_CONSTANTS.PRIORITIES.HIGH:
      return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400';
    case APP_CONSTANTS.PRIORITIES.MEDIUM:
      return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400';
    case APP_CONSTANTS.PRIORITIES.LOW:
      return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
    default:
      return 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400';
  }
};

/**
 * Get color classes for status levels
 */
export const getStatusColor = (status: Status): string => {
  switch (status) {
    case APP_CONSTANTS.STATUSES.OPEN:
      return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400';
    case APP_CONSTANTS.STATUSES.IN_PROGRESS:
      return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400';
    case APP_CONSTANTS.STATUSES.RESOLVED:
      return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
    case APP_CONSTANTS.STATUSES.CLOSED:
      return 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400';
    default:
      return 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400';
  }
};

/**
 * Get color classes for sentiment
 */
export const getSentimentColor = (sentiment: Sentiment): string => {
  switch (sentiment) {
    case APP_CONSTANTS.SENTIMENTS.POSITIVE:
      return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
    case APP_CONSTANTS.SENTIMENTS.NEGATIVE:
      return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400';
    case APP_CONSTANTS.SENTIMENTS.NEUTRAL:
      return 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400';
    default:
      return 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400';
  }
};

/**
 * Truncate text to specified length
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

/**
 * Generate random ID
 */
export const generateId = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Capitalize first letter of each word
 */
export const capitalizeWords = (str: string): string => {
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
};

/**
 * Debounce function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(null, args), wait);
  };
};

/**
 * Deep clone object
 */
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as unknown as T;
  if (typeof obj === 'object') {
    const clonedObj = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
  return obj;
};

/**
 * Format file size
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Check if user is online
 */
export const isOnline = (): boolean => {
  return navigator.onLine;
};

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};