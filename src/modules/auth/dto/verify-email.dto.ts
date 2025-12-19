import z from "zod";

export const VerifyEmailSchema = z.object({
    token: z.string().min(1, `token is required`),
});

export class VerifyEmailDto {
    static schema = VerifyEmailSchema;
    token: string;
}