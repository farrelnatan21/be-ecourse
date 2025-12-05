import { Gender } from "@prisma/client";
import { VALIDATION_MESSAGE, VALIDATION_REGEX } from "src/common/constants/validation.constant";
import { REGISTRATION_ROLES } from "src/common/enums/user-role.enum";
import z, { regex } from "zod";

export const RegisterSchema = z.object({
    name: z.string().min(1, 'Name is required').max(255, 'Name is too long'),
    email: z.string().email('invalid email format'),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters long').max(255, 'Password is too long')
        .regex(VALIDATION_REGEX.PASSWORD, 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    confirmPassword: z.string(),
    role: z.enum(REGISTRATION_ROLES),
    phone: z.string().regex(VALIDATION_REGEX.INDONESIAN_PHONE, VALIDATION_MESSAGE.PASSWORD).optional(),
    gender: z.enum(Gender).optional(),
    avatar: z.string().optional(),
    bio: z.string().max(500, 'Bio is too long').optional(),
    expertise: z.string().max(255, 'Expertise is too long').optional(),
    experienceYears: z.number().min(0, 'Experience years must be at least 0').max(50, 'Experience years must be at most 50').optional(),
    linkedInUrl: z.string().url('Invalid LinkedIn URL').max(255, 'LinkedIn URL is too long').optional().or(z.literal('')),
    githubUrl: z.string().url('Invalid GitHub URL').max(255, 'GitHub URL is too long').optional().or(z.literal('')),
})
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    });

export class RegisterDto {
    static schema = RegisterSchema;

    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    role: string;
    phone: string;
    gender: string;
    avatar: string;
    bio: string;
    expertise: string;
    experienceYears: number;
    linkedInUrl: string;
    githubUrl: string;
}