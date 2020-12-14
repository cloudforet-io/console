type UserType = 'USER' | 'DOMAIN_OWNER' | 'API_USER';
type UserBackend = 'LOCAL' | 'EXTERNAL';
export type LanguageCode = 'ko' | 'en' | string;
export type Timezone = 'UTC' | 'Asia/Seoul' | string;

export interface UserState {
    isSessionExpired?: boolean;
    userId?: string;
    userType?: UserType;
    backend?: UserBackend;
    name?: string;
    email?: string;
    language?: string;
    timezone?: string;
    reportState?: boolean;
    powerSchedulerState?: boolean;
}

export interface SignInRequest {
    domainId: string;
    userId: string;
    userType: UserType;
    credentials: any;
}

export interface UpdateUserRequest {
    name?: string;
    password?: string;
    email?: string;
    language?: string;
    timezone?: string;
    tags?: Record<string, any>;
}
