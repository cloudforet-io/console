import { timeZonesNames } from '@vvo/tzdb';

import { ROLE_TYPE } from '@/schema/identity/role/constant';

export const timezoneList = ['UTC'].concat(timeZonesNames);

export const languages = {
    en: 'English',
    ko: '한국어',
    ja: '日本語',
};

export const MANAGED_ROLES = {
    'managed-system-admin': ROLE_TYPE.SYSTEM_ADMIN,
    'managed-domain-admin': ROLE_TYPE.DOMAIN_ADMIN,
    'managed-workspace-owner': ROLE_TYPE.WORKSPACE_OWNER,
    'managed-workspace-member': ROLE_TYPE.WORKSPACE_MEMBER,
} as const;
