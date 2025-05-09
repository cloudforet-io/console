import type { Ref } from 'vue';
import { computed, reactive, toRef } from 'vue';

import { useAuthorizationStore } from '@/store/authorization/authorization-store';

import { useCurrentMenuId } from '@/common/composables/current-menu-id';

interface UsePageEditableStatusReturnType {
    hasReadWriteAccess: Ref<boolean|undefined>;
}

export const usePageEditableStatus = (): UsePageEditableStatusReturnType => {
    const authorizationStore = useAuthorizationStore();
    const { currentMenuId } = useCurrentMenuId();

    const state = reactive({
        hasReadWriteAccess: computed<boolean|undefined>(() => authorizationStore.getters.pageAccessPermissionMap[currentMenuId.value]?.write),
    });

    return {
        hasReadWriteAccess: toRef(state, 'hasReadWriteAccess'),
    };
};
