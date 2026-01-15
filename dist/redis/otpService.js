const otpStore = new Map();
export const setOtp = async (email, otp, ttl = 600) => {
    const expiresAt = Date.now() + ttl * 1000;
    otpStore.set(email, { otp, expiresAt });
};
export const getOtp = async (email) => {
    const entry = otpStore.get(email);
    if (!entry)
        return null;
    if (entry.expiresAt < Date.now()) {
        otpStore.delete(email);
        return null;
    }
    return entry.otp;
};
export const deleteOtp = async (email) => {
    otpStore.delete(email);
};
//# sourceMappingURL=otpService.js.map