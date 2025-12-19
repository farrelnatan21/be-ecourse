import { Injectable, Logger } from "@nestjs/common";
import { JobOptions, Queue } from "bull";
import { EmailJobData } from "../queue/email.queue";
import { InjectQueue } from "@nestjs/bull";

@Injectable()
export class QueueService {
    private readonly logger = new Logger(QueueService.name);

    constructor(@InjectQueue('email') private emailQueue: Queue<EmailJobData>) { }

    async addEmailJob(jobData: EmailJobData, options?: JobOptions): Promise<void> {
        try {
            const JobOptions: JobOptions = {
                removeOnComplete: false,
                removeOnFail: true,
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 6000,
                },
                delay: options?.delay || 0,
                ...options,
            };

            const job = await this.emailQueue.add('send', jobData, JobOptions);
            this.logger.log(`Email job added to the queue: ${job.id}`);
        } catch (error) {
            this.logger.error('Failed to add email job to the queue:', error);
            throw new Error('Failed to add email job to the queue');
        }
    }

    async sendEmailViaQueue(): Promise<void> {
        await this.addEmailJob({
            to: 'recipient@example.com',
            subject: 'Test Email',
            template: 'test',
            templateData: {
                name: 'John Doe',
                timestamp: new Date().toLocaleString('id-ID', {
                    timeZone: 'Asia/Jakarta',
                    dateStyle: 'full',
                    timeStyle: 'long'
                })
            },
        });
    }
}