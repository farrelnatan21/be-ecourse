import z from "zod";

export const LoginSchema = z.object({
    email: z.string().email("invalid email address"),
    password: z.string().min(8, "password must be at least 8 characters long"),
});

export class LoginDto {
    static schema = LoginSchema;
    email: string;
    password: string;
}