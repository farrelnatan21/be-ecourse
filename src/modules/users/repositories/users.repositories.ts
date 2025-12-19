import { PrismaService } from "src/common/prisma/prisma.service";
import { CreateUserData, CreateUserProfileData, UserWithRoleAndPermissions } from "../types/users.types";
import { UsersResponseDto } from "../dto/users-response.dto";
import { Injectable } from "@nestjs/common";

@Injectable()
export class UsersRepositories {

    private readonly usersInclude = {
        role: {
            include: {
                rolePermissions: {
                    include: {
                        permission: true,
                    },
                },
            },
        },
        userProfile: true,
    }
    constructor(private readonly prisma: PrismaService) { }

    async findUniqueUserByEmail(email: string): Promise<UserWithRoleAndPermissions | null> {
        return this.prisma.user.findUnique({
            where: { email },
            include: this.usersInclude,
        });
    }

    toResponseDto(user: UserWithRoleAndPermissions): UsersResponseDto {
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            isVerified: user.isVerified,
            isActive: user.isActive,
            role: {
                id: user.role.id,
                name: user.role.name,
                key: user.role.key,
                permissions: user.role.rolePermissions.map((rolePermission) => ({
                    id: rolePermission.permission.id,
                    name: rolePermission.permission.name,
                    key: rolePermission.permission.key,
                    resource: rolePermission.permission.resource,
                })),
            },
            userProfile: user.userProfile ? {
                id: user.userProfile.id,
                bio: user.userProfile.bio,
                avatar: user.userProfile.avatar,
                gender: user.userProfile.gender,
                expertise: user.userProfile.expertise,
                experienceYears: user.userProfile.experienceYears,
                linkedInUrl: user.userProfile.linkedinUrl,
                githubUrl: user.userProfile.githubUrl,
            }
                : null,

        }
    }
    async findById(id: number): Promise<UserWithRoleAndPermissions | null> {
        return this.prisma.user.findUnique({
            where: { id },
            include: this.usersInclude,
        });
    }
    async createUserWithProfile(userData: CreateUserData, profileData?: CreateUserProfileData): Promise<UserWithRoleAndPermissions> {
        const user = await this.prisma.user.create({
            data: {
                ...userData,
                userProfile: profileData ? {
                    create: profileData
                } : undefined,
            },
            include: this.usersInclude,
        });
        return user as UserWithRoleAndPermissions;
    }
}