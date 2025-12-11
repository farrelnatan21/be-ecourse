import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Transporter } from "nodemailer";
import * as nodemailer from 'nodemailer';
import * as path from "path";
import * as fs from 'fs';
import * as hbs from 'hbs';

export interface EmailOptions {
    to: string | string[];
    subject: string;
    text?: string;
    html?: string;
    from?: string;
}

@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name);
    private transporter: Transporter; // ✅ Fixed typo: trasnporter → transporter

    constructor(
        private configService: ConfigService,
    ) {
        this.createTransporter();
    }

    private createTransporter(): void {
        const smtpHost = this.configService.get<string>('SMTP_HOST');
        const smtpPort = this.configService.get<number>('SMTP_PORT');
        const smtpUser = this.configService.get<string>('SMTP_USER');
        const smtpPass = this.configService.get<string>('SMTP_PASSWORD');

        if (!smtpHost || !smtpPort || !smtpUser || !smtpPass) {
            this.logger.warn('SMTP configuration is not found. Email service will not be available.'); // ✅ Fixed typo: availbale → available
            return;
        }

        this.transporter = nodemailer.createTransport({ // ✅ Fixed typo
            host: smtpHost,
            port: Number(smtpPort), // ✅ Convert to number explicitly
            secure: smtpPort === 465, // ✅ Only true for port 465
            auth: {
                user: smtpUser,
                pass: smtpPass,
            },
        });
        this.verifyConnection();
    }

    private async verifyConnection(): Promise<void> {
        try {
            await this.transporter.verify(); // ✅ Fixed typo
            this.logger.log('SMTP connection verified successfully.');
        } catch (error) {
            this.logger.error('Failed to verify SMTP connection:', error);
            throw new Error('Failed to verify SMTP connection');
        }
    }

    async sendEmail(options: EmailOptions): Promise<boolean> {
        if (!this.transporter) { // ✅ Fixed typo
            this.logger.error('Email transporter is not configured.');
            return false;
        }

        try {
            const defaultFrom = this.configService.get<string>('SMTP_EMAIL_SENDER') || 'noreply@example.com'; // ✅ Better default

            const mailOptions = {
                from: options.from || defaultFrom,
                to: Array.isArray(options.to) ? options.to.join(',') : options.to,
                subject: options.subject,
                text: options.text,
                html: options.html
            };

            const result = await this.transporter.sendMail(mailOptions); // ✅ Fixed typo: resutl → result, trasnporter → transporter
            this.logger.log(`Email sent: ${result.messageId}`); // ✅ Fixed: use backticks for template literal
            return true;
        } catch (error) {
            this.logger.error('Error sending email:', error);
            return false;
        }
    }

    public compileTemplate(template: string, variables: Record<string, any>): string {
        try {
            const templatePath = path.join(
                process.cwd(),
                'src',
                'common',
                'templates',
                'email',
                `${template}.hbs`,
            );

            const templateSource = fs.readFileSync(templatePath, 'utf-8');
            const compiledTemplate = hbs.compile(templateSource); // ✅ Better variable name
            return compiledTemplate(variables);
        } catch (error) {
            this.logger.error('Error compiling email template:', error);
            throw new Error('Failed to compile email template');
        }
    }

    async sendTestEmail(): Promise<boolean> {
        const html = this.compileTemplate('test', {
            name: 'John Doe',
            timestamp: new Date().toLocaleString('id-ID', {
                timeZone: 'Asia/Jakarta',
                dateStyle: 'full',
                timeStyle: 'long'
            })
        });

        return this.sendEmail({
            to: 'john.doe@example.com', // ⚠️ GANTI dengan email Anda untuk testing!
            subject: 'Test Email from E-Course Platform',
            html,
        });
    }
}