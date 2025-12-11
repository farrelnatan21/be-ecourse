import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './common/prisma/prisma.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';

import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailService } from './common/services/email.service';
import { BullModule } from '@nestjs/bull';
import { QueueModule } from './common/modules/queue.module';
import { CacheService } from './common/services/cache.service';
import { RedisService } from './common/services/redis.service';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    AuthModule,
    ConfigModule.forRoot({ isGlobal: true }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get<string>('REDIS_HOST') || 'localhost',
          port: configService.get<number>('REDIS_PORT') || 6379,
          password: configService.get<string>('REDIS_PASSWORD') || undefined,
        },
      }),
    }),
    QueueModule,
  ],

  controllers: [AppController],
  providers: [AppService, EmailService, CacheService, RedisService],
})
export class AppModule { }
