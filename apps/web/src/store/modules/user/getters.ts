import type { Getter } from 'vuex';

import { ROLE_TYPE } from '@/schema/identity/role/constant';

import { languages } from '@/store/modules/user/config';

import {
    getDefaultPageAccessPermissionList,
    getPageAccessPermissionMapFromRawData,
} from '@/lib/access-control/page-access-permission-helper';
import type { MenuId } from '@/lib/menu/config';

import type { RoleInfo, UserState } from './type';

// TODO: temporary defence
export const isDomainAdmin = (state: UserState): boolean => state.roleType === ROLE_TYPE.DOMAIN_ADMIN;
export const isSystemAdmin = (state: UserState): boolean => state.roleType === ROLE_TYPE.SYSTEM_ADMIN;
export const languageLabel = (state: UserState): string => languages[state.language as string] || state.language;

export const isNoRoleUser = (state: UserState): boolean => !state.currentRoleInfo;

export const hasSystemRole = (state: UserState): boolean => state.roleType === 'SYSTEM_ADMIN';

export const hasPermission = (state: UserState): boolean => !!state.currentRoleInfo;

export const getCurrentRoleInfo: Getter<UserState, any> = (state: UserState): RoleInfo|undefined => state.currentRoleInfo;

export const pageAccessPermissionList: Getter<UserState, any> = (state, getters): MenuId[] => {
    const roleBasePagePermissions = getters.getCurrentRoleInfo?.pageAccess ?? [];
    const roleType = getters.getCurrentRoleInfo?.roleType ?? 'USER';
    const pagePermissionMap = getPageAccessPermissionMapFromRawData(roleBasePagePermissions);
    const defaultPagePermissionList = getDefaultPageAccessPermissionList(roleType);
    Object.keys(pagePermissionMap).forEach((menuId) => {
        if (!defaultPagePermissionList.includes(menuId as MenuId)) pagePermissionMap[menuId] = false;
    });

    return Object.entries(pagePermissionMap).filter(([, accessible]) => accessible).map(([page]) => page as MenuId);
};

export const pageAccessPermissionMap: Getter<UserState, any> = (state, getters): Record<string, boolean> => {
    const result: Record<string, boolean> = {};
    getters.pageAccessPermissionList.forEach((MenuId) => {
        if (!result[MenuId]) result[MenuId] = true;
    });
    return result;
};

export const isUserNeedPasswordReset: Getter<UserState, any> = (state): boolean => !!state.requiredActions?.includes('UPDATE_PASSWORD');
