import type { Getter } from 'vuex';

import { ROLE_TYPE } from '@/schema/identity/role/constant';

import { languages } from '@/store/modules/user/config';

import type { PageAccessMap } from '@/lib/access-control/config';
import {
    getDefaultPageAccessPermissionList, getMinimalPageAccessPermissionList, getPageAccessMapFromRawData,
} from '@/lib/access-control/page-access-helper';
import type { MenuId } from '@/lib/menu/config';

import type { GrantInfo, RoleInfo, UserState } from './type';

// TODO: temporary defence
export const isDomainAdmin = (state: UserState): boolean => state.roleType === ROLE_TYPE.DOMAIN_ADMIN;
export const isSystemAdmin = (state: UserState): boolean => state.roleType === ROLE_TYPE.SYSTEM_ADMIN;
export const languageLabel = (state: UserState): string => languages[state.language as string] || state.language;

export const isNoRoleUser = (state: UserState): boolean => !state.currentRoleInfo;

export const hasSystemRole = (state: UserState): boolean => state.roleType === 'SYSTEM_ADMIN';

export const hasAdminOrWorkspaceOwnerRole = (state: UserState): boolean => state.roleType === 'DOMAIN_ADMIN' || state.roleType === 'WORKSPACE_OWNER';

// TODO: this need to calculate with user workspace list
export const hasPermission = (state: UserState): boolean => !!state.currentRoleInfo;

export const getCurrentRoleInfo: Getter<UserState, any> = (state: UserState): RoleInfo|undefined => state.currentRoleInfo;

export const getCurrentGrantInfo: Getter<UserState, any> = (state: UserState): GrantInfo|undefined => state.currentGrantInfo;

export const pageAccessPermissionList: Getter<UserState, any> = (state, getters): MenuId[] => {
    const roleType = getters.getCurrentRoleInfo?.roleType ?? 'USER';
    const minimalPagePermissionList = getMinimalPageAccessPermissionList(roleType);
    const defaultPagePermissionList = getDefaultPageAccessPermissionList(roleType);
    const roleBasePagePermissions = getters.getCurrentRoleInfo?.pageAccess ?? ['my_page.*'];
    const pagePermissionMap = getPageAccessMapFromRawData(roleBasePagePermissions);

    Object.keys(pagePermissionMap).forEach((menuId) => {
        if (minimalPagePermissionList.includes(menuId as MenuId)) pagePermissionMap[menuId] = { read: true, write: true, access: true };
    });
    let result = [...minimalPagePermissionList];
    Object.keys(pagePermissionMap).forEach((menuId) => {
        const _menuId = menuId as MenuId;
        if (defaultPagePermissionList.includes(_menuId) && !minimalPagePermissionList.includes(_menuId) && pagePermissionMap[_menuId].access) result = [...result, _menuId];
    });

    return result;
};

export const pageAccessPermissionMap: Getter<UserState, any> = (state, getters): PageAccessMap => {
    const result: PageAccessMap = {};

    const roleType = getters.getCurrentRoleInfo?.roleType ?? 'USER';
    const minimalPagePermissionList = getMinimalPageAccessPermissionList(roleType);
    const roleBasePagePermissions = getters.getCurrentRoleInfo?.pageAccess ?? ['my_page.*'];
    const pagePermissionMap = getPageAccessMapFromRawData(roleBasePagePermissions);

    const isAllReadOnly = roleBasePagePermissions.every((item) => {
        const accessType = item.split('.*')[0].split(':')[1];
        return accessType === 'read_only';
    });

    getters.pageAccessPermissionList.forEach((menuId) => {
        if (!result[menuId]) {
            if (roleType === ROLE_TYPE.DOMAIN_ADMIN) {
                result[menuId] = {
                    write: !isAllReadOnly,
                };
            } else {
                result[menuId] = {
                    write: minimalPagePermissionList.includes(menuId) ? true : pagePermissionMap[menuId]?.write,
                };
            }
        }
    });
    return result;
};

export const isUserNeedPasswordReset: Getter<UserState, any> = (state): boolean => !!state.requiredActions?.includes('UPDATE_PASSWORD');
