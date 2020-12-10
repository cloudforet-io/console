import { languages } from '@/store/modules/user/config';
import { UserState } from './type';

// Deprecated: isDomainOwner
export const isDomainOwner = (state: UserState): boolean => state.userType === 'DOMAIN_OWNER';
export const isAdmin = (state: UserState): boolean => state.userType === 'DOMAIN_OWNER';
export const languageLabel = (state: UserState): string => languages[state.language as string] || state.language;
