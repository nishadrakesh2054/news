const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 128;

export function validatePassword(password: string): string | null {
  if (!password || password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  if (password.length > MAX_PASSWORD_LENGTH) {
    return `Password must be at most ${MAX_PASSWORD_LENGTH} characters.`;
  }
  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    return "Password must include at least one letter and one number.";
  }
  if (!/[A-Z]/.test(password) && !/[^A-Za-z0-9]/.test(password)) {
    return "Password must include an uppercase letter or a special character.";
  }
  return null;
}

export const PASSWORD_MIN_LENGTH = MIN_PASSWORD_LENGTH;
export const PASSWORD_MAX_LENGTH = MAX_PASSWORD_LENGTH;

/** Prefer this cost everywhere (register, admin create, reset, profile). */
export const BCRYPT_COST = 12;
