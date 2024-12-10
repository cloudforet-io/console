import { useRoute } from 'vue-router/composables';

import { clone } from 'lodash';

import { MENU_ID } from '@/lib/menu/config';


import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/routes/route-constant';

export const useCurrentMenuId = (): string => {
    const route = useRoute();
    const reversedMatched = clone(route.matched).reverse();
    const closestRoute = reversedMatched.find((d) => d.meta?.menuId !== undefined);
    const targetMenuId = closestRoute?.meta?.menuId || MENU_ID.WORKSPACE_HOME;
    if (route.name === COST_EXPLORER_ROUTE.LANDING._NAME) {
        return '';
    }
    return targetMenuId;
};
