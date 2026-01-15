export const checkLoginRateLimit = async (_identifier: string): Promise<boolean> => {
  return true;
};

export const checkOtpRateLimit = async (_email: string): Promise<boolean> => {
  return true;
};