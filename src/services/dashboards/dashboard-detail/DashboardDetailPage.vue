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
                                   @click="handleNameEditModal"
                    />
                    <dashboard-more-menu dashboard-id="dashboard-xxx"
                                         :dashboard="{ public_dashboard_id: 'dashboard-xxx' }"
                                         :manage-disabled="false"
                                         dashboard-type="PUBLIC"
                    />
                </span>
            </template>
            <template #extra>
                <dashboard-control-buttons @update:visible-clone-modal="handleVisibleCloneModal" />
            </template>
        </p-page-title>
        <div class="flex justify-between mt-4">
            <dashboard-labels :label-list="state.labelList" />
            <dashboard-toolset />
        </div>
        <p-divider />
        <dashboard-refresher loading />
        <dashboard-widget-container
            :widget-size-list="WIDGET_SIZE_MOCK"
            :widget-theme-option-list="WIDGET_THEME_OPTION_MOCK"
        />
        <dashboard-name-edit-modal :visible.sync="state.nameEditModalVisible"
                                   :dashboard-id="state.dashboardId"
                                   :dashboard-name="state.dashboardName"
                                   @confirm="handleNameUpdate"
        />
        <dashboard-clone-modal :visible.sync="state.cloneModalVisible" />
    </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue';

import {
    PDivider, PI, PIconButton, PPageTitle,
} from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { FAVORITE_TYPE } from '@/store/modules/favorite/type';

import FavoriteButton from '@/common/modules/favorites/favorite-button/FavoriteButton.vue';

import { gray } from '@/styles/colors';

import { DASHBOARD_VIEWER } from '@/services/dashboards/config';
import DashboardControlButtons from '@/services/dashboards/dashboard-detail/modules/DashboardControlButtons.vue';
import DashboardMoreMenu from '@/services/dashboards/dashboard-detail/modules/DashboardMoreMenu.vue';
import DashboardNameEditModal from '@/services/dashboards/dashboard-detail/modules/DashboardNameEditModal.vue';
import DashboardRefresher from '@/services/dashboards/dashboard-detail/modules/DashboardRefresher.vue';
import DashboardWidgetContainer from '@/services/dashboards/dashboard-detail/modules/DashboardWidgetContainer.vue';
import DashboardLabels from '@/services/dashboards/modules/dashboard-label/DashboardLabels.vue';
import DashboardToolset from '@/services/dashboards/modules/dashboard-toolset/DashboardToolset.vue';
import DashboardCloneModal from '@/services/dashboards/modules/DashboardCloneModal.vue';
import type { DashboardScope, DashboardViewer } from '@/services/dashboards/type';


const PUBLIC_ICON_COLOR = gray[500];

interface Props {
    dashboardScope: DashboardScope;
    dashboardId: string;
}

// eslint-disable-next-line no-unused-vars,@typescript-eslint/no-unused-vars
const props = defineProps<Props>();

const LABEL_LIST_MOCK = [{ label: 'THIS' }, { label: 'LABELS ARE' }, { label: 'MOCK' }];
const state = reactive({
    dashboardType: DASHBOARD_VIEWER.PUBLIC as DashboardViewer,
    dashboardId: 'dashboard-idxxx',
    dashboardName: 'Dashboard XXX',
    labelList: LABEL_LIST_MOCK as Array<{label: string}>,
    nameEditModalVisible: false,
    cloneModalVisible: false,
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

const handleNameEditModal = () => {
    state.nameEditModalVisible = true;
};
const handleNameUpdate = (name: string) => {
    state.dashboardName = name;
};
const handleVisibleCloneModal = () => {
    state.cloneModalVisible = true;
};

// INIT
(async () => {
    SpaceConnector.clientV2.dashboard.projectDashboard.get({ project_dashboard_id: 'project-dash-5f7dc1d3bb43' });
})();
</script>

<style lang="postcss" scoped>
.dashboard-title-icon-buttons-wrapper {
    display: inline-flex;
    gap: 0.5rem;
    align-items: center;
    margin-left: 0.25rem;
}
</style>
