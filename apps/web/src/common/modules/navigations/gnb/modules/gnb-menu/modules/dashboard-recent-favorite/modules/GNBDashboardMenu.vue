<template>
    <div class="g-n-b-dashboard-menu">
        <p-tab :tabs="tabs"
               :active-tab.sync="activeTab"
        >
            <template #favorite>
                <g-n-b-dashboard-favorite :dashboard-list="dashboardList"
                                          @close="hideMenu"
                                          @update:is-overflown="handleOverflown"
                />
            </template>
            <template #recent>
                <g-n-b-dashboard-recent :visible="activeTab === 'recent'"
                                        :dashboard-list="dashboardList"
                                        @close="hideMenu"
                />
            </template>
            <template #footer>
                <div class="footer-wrapper">
                    <template v-for="(subMenu, index) in subMenuList">
                        <div :key="`footer-${subMenu.label}-${index}`"
                             class="sub-menu"
                        >
                            <g-n-b-sub-menu :label="subMenu.label"
                                            :to="subMenu.to"
                                            :higlight-tag="subMenu.highlightTag"
                                            @navigate="hideMenu"
                            />
                        </div>
                    </template>
                    <div v-if="isOverflown"
                         class="gradient-box"
                    />
                </div>
            </template>
        </p-tab>
    </div>
</template>

<script lang="ts">
import type { SetupContext } from 'vue';
import {
    computed, defineComponent, reactive, toRefs,
} from 'vue';

import { PTab } from '@spaceone/design-system';
import type { TabItem } from '@spaceone/design-system/types/navigation/tabs/tab/type';

import { store } from '@/store';
import { i18n } from '@/translations';

import { useDashboardStore } from '@/store/dashboard/dashboard-store';
import type { DisplayMenu } from '@/store/modules/display/type';
import { FAVORITE_TYPE } from '@/store/modules/favorite/type';

import { useProperRouteLocation } from '@/common/composables/proper-route-location';
import GNBSubMenu from '@/common/modules/navigations/gnb/modules/gnb-menu/GNBSubMenu.vue';
import GNBDashboardFavorite
    from '@/common/modules/navigations/gnb/modules/gnb-menu/modules/dashboard-recent-favorite/modules/GNBDashboardFavorite.vue';
import GNBDashboardRecent
    from '@/common/modules/navigations/gnb/modules/gnb-menu/modules/dashboard-recent-favorite/modules/GNBDashboardRecent.vue';
import type {
    GNBDashboardMenuItem,
} from '@/common/modules/navigations/gnb/modules/gnb-menu/modules/dashboard-recent-favorite/type';

import { DASHBOARDS_ROUTE } from '@/services/dashboards/routes/route-constant';


export default defineComponent({
    name: 'GNBDashboardMenu',
    components: {
        PTab,
        GNBDashboardRecent,
        GNBDashboardFavorite,
        GNBSubMenu,
    },
    setup(props, { emit }: SetupContext) {
        const { getProperRouteLocation } = useProperRouteLocation();
        const dashboardStore = useDashboardStore();
        const dashboardGetters = dashboardStore.getters;
        const state = reactive({
            tabs: computed(() => ([
                { label: i18n.t('COMMON.GNB.FAVORITES.FAVORITES'), name: 'favorite', keepAlive: true },
                { label: i18n.t('COMMON.GNB.RECENT.RECENT'), name: 'recent', keepAlive: true },
            ] as TabItem[])),
            activeTab: 'favorite',
            subMenuList: computed(() => [
                {
                    label: i18n.t('COMMON.GNB.DASHBOARDS.VIEW_ALL'),
                    to: getProperRouteLocation({ name: DASHBOARDS_ROUTE.ALL._NAME }),
                },
                {
                    label: i18n.t('COMMON.GNB.DASHBOARDS.CREATE_DASHBOARDS'),
                    to: getProperRouteLocation({ name: DASHBOARDS_ROUTE.CREATE._NAME }),
                },
            ] as DisplayMenu[]),
            isOverflown: false,
            dashboardList: computed<GNBDashboardMenuItem[]>(() => dashboardGetters.allItems.map((item) => ({
                name: item.name,
                dashboardId: item.public_dashboard_id || item.private_dashboard_id || '',
                workspaceId: item.workspace_id || '',
            }))),
        });
        const hideMenu = () => {
            emit('close');
        };
        const handleOverflown = (isOverflown: boolean) => {
            state.isOverflown = isOverflown;
        };

        (async () => {
            // CAUTION: If GNBDashboardMenu is deprecated, you need to add a request to receive a dashboard list in "GNBFavorite.vue".
            await Promise.allSettled([
                store.dispatch('favorite/load', FAVORITE_TYPE.DASHBOARD),
                dashboardStore.load(),
            ]);
        })();

        return {
            ...toRefs(state),
            hideMenu,
            handleOverflown,
        };
    },
});
</script>

<style lang="postcss" scoped>
.g-n-b-dashboard-menu {
    width: 22.5rem;

    /* custom design-system component - p-tab */
    :deep(.p-tab) {
        @apply absolute bg-white rounded-xs border border-gray-200;
        display: flex;
        flex-direction: column;
        width: 22.5rem;
        min-height: auto;
        right: 0;
        box-shadow: 0 0 0.5rem rgba(0, 0, 0, 0.08);
        .tab-pane {
            padding-bottom: 0;
        }
    }
    .footer-wrapper {
        position: relative;
        .sub-menu {
            @apply border-t border-gray-200;
            padding: 0.5rem;
        }
        .gradient-box {
            position: absolute;
            top: -3rem;
            width: 100%;
            height: 3rem;
            background: linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, #fff 100%);
        }
    }

    &:hover {
        .gradient-box {
            display: none;
        }
    }
}

</style>
