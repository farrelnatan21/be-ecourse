import { Body, Controller, Get, Post, Query, UploadedFile, UseInterceptors } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginDto } from "src/modules/users/dto/login.dto";
import { AuthResponseDto } from "../dto/auth-response.dto";
import { BaseResponse } from "src/common/interface/base-response.interface";
import { FileUploadService } from "src/common/services/file-upload.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { RegisterResponseDto } from "src/modules/users/dto/register-response.dto";
import { RegisterDto } from "src/modules/users/dto/register.dto";
import { VerifyEmailDto } from "../dto/verify-email.dto";
import { ResendVerificationDto } from "../dto/resend-verification.dto";

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService, private readonly fileUploadService: FileUploadService) { }

    @Post('login')
    async login(
        @Body() loginDto: LoginDto,
    ): Promise<BaseResponse<AuthResponseDto>> {
        return this.authService.login(loginDto);
    }
    @Post('register')
    @UseInterceptors(
        FileInterceptor('avatar', FileUploadService.getAvatarMulterConfig()),
    )
    async register(
        @Body() body: any,
        @UploadedFile() avatar?: Express.Multer.File,
    ): Promise<BaseResponse<RegisterResponseDto>> {
        console.log('=== REGISTER DEBUG START ===');
        console.log('1. Body received:', body);
        console.log('2. Avatar file received:', avatar);
        console.log('3. Avatar exists?', !!avatar);

        if (avatar) {
            console.log('4. Avatar details:');
            console.log('   - fieldname:', avatar.fieldname);
            console.log('   - originalname:', avatar.originalname);
            console.log('   - filename:', avatar.filename);
            console.log('   - path:', avatar.path);
            console.log('   - size:', avatar.size);
        }

        try {
            const validatedData = RegisterDto.schema.parse(body);
            console.log('5. Validated data:', validatedData);

            const avatarUrl = avatar
                ? this.fileUploadService.getAvatarUrl(avatar.filename)
                : undefined;

            console.log('6. Avatar URL generated:', avatarUrl);

            const registerData: RegisterDto = {
                ...validatedData,
                avatar: avatarUrl,
            };

            console.log('7. Final registerData:', registerData);
            console.log('=== REGISTER DEBUG END ===');

            return this.authService.register(registerData);
        } catch (error) {
            console.error('8. Error occurred:', error);
            if (avatar) {
                await this.fileUploadService.deleteAvatarByName(avatar.filename);
            }
            throw error;
        }
    }

    @Get('verify-email')
    async verifyEmail(
        @Query() query: VerifyEmailDto,
    ): Promise<BaseResponse<null>> {
        return this.authService.verifyEmail(query.token);
    }

    @Post('resend-verification')
    async resendVerification(
        @Body() body: ResendVerificationDto,
    ): Promise<BaseResponse<null>> {
        return this.authService.resendVerificationEmail(body.email);
    }


}