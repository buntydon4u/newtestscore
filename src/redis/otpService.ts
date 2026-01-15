const otpStore = new Map<string, { otp: string; expiresAt: number }>();

export const setOtp = async (email: string, otp: string, ttl: number = 600): Promise<void> => {
  const expiresAt = Date.now() + ttl * 1000;
  otpStore.set(email, { otp, expiresAt });
};

export const getOtp = async (email: string): Promise<string | null> => {
  const entry = otpStore.get(email);
  if (!entry) return null;
  if (entry.expiresAt < Date.now()) {
    otpStore.delete(email);
    return null;
  }
  return entry.otp;
};

export const deleteOtp = async (email: string): Promise<void> => {
  otpStore.delete(email);
};