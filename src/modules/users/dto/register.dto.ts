import { Gender } from "@prisma/client";
import { VALIDATION_MESSAGE, VALIDATION_REGEX } from "src/common/constants/validation.constant";
import { UserRole, REGISTRATION_ROLES } from "src/common/enums/user-role.enum";
import z from "zod";

export const RegisterSchema = z.object({
    name: z.string().min(1, 'Name is required').max(255, 'Name is too long'),
    email: z.string().email('invalid email format'),
    password: z
        .string()
        .min(8, VALIDATION_MESSAGE.PASSWORD)
        .max(255, 'Password is too long')
        .regex(VALIDATION_REGEX.PASSWORD, VALIDATION_MESSAGE.PASSWORD),
    confirmPassword: z.string().min(1, 'Confirm password is required'),
    role: z.enum(REGISTRATION_ROLES),
    phone: z.string().regex(VALIDATION_REGEX.INDONESIAN_PHONE, VALIDATION_MESSAGE.INDONESIAN_PHONE).optional(),
    gender: z.nativeEnum(Gender).optional(),
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
    role: UserRole;
    phone?: string;
    gender?: Gender;
    avatar?: string;
    bio?: string;
    expertise?: string;
    experienceYears?: number;
    linkedInUrl?: string;
    githubUrl?: string;
}