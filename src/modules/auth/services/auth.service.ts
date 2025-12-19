import { ConflictException, Injectable, NotFoundException, UnauthorizedException, BadRequestException } from "@nestjs/common";
import { UsersService } from "src/modules/users/services/users.service";
import { JwtTokenService } from "./jwt.service";
import { PrismaService } from "src/common/prisma/prisma.service";
import { LoginDto } from "src/modules/users/dto/login.dto";
import * as bcrypt from 'bcrypt';
import { BaseResponse } from "src/common/interface/base-response.interface";
import { AuthResponseDto } from "../dto/auth-response.dto";
import { UserRole } from "src/common/enums/user-role.enum";
import { UsersResponseDto } from "src/modules/users/dto/users-response.dto";
import { RegisterDto } from "src/modules/users/dto/register.dto";
import { CreateUserData, CreateUserProfileData } from "src/modules/users/types/users.types";
import * as crypto from 'crypto';
import { QueueService } from "src/common/services/queue.service";
import { timestamp } from "rxjs";
import { string } from "zod";

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtTokenService: JwtTokenService,
        private readonly prisma: PrismaService,
        private readonly queueService: QueueService,
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

        const userDto = this.usersService.transformToDtoWithoutPassword(userWithoutPassword);

        const userWithStats = await this.addUserStatistic(userDto);

        const accessToken = this.jwtTokenService.generateToken(userDto);

        return {
            message: 'Login successfully',
            data: {
                accessToken,
                user: userWithStats,
            },
        }
    }

    private async addUserStatistic(userDto: any): Promise<any> {
        const stats = { ...userDto }

        if (userDto.role.key === UserRole.MENTOR) {
            const totalCourse = await this.prisma.course.count({
                where: {
                    mentorId: userDto.id
                },
            });
            const totalStudentsResult = await this.prisma.course.aggregate({
                where: {
                    mentorId: userDto.id
                },
                _sum: {
                    totalStudents: true
                },
            });

            stats.totalCourse = totalCourse;
            stats.totalStudents = totalStudentsResult._sum.totalStudents || 0;
            stats.totalEnrolledCourses = null;
        } else if (userDto.role.key === UserRole.STUDENT) {
            const totalEnrolledCourse = await this.prisma.enrollment.count({
                where: {
                    studentId: userDto.id
                },
            });

            stats.totalCourse = null;
            stats.totalStudents = null;
            stats.totalEnrolledCourses = totalEnrolledCourse;
        } else {
            stats.totalCourse = null;
            stats.totalStudents = null;
            stats.totalEnrolledCourses = null;
        }
        return stats;
    }

    async validateUser(userId: number): Promise<UsersResponseDto | null> {
        const user = await this.usersService.findById(userId);
        return user;
    }

    async register(registerDto: RegisterDto): Promise<BaseResponse<AuthResponseDto>> {
        // Debug logging
        console.log('=== SERVICE REGISTER DEBUG START ===');
        console.log('1. Full RegisterDto received:', JSON.stringify(registerDto, null, 2));
        console.log('2. Password value:', registerDto.password);
        console.log('3. Password type:', typeof registerDto.password);
        console.log('4. Password length:', registerDto.password?.length);
        console.log('5. Avatar value:', registerDto.avatar);
        console.log('6. Avatar type:', typeof registerDto.avatar);
        console.log('7. Avatar exists?', !!registerDto.avatar);
        console.log('=== SERVICE REGISTER DEBUG END ===');

        // Validasi password tidak null/undefined
        if (!registerDto.password || registerDto.password.trim() === '') {
            throw new BadRequestException('Password is required and cannot be empty');
        }

        const isEmailTaken = await this.usersService.isEmailTaken(registerDto.email);
        if (isEmailTaken) {
            throw new ConflictException('Email already taken');
        }

        const role = await this.prisma.role.findUnique({
            where: {
                key: registerDto.role
            },
        });

        if (!role) {
            throw new NotFoundException('Role not found');
        }

        console.log('About to hash password...');
        const hashedPassword = await bcrypt.hash(registerDto.password, 10);

        const verificationToken = crypto.randomBytes(32).toString('hex');
        console.log('Password hashed successfully');

        const userData: CreateUserData = {
            email: registerDto.email,
            password: hashedPassword,
            roleId: role.id,
            name: registerDto.name,
            phone: registerDto.phone,
            isVerified: false,
            verificationToken,
        };

        console.log('=== USER DATA TO SAVE ===');
        console.log('User data:', JSON.stringify(userData, null, 2));
        console.log('========================');

        const profileData: CreateUserProfileData = {
            gender: registerDto.gender,
            avatar: registerDto.avatar,
            bio: registerDto.bio,
            expertise: registerDto.expertise,
            experienceYears: registerDto.experienceYears,
            linkedInUrl: registerDto.linkedInUrl,
            githubUrl: registerDto.githubUrl,
        };

        console.log('=== PROFILE DATA TO SAVE ===');
        console.log('Profile data:', JSON.stringify(profileData, null, 2));
        console.log('Avatar in profileData:', profileData.avatar);
        console.log('Avatar type:', typeof profileData.avatar);
        console.log('Avatar length:', profileData.avatar?.length);
        console.log('===========================');

        console.log('Calling usersService.register...');
        const user = await this.usersService.register(userData, profileData);

        const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

        await this.queueService.addEmailJob({
            to: user.email,
            subject: 'verifikasi email hackgrowth',
            template: 'verification',
            templateData: {
                name: user.name,
                email: user.email,
                verificationUrl,
                timestamp: new Date().toISOString(),
            }
        })
        console.log('User registered successfully');

        console.log('=== USER SAVED RESULT ===');
        console.log('User:', JSON.stringify(user, null, 2));
        console.log('User has userProfile?', !!user.userProfile);
        if (user.userProfile) {
            console.log('UserProfile avatar:', user.userProfile.avatar);
            console.log('UserProfile avatar type:', typeof user.userProfile.avatar);
        } else {
            console.log('UserProfile is null or undefined');
        }
        console.log('========================');

        return {
            message: 'Registration successful',
            data: {
                user,
            },
        };
    }

    async verifyEmail(token: string): Promise<BaseResponse<null>> {
        const user = await this.prisma.user.findFirst({
            where: {
                verificationToken: token
            },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        if (user.isVerified) {
            return {
                message: 'Email already verified',
                data: null,
            };
        }
        const verificationToken = crypto.randomBytes(32).toString('hex');

        await this.prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                isVerified: true,
                verificationToken,
            },
        });

        const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

        await this.queueService.addEmailJob({
            to: user.email,
            subject: 'verifikasi email hackgrowth',
            template: 'verification',
            templateData: {
                name: user.name,
                email: user.email,
                verificationUrl,
                timestamp: new Date().toISOString(),
            },
        });

        return {
            message: 'Email verified successfully',
            data: null,
        };
    }
    async resendVerificationEmail(email: string): Promise<BaseResponse<null>> {
        const user = await this.prisma.user.findUnique({
            where: {
                email,
            },
        });
        if (!user) {
            throw new NotFoundException('User not Found');
        }
        if (user.isVerified) {
            return {
                message: 'Email already verified',
                data: null,
            };
        }
        const verificationToken = crypto.randomBytes(32).toString('hex');

        await this.prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                verificationToken,
            },
        });
        const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

        await this.queueService.addEmailJob({
            to: user.email,
            subject: 'verifikasi email hackgrowth',
            template: 'verification',
            templateData: {
                name: user.name,
                email: user.email,
                verificationUrl,
                timestamp: new Date().toISOString(),
            },
        });

        return {
            message: 'Verification email sent successfully',
            data: null,
        };
    }
}