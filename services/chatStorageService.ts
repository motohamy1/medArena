import AsyncStorage from '@react-native-async-storage/async-storage';
import { DoctorCategory, Citation } from './aiService';

export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
  category?: DoctorCategory;
  citations?: Citation[];
  suggestions?: string[];
  sourceType?: string;
  isError?: boolean;
  failedQuery?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
  specialtyId?: string;
  topicId?: string;
  topicName?: string;
}

const STORAGE_KEY_SESSIONS = '@med_arena_chat_sessions_v1';
const STORAGE_KEY_ACTIVE_SESSION_ID = '@med_arena_active_session_id_v1';

export const chatStorageService = {
  /**
   * Get all saved chat sessions sorted by latest update
   */
  async getAllSessions(): Promise<ChatSession[]> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY_SESSIONS);
      if (!raw) return [];
      const parsed: ChatSession[] = JSON.parse(raw);
      return Array.isArray(parsed)
        ? parsed.sort((a, b) => b.updatedAt - a.updatedAt)
        : [];
    } catch (e) {
      console.warn('[chatStorageService] Error reading sessions:', e);
      return [];
    }
  },

  /**
   * Get a specific session by ID
   */
  async getSessionById(sessionId: string): Promise<ChatSession | null> {
    try {
      const sessions = await this.getAllSessions();
      return sessions.find((s) => s.id === sessionId) || null;
    } catch {
      return null;
    }
  },

  /**
   * Save or update a session
   */
  async saveSession(session: ChatSession): Promise<void> {
    try {
      const sessions = await this.getAllSessions();
      const existingIdx = sessions.findIndex((s) => s.id === session.id);

      // Auto-derive a concise title from the first user message if default
      let title = session.title;
      if (!title || title === 'New Clinical Inquiry') {
        const firstUserMsg = session.messages.find((m) => m.isUser);
        if (firstUserMsg) {
          title = firstUserMsg.text.slice(0, 48).trim();
          if (firstUserMsg.text.length > 48) title += '...';
        } else {
          title = 'New Clinical Inquiry';
        }
      }

      const updatedSession: ChatSession = {
        ...session,
        title,
        updatedAt: Date.now(),
      };

      if (existingIdx >= 0) {
        sessions[existingIdx] = updatedSession;
      } else {
        sessions.unshift(updatedSession);
      }

      // Limit stored sessions to 50 for performance
      const capped = sessions.slice(0, 50);
      await AsyncStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(capped));
      await AsyncStorage.setItem(STORAGE_KEY_ACTIVE_SESSION_ID, updatedSession.id);
    } catch (e) {
      console.warn('[chatStorageService] Error saving session:', e);
    }
  },

  /**
   * Create a new blank session
   */
  async createNewSession(context?: {
    specialtyId?: string;
    topicId?: string;
    topicName?: string;
  }): Promise<ChatSession> {
    const newSession: ChatSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: context?.topicName ? `${context.topicName} Session` : 'New Clinical Inquiry',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      specialtyId: context?.specialtyId,
      topicId: context?.topicId,
      topicName: context?.topicName,
    };

    await this.saveSession(newSession);
    await AsyncStorage.setItem(STORAGE_KEY_ACTIVE_SESSION_ID, newSession.id);
    return newSession;
  },

  /**
   * Delete a session by ID
   */
  async deleteSession(sessionId: string): Promise<ChatSession[]> {
    try {
      const sessions = await this.getAllSessions();
      const filtered = sessions.filter((s) => s.id !== sessionId);
      await AsyncStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(filtered));

      const activeId = await AsyncStorage.getItem(STORAGE_KEY_ACTIVE_SESSION_ID);
      if (activeId === sessionId) {
        if (filtered.length > 0) {
          await AsyncStorage.setItem(STORAGE_KEY_ACTIVE_SESSION_ID, filtered[0].id);
        } else {
          await AsyncStorage.removeItem(STORAGE_KEY_ACTIVE_SESSION_ID);
        }
      }

      return filtered;
    } catch (e) {
      console.warn('[chatStorageService] Error deleting session:', e);
      return [];
    }
  },

  /**
   * Get active session ID
   */
  async getActiveSessionId(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEY_ACTIVE_SESSION_ID);
    } catch {
      return null;
    }
  },

  /**
   * Set active session ID
   */
  async setActiveSessionId(sessionId: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY_ACTIVE_SESSION_ID, sessionId);
    } catch (e) {
      console.warn('[chatStorageService] Error setting active session:', e);
    }
  },
};
