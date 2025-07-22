// Google Calendar Integration Service
// This service handles calendar sync for ticket reminders and agent scheduling
import { env } from '../config/env';
import { doc, updateDoc, getDoc, query, collection, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import toast from 'react-hot-toast';

export interface CalendarConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scope: string;
}

// Google Calendar API configuration
const calendarConfig: CalendarConfig = {
  clientId: env.google.clientId,
  clientSecret: env.google.clientSecret,
  redirectUri: window.location.origin,
  scope: 'https://www.googleapis.com/auth/calendar'
};

export interface CalendarEvent {
  id?: string;
  summary: string;
  description: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  attendees?: Array<{
    email: string;
    displayName?: string;
  }>;
  reminders?: {
    useDefault: boolean;
    overrides?: Array<{
      method: 'email' | 'popup';
      minutes: number;
    }>;
  };
}

class CalendarService {
  private accessToken: string | null = null;
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    // Origin check for local dev
    const origin = window.location.origin;
    if (origin !== "http://localhost:5175") {
      console.error("Google Calendar OAuth blocked due to invalid origin:", origin);
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem("calendarIntegrationFailed", "true");
      }
      if (typeof toast !== 'undefined') {
        toast.error("Calendar integration not available on this environment.");
      }
      return;
    }

    try {
      // Load Google API
      await this.loadGoogleAPI();
      
      // Initialize Google Auth
      await new Promise<void>((resolve, reject) => {
        gapi.load('auth2', () => {
          gapi.auth2.init({
            client_id: calendarConfig.clientId,
            scope: calendarConfig.scope
          }).then(() => {
            this.isInitialized = true;
            resolve();
          }).catch(reject);
        });
      });

      console.log('✅ Google Calendar API initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Google Calendar API:', error);
      throw error;
    }
  }

  private async loadGoogleAPI(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof gapi !== 'undefined') {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google API'));
      document.head.appendChild(script);
    });
  }

  async signIn(): Promise<boolean> {
    try {
      await this.initialize();
      
      const authInstance = gapi.auth2.getAuthInstance();
      const user = await authInstance.signIn();
      
      this.accessToken = user.getAuthResponse().access_token;
      
      // Load Calendar API
      await new Promise<void>((resolve, reject) => {
        gapi.load('client', () => {
          gapi.client.init({
            apiKey: 'your-api-key-here', // You'll need to add this
            discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest']
          }).then(() => resolve()).catch(reject);
        });
      });

      console.log('✅ Google Calendar signed in successfully');
      return true;
    } catch (error) {
      console.error('❌ Google Calendar sign-in failed:', error);
      return false;
    }
  }

  async createTicketReminder(
    ticketId: string,
    ticketTitle: string,
    agentEmail: string,
    reminderDate: Date
  ): Promise<string | null> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      if (!this.accessToken) {
        console.warn('⚠️ Not signed in to Google Calendar');
        return null;
      }
      if (!(reminderDate instanceof Date) || isNaN(reminderDate.getTime())) {
        console.error('❌ Invalid reminderDate for calendar event:', reminderDate);
        throw new Error('Invalid reminderDate for calendar event');
      }
      const endDate = new Date(reminderDate.getTime() + 30 * 60000);
      if (!(endDate instanceof Date) || isNaN(endDate.getTime())) {
        console.error('❌ Invalid endDate for calendar event:', endDate);
        throw new Error('Invalid endDate for calendar event');
      }
      const event: CalendarEvent = {
        summary: `Follow up: ${ticketTitle}`,
        description: `Ticket ID: ${ticketId}\n\nReminder to follow up on this support ticket.`,
        start: {
          dateTime: reminderDate.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        end: {
          dateTime: endDate.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        attendees: [
          {
            email: agentEmail
          }
        ],
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 60 },
            { method: 'popup', minutes: 15 }
          ]
        }
      };
      const response = await gapi.client.calendar.events.insert({
        calendarId: 'primary',
        resource: event
      });
      console.log('✅ Calendar reminder created:', response.result.id);
      return response.result.id || null;
    } catch (error) {
      console.error('❌ Failed to create calendar reminder:', error);
      return null;
    }
  }

  async scheduleAgentMeeting(
    agentEmails: string[],
    subject: string,
    description: string,
    startTime: Date,
    durationMinutes: number = 60
  ): Promise<string | null> {
    try {
      if (!this.accessToken) {
        console.warn('⚠️ Not signed in to Google Calendar');
        return null;
      }
      if (!(startTime instanceof Date) || isNaN(startTime.getTime())) {
        console.error('❌ Invalid startTime for calendar event:', startTime);
        throw new Error('Invalid startTime for calendar event');
      }
      const endTime = new Date(startTime.getTime() + durationMinutes * 60000);
      if (!(endTime instanceof Date) || isNaN(endTime.getTime())) {
        console.error('❌ Invalid endTime for calendar event:', endTime);
        throw new Error('Invalid endTime for calendar event');
      }
      const event: CalendarEvent = {
        summary: subject,
        description: description,
        start: {
          dateTime: startTime.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        end: {
          dateTime: endTime.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        attendees: agentEmails.map(email => ({ email })),
        reminders: {
          useDefault: true
        }
      };

      const response = await gapi.client.calendar.events.insert({
        calendarId: 'primary',
        resource: event
      });

      console.log('✅ Agent meeting scheduled:', response.result.id);
      return response.result.id || null;
    } catch (error) {
      console.error('❌ Failed to schedule agent meeting:', error);
      return null;
    }
  }

  async getAgentAvailability(
    agentEmail: string,
    startDate: Date,
    endDate: Date
  ): Promise<Array<{ start: Date; end: Date }>> {
    try {
      if (!this.accessToken) {
        console.warn('⚠️ Not signed in to Google Calendar');
        return [];
      }

      const response = await gapi.client.calendar.freebusy.query({
        resource: {
          timeMin: startDate.toISOString(),
          timeMax: endDate.toISOString(),
          items: [{ id: agentEmail }]
        }
      });

      const busyTimes = response.result.calendars[agentEmail]?.busy || [];
      
      return busyTimes.map((busy: any) => ({
        start: new Date(busy.start),
        end: new Date(busy.end)
      }));
    } catch (error) {
      console.error('❌ Failed to get agent availability:', error);
      return [];
    }
  }

  async deleteEvent(eventId: string): Promise<boolean> {
    try {
      if (!this.accessToken) {
        console.warn('⚠️ Not signed in to Google Calendar');
        return false;
      }

      await gapi.client.calendar.events.delete({
        calendarId: 'primary',
        eventId: eventId
      });

      console.log('✅ Calendar event deleted:', eventId);
      return true;
    } catch (error) {
      console.error('❌ Failed to delete calendar event:', error);
      return false;
    }
  }

  isSignedIn(): boolean {
    return !!this.accessToken;
  }

  async signOut(): Promise<void> {
    try {
      if (this.isInitialized) {
        const authInstance = gapi.auth2.getAuthInstance();
        await authInstance.signOut();
      }
      this.accessToken = null;
      console.log('✅ Google Calendar signed out');
    } catch (error) {
      console.error('❌ Failed to sign out from Google Calendar:', error);
    }
  }
}

// Export singleton instance
export const calendarService = new CalendarService();
export const activeCalendarService = new CalendarService();

// Mock implementation for development
export const mockCalendarService = {
  async createTicketReminder(ticketId: string, ticketTitle: string, agentEmail: string, reminderDate: Date): Promise<string | null> {
    console.log(`📅 Mock: Creating calendar reminder for ticket ${ticketId} at ${reminderDate.toISOString()}`);
    return `mock-event-${Date.now()}`;
  },

  async scheduleAgentMeeting(agentEmails: string[], subject: string, description: string, startTime: Date): Promise<string | null> {
    console.log(`📅 Mock: Scheduling meeting "${subject}" with ${agentEmails.join(', ')} at ${startTime.toISOString()}`);
    return `mock-meeting-${Date.now()}`;
  },

  async getAgentAvailability(agentEmail: string, startDate: Date, endDate: Date): Promise<Array<{ start: Date; end: Date }>> {
    console.log(`📅 Mock: Getting availability for ${agentEmail} from ${startDate.toISOString()} to ${endDate.toISOString()}`);
    return []; // Mock: agent is always available
  },

  isSignedIn(): boolean {
    return true; // Mock: always signed in
  }
};

// Use mock service in development, real service in production
export const activeService = process.env.NODE_ENV === 'development' ? mockCalendarService : calendarService;

// Global type declaration for Google API
declare global {
  const gapi: any;
}

// Utility: Create a Google Calendar event for a ticket
export async function createCalendarEvent(ticket: {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  dueDate?: string | Date;
  createdAt: string | Date;
  link?: string;
}) {
  const { id, title, description, assignedTo, dueDate, createdAt, link } = ticket;
  const agentEmail = assignedTo;
  const start = dueDate ? new Date(dueDate) : new Date((createdAt instanceof Date ? createdAt : new Date(createdAt)).getTime() + 24 * 60 * 60 * 1000);
  const end = new Date(start.getTime() + 60 * 60 * 1000); // 1 hour event
  const event = {
    summary: `Ticket #${id}: ${title}`,
    description: `${description}\n\nView ticket: ${link || ''}`,
    start: {
      dateTime: start.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    },
    end: {
      dateTime: end.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    },
    attendees: [{ email: agentEmail }],
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: 10 }
      ]
    }
  };
  if (!activeCalendarService.isSignedIn()) return null;
  const response = await gapi.client.calendar.events.insert({ calendarId: 'primary', resource: event });
  return response.result.id || null;
}

