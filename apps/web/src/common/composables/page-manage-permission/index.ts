import type { ComputedRef } from 'vue';
import { computed, getCurrentInstance } from 'vue';
import type { Vue } from 'vue/types/vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { getUserAccessLevel } from '@/lib/access-control';
import { ACCESS_LEVEL } from '@/lib/access-control/config';
import type { MenuId } from '@/lib/menu/config';

/**
 * @description return the state which indicates whether the user has manage permission or not.
 *              It compares between access level of user's and that of given route or current route.
 *              RECOMMEND to use in page components only. Do NOT use in child components without given value.
 *              That's because it works by current route when the route name is not given.
 * @param menuId
 */
export const useManagePermissionState = (menuId?: MenuId): ComputedRef<boolean> => {
    const vm = getCurrentInstance()?.proxy as Vue;
    const isDomainAdmin = vm.$store.getters['user/isDomainAdmin'];
    const route = vm.$route;
    if (menuId) {
        const _route = { ...route, meta: { ...route.meta, menuId } };
        return computed<boolean>(() => {
            const userAccessLevel = getUserAccessLevel(_route, isDomainAdmin, vm.$store.getters['user/pagePermissionList'], SpaceConnector.isTokenAlive);
            return userAccessLevel >= ACCESS_LEVEL.MANAGE_PERMISSION;
        });
    }

    return computed<boolean>(() => {
        const userAccessLevel = getUserAccessLevel(route, isDomainAdmin, vm.$store.getters['user/pagePermissionList'], SpaceConnector.isTokenAlive);
        return userAccessLevel >= ACCESS_LEVEL.MANAGE_PERMISSION;
    });
};
