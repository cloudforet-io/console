export interface UserProfileEnableMfaParameters {
    mfa_type: 'EMAIL' | 'OTP';
    options: Record<string, any>;
}
