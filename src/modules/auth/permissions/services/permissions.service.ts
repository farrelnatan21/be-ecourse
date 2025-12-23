import { Injectable } from "@nestjs/common";
import { PermissionsRepository } from "../repositories/permissions.repository";
import { BaseResponse } from "src/common/interface/base-response.interface";
import { PermissionsResponseDto } from "../dto/permissions-response.dto";

@Injectable()
export class PermissionsService {
    constructor(
        private readonly permissionsRepository: PermissionsRepository,
    ) { }
    async findAll(): Promise<BaseResponse<PermissionsResponseDto[]>> {
        const permissions = await this.permissionsRepository.findAll();
        const data = this.permissionsRepository.toResponseDtoList(permissions);
        return {
            message: 'Permissions retrieved successfully',
            data,
        };
    }
}