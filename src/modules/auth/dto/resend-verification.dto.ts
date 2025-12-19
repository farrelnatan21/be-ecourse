import z from "zod";

export const ResendVerificationSchema = z.object({
    email: z.email({ message: 'Invalid email format' }),
})

export class ResendVerificationDto {
    static schema = ResendVerificationSchema;
    email: string;
}