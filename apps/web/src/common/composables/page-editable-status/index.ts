import { computed, reactive } from 'vue';

import { useUserStore } from '@/store/user/user-store';

import type { PageAccessMap } from '@/lib/access-control/config';

import { useCurrentMenuId } from '@/common/composables/current-menu-id';

export const usePageEditableStatus = (): boolean|undefined => {
    const userStore = useUserStore();
    const userGetters = userStore.getters;

    const storeState = reactive({
        pageAccessPermissionMap: computed<PageAccessMap>(() => userGetters.pageAccessPermissionMap),
    });

    return storeState.pageAccessPermissionMap[useCurrentMenuId()]?.write;
};
