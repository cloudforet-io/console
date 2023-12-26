export interface UserProfileEnableMfaParameters {
    mfa_type: string;
    options: {
        [key: string]: any;
    };
}
