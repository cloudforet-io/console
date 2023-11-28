import { ACCOUNT_TYPE } from '@/schema/identity/service-account/constant';

// TRUSTED-MANAGED is not added as a constant because it is used only as a style option.
export const ACCOUNT_TYPE_BADGE_OPTION = {
    [ACCOUNT_TYPE.GENERAL]: { label: 'General Account', styleType: 'gray200' },
    [ACCOUNT_TYPE.TRUSTED]: { label: 'Trusted Account', styleType: 'blue200' },
    'TRUSTED-MANAGED': { label: 'Trusted Account - Managed', styleType: 'primary3' },
} as const;
