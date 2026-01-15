export declare class AuthService {
    signup(email: string, username: string, password: string): Promise<{
        user: {
            id: string;
            email: string;
            username: string;
            role: import(".prisma/client").$Enums.UserRole;
        };
        message: string;
    }>;
    login(email: string, password: string): Promise<{
        user: {
            id: string;
            email: string;
            username: string;
            role: import(".prisma/client").$Enums.UserRole;
        };
        accessToken: string;
        refreshToken: string;
    }>;
    refreshTokens(refreshToken: string): Promise<{
        accessToken: string;
        expiresIn: number;
    }>;
    logout(userId: string, refreshToken: string): Promise<void>;
    changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void>;
    forgotPassword(email: string): Promise<{
        message: string;
    }>;
    verifyResetOtp(email: string, otp: string): Promise<{
        message: string;
        userId: string;
    }>;
    resetPassword(email: string, otp: string, newPassword: string): Promise<{
        message: string;
    }>;
    private generateOtp;
    sendVerificationOtp(userId: string): Promise<void>;
    verifyEmail(userId: string, otp: string): Promise<{
        message: string;
    }>;
}
export declare const authService: AuthService;
//# sourceMappingURL=auth.service.d.ts.map