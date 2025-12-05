import { Injectable } from "@nestjs/common";
import { UsersRepositories } from "../repositories/users.repositories";
import { UsersResponseDto } from "../dto/users-response.dto";
import { UserWithRoleAndPermissions } from "../types/users.types";
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
}
