import { computed } from 'vue';

import { defineStore } from 'pinia';

import { ROLE_TYPE } from '@/api-clients/identity/role/constant';

import { useMenuStore } from '@/store/derived/menu-store';
import { useUserStore } from '@/store/user/user-store';

import type { PageAccessMap } from '@/lib/access-control/config';
import {
    checkAllMenuReadonly,
    getDefaultPageAccessPermissionList,
    getMinimalPageAccessPermissionList,
    getPageAccessMapFromRawData,
} from '@/lib/access-control/page-access-helper';
import type { MenuId } from '@/lib/menu/config';

export const useAccessControlStore = defineStore('derived-access-control-store', () => {
    const userStore = useUserStore();
    const menuStore = useMenuStore();

    const getters = {
        pageAccessPermissionList: computed<MenuId[]>(() => {
            const roleType = userStore.state.currentRoleInfo?.roleType ?? 'USER';
            const roleBasePagePermissions = userStore.state.currentRoleInfo?.pageAccess ?? ['my_page.*'];
            const pagePermissionMap = getPageAccessMapFromRawData({
                pageAccessPermissions: roleBasePagePermissions,
                menuList: menuStore.getters.menuList,
            });
            const minimalPagePermissionList = getMinimalPageAccessPermissionList(roleType);
            const defaultPagePermissionList = getDefaultPageAccessPermissionList(roleType);

            Object.keys(pagePermissionMap).forEach((menuId) => {
                if (minimalPagePermissionList.includes(menuId as MenuId)) pagePermissionMap[menuId] = { read: true, write: true, access: true };
            });
            let result = [...minimalPagePermissionList];
            Object.keys(pagePermissionMap).forEach((menuId) => {
                const _menuId = menuId as MenuId;
                if (defaultPagePermissionList.includes(_menuId) && !minimalPagePermissionList.includes(_menuId) && pagePermissionMap[_menuId].access) result = [...result, _menuId];
            });

            return result;
        }),
        pageAccessPermissionMap: computed<PageAccessMap>(() => {
            const result: PageAccessMap = {};

            const roleType = userStore.state.currentRoleInfo?.roleType ?? 'USER';
            const roleBasePagePermissions = userStore.state.currentRoleInfo?.pageAccess ?? ['my_page.*'];
            const pagePermissionMap = getPageAccessMapFromRawData({
                pageAccessPermissions: roleBasePagePermissions,
                menuList: menuStore.getters.menuList,
            });
            const minimalPagePermissionList = getMinimalPageAccessPermissionList(roleType);

            const isAllReadOnly = checkAllMenuReadonly(roleBasePagePermissions);

            getters.pageAccessPermissionList.value?.forEach((menuId) => {
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
        }),
    };

    return {
        getters,
    };
});
