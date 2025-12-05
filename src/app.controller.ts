import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from './common/prisma/prisma.service';
import { JwtAuthGuard } from './modules/auth/guards/jwt.guard';
import { CurrentUser } from './modules/auth/decorators/current-user.decorator';
import { UsersResponseDto } from './modules/users/dto/users-response.dto';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService,
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
}
