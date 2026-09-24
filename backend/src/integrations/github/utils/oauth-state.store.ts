import * as crypto from 'crypto';

interface StateEntry {
  userId: string;
  expiresAt: number;
}

/**
 * In-memory store for OAuth state tokens with automatic TTL cleanup
 */
class OAuthStateStore {
  private states = new Map<string, StateEntry>();
  private readonly TTL_MS = 10 * 60 * 1000; // 10 minutes

  /**
   * Generates a cryptographically secure random state associated with a CaelumOS user ID
   */
  generateState(userId: string): string {
    this.cleanExpired();
    const state = crypto.randomBytes(32).toString('hex');
    this.states.set(state, {
      userId,
      expiresAt: Date.now() + this.TTL_MS,
    });
    return state;
  }

  /**
   * Validates state, consumes it (single-use to prevent replay), and returns the matching userId
   */
  validateAndConsumeState(state: string): string | null {
    this.cleanExpired();
    if (!state) return null;

    const entry = this.states.get(state);
    if (!entry) return null;

    this.states.delete(state);

    if (Date.now() > entry.expiresAt) {
      return null;
    }

    return entry.userId;
  }

  private cleanExpired(): void {
    const now = Date.now();
    for (const [key, value] of this.states.entries()) {
      if (now > value.expiresAt) {
        this.states.delete(key);
      }
    }
  }
}

export const oauthStateStore = new OAuthStateStore();
