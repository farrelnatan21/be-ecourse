import { BullModule } from "@nestjs/bull";
import { Global, Module } from "@nestjs/common";
import { EmailService } from "../services/email.service";
import { EmailProcessor } from "../queue/email.queue";
import { QueueService } from "../services/queue.service";

@Global()
@Module({
    imports: [
        BullModule.registerQueue({
            name: 'email',
        }),
    ],
    providers: [EmailService, EmailProcessor, QueueService],
    exports: [QueueService],
})
export class QueueModule { }