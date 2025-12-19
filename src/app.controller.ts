import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from './common/prisma/prisma.service';
import { JwtAuthGuard } from './modules/auth/guards/jwt.guard';
import { CurrentUser } from './modules/auth/decorators/current-user.decorator';
import { UsersResponseDto } from './modules/users/dto/users-response.dto';
import { EmailService } from './common/services/email.service';
import { QueueService } from './common/services/queue.service';
import { BaseResponse } from './common/interface/base-response.interface';
import { CacheService } from './common/services/cache.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly queueService: QueueService,
    private readonly cacheService: CacheService,
  ) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('test-roles')
  async testRoles() {
    return await this.prisma.role.findMany();
  }
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@CurrentUser() user: UsersResponseDto) {
    return user;
  }
  @Get('test-email')
  async testEmail() {
    const result = await this.emailService.sendTestEmail();
    return {
      message: 'Test email sent successfully',
      data: result,
    }
  }

  @Get('test-email-queue')
  async testQueue(): Promise<BaseResponse<boolean>> {
    await this.queueService.sendEmailViaQueue();
    return {
      message: 'Test queue sent successfully',
      data: true,
    }
  }

  @Get('test-cache')
  async testCache() {
    const key = 'test:key';
    const value = { message: 'hello world' };

    await this.cacheService.set(key, value, 60)
    const cachedValue = await this.cacheService.get(key);

    return {
      message: 'Test cache sent successfully',
      data: {
        cachedValue,
        keyExists: await this.cacheService.exists(key)
      }
    }
  }
}
