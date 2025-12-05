import { Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginDto } from "src/modules/users/dto/login.dto";
import { AuthResponseDto } from "../dto/auth-response.dto";
import { BaseResponse } from "src/common/interface/base-response.interface";

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('login')
    async login(
        @Body() loginDto: LoginDto,
    ): Promise<BaseResponse<AuthResponseDto>> {
        return this.authService.login(loginDto);
    }
}