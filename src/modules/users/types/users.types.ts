import { Gender, Permission, Role, User, UserProfile } from "@prisma/client"

export type UserWithRoleAndPermissions = User & {
    role: Role & {
        rolePermissions: {
            permission: Permission;
        }[];
    };
    userProfile: UserProfile | null;
};

export type UserWithRoleAndPermissionsWithoutPassword = Omit<UserWithRoleAndPermissions, 'password'>;

export interface CreateUserData {
    email: string;
    password: string;
    name: string;
    roleId: number;
    phone?: string;
    isVerified?: boolean;
    verificationToken?: string;
}

export interface CreateUserProfileData {
    gender?: Gender;
    avatar?: string;
    bio?: string;
    expertise?: string;
    experienceYears?: number;
    linkedInUrl?: string;
    githubUrl?: string;
}

