import { Injectable, Logger, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Redis from "ioredis";

@Injectable()
export class RedisService implements OnModuleDestroy {
    private readonly logger = new Logger(RedisService.name);
    private client: Redis
    constructor(
        private configService: ConfigService
    ) {
        this.connect();
    }

    private connect(): void {
        const host = this.configService.get<string>("REDIS_HOST", "localhost");
        const port = this.configService.get<number>("REDIS_PORT", 6379);
        const password = this.configService.get<string>("REDIS_PASSWORD", "");

        this.client = new Redis({
            host,
            port,
            password: password || undefined,
            maxRetriesPerRequest: null,
            enableReadyCheck: true,
        });

        this.client.on("connect", () => {
            this.logger.log("Redis connected");
        });

        this.client.on("error", (error) => {
            this.logger.error("Redis error:", error);
        });

        this.client.on("close", () => {
            this.logger.log("Redis disconnected");
        });

        this.client.on('ready', () => {
            this.logger.log("Redis ready");
        });
    }
    getClient(): Redis {
        return this.client;
    }
    async onModuleDestroy() {
        this.logger.log("Redis module destroyed");
        await this.client.quit();
    }
}