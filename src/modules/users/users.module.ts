import { Module } from "@nestjs/common";
import { UsersService } from "./services/users.service";
import { UsersRepositories } from "./repositories/users.repositories";

@Module({
    providers: [UsersService, UsersRepositories],
    exports: [UsersService, UsersRepositories],
})
export class UsersModule { }