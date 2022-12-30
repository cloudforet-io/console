<template>
    <div class="dashboard-detail-page">
        <p-page-title :title="state.dashboardName">
            <template v-if="state.dashboardViewer === DASHBOARD_VIEWER.PUBLIC"
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
                    <favorite-button :item-id="props.dashboardId"
                                     :favorite-type="FAVORITE_TYPE.DASHBOARD"
                    />
                    <p-icon-button name="ic_edit-text"
                                   width="1.5rem"
                                   height="1.5rem"
                                   :disabled="!state.hasManagePermission && state.dashboardViewer === DASHBOARD_VIEWER.PUBLIC"
                                   class="ml-1"
                                   @click="handleVisibleNameEditModal"
                    />
                    <p-icon-button name="ic_trashcan"
                                   width="1.5rem"
                                   height="1.5rem"
                                   :disabled="!state.hasManagePermission && state.dashboardViewer === DASHBOARD_VIEWER.PUBLIC"
                                   @click="handleVisibleDeleteModal"
                    />
                </span>
            </template>
            <template #extra>
                <dashboard-control-buttons :dashboard-name="state.dashboardName"
                                           @update:visible-clone-modal="handleVisibleCloneModal"
                />
            </template>
        </p-page-title>
        <div class="filter-box">
            <dashboard-labels :label-list="state.labelList" />
            <dashboard-toolset :enable-currency="state.enableCurrency"
                               :currency.sync="state.currency"
                               :enable-date-range="state.enableDateRange"
                               :date-range.sync="state.dateRange"
                               @update:dateRange="handleUpdateURLParam"
                               @update:currency="handleUpdateURLParam"
            />
        </div>
        <p-divider class="divider" />
        <div class="filter-box">
            <div>filters</div>
            <dashboard-refresh-dropdown :interval-option.sync="state.refreshInterval"
                                        :loading="state.loading"
                                        @refresh="handleRefresh"
            />
        </div>
        <dashboard-widget-container
            ref="widgetContainerRef"
            :widget-info-list="state.dashboardWidgetInfoList"
            :all-reference-type-info="state.allReferenceTypeInfo"
        />
        <dashboard-name-edit-modal :visible.sync="state.nameEditModalVisible"
                                   :dashboard-id="props.dashboardId"
                                   :dashboard-name="state.dashboardName"
                                   @confirm="handleNameUpdate"
        />
        <dashboard-delete-modal :visible.sync="state.deleteModalVisible"
                                :dashboard-id="props.dashboardId"
        />
        <dashboard-clone-modal :visible.sync="state.cloneModalVisible" />
    </div>
</template>

<script setup lang="ts">
import {
    reactive, ref, computed, watch, onMounted,
} from 'vue';

import {
    PDivider, PI, PIconButton, PPageTitle,
} from '@spaceone/design-system';
import dayjs from 'dayjs';
import { flattenDeep } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { SpaceRouter } from '@/router';
import { store } from '@/store';

import type { Currency } from '@/store/modules/display/config';
import { CURRENCY } from '@/store/modules/display/config';
import { FAVORITE_TYPE } from '@/store/modules/favorite/type';
import type { AllReferenceTypeInfo } from '@/store/modules/reference/type';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useManagePermissionState } from '@/common/composables/page-manage-permission';
import FavoriteButton from '@/common/modules/favorites/favorite-button/FavoriteButton.vue';

import { gray } from '@/styles/colors';

