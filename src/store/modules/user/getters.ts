import { UserState } from './type';

export const isDomainOwner = (state: UserState): boolean => state.userType === 'DOMAIN_OWNER';
