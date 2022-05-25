import { Getter } from 'vuex';

import { languages } from '@/store/modules/user/config';

import { getPagePermissionMap, PagePermissionTuple } from '@/lib/access-control/page-permission-helper';
import { MENU_ID } from '@/lib/menu/config';

import { UserState } from './type';

export const isDomainOwner = (state: UserState): boolean => state.userType === 'DOMAIN_OWNER';
export const languageLabel = (state: UserState): string => languages[state.language as string] || state.language;
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
                projectRoleNames.push(role.name); // 'PROJECT'
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

export const pagePermissionList: Getter<UserState, any> = (state, getters): PagePermissionTuple[] => {
    if (getters.isDomainOwner) {
        return [
            [MENU_ID.ADMINISTRATION_ROLE, 'MANAGE'],
            [MENU_ID.ADMINISTRATION_POLICY, 'MANAGE'],
            [MENU_ID.ADMINISTRATION_USER, 'MANAGE'],
        ];
    }
    const permissions = state.roles?.flatMap(role => role.pagePermissions) ?? [];
    return Object.entries(getPagePermissionMap(permissions));
};
