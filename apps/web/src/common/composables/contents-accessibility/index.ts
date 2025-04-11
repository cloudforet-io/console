import type { Ref } from 'vue';
import { computed, reactive, toRef } from 'vue';

import { useGlobalConfigStore } from '@/store/global-config/global-config-store';

import type { MenuId } from '@/lib/menu/config';

interface UseContentsAccessibilityReturnType {
    visibleContents: Ref<boolean>;
}

export const useContentsAccessibility = (menuId: MenuId): UseContentsAccessibilityReturnType => {
    const globalConfigStore = useGlobalConfigStore();

    const state = reactive({
        visibleContents: computed<boolean>(() => globalConfigStore.getters.menuList.findIndex((menu) => menu.id === menuId) !== -1),
    });

    return {
        visibleContents: toRef(state, 'visibleContents'),
    };
};
