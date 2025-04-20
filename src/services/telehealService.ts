import { setupTelehealthSession } from './api';

export interface TelehealthSession {
  sessionUrl: string;
  sessionId: string;
  password: string;
}

export const createTelehealthSession = async (): Promise<TelehealthSession> => {
  try {
    const session = await setupTelehealthSession();
    return session as TelehealthSession;
  } catch (error) {
    console.error("Error creating telehealth session:", error);
    throw error;
  }
};

export const joinTelehealthSession = (sessionUrl: string): void => {
  // In a real implementation, this might do more setup before redirecting
  // For now, we'll just open the URL in a new tab
  window.open(sessionUrl, '_blank');
};