// Utility: Delete a Google Calendar event by ticketId (requires eventId mapping)
export async function deleteCalendarEvent(ticketId: string) {
  // You must store eventId <-> ticketId mapping in Firestore or ticket doc
  // Example: eventId is stored as ticket.calendarEventId
  // Fetch ticket by ticketId, get eventId, then delete
  // ...existing code for fetching eventId...
  // await gapi.client.calendar.events.delete({ calendarId: 'primary', eventId });
}

// Utility: Update a Google Calendar event for a ticket
export async function updateCalendarEvent(ticket: {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  dueDate?: string | Date;
  createdAt: string | Date;
  link?: string;
}) {
  // Similar to createCalendarEvent, but use gapi.client.calendar.events.update
  // ...existing code...
}

// Utility: Connect Google Calendar and update Firestore flag
export async function connectGoogleCalendar(userId: string): Promise<'success' | 'error' | 'cancel'> {
  try {
    const signedIn = await activeCalendarService.signIn();
    if (!signedIn) return 'cancel';
    // Save flag in Firestore
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { calendarConnected: true });
    return 'success';
  } catch (e) {
    return 'error';
  }
}

// Delete all Google Calendar events for a user (by tickets with calendarEventId)
export async function deleteAllUserCalendarEvents(userId: string) {
  const ticketsQuery = query(collection(db, 'tickets'), where('submitter', '==', userId));
  const ticketsSnap = await getDocs(ticketsQuery);
  for (const docSnap of ticketsSnap.docs) {
    const data = docSnap.data();
    if (data.calendarEventId && typeof calendarService.deleteEvent === 'function') {
      try {
        await calendarService.deleteEvent(data.calendarEventId);
      } catch (e) {
        // Log but don't block
        console.warn('Failed to delete calendar event', data.calendarEventId, e);
      }
    }
  }
}