import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class EmailService {
  private transporter: nodemailer.Transporter;

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

  private loadTemplate(templateName: string): string {
    const templatePath = path.join(__dirname, '../templates', `${templateName}.html`);
    return fs.readFileSync(templatePath, 'utf-8');
  }

  private replacePlaceholders(template: string, replacements: Record<string, string>): string {
    let result = template;
    for (const [key, value] of Object.entries(replacements)) {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }
    return result;
  }

  async sendEmailVerification(email: string, otp: string): Promise<void> {
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

  async sendPasswordReset(email: string, otp: string): Promise<void> {
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

  async sendEmail(options: {
    to: string;
    subject: string;
    template?: string;
    data?: Record<string, string>;
    html?: string;
  }): Promise<void> {
    let html = options.html;

    if (!html && options.template) {
      const template = this.loadTemplate(options.template);
      html = this.replacePlaceholders(template, options.data || {});
    }

    const mailOptions = {
      from: process.env.SMTP_USER || 'dev@agixam.com',
      to: options.to,
      subject: options.subject,
      html: html || '',
    };

    await this.transporter.sendMail(mailOptions);
  }
}

export const emailService = new EmailService();
