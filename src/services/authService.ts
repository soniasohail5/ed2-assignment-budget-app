import { User, UserCredentials, AuthSession, CurrencyCode } from '../types/finance';
import { generateSalt, hashPassword, constantTimeCompare, generateSecureToken, evaluatePasswordStrength } from './cryptoUtils';
import { getInitialSeedData } from './mockSeedData';

const USERS_STORAGE_KEY = 'clarityspend_users_v1';
const CREDS_STORAGE_KEY = 'clarityspend_credentials_v1';
const SESSION_STORAGE_KEY = 'clarityspend_active_session_v1';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 5 * 60 * 1000; // 5 minutes lockout

// Helper to get stored users
function getAllUsers(): User[] {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to read users from localStorage:', e);
    return [];
  }
}

function saveAllUsers(users: User[]) {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

function getAllCredentials(): UserCredentials[] {
  try {
    const raw = localStorage.getItem(CREDS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to read credentials from localStorage:', e);
    return [];
  }
}

function saveAllCredentials(creds: UserCredentials[]) {
  localStorage.setItem(CREDS_STORAGE_KEY, JSON.stringify(creds));
}

export class AuthService {
  /**
   * Initializes demo account if not already present
   */
  static async initDemoAccount(): Promise<User> {
    const users = getAllUsers();
    const demoEmail = 'demo@clarityspend.com';
    const existing = users.find(u => u.email.toLowerCase() === demoEmail);

    if (existing) {
      return existing;
    }

    const salt = generateSalt();
    const passwordHash = await hashPassword('Demo1234!', salt);
    const userId = 'usr_demo_fin';

    const demoUser: User = {
      id: userId,
      email: demoEmail,
      name: 'Alex Morgan',
      currency: 'USD',
      monthlyIncomeTarget: 3850,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      securitySettings: {
        sessionTimeoutMinutes: 60,
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastPasswordChange: new Date().toISOString(),
        requireStrongPassword: true,
        twoFactorSimulated: false,
      }
    };

    const demoCreds: UserCredentials = {
      userId,
      email: demoEmail,
      passwordHash,
      salt,
      iterations: 100000,
    };

    saveAllUsers([...users, demoUser]);
    const creds = getAllCredentials();
    saveAllCredentials([...creds, demoCreds]);

    // Initialize user data with seed transactions & categories
    const seed = getInitialSeedData(userId);
    localStorage.setItem(`clarityspend_user_${userId}_categories`, JSON.stringify(seed.categories));
    localStorage.setItem(`clarityspend_user_${userId}_transactions`, JSON.stringify(seed.transactions));
    localStorage.setItem(`clarityspend_user_${userId}_goals`, JSON.stringify(seed.goals));

    return demoUser;
  }

  /**
   * Register a new user with secure password hashing and salting
   */
  static async register(params: {
    name: string;
    email: string;
    password: string;
    currency?: CurrencyCode;
    monthlyIncome?: number;
  }): Promise<{ user: User; session: AuthSession }> {
    const email = params.email.trim().toLowerCase();
    const name = params.name.trim();

    if (!name || name.length < 2) {
      throw new Error('Please enter a valid full name.');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Please enter a valid email address.');
    }

    // Password validation
    const strength = evaluatePasswordStrength(params.password);
    if (!strength.hasMinLength || !strength.hasNumber || (!strength.hasUppercase && !strength.hasSpecial)) {
      throw new Error('Password must be at least 8 characters and contain a mix of letters, numbers, and symbols.');
    }

    const users = getAllUsers();
    if (users.some(u => u.email.toLowerCase() === email)) {
      throw new Error('An account with this email address already exists.');
    }

    const userId = 'usr_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 7);
    const salt = generateSalt();
    const passwordHash = await hashPassword(params.password, salt);

    const newUser: User = {
      id: userId,
      email,
      name,
      currency: params.currency || 'USD',
      monthlyIncomeTarget: params.monthlyIncome || 3500,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      securitySettings: {
        sessionTimeoutMinutes: 60,
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastPasswordChange: new Date().toISOString(),
        requireStrongPassword: true,
        twoFactorSimulated: false,
      }
    };

    const newCreds: UserCredentials = {
      userId,
      email,
      passwordHash,
      salt,
      iterations: 100000,
    };

    saveAllUsers([...users, newUser]);
    const creds = getAllCredentials();
    saveAllCredentials([...creds, newCreds]);

    // Seed initial categories & sample starter data for realistic visual analytics
    const seed = getInitialSeedData(userId);
    localStorage.setItem(`clarityspend_user_${userId}_categories`, JSON.stringify(seed.categories));
    localStorage.setItem(`clarityspend_user_${userId}_transactions`, JSON.stringify(seed.transactions));
    localStorage.setItem(`clarityspend_user_${userId}_goals`, JSON.stringify(seed.goals));

    // Create active session
    const session = this.createSession(userId, true);
    return { user: newUser, session };
  }

  /**
   * Log in user with password verification and rate-limiting brute force protection
   */
  static async login(params: {
    email: string;
    password: string;
    rememberMe?: boolean;
  }): Promise<{ user: User; session: AuthSession }> {
    const email = params.email.trim().toLowerCase();
    const users = getAllUsers();
    const user = users.find(u => u.email.toLowerCase() === email);

    if (!user) {
      // Secure message: do not reveal whether user exists
      throw new Error('Invalid email or password. Please verify your credentials.');
    }

    // Check account lockout
    const now = Date.now();
    if (user.securitySettings.lockedUntil && user.securitySettings.lockedUntil > now) {
      const remainingSeconds = Math.ceil((user.securitySettings.lockedUntil - now) / 1000);
      const minutes = Math.floor(remainingSeconds / 60);
      const seconds = remainingSeconds % 60;
      throw new Error(
        `Account temporarily locked due to too many failed attempts. Try again in ${minutes > 0 ? `${minutes}m ` : ''}${seconds}s.`
      );
    }

    const credsList = getAllCredentials();
    const creds = credsList.find(c => c.userId === user.id);
    if (!creds) {
      throw new Error('Invalid email or password.');
    }

    const computedHash = await hashPassword(params.password, creds.salt);
    const isValid = constantTimeCompare(computedHash, creds.passwordHash);

    if (!isValid) {
      // Increment failed attempts
      user.securitySettings.failedLoginAttempts = (user.securitySettings.failedLoginAttempts || 0) + 1;
      if (user.securitySettings.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
        user.securitySettings.lockedUntil = now + LOCKOUT_DURATION_MS;
      }
      saveAllUsers(users);

      const attemptsRemaining = MAX_FAILED_ATTEMPTS - user.securitySettings.failedLoginAttempts;
      if (attemptsRemaining <= 0) {
        throw new Error('Too many failed attempts. Your account has been temporarily locked for 5 minutes.');
      } else {
        throw new Error(`Invalid credentials. ${attemptsRemaining} attempt${attemptsRemaining === 1 ? '' : 's'} remaining before temporary lockout.`);
      }
    }

    // Login successful: reset failed attempts
    user.securitySettings.failedLoginAttempts = 0;
    user.securitySettings.lockedUntil = null;
    user.lastLoginAt = new Date().toISOString();
    saveAllUsers(users);

    const session = this.createSession(user.id, params.rememberMe ?? true);
    return { user, session };
  }

  /**
   * Fast demo login for instant app testing
   */
  static async loginDemo(): Promise<{ user: User; session: AuthSession }> {
    const demoUser = await this.initDemoAccount();
    const session = this.createSession(demoUser.id, true);
    return { user: demoUser, session };
  }

  /**
   * Create and store an authenticated session
   */
  private static createSession(userId: string, rememberMe: boolean): AuthSession {
    const durationMs = rememberMe ? 7 * 24 * 60 * 60 * 1000 : 2 * 60 * 60 * 1000; // 7 days or 2 hours
    const session: AuthSession = {
      token: generateSecureToken(),
      userId,
      expiresAt: Date.now() + durationMs,
      rememberMe,
    };
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    return session;
  }

  /**
   * Get currently logged-in user from active session
   */
  static getCurrentUser(): User | null {
    try {
      const rawSession = localStorage.getItem(SESSION_STORAGE_KEY);
      if (!rawSession) return null;

      const session: AuthSession = JSON.parse(rawSession);
      if (Date.now() > session.expiresAt) {
        this.logout();
        return null;
      }

      const users = getAllUsers();
      const user = users.find(u => u.id === session.userId);
      return user || null;
    } catch (e) {
      console.error('Error fetching current user:', e);
      return null;
    }
  }

  /**
   * Log out and invalidate session
   */
  static logout(): void {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  }

  /**
   * Update user profile information
   */
  static updateUserProfile(userId: string, updates: Partial<Pick<User, 'name' | 'currency' | 'monthlyIncomeTarget' | 'securitySettings'>>): User {
    const users = getAllUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index === -1) throw new Error('User not found');

    const updated: User = {
      ...users[index],
      ...updates,
      securitySettings: {
        ...users[index].securitySettings,
        ...(updates.securitySettings || {}),
      }
    };

    users[index] = updated;
    saveAllUsers(users);
    return updated;
  }

  /**
   * Get current active session details
   */
  static getActiveSession(): AuthSession | null {
    try {
      const rawSession = localStorage.getItem(SESSION_STORAGE_KEY);
      if (!rawSession) return null;
      const session: AuthSession = JSON.parse(rawSession);
      if (Date.now() > session.expiresAt) {
        this.logout();
        return null;
      }
      return session;
    } catch {
      return null;
    }
  }

  /**
   * Get list of all registered accounts on this device for easy switching
   */
  static getRegisteredAccounts(): Pick<User, 'id' | 'email' | 'name' | 'currency' | 'lastLoginAt'>[] {
    const users = getAllUsers();
    return users.map(u => ({
      id: u.id,
      email: u.email,
      name: u.name,
      currency: u.currency,
      lastLoginAt: u.lastLoginAt,
    }));
  }

  /**
   * Delete an account and its associated user data
   */
  static deleteAccount(userId: string): void {
    const users = getAllUsers().filter(u => u.id !== userId);
    saveAllUsers(users);

    const creds = getAllCredentials().filter(c => c.userId !== userId);
    saveAllCredentials(creds);

    localStorage.removeItem(`clarityspend_user_${userId}_categories`);
    localStorage.removeItem(`clarityspend_user_${userId}_transactions`);
    localStorage.removeItem(`clarityspend_user_${userId}_goals`);

    const current = this.getActiveSession();
    if (current && current.userId === userId) {
      this.logout();
    }
  }

  /**
   * Change user password securely
   */
  static async changePassword(userId: string, currentPass: string, newPass: string): Promise<boolean> {
    const credsList = getAllCredentials();
    const credsIndex = credsList.findIndex(c => c.userId === userId);
    if (credsIndex === -1) throw new Error('User credentials record not found');

    const creds = credsList[credsIndex];
    const currentHash = await hashPassword(currentPass, creds.salt);
    if (!constantTimeCompare(currentHash, creds.passwordHash)) {
      throw new Error('Current password does not match.');
    }

    const strength = evaluatePasswordStrength(newPass);
    if (!strength.hasMinLength || strength.score < 2) {
      throw new Error('New password is not strong enough. Ensure at least 8 characters with numbers and letters.');
    }

    const newSalt = generateSalt();
    const newHash = await hashPassword(newPass, newSalt);

    credsList[credsIndex] = {
      ...creds,
      salt: newSalt,
      passwordHash: newHash,
    };
    saveAllCredentials(credsList);

    // Update user record
    const users = getAllUsers();
    const uIndex = users.findIndex(u => u.id === userId);
    if (uIndex !== -1) {
      users[uIndex].securitySettings.lastPasswordChange = new Date().toISOString();
      saveAllUsers(users);
    }

    return true;
  }
}
