import type { Ref } from 'vue';
import { computed, reactive, toRef } from 'vue';

import { useGlobalConfigSchemaStore } from '@/store/global-config-schema/global-config-schema-store';

import type { MenuId } from '@/lib/menu/config';

interface UseContentsAccessibilityReturnType {
    visibleContents: Ref<boolean>;
}

export const useContentsAccessibility = (menuId: MenuId): UseContentsAccessibilityReturnType => {
    const globalConfigSchemaStore = useGlobalConfigSchemaStore();

    const state = reactive({
        visibleContents: computed<boolean>(() => globalConfigSchemaStore.getters.menuList.findIndex((menu) => menu.id === menuId) !== -1),
    });

    return {
        visibleContents: toRef(state, 'visibleContents'),
    };
};
