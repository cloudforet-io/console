import type { Ref } from 'vue';
import { computed, reactive, toRef } from 'vue';

import { useMenuStore } from '@/store/menu/menu-store';

import type { MenuId } from '@/lib/menu/config';

interface UseContentsAccessibilityReturnType {
    visibleContents: Ref<boolean>;
}

export const useContentsAccessibility = (menuId: MenuId): UseContentsAccessibilityReturnType => {
    const menuStore = useMenuStore();
    const menuState = menuStore.state;

    const state = reactive({
        visibleContents: computed<boolean>(() => menuState.menuList.findIndex((menu) => menu.id === menuId) !== -1),
    });

    return {
        visibleContents: toRef(state, 'visibleContents'),
    };
};
