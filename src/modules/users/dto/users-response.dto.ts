export interface UsersResponseDto {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    isVerified: boolean;
    isActive: boolean;
    role: RoleResponseDto;
    userProfile: UserProfileResponseDto | null;
    totalStudent?: number;
    totalEnrolledCourse?: number;
}

interface RoleResponseDto {
    id: number;
    name: string;
    key: string;
    permissions: PermissionResponseDto[];
}

interface PermissionResponseDto {
    id: number;
    name: string;
    key: string;
    resource: string;
}

interface UserProfileResponseDto {
    id: number;
    bio: string | null;
    avatar: string | null;
    gender: string | null;
    expertise: string | null;
    experienceYears: number | null;
    linkedInUrl: string | null;
    githubUrl: string | null;
}

