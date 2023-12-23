export interface UserProfileEnableMfaParams {
    mfa_type: string;
    options: {
        [key: string]: any;
    };
}
