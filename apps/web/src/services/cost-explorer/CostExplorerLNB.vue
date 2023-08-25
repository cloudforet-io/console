<template>
    <aside class="sidebar-menu">
        <l-n-b :header="header"
               :menu-set="menuSet"
        />
    </aside>
</template>

<script lang="ts">
import {
    computed, reactive, toRefs,
} from 'vue';

import { store } from '@/store';
import { i18n } from '@/translations';

import { filterLNBMenuByPermission } from '@/lib/access-control/page-permission-helper';
import { MENU_ID } from '@/lib/menu/config';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';

import LNB from '@/common/modules/navigations/lnb/LNB.vue';
import type { LNBItem, LNBMenu } from '@/common/modules/navigations/lnb/type';

import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/route-config';


export default {
    name: 'CostExplorerLNB',
    components: {
        LNB,
    },
    setup() {
        const state = reactive({
            loading: true,
            header: computed(() => i18n.t(MENU_INFO_MAP[MENU_ID.COST_EXPLORER].translationId)),
            menuSet: computed<LNBMenu[]>(() => [
                ...filterLNBMenuByPermission([
                    {
                        type: 'item',
                        id: MENU_ID.COST_EXPLORER_COST_ANALYSIS,
                        label: i18n.t(MENU_INFO_MAP[MENU_ID.COST_EXPLORER_COST_ANALYSIS].translationId),
                        to: { name: COST_EXPLORER_ROUTE.COST_ANALYSIS._NAME },
                    },
                    {
                        type: 'item',
                        id: MENU_ID.COST_EXPLORER_BUDGET,
                        label: i18n.t(MENU_INFO_MAP[MENU_ID.COST_EXPLORER_BUDGET].translationId),
                        to: { name: COST_EXPLORER_ROUTE.BUDGET._NAME },
                    },
                ], store.getters['user/pagePermissionList']),
            ]),
            selectedMenu: {} as LNBItem,
        });

        return {
            ...toRefs(state),
            COST_EXPLORER_ROUTE,
        };
    },
};
</script>
