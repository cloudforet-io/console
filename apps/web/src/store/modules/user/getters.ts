import type { Getter } from 'vuex';

import { languages } from '@/store/modules/user/config';

import {
    getDefaultPagePermissionList,
    getPagePermissionMapFromRaw,
} from '@/lib/access-control/page-permission-helper';
import type { MenuId } from '@/lib/menu/config';
import { MENU_LIST } from '@/lib/menu/menu-architecture';

import type { UserState } from './type';


// TODO: temporary defence
// export const isDomainOwner = (state: UserState): boolean => state.roleType === 'DOMAIN_ADMIN';
export const isDomainAdmin = (): boolean => true;
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
export const isNoRoleUser = (state: UserState): boolean => !state.currentRoleInfo?.roleId;

// TODO: refactor hasDomainRole need more exact planning roleType and grant roleType
// export const hasDomainRole = (state: UserState): boolean => {
//     if (state.roles) {
//         return state.roleType === 'DOMAIN_ADMIN';
//     }
//
//     return false;
export const hasDomainRole = (): boolean => true;

export const hasSystemRole = (state: UserState): boolean => state.currentRoleInfo?.roleType === 'SYSTEM_ADMIN';

// TODO: you must recover this after new role rebuild
// export const hasPermission = (state: UserState): boolean => !!state.roles?.length;
export const hasPermission = (): boolean => true;

export const getCurrentRoleInfo = (state: UserState): any => state.currentRoleInfo;

// TODO: change pagePermissionList to pageAccessList
export const pagePermissionList: Getter<UserState, any> = (state, getters): MenuId[] => {
    const roleBasePagePermissions = getters.getCurrentRoleInfo.pageAccess ?? [];
    const roleType = getters.getCurrentRoleInfo.roleType;
    const pagePermissionMap = getPagePermissionMapFromRaw(roleBasePagePermissions, MENU_LIST);
    const defaultPagePermissionList = getDefaultPagePermissionList(roleType);
    Object.keys(pagePermissionMap).forEach((menuId) => {
        if (!defaultPagePermissionList.includes(menuId as MenuId)) pagePermissionMap[menuId] = false;
    });

    return Object.entries(pagePermissionMap).filter(([, accessible]) => accessible).map(([page]) => page as MenuId);
};

export const pagePermissionMap: Getter<UserState, any> = (state, getters): Record<string, boolean> => {
    const result: Record<string, boolean> = {};
    getters.pagePermissionList.forEach((MenuId) => {
        if (!result[MenuId]) result[MenuId] = true;
    });
    return result;
};

export const isUserNeedPasswordReset: Getter<UserState, any> = (state): boolean => !!state.requiredActions?.includes('UPDATE_PASSWORD');
