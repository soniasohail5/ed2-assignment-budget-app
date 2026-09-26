/**
 * Secure cryptographic utilities using native Web Crypto API (SubtleCrypto).
 * Implements PBKDF2 with HMAC-SHA-256 for password hashing and salting,
 * constant-time verification, and password entropy evaluation.
 */

const PBKDF2_ITERATIONS = 100000;
const KEY_LENGTH_BITS = 256;

// Convert Uint8Array to Hex string
function buf2hex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Convert Hex string to Uint8Array
function hex2buf(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

/**
 * Generate a cryptographically secure random salt (16 bytes)
 */
export function generateSalt(): string {
  const salt = new Uint8Array(16);
  window.crypto.getRandomValues(salt);
  return buf2hex(salt.buffer);
}

/**
 * Generate a cryptographically secure random session token (32 bytes)
 */
export function generateSecureToken(): string {
  const token = new Uint8Array(32);
  window.crypto.getRandomValues(token);
  return buf2hex(token.buffer);
}

/**
 * Hash password with PBKDF2, HMAC-SHA-256, and user salt
 */
export async function hashPassword(password: string, saltHex: string): Promise<string> {
  const encoder = new TextEncoder();
  const passwordKey = await window.crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const saltBuf = hex2buf(saltHex);
  const derivedBits = await window.crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltBuf as unknown as ArrayBuffer,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256'
    },
    passwordKey,
    KEY_LENGTH_BITS
  );

  return buf2hex(derivedBits);
}

/**
 * Constant-time comparison to prevent timing attacks
 */
export function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

export interface PasswordStrengthResult {
  score: number; // 0 - 4 (0: very weak, 4: very strong)
  label: 'Very Weak' | 'Weak' | 'Fair' | 'Strong' | 'Very Strong';
  color: string;
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
  feedback: string[];
}

/**
 * Evaluate password strength and adherence to secure authentication standards
 */
export function evaluatePasswordStrength(password: string): PasswordStrengthResult {
  const feedback: string[] = [];
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  if (!hasMinLength) feedback.push('At least 8 characters required');
  if (!hasUppercase) feedback.push('Add an uppercase letter');
  if (!hasLowercase) feedback.push('Add a lowercase letter');
  if (!hasNumber) feedback.push('Add a number');
  if (!hasSpecial) feedback.push('Add a special character (!@#$%^&*)');

  let points = 0;
  if (password.length >= 8) points++;
  if (password.length >= 12) points++;
  if (hasUppercase && hasLowercase) points++;
  if (hasNumber) points++;
  if (hasSpecial) points++;

  // Normalize to 0-4
  let score = 0;
  if (points <= 1) score = 0;
  else if (points === 2) score = 1;
  else if (points === 3) score = 2;
  else if (points === 4) score = 3;
  else score = 4;

  const labels: PasswordStrengthResult['label'][] = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
  const colors = [
    '#ef4444', // red
    '#f97316', // orange
    '#eab308', // yellow
    '#3b82f6', // blue
    '#10b981'  // emerald
  ];

  return {
    score,
    label: labels[score],
    color: colors[score],
    hasMinLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecial,
    feedback
  };
}
