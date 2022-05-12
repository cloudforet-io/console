import { languages, userTypes } from '@/store/modules/user/config';
import { Getter } from 'vuex';
import { getPagePermissionMap, PagePermissionTuple, PagePermissionType } from '@/lib/access-control/page-permission-helper';
import { ROUTE_ACCESS_LEVEL } from '@/lib/access-control';
import { UserState } from './type';

export const isDomainOwner = (state: UserState): boolean => state.userType === 'DOMAIN_OWNER';
export const isAdmin = (state: UserState): boolean => {
    if (state.userType === 'DOMAIN_OWNER') return true;
    if (state.roles) return state.roles.some(role => role.roleType === 'DOMAIN');
    return false;
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

export const pagePermissionMap: Getter<UserState, any> = (state): Record<string, PagePermissionType> => {
    const permissions = state.roles?.flatMap(role => role.pagePermissions) ?? [];
    return getPagePermissionMap(permissions);
};

export const pagePermissionList: Getter<UserState, any> = (state, getters): PagePermissionTuple[] => Object.entries(getters.pagePermissionMap);

export const hasNoManagePermission: Getter<UserState, any> = (state): boolean => state.accessLevel >= ROUTE_ACCESS_LEVEL.MANAGE_PERMISSION;
