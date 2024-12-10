import type { Ref } from 'vue';
import { computed, reactive, toRef } from 'vue';
import { useRoute } from 'vue-router/composables';

import { clone } from 'lodash';

import { MENU_ID } from '@/lib/menu/config';


interface UseCurrentMenuIdReturnType {
    currentMenuId: Ref<string>;
}

export const useCurrentMenuId = (): UseCurrentMenuIdReturnType => {
    const route = useRoute();

    const state = reactive({
        currentMenuId: computed<string>(() => {
            const reversedMatched = clone(route.matched).reverse();
            const closestRoute = reversedMatched.find((d) => d.meta?.menuId !== undefined);
            return closestRoute?.meta?.menuId || MENU_ID.WORKSPACE_HOME;
        }),
    });

    return {
        currentMenuId: toRef(state, 'currentMenuId'),
    };
};
