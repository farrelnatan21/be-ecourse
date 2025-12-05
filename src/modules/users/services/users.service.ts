import { Injectable } from "@nestjs/common";
import { UsersRepositories } from "../repositories/users.repositories";
import { UsersResponseDto } from "../dto/users-response.dto";
import { CreateUserData, CreateUserProfileData, UserWithRoleAndPermissions, UserWithRoleAndPermissionsWithoutPassword } from "../types/users.types";
import { J } from "@faker-js/faker/dist/airline-DF6RqYmq";

@Injectable()
export class UsersService {
    constructor(
        private readonly usersRepository: UsersRepositories
    ) { }

    async findByEmail(email: string): Promise<UsersResponseDto | null> {
        const user = await this.usersRepository.findUniqueUserByEmail(email);
        return user ? this.usersRepository.toResponseDto(user) : null;
    }

    async findByEmailWithPassword(email: string): Promise<UserWithRoleAndPermissions | null> {
        return this.usersRepository.findUniqueUserByEmail(email);
    }

    transformToDto(user: UserWithRoleAndPermissions): UsersResponseDto {
        return this.usersRepository.toResponseDto(user);
    }
    transformToDtoWithoutPassword(
        user: UserWithRoleAndPermissionsWithoutPassword,
    ): UsersResponseDto {
        return this.usersRepository.toResponseDto(user as UserWithRoleAndPermissions)
    }
    async findById(id: number): Promise<UsersResponseDto | null> {
        const user = await this.usersRepository.findById(id);
        return user ? this.usersRepository.toResponseDto(user) : null;
    }
    async isEmailTaken(email: string): Promise<boolean> {
        const user = await this.usersRepository.findUniqueUserByEmail(email);
        return !!user;
    }
    async register(userData: CreateUserData, profileData: CreateUserProfileData): Promise<UsersResponseDto> {
        const user = await this.usersRepository.createUserWithProfile(userData, profileData);
        return this.usersRepository.toResponseDto(user);
    }
}
