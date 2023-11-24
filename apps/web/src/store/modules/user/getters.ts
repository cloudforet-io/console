import type { Getter } from 'vuex';

import { languages } from '@/store/modules/user/config';

import type { PagePermissionTuple, PagePermissionType } from '@/lib/access-control/config';
import { PAGE_PERMISSION_TYPE } from '@/lib/access-control/config';
import {
    getDefaultPagePermissionList,
    getPagePermissionMapFromRaw, getProperPermissionType,
} from '@/lib/access-control/page-permission-helper';


import type { UserState, PageAccessType } from './type';


// TODO: refactor isDomainOwner
export const isDomainOwner = (state: UserState): boolean => state.roleType === 'DOMAIN_ADMIN';
export const languageLabel = (state: UserState): string => languages[state.language as string] || state.language;
export const roleNames = (state: UserState): Array<string> => {
    const systemRoleNames: Array<string> = [];
    const domainRoleNames: Array<string> = [];
    const workspaceOwnerRoleNames: Array<string> = [];
    const workspaceMemberRoleNames: Array<string> = [];

    if (state.roles) {
        state.roles.forEach((role) => {
            if (role.roleType === 'SYSTEM_ADMIN') {
                systemRoleNames.push(role.name);
            } else if (role.roleType === 'DOMAIN_ADMIN') {
                domainRoleNames.push(role.name);
            } else if (role.roleType === 'WORKSPACE_OWNER') {
                workspaceOwnerRoleNames.push(role.name);
            } else {
                workspaceMemberRoleNames.push(role.name);
            }
        });
    }

    if (systemRoleNames.length > 0) {
        return systemRoleNames;
    }
    if (domainRoleNames.length > 0) {
        return domainRoleNames;
    }
    if (workspaceOwnerRoleNames.length > 0) {
        return workspaceOwnerRoleNames;
    }
    if (workspaceMemberRoleNames.length > 0) {
        return workspaceMemberRoleNames;
    }
    return ['No Role'];
};
export const isNoRoleUser = (state: UserState): boolean => !state.roles?.length;

// TODO: refactor hasDomainRole
// export const hasDomainRole = (state: UserState): boolean => {
//     if (state.roles) {
//         return state.roles.some((role) => role.roleType === 'DOMAIN');
//     }
//
//     return false;
// };
export const hasDomainRole = (): boolean => true;

export const hasSystemRole = (state: UserState): boolean => {
    if (state.roles) {
        return state.roles.some((role) => role.roleType === 'SYSTEM_ADMIN');
    }

    return false;
};

// TODO: you must recover this after new role rebuild
// export const hasPermission = (state: UserState): boolean => !!state.roles?.length;
export const hasPermission = (): boolean => true;

export const pagePermissionList: Getter<UserState, any> = (state, getters): PagePermissionTuple[] => {
    const roleBasePagePermissions = state.roles?.flatMap((role) => role.pagePermissions) ?? [];
    const pagePermissionMap = getPagePermissionMapFromRaw(roleBasePagePermissions);
    // merge role based page permissions and default page permissions
    let pageAccessType: PageAccessType|undefined;
    if (getters.hasSystemRole) pageAccessType = 'SYSTEM';
    else if (getters.hasPermission) pageAccessType = 'BASIC';
    getDefaultPagePermissionList(false, pageAccessType).forEach(([page, permission]) => {
        pagePermissionMap[page] = getProperPermissionType(permission, pagePermissionMap[page]);
    });
    return Object.entries(pagePermissionMap);
};

export const pagePermissionMap: Getter<UserState, any> = (state, getters): Record<string, PagePermissionType> => {
    const result: Record<string, PagePermissionType> = {};
    getters.pagePermissionList.forEach(([page, permission]) => {
        if (!result[page]) result[page] = permission;
        else if (permission === PAGE_PERMISSION_TYPE.MANAGE) result[page] = PAGE_PERMISSION_TYPE.MANAGE;
    });
    return result;
};

export const isUserNeedPasswordReset: Getter<UserState, any> = (state): boolean => !!state.requiredActions?.includes('UPDATE_PASSWORD');
