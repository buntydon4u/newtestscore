import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: 'rjkumarhosting@gmail.com',
                pass: 'lyxn qzhb ckpp ilzm'
            }
        });
    }
    loadTemplate(templateName) {
        const templatePath = path.join(__dirname, '../templates', `${templateName}.html`);
        return fs.readFileSync(templatePath, 'utf-8');
    }
    replacePlaceholders(template, replacements) {
        let result = template;
        for (const [key, value] of Object.entries(replacements)) {
            result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
        }
        return result;
    }
    async sendEmailVerification(email, otp) {
        const template = this.loadTemplate('signupVerification');
        const html = this.replacePlaceholders(template, {
            otp: otp,
            expiryTime: '10 minutes',
        });
        const mailOptions = {
            from: process.env.SMTP_USER || 'dev@agixam.com',
            to: email,
            subject: 'Verify Your Email - AGIXAM',
            html: html,
        };
        await this.transporter.sendMail(mailOptions);
    }
    async sendPasswordReset(email, otp) {
        const template = this.loadTemplate('passwordReset');
        const html = this.replacePlaceholders(template, {
            otp: otp,
            expiryTime: '10 minutes',
        });
        const mailOptions = {
            from: process.env.SMTP_USER || 'dev@agixam.com',
            to: email,
            subject: 'Reset Your Password - AGIXAM',
            html: html,
        };
        await this.transporter.sendMail(mailOptions);
    }
}
export const emailService = new EmailService();
//# sourceMappingURL=email.service.js.map