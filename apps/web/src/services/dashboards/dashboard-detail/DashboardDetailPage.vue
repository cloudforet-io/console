<template>
    <div class="dashboard-detail-page">
        <p-heading :title="dashboardDetailState.name">
            <p-skeleton v-if="!dashboardDetailState.name"
                        width="20rem"
                        height="1.5rem"
            />
            <template v-if="dashboardDetailState.name && dashboardDetailStore.dashboardViewer === DASHBOARD_VIEWER.PUBLIC"
                      #title-left-extra
            >
                <p-i name="ic_globe-filled"
                     width="1rem"
                     height="1rem"
                     :color="PUBLIC_ICON_COLOR"
                />
            </template>
            <template v-if="dashboardDetailState.name"
                      #title-right-extra
            >
                <span class="dashboard-title-icon-buttons-wrapper">
                    <div class="favorite-wrapper">
                        <favorite-button :item-id="props.dashboardId"
                                         :favorite-type="FAVORITE_TYPE.DASHBOARD"
                                         scale="0.8"
                        />
                    </div>
                    <p-icon-button name="ic_edit-text"
                                   width="1.5rem"
                                   height="1.5rem"
                                   :disabled="!state.hasManagePermission && dashboardDetailStore.dashboardViewer === DASHBOARD_VIEWER.PUBLIC"
                                   @click="handleVisibleNameEditModal"
                    />
                    <p-icon-button name="ic_delete"
                                   width="1.5rem"
                                   height="1.5rem"
                                   :disabled="!state.hasManagePermission && dashboardDetailStore.dashboardViewer === DASHBOARD_VIEWER.PUBLIC"
                                   class="delete-button"
                                   @click="handleVisibleDeleteModal"
                    />
                </span>
            </template>
            <template #extra>
                <dashboard-control-buttons v-if="state.hasManagePermission"
                                           :dashboard-id="props.dashboardId"
                                           :name="dashboardDetailState.name"
                                           @update:visible-clone-modal="handleVisibleCloneModal"
                />
            </template>
        </p-heading>
        <div class="filter-box">
            <dashboard-labels :editable="state.hasManagePermission"
                              @update-labels="handleUpdateLabels"
            />
            <dashboard-toolset />
        </div>
        <p-divider class="divider" />
        <div class="dashboard-selectors">
            <dashboard-variables-selector class="variable-selector-wrapper"
                                          :is-manageable="state.hasManagePermission"
            />
            <dashboard-refresh-dropdown :dashboard-id="props.dashboardId"
                                        :loading="dashboardDetailState.loadingWidgets"
                                        @refresh="handleRefresh"
            />
        </div>
        <dashboard-widget-container ref="widgetContainerRef" />
        <dashboard-name-edit-modal :visible.sync="state.nameEditModalVisible"
                                   :dashboard-id="props.dashboardId"
                                   :name="dashboardDetailState.name"
                                   @confirm="handleNameUpdate"
        />
        <dashboard-delete-modal :visible.sync="state.deleteModalVisible"
                                :dashboard-id="props.dashboardId"
        />
        <dashboard-clone-modal :visible.sync="state.cloneModalVisible"
                               :dashboard="dashboardDetailState"
        />
        <widget-view-mode-modal :visible="dashboardDetailState.widgetViewModeModalVisible" />
    </div>
</template>

<script setup lang="ts">
import {
    computed, onMounted, onUnmounted,
    reactive, ref, watch,
} from 'vue';

import {
    PDivider, PI, PIconButton, PHeading, PSkeleton,
} from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { SpaceRouter } from '@/router';

import { FAVORITE_TYPE } from '@/store/modules/favorite/type';

import type { RouteQueryString } from '@/lib/router-query-string';
import {
    objectToQueryString, primitiveToQueryString,
    queryStringToObject, queryStringToString,
    replaceUrlQuery,
} from '@/lib/router-query-string';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useManagePermissionState } from '@/common/composables/page-manage-permission';
import FavoriteButton from '@/common/modules/favorites/favorite-button/FavoriteButton.vue';

import { gray } from '@/styles/colors';

import type { RefreshIntervalOption } from '@/services/dashboards/config';
import { DASHBOARD_VIEWER } from '@/services/dashboards/config';
import DashboardWidgetContainer from '@/services/dashboards/dashboard-detail/modules/dashboard-widget-container/DashboardWidgetContainer.vue';
import DashboardControlButtons from '@/services/dashboards/dashboard-detail/modules/DashboardControlButtons.vue';
import DashboardDeleteModal from '@/services/dashboards/dashboard-detail/modules/DashboardDeleteModal.vue';
import DashboardNameEditModal from '@/services/dashboards/dashboard-detail/modules/DashboardNameEditModal.vue';
import DashboardLabels from '@/services/dashboards/modules/dashboard-label/DashboardLabels.vue';
import DashboardToolset from '@/services/dashboards/modules/dashboard-toolset/DashboardToolset.vue';
import DashboardCloneModal from '@/services/dashboards/modules/DashboardCloneModal.vue';
import DashboardRefreshDropdown from '@/services/dashboards/modules/DashboardRefreshDropdown.vue';
import DashboardVariablesSelector from '@/services/dashboards/modules/DashboardVariablesSelector.vue';
import { DASHBOARDS_ROUTE } from '@/services/dashboards/route-config';
import { useDashboardDetailInfoStore } from '@/services/dashboards/store/dashboard-detail-info';
import WidgetViewModeModal from '@/services/dashboards/widgets/_components/WidgetViewModeModal.vue';

