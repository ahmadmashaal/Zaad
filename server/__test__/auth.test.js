import { hashPassword, comparePassword } from '../utils/auth.js';

describe('Authentication Utilities', () => {
  it('should hash the password correctly', async () => {
    const password = 'P@ssw0rd123';
    const hashedPassword = await hashPassword(password);

    expect(hashedPassword).not.toBe(password);
    expect(hashedPassword).toMatch(/^\$2[ayb]\$.{56}$/);
  });

  it('should return true for a valid password comparison', async () => {
    const password = 'P@ssw0rd123';
    const hashedPassword = await hashPassword(password);
    const match = await comparePassword(password, hashedPassword);

    expect(match).toBe(true);
  });

  it('should return false for an invalid password comparison', async () => {
    const password = 'P@ssw0rd123';
    const hashedPassword = await hashPassword(password);
    const match = await comparePassword('WrongPassword', hashedPassword);

    expect(match).toBe(false);
  });
});