import { DASHBOARD_VIEWER } from '@/services/dashboards/config';
import type { DashboardViewer, DateRange } from '@/services/dashboards/config';
import DashboardControlButtons from '@/services/dashboards/dashboard-detail/modules/DashboardControlButtons.vue';
import DashboardDeleteModal from '@/services/dashboards/dashboard-detail/modules/DashboardDeleteModal.vue';
import DashboardNameEditModal from '@/services/dashboards/dashboard-detail/modules/DashboardNameEditModal.vue';
import DashboardWidgetContainer from '@/services/dashboards/dashboard-detail/modules/DashboardWidgetContainer.vue';
import type { DashboardModel } from '@/services/dashboards/model';
import DashboardLabels from '@/services/dashboards/modules/dashboard-label/DashboardLabels.vue';
import DashboardToolset from '@/services/dashboards/modules/dashboard-toolset/DashboardToolset.vue';
import DashboardCloneModal from '@/services/dashboards/modules/DashboardCloneModal.vue';
import DashboardRefreshDropdown from '@/services/dashboards/modules/DashboardRefreshDropdown.vue';
import { DASHBOARDS_ROUTE } from '@/services/dashboards/route-config';
import type { DashboardLayoutWidgetInfo } from '@/services/dashboards/widgets/config';

const PUBLIC_ICON_COLOR = gray[500];

interface Props {
    dashboardId: string;
}
const props = defineProps<Props>();

const state = reactive({
    hasManagePermission: useManagePermissionState(),
    dashboardInfo: {} as DashboardModel,
    dashboardViewer: computed<DashboardViewer>(() => state.dashboardInfo?.viewers ?? DASHBOARD_VIEWER.PRIVATE),
    dashboardName: '',
    isProjectDashboard: computed<boolean>(() => props.dashboardId.startsWith('project')),
    labelList: computed<string[]>(() => state.dashboardInfo?.labels ?? []),
    dashboardWidgetInfoList: computed<DashboardLayoutWidgetInfo[]>(() => flattenDeep(state.dashboardInfo?.layouts)),
    enableDateRange: false,
    dateRange: {
        start: dayjs.utc().format('YYYY-MM-01'),
        end: dayjs.utc().format('YYYY-MM-DD'),
    } as DateRange,
    enableCurrency: false,
    currency: CURRENCY.USD as Currency,
    //
    nameEditModalVisible: false,
    deleteModalVisible: false,
    cloneModalVisible: false,
    refreshInterval: '15s',
    loading: false,
    allReferenceTypeInfo: computed<AllReferenceTypeInfo>(() => store.getters['reference/allReferenceTypeInfo']),
});

const widgetContainerRef = ref<any>(null);

// name edit
const handleVisibleNameEditModal = () => {
    state.nameEditModalVisible = true;
};
const handleNameUpdate = (name: string) => {
    state.dashboardName = name;
};

// delete dashboard
const handleVisibleDeleteModal = () => {
    state.deleteModalVisible = true;
};

// clone dashboard
const handleVisibleCloneModal = () => {
    state.cloneModalVisible = true;
};


// else
const handleRefresh = () => {
    widgetContainerRef.value?.refreshAllWidget();
};
const handleUpdateURLParam = () => {
    // TODO: write currency/dateRange data in url parameters
};

const getDashboardData = async () => {
    try {
        let result: DashboardModel;
        if (state.isProjectDashboard) {
            result = await SpaceConnector.clientV2.dashboard.projectDashboard.get({ project_dashboard_id: props.dashboardId });
        } else {
            result = await SpaceConnector.clientV2.dashboard.domainDashboard.get({ domain_dashboard_id: props.dashboardId });
        }
        state.dashboardInfo = result;
        state.dashboardName = result.name;

        state.enableCurrency = result.settings.currency.enabled;
        state.currency = result.settings.currency?.value ?? CURRENCY.USD;
        state.enableDateRange = result.settings.date_range.enabled;
        state.dateRange = result.settings.date_range;
    } catch (e) {
        ErrorHandler.handleError(e);
        await SpaceRouter.router.push({ name: DASHBOARDS_ROUTE.ALL._NAME });
    }
};

watch(() => props.dashboardId, (dashboardId) => {
    if (dashboardId) getDashboardData();
}, { immediate: true });

onMounted(async () => {
    await store.dispatch('reference/loadAll');
});
</script>

<style lang="postcss" scoped>
.dashboard-title-icon-buttons-wrapper {
    display: inline-flex;
    gap: 0.5rem;
    align-items: center;
    margin-left: 0.25rem;
}
.divider {
    @apply mb-6;
}
.filter-box {
    @apply flex justify-between items-start mt-5;
}
</style>
