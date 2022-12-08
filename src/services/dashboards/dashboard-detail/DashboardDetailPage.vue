<template>
    <div class="dashboard-detail-page">
        <p-page-title title="Project_title">
            <template v-if="state.dashboardType === DASHBOARD_VIEWER_PUBLIC"
                      #title-left-extra
            >
                <p-i name="ic_public"
                     width="1rem"
                     height="1rem"
                     :color="PUBLIC_ICON_COLOR"
                />
            </template>
            <template #title-right-extra>
                <span class="dashboard-title-icon-buttons-wrapper">
                    <favorite-button :item-id="state.dashboardId"
                                     :favorite-type="FAVORITE_TYPE.DASHBOARD"
                    />
                    <p-icon-button name="ic_edit-text"
                                   width="1.5rem"
                                   height="1.5rem"
                    />
                    <dashboard-more-menu dashboard-id="dashboard-xxx"
                                         :dashboard="{ public_dashboard_id: 'dashboard-xxx' }"
                                         :manage-disabled="false"
                    />
                </span>
            </template>
            <template #extra>
                <dashboard-control-buttons />
            </template>
        </p-page-title>
        <dashboard-refresher loading />
        <dashboard-widget-container
            :widget-size-list="WIDGET_SIZE_MOCK"
            :widget-theme-option-list="WIDGET_THEME_OPTION_MOCK"
        />
    </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue';

import { PI, PIconButton, PPageTitle } from '@spaceone/design-system';

import { FAVORITE_TYPE } from '@/store/modules/favorite/type';

import FavoriteButton from '@/common/modules/favorites/favorite-button/FavoriteButton.vue';

import { gray } from '@/styles/colors';

import { DASHBOARD_VIEWER_PUBLIC } from '@/services/dashboards/dashboard-create/config';
import type { DashboardViewerType } from '@/services/dashboards/dashboard-create/type';
import DashboardControlButtons from '@/services/dashboards/dashboard-detail/modules/DashboardControlButtons.vue';
import DashboardMoreMenu from '@/services/dashboards/dashboard-detail/modules/DashboardMoreMenu.vue';
import DashboardRefresher from '@/services/dashboards/dashboard-detail/modules/DashboardRefresher.vue';
import DashboardWidgetContainer from '@/services/dashboards/dashboard-detail/modules/DashboardWidgetContainer.vue';

const PUBLIC_ICON_COLOR = gray[500];


const state = reactive({
    dashboardType: DASHBOARD_VIEWER_PUBLIC as DashboardViewerType,
    dashboardId: 'dashboard-idxxx',
});

const WIDGET_SIZE_MOCK = ['md', 'md', 'sm', 'md', 'lg', 'sm'];
const WIDGET_THEME_OPTION_MOCK = [
    { inherit: true, inherit_count: 3 },
    { inherit: true, inherit_count: undefined },
    { inherit: false, inherit_count: undefined },
    { inherit: true, inherit_count: undefined },
    { inherit: true, inherit_count: undefined },
    { inherit: true, inherit_count: undefined },
];

</script>

<style lang="postcss" scoped>
.dashboard-title-icon-buttons-wrapper {
    display: inline-flex;
    gap: 0.5rem;
    align-items: center;
    margin-left: 0.25rem;
}
</style>
