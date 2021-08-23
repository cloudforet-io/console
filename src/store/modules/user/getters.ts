import { languages, userTypes } from '@/store/modules/user/config';
import { UserState } from './type';

export const isDomainOwner = (state: UserState): boolean => state.userType === 'DOMAIN_OWNER';
export const isAdmin = (state: UserState): boolean => {
    let isAdminUser = false;

    if (state.userType === 'DOMAIN_OWNER') {
        isAdminUser = true;
    }

    if (state.roles) {
        state.roles.forEach((role) => {
            if (role.roleType === 'DOMAIN') {
                isAdminUser = true;
            }
        });
    }

    return isAdminUser;
};
export const languageLabel = (state: UserState): string => languages[state.language as string] || state.language;
export const userTypeLabel = (state: UserState): string => userTypes[state.userType as string] || state.userType;
export const roleNames = (state: UserState): Array<string> => {
    const systemRoleNames: Array<string> = [];
    const domainRoleNames: Array<string> = [];
    const projectRoleNames: Array<string> = [];

    if (state.roles) {
        state.roles.forEach((role) => {
            if (role.roleType === 'SYSTEM') {
                systemRoleNames.push(role.name);
            } else if (role.roleType === 'DOMAIN') {
                domainRoleNames.push(role.name);
            } else {
                projectRoleNames.push(role.name);
            }
        });
    }

    if (systemRoleNames.length > 0) {
        return systemRoleNames;
    }
    if (domainRoleNames.length > 0) {
        return domainRoleNames;
    }
    if (projectRoleNames.length > 0) {
        return projectRoleNames;
    }
    return ['No Role'];
};

export const hasDomainRole = (state: UserState): boolean => {
    if (state.roles) {
        return state.roles.some(role => role.roleType === 'DOMAIN');
    }

    return false;
};

export const hasPermission = (state: UserState): boolean => !!state.roles?.length;
