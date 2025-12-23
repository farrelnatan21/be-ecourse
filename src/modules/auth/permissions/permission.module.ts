import { Module } from "@nestjs/common";
import { AuthModule } from "../auth.module";
import { PermissionsService } from "./services/permissions.service";
import { PermissionsRepository } from "./repositories/permissions.repository";

@Module({
    imports: [AuthModule],
    controllers: [PermissionsService, PermissionsRepository],
    exports: [PermissionsService],
})
export class PermissionsModule { }