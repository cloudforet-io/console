import type { Ref } from 'vue';
import { computed, reactive, toRef } from 'vue';

import { useUserStore } from '@/store/user/user-store';

import type { PageAccessMap } from '@/lib/access-control/config';

import { useCurrentMenuId } from '@/common/composables/current-menu-id';

interface UsePageEditableStatusReturnType {
    hasReadWriteAccess: Ref<boolean|undefined>;
}

export const usePageEditableStatus = (): UsePageEditableStatusReturnType => {
    const userStore = useUserStore();
    const userGetters = userStore.getters;

    const { currentMenuId } = useCurrentMenuId();

    const storeState = reactive({
        pageAccessPermissionMap: computed<PageAccessMap>(() => userGetters.pageAccessPermissionMap),
    });

    const state = reactive({
        hasReadWriteAccess: computed<boolean|undefined>(() => storeState.pageAccessPermissionMap[currentMenuId.value]?.write),
    });

    return {
        hasReadWriteAccess: toRef(state, 'hasReadWriteAccess'),
    };
};
