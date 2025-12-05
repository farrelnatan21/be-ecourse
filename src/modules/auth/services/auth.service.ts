import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
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
import { Gender } from "@prisma/client";

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
        const hashedPassword = await bcrypt.hash(registerDto.password, 10);
        const userData: CreateUserData = {
            email: registerDto.email,
            password: hashedPassword,
            roleId: role.id,
            name: registerDto.name,
            phone: registerDto.phone,
            isVerified: false,
        };
        const profileData: CreateUserProfileData = {
            gender: registerDto.gender && Object.values(Gender).includes(registerDto.gender as Gender)
                ? (registerDto.gender as Gender)
                : undefined,
            avatar: registerDto.avatar,
            bio: registerDto.bio,
            expertise: registerDto.expertise,
            experienceYears: registerDto.experienceYears,
            linkedInUrl: registerDto.linkedInUrl,
            githubUrl: registerDto.githubUrl,
        };
        const user = await this.usersService.register(userData, profileData);

        return {
            message: 'Registration successful',
            data: {
                user,
            },
        };
    }
}