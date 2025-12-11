export const VALIDATION_REGEX = {
    INDONESIAN_PHONE: /^(\+62|62|0)8[1-9]\d{6,8}$/,
    PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/,
} as const;

export const VALIDATION_MESSAGE = {
    INDONESIAN_PHONE: 'Phone number must be Indonesian phone number',
    PASSWORD: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character',
} as const;