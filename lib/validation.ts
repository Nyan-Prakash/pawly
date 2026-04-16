export interface PasswordValidationResult {
  valid: boolean;
  message: string;
}

/**
 * Validates a password meets minimum security requirements:
 * - At least 10 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one digit
 */
export function validatePassword(password: string): PasswordValidationResult {
  if (password.length < 10) {
    return { valid: false, message: 'Password must be at least 10 characters.' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must include an uppercase letter.' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must include a lowercase letter.' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must include a number.' };
  }
  return { valid: true, message: '' };
}

export const PASSWORD_PLACEHOLDER = 'Min. 10 chars, upper, lower & number';
