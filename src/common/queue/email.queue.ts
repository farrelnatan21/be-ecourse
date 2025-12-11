import { Process, Processor } from "@nestjs/bull";
import { EmailService } from "../services/email.service";
import { Logger } from "@nestjs/common";
import { Job } from "bull";
import { email } from "zod";

export interface EmailJobData {
    to: string | string[];
    subject: string;
    text?: string;
    html?: string;
    from?: string;
    template?: string;
    templateData?: any;
}

@Processor('email')
export class EmailProcessor {
    private readonly logger = new Logger(EmailProcessor.name);
    constructor(
        private readonly emailService: EmailService,
    ) { }
    @Process('send')
    async handleSendEmail(job: Job<EmailJobData>) {
        this.logger.log(`Processing email job ${job.id} ta ${job.data.to}`);
        try {
            const { to, subject, text, html, template, templateData } = job.data;
            let emailHtml = html;
            if (template && templateData) {
                emailHtml = this.emailService.compileTemplate(template, templateData);
            }
            const email = await this.emailService.sendEmail({ to, subject, text, html: emailHtml });

            if (email) {
                this.logger.log(`Email job ${job.id} processed successfully to ${to}`);
            } else {
                this.logger.error(`Failed to process email job ${job.id} failed to send email to ${to}`);
                throw new Error(`Failed to process email job ${job.id} failed to send email to ${to}`);
            }
        } catch (error) {
            this.logger.error(`Failed to process email job ${job.id}: ${error.message}`);
        }
    }
}
