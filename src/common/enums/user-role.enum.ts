export enum UserRole {
    STUDENT = 'student',
    MENTOR = 'mentor',
    MANAGER = 'manager',
}

export const REGISTRATION_ROLES = [UserRole.STUDENT, UserRole.MENTOR, UserRole.MANAGER] as const;