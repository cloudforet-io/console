<template>
    <aside class="sidebar-menu">
        <l-n-b :header="header"
               :menu-set="menuSet"
        >
            <template v-if="relocateNotificationState.isShow"
                      #default
            >
                <l-n-b-router-menu-item :item="relocateNotificationState.data">
                    <template #after-text>
                        <p-i name="ic_arrow-right-up"
                             width="1rem"
                             height="1rem"
                             class="link-icon"
                        />
                    </template>
                </l-n-b-router-menu-item>
                <relocate-dashboard-notification @click-dismiss="handleDismissRelocateNotification"
                                                 @click-learn-more="handleLearnMoreRelocateNotification"
                />
                <l-n-b-divider-menu-item />
            </template>
        </l-n-b>
        <!--TODO: Should be replaced with lean-more modal-->
        <p-button-modal :visible.sync="relocateNotificationState.isModalVisible" />
    </aside>
</template>

<script lang="ts">
import {
    computed, reactive, toRefs,
} from 'vue';

import { PButtonModal, PI } from '@spaceone/design-system';

import { store } from '@/store';
import { i18n } from '@/translations';

import { filterLNBMenuByPermission } from '@/lib/access-control/page-permission-helper';
import { MENU_ID } from '@/lib/menu/config';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';

import LNB from '@/common/modules/navigations/lnb/LNB.vue';
import LNBDividerMenuItem from '@/common/modules/navigations/lnb/modules/LNBDividerMenuItem.vue';
import LNBRouterMenuItem from '@/common/modules/navigations/lnb/modules/LNBRouterMenuItem.vue';
import type { LNBItem, LNBMenu } from '@/common/modules/navigations/lnb/type';

import RelocateDashboardNotification from '@/services/cost-explorer/modules/RelocateDashboardNotification.vue';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/route-config';
import { DASHBOARDS_ROUTE } from '@/services/dashboards/route-config';


export default {
    name: 'CostExplorerLNB',
    components: {
        LNB,
        PButtonModal,
        PI,
        RelocateDashboardNotification,
        LNBRouterMenuItem,
        LNBDividerMenuItem,
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
        });

        const relocateNotificationState = reactive({
            isShow: true,
            data: computed<LNBItem>(() => ({
                type: 'item',
                id: MENU_ID.DASHBOARDS,
                label: 'Go to Dashboard',
                to: { name: DASHBOARDS_ROUTE._NAME },
                isNew: true,
                hideFavorite: true,
            })),
            isModalVisible: false,
        });

        const handleLearnMoreRelocateNotification = () => {
            relocateNotificationState.isModalVisible = true;
        };

        const handleDismissRelocateNotification = () => {
            relocateNotificationState.isShow = false;
        };

        return {
            ...toRefs(state),
            relocateNotificationState,
            COST_EXPLORER_ROUTE,
            handleLearnMoreRelocateNotification,
            handleDismissRelocateNotification,
        };
    },
};
</script>

<style scoped lang="postcss">
.sidebar-menu {
    .link-icon {
        margin-left: 0.25rem;
    }
}
</style>
