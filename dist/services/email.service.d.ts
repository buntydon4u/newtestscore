export declare class EmailService {
    private transporter;
    constructor();
    private loadTemplate;
    private replacePlaceholders;
    sendEmailVerification(email: string, otp: string): Promise<void>;
    sendPasswordReset(email: string, otp: string): Promise<void>;
    sendEmail(options: {
        to: string;
        subject: string;
        template?: string;
        data?: Record<string, string>;
        html?: string;
    }): Promise<void>;
}
export declare const emailService: EmailService;
//# sourceMappingURL=email.service.d.ts.map