const PUBLIC_ICON_COLOR = gray[500];

interface Props {
    dashboardId: string;
}
const props = defineProps<Props>();

const dashboardDetailStore = useDashboardDetailInfoStore();
const dashboardDetailState = dashboardDetailStore.$state;

const state = reactive({
    hasManagePermission: useManagePermissionState(),
    nameEditModalVisible: false,
    deleteModalVisible: false,
    cloneModalVisible: false,
});

const queryState = reactive({
    variables: computed(() => dashboardDetailState.variables),
    settings: computed(() => dashboardDetailState.settings),
    urlQueryString: computed(() => {
        const result = { variables: objectToQueryString(queryState.variables) } as Record<string, RouteQueryString>;
        if (queryState.settings.date_range.enabled) {
            result.dateRange = objectToQueryString({
                start: queryState.settings.date_range.start,
                end: queryState.settings.date_range.end,
            });
        }
        if (queryState.settings.currency.enabled) {
            result.currency = objectToQueryString({
                value: queryState.settings.currency.value,
            });
        }
        if (queryState.settings.refresh_interval_option) {
            result.refresh_interval_option = primitiveToQueryString(queryState.settings.refresh_interval_option);
        }
        return result;
    }),
});

const widgetContainerRef = ref<typeof DashboardWidgetContainer|null>(null);

const getDashboardData = async (dashboardId: string, force = false) => {
    try {
        await dashboardDetailStore.getDashboardInfo(dashboardId, force);
    } catch (e) {
        ErrorHandler.handleError(e);
        await SpaceRouter.router.push({ name: DASHBOARDS_ROUTE.ALL._NAME });
    }
};

// name edit
const handleVisibleNameEditModal = () => {
    state.nameEditModalVisible = true;
};
const handleNameUpdate = (name: string) => {
    dashboardDetailStore.$patch({ name });
    dashboardDetailStore.setOriginDashboardName(name);
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
    if (widgetContainerRef.value) widgetContainerRef.value.refreshAllWidget();
};
const handleUpdateLabels = async (labels: string[]) => {
    try {
        const isProjectDashboard = props.dashboardId?.startsWith('project');
        if (isProjectDashboard) {
            await SpaceConnector.clientV2.dashboard.projectDashboard.update({
                project_dashboard_id: props.dashboardId,
                labels,
            });
        } else {
            await SpaceConnector.clientV2.dashboard.domainDashboard.update({
                domain_dashboard_id: props.dashboardId,
                labels,
            });
        }
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};

/* init */
let urlQueryStringWatcherStop;
const init = async () => {
    const currentQuery = SpaceRouter.router.currentRoute.query;
    const useQueryValue = {
        variables: queryStringToObject(currentQuery.variables),
        dateRange: queryStringToObject(currentQuery.dateRange),
        currency: queryStringToObject(currentQuery.currency),
        refresh_interval_option: queryStringToString(currentQuery.refresh_interval_option) as RefreshIntervalOption,
    };

    if (useQueryValue.variables) {
        dashboardDetailStore.$patch((_state) => {
            _state.variables = useQueryValue.variables;
        });
    }
    if (useQueryValue.dateRange) {
        dashboardDetailStore.$patch((_state) => {
            _state.settings = {
                ..._state.settings,
                date_range: {
                    enabled: true,
                    ...useQueryValue.dateRange,
                },
            };
        });
    }
    if (useQueryValue.currency) {
        dashboardDetailStore.$patch((_state) => {
            _state.settings = {
                ..._state.settings,
                currency: {
                    enabled: true,
                    ...useQueryValue.currency,
                },
            };
        });
    }
    if (useQueryValue.refresh_interval_option) {
        dashboardDetailStore.$patch((_state) => {
            _state.settings = {
                ..._state.settings,
                refresh_interval_option: useQueryValue.refresh_interval_option,
            };
        });
    }

    urlQueryStringWatcherStop = watch(() => queryState.urlQueryString, (urlQueryString) => {
        replaceUrlQuery(urlQueryString);
    }, { immediate: true });
};

(async () => {
    await getDashboardData(props.dashboardId, true);
    await init();
})();

onUnmounted(() => {
    if (urlQueryStringWatcherStop) urlQueryStringWatcherStop();
});

watch(() => props.dashboardId, (_dashboardId) => {
    getDashboardData(_dashboardId);
});

onUnmounted(() => {
    dashboardDetailStore.revertDashboardData();
});

onMounted(() => {
    /*
    Empty widget data map which is used in DashboardWidgetContainer to reuse data and not to call api when going to customize page.
     */
    dashboardDetailStore.$patch((_state) => {
        _state.widgetDataMap = {};
    });
});
</script>

<style lang="postcss" scoped>
.p-heading {
    margin-bottom: 0.75rem;
}
.dashboard-title-icon-buttons-wrapper {
    display: inline-flex;
    gap: 0.5rem;
    align-items: center;
    .favorite-wrapper {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 2rem;
    }
}
.divider {
    @apply mb-6;
}
.filter-box {
    @apply flex justify-between items-start mb-4;
}
.dashboard-selectors {
    @apply relative flex justify-between items-start z-10;
    padding-bottom: 1.25rem;

    .variable-selector-wrapper {
        @apply relative flex items-center flex-wrap;
        gap: 0.5rem;
        padding-right: 1rem;
    }
}
</style>
