type UserType = 'USER' | 'DOMAIN_OWNER';
export type LanguageCode = 'ko' | 'en' | string;
export type Timezone = 'UTC' | 'Asia/Seoul' | string;

export interface UserState {
    userId?: string;
    userType?: UserType;
    name?: string;
    email?: string;
    mobile?: string;
    group?: string;
    language?: string;
    timezone?: string;
    reportState?: boolean;
    powerSchedulerState?: boolean;
}

export interface SignInRequest {
    domain_id: string;
    credentials: any;
}

export interface UpdateUserRequest {
    name?: string;
    password?: string;
    email?: string;
    mobile?: string;
    group?: string;
    language?: string;
    timezone?: string;
    tags?: Record<string, any>;
}
