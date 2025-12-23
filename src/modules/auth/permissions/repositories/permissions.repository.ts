import { Injectable } from "@nestjs/common";
import { Permission, PrismaClient } from "@prisma/client";

@Injectable()
export class PermissionsRepository {
    constructor(
        private readonly prisma: PrismaClient,
    ) { }

    async findAll(): Promise<Permission[]> {
        return this.prisma.permission.findMany();
    }
    toResponseDto(permission: Permission) {
        return {
            id: permission.id,
            name: permission.name,
            key: permission.key,
            resource: permission.resource,
        };
    }
    toResponseDtoList(permission: Permission[]) {
        return permission.map((permission) => this.toResponseDto(permission));
    }
}