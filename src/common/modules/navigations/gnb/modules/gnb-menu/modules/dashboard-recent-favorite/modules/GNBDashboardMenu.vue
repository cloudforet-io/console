<template>
    <div class="g-n-b-dashboard-menu">
        <p-tab :tabs="tabs"
               :active-tab.sync="activeTab"
        >
            <template #favorite>
                <g-n-b-dashboard-favorite />
            </template>
            <template #recent>
                <g-n-b-dashboard-recent :visible="activeTab === 'recent'" />
            </template>
            <template #footer>
                <div v-for="(subMenu, index) in subMenuList"
                     :key="index"
                     class="sub-menu"
                >
                    <g-n-b-sub-menu :show="!subMenu.hideOnGNB"
                                    :label="subMenu.label"
                                    :to="subMenu.to"
                                    :is-beta="subMenu.isBeta"
                                    :is-new="subMenu.isNew"
                    />
                </div>
            </template>
        </p-tab>
    </div>
</template>

<script lang="ts">
import {
    computed, defineComponent, reactive, toRefs,
} from 'vue';

import { PTab } from '@spaceone/design-system';
import type { TabItem } from '@spaceone/design-system/dist/src/navigation/tabs/tab/type';

import { i18n } from '@/translations';

import type { DisplayMenu } from '@/store/modules/display/type';

import GNBSubMenu from '@/common/modules/navigations/gnb/modules/gnb-menu/GNBSubMenu.vue';
import GNBDashboardFavorite
    from '@/common/modules/navigations/gnb/modules/gnb-menu/modules/dashboard-recent-favorite/modules/GNBDashboardFavorite.vue';
import GNBDashboardRecent
    from '@/common/modules/navigations/gnb/modules/gnb-menu/modules/dashboard-recent-favorite/modules/GNBDashboardRecent.vue';

import { DASHBOARD_ROUTE } from '@/services/dashboard/route-config';

export default defineComponent({
    name: 'GNBDashboardMenu',
    components: {
        PTab,
        GNBDashboardRecent,
        GNBDashboardFavorite,
        GNBSubMenu,
    },
    setup() {
        const state = reactive({
            tabs: computed(() => ([
                { label: i18n.t('COMMON.GNB.FAVORITES.FAVORITES'), name: 'favorite', keepAlive: true },
                { label: i18n.t('COMMON.GNB.RECENT.RECENT'), name: 'recent', keepAlive: true },
            ] as TabItem[])),
            activeTab: 'favorite',
            subMenuList: [
                {
                    label: 'View All Dashboards', // song-lang
                    to: { name: DASHBOARD_ROUTE._NAME },
                },
                {
                    label: 'Create New Dashboard', // song-lang
                    to: { name: DASHBOARD_ROUTE.CREATE._NAME },
                },
            ] as DisplayMenu[],
        });
        return {
            ...toRefs(state),
        };
    },
});
</script>

<style lang="postcss" scoped>
.g-n-b-dashboard-menu {
    /* custom design-system component - p-tab */
    :deep(.p-tab) {
        @apply absolute bg-white rounded-xs border border-gray-200;
        display: flex;
        flex-direction: column;
        width: 27.5rem;
        min-height: auto;
        top: 100%;
        right: 0;
        box-shadow: 0 0 0.5rem rgba(0, 0, 0, 0.08);
        margin-top: -0.5rem;
        margin-right: -0.5rem;
        .tab-pane {
            padding-bottom: 0;
        }
    }
    .sub-menu {
        @apply border-t border-gray-200;
        padding: 0.5rem;
    }
}

</style>
