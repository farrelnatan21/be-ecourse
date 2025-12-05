import { Injectable, UnauthorizedException } from "@nestjs/common";
import { UsersService } from "src/modules/users/services/users.service";
import { JwtTokenService } from "./jwt.service";
import { PrismaService } from "src/common/prisma/prisma.service";
import { LoginDto } from "src/modules/users/dto/login.dto";
import * as bcrypt from 'bcrypt';
import { BaseResponse } from "src/common/interface/base-response.interface";

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtTokenService: JwtTokenService,
        private prisma: PrismaService,
    ) { }

    async login(loginDto: LoginDto): Promise<BaseResponse<AuthResponseDto>> {
        const user = await this.usersService.findByEmailWithPassword(loginDto.email);

        if (!user) {
            throw new UnauthorizedException('invalid credentials');
        }

        if (!user.isActive) {
            throw new UnauthorizedException('user is not active');
        }
        if (!user.isVerified) {
            throw new UnauthorizedException('user is not verified');
        }
        const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('invalid credentials');
        }

        const { password, ...userWithoutPassword } = user;
    }
}