import { Module } from "@nestjs/common";
import { AuthController } from "./services/auth.controller";
import { AuthService } from "./services/auth.service";
import { JwtTokenService } from "./services/jwt.service";
import { UsersService } from "../users/services/users.service";
import { JwtModule } from "@nestjs/jwt";
import { UsersRepositories } from "../users/repositories/users.repositories";

@Module({
    imports: [
        JwtModule.register({
            secret: process.env.JWT_SECRET || 'defaultSecretKey',
            signOptions: {
                expiresIn: '6d'
            },
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtTokenService, UsersService, UsersRepositories],
    exports: [AuthService, JwtTokenService, UsersService, UsersRepositories],
})
export class AuthModule { }