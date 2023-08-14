<script lang="ts" setup>
import { PTab } from '@spaceone/design-system';
import type { TabItem } from '@spaceone/design-system/types/navigation/tabs/tab/type';
import {
    computed, reactive,
} from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';

import type { DisplayMenu } from '@/store/modules/display/type';
import { FAVORITE_TYPE } from '@/store/modules/favorite/type';

import { MENU_ID } from '@/lib/menu/config';

import { useManagePermissionState } from '@/common/composables/page-manage-permission';
import GNBSubMenu from '@/common/modules/navigations/gnb/modules/gnb-menu/GNBSubMenu.vue';
import GNBDashboardFavorite
    from '@/common/modules/navigations/gnb/modules/gnb-menu/modules/dashboard-recent-favorite/modules/GNBDashboardFavorite.vue';
import GNBDashboardRecent
    from '@/common/modules/navigations/gnb/modules/gnb-menu/modules/dashboard-recent-favorite/modules/GNBDashboardRecent.vue';
import type {
    GNBDashboardMenuItem,
} from '@/common/modules/navigations/gnb/modules/gnb-menu/modules/dashboard-recent-favorite/type';

import type { DomainDashboardModel, ProjectDashboardModel } from '@/services/dashboards/model';
import { DASHBOARDS_ROUTE } from '@/services/dashboards/route-config';

const emit = defineEmits<{(e: 'close'): void}>();
const store = useStore();
const { t } = useI18n();

const storeState = reactive({
    domainItems: computed<DomainDashboardModel[]>(() => store.state.dashboard.domainItems),
    projectItems: computed<ProjectDashboardModel[]>(() => store.state.dashboard.projectItems),
});
const state = reactive({
    tabs: computed(() => ([
        { label: t('COMMON.GNB.FAVORITES.FAVORITES'), name: 'favorite', keepAlive: true },
        { label: t('COMMON.GNB.RECENT.RECENT'), name: 'recent', keepAlive: true },
    ] as TabItem[])),
    activeTab: 'favorite',
    subMenuList: computed(() => [
        {
            label: t('COMMON.GNB.DASHBOARDS.VIEW_ALL'),
            to: { name: DASHBOARDS_ROUTE.ALL._NAME },
            show: true,
        },
        {
            label: t('COMMON.GNB.DASHBOARDS.CREATE_DASHBOARDS'),
            to: { name: DASHBOARDS_ROUTE.CREATE._NAME },
            show: !state.hasOnlyViewPermission,
        },
    ] as DisplayMenu[]),
    isOverflown: false,
    dashboardList: computed<GNBDashboardMenuItem[]>(() => {
        const dashboardList: GNBDashboardMenuItem[] = [];
        storeState.domainItems.forEach((domainItem) => {
            dashboardList.push({
                name: domainItem.name,
                dashboardId: domainItem.domain_dashboard_id,
            });
        });
        storeState.projectItems.forEach((projectItem) => {
            dashboardList.push({
                name: projectItem.name,
                dashboardId: projectItem.project_dashboard_id,
            });
        });
        return dashboardList;
    }),
    projectManagePermission: useManagePermissionState(MENU_ID.DASHBOARDS_PROJECT),
    workspaceManagePermission: useManagePermissionState(MENU_ID.DASHBOARDS_WORKSPACE),
    hasOnlyViewPermission: computed(() => !(state.projectManagePermission || state.workspaceManagePermission)),
});
const hideMenu = () => {
    emit('close');
};
const handleOverflown = (isOverflown: boolean) => {
    state.isOverflown = isOverflown;
};

(async () => {
    await Promise.allSettled([
        store.dispatch('favorite/load', FAVORITE_TYPE.DASHBOARD),
        store.dispatch('dashboard/loadAllDashboard'),
    ]);
})();

</script>

<template>
    <div class="g-n-b-dashboard-menu">
        <p-tab v-model:active-tab="state.activeTab"
               :tabs="state.tabs"
        >
            <template #favorite>
                <g-n-b-dashboard-favorite :dashboard-list="state.dashboardList"
                                          @close="hideMenu"
                                          @update:is-overflown="handleOverflown"
                />
            </template>
            <template #recent>
                <g-n-b-dashboard-recent :visible="state.activeTab === 'recent'"
                                        :dashboard-list="state.dashboardList"
                                        @close="hideMenu"
                />
            </template>
            <template #footer>
                <div class="footer-wrapper">
                    <template v-for="(subMenu, index) in state.subMenuList">
                        <div v-if="subMenu.show"
                             :key="`footer-${subMenu.label}-${index}`"
                             class="sub-menu"
                        >
                            <g-n-b-sub-menu :label="subMenu.label"
                                            :to="subMenu.to"
                                            :is-beta="subMenu.isBeta"
                                            :is-new="subMenu.isNew"
                                            @navigate="hideMenu"
                            />
                        </div>
                    </template>
                    <div v-if="state.isOverflown"
                         class="gradient-box"
                    />
                </div>
            </template>
        </p-tab>
    </div>
</template>

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
        box-shadow: 0 0 0.5rem rgba(0, 0, 0, 8%);
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
            background: linear-gradient(180deg, rgba(255, 255, 255, 0%) 0%, #fff 100%);
        }
    }

    &:hover {
        .gradient-box {
            display: none;
        }
    }
}

</style>
