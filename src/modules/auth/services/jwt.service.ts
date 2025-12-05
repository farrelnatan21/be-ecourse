import { Injectable } from "@nestjs/common";
import { UsersResponseDto } from "src/modules/users/dto/users-response.dto";
import { JwtService } from "@nestjs/jwt";

export interface JwtPayload {
    id: number;
    email: string;
    roleKey: string;
    permissions: string[];
}

@Injectable()
export class JwtTokenService {
    constructor(private readonly jwtService: JwtService) { }
    generateToken(user: UsersResponseDto): string {
        const payload: JwtPayload = {
            id: user.id,
            email: user.email,
            roleKey: user.role.key,
            permissions: user.role.permissions.map((p) => p.key),
        };
        return this.jwtService.sign(payload, {
            expiresIn: "7d",
        });
    }

    verifyToken(token: string): JwtPayload {
        return this.jwtService.verify<JwtPayload>(token);
    }

    decodeToken(token: string): JwtPayload | null {
        try {
            return this.jwtService.decode<JwtPayload>(token);
        } catch (error) {
            return null;
        }
    }
}