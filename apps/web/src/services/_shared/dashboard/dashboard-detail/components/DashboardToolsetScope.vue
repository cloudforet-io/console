<script lang="ts" setup="">
import {
    reactive, watch, onUnmounted,
} from 'vue';

import { isEqual } from 'lodash';

import {
    PSelectDropdown, PCheckbox, PButtonModal, PStatus, PScopedNotification,
} from '@cloudforet/mirinae';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

import type { WorkspaceModel } from '@/api-clients/identity/workspace/schema/model';
import { useResourceMenuHandlerMap } from '@/query/resource-query/resource-menu-handler';

import WorkspaceLogoIcon from '@/common/modules/navigations/top-bar/modules/top-bar-header/WorkspaceLogoIcon.vue';

import { useAdminDashboardInitialWorkspaceFilter } from '@/services/_shared/dashboard/dashboard-detail/composables/use-admin-dashboard-initial-workspace-filter';
import { useDashboardDetailInfoStore } from '@/services/_shared/dashboard/dashboard-detail/stores/dashboard-detail-info-store';
import { workspaceStateFormatter } from '@/services/advanced/composables/refined-table-data';
import { WORKSPACE_STATE } from '@/services/advanced/constants/workspace-constant';



const dashboardDetailStore = useDashboardDetailInfoStore();
const dashboardDetailState = dashboardDetailStore.state;

const resourceMenuHandlerMap = useResourceMenuHandlerMap();
const workspaceHandler = resourceMenuHandlerMap.workspace({
    menuFilters: [{
        k: 'is_dormant',
        v: false,
        o: '=',
    }],
});

const state = reactive({
    selectedWorkspaceItems: [] as SelectDropdownMenuItem[],
    performanceDelayModalVisible: false as boolean,
});

/* API */
const { data: initialWorkspace } = useAdminDashboardInitialWorkspaceFilter();

const initSelectedWorkspace = (_initialWorkspace?: WorkspaceModel) => {
    const workspace = _initialWorkspace || initialWorkspace.value;
    if (!workspace) return;
    dashboardDetailStore.setSelectedWorkspaceId(workspace.workspace_id);
    state.selectedWorkspaceItems = [{
        name: workspace.workspace_id,
        label: workspace.name,
    }];
};

/* Event */
const handleSelectWorkspace = (selected: SelectDropdownMenuItem[]) => {
    if (isEqual(state.selectedWorkspaceItems, selected)) return;
    dashboardDetailStore.setSelectedWorkspaceId(selected[0]?.name);
    state.selectedWorkspaceItems = selected;
};
const handleToggleAllWorkspace = (value: boolean) => {
    if (value) {
        state.performanceDelayModalVisible = true;
    } else {
        initSelectedWorkspace();
    }
};
const handleConfirmPerformanceDelay = () => {
    state.selectedWorkspaceItems = [];
    state.performanceDelayModalVisible = false;
    dashboardDetailStore.setSelectedWorkspaceId('all');
};


/* Watcher */
watch(initialWorkspace, (workspace) => {
    if (workspace) initSelectedWorkspace(workspace);
}, { immediate: true });

onUnmounted(() => {
    dashboardDetailStore.setSelectedWorkspaceId(undefined);
    state.selectedWorkspaceItems = [];
});
</script>

<template>
    <div class="dashboard-toolset-scope">
        <div class="based-on-wrapper">
            <span class="label-text">
                {{ $t('DASHBOARDS.DETAIL.SCOPE') }}
            </span>
            <p-select-dropdown size="sm"
                               is-filterable
                               :handler="workspaceHandler"
                               menu-position="left"
                               show-select-marker
                               use-fixed-menu-style
                               init-selected-with-handler
                               :disabled="dashboardDetailState.selectedWorkspaceId === 'all'"
                               :page-size="10"
                               @update:selected="handleSelectWorkspace"
            >
                <template #menu-item--format="{item}">
                    <div class="menu-item-wrapper">
                        <div class="label">
                            <workspace-logo-icon :text="item?.label || ''"
                                                 :theme="item?.data?.tags?.theme"
                                                 size="xs"
                            />
                            <span class="label-text">{{ item.label }}</span>
                            <p-status v-if="item?.data?.is_dormant"
                                      v-bind="workspaceStateFormatter(WORKSPACE_STATE.DORMANT)"
                                      class="capitalize state"
                            />
                        </div>
                    </div>
                </template>
            </p-select-dropdown>
        </div>
        <div class="checkbox-wrapper">
            <p-checkbox :selected="dashboardDetailState.selectedWorkspaceId === 'all'"
                        class="ml-1"
                        @change="handleToggleAllWorkspace"
            />
            <span>{{ $t('DASHBOARDS.DETAIL.ALL_WORKSPACE') }}</span>
        </div>
        <p-button-modal :visible.sync="state.performanceDelayModalVisible"
                        size="sm"
                        :header-title="$t('DASHBOARDS.DETAIL.POSSIBLE_PERFORMANCE_DELAY')"
                        @confirm="handleConfirmPerformanceDelay"
        >
            <template #body>
                <p-scoped-notification type="warning"
                                       icon="ic_warning-filled"
                >
                    {{ $t('DASHBOARDS.DETAIL.PERFORMANCE_DELAY_WARNING') }}
                </p-scoped-notification>
            </template>
        </p-button-modal>
    </div>
</template>

<style lang="postcss" scoped>
.dashboard-toolset-scope {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.25rem;

    .based-on-wrapper {
        display: flex;
        align-items: center;
        gap: 0.25rem;
    }
    .checkbox-wrapper {
        display: flex;
        align-items: center;
        gap: 0.25rem;
    }
    .label-text {
        @apply text-label-md font-bold text-gray-800;
    }
    .menu-item-wrapper {
        @apply flex justify-between;
        max-width: 100%;

        .label {
            @apply flex items-center gap-2;
        }
        .state {
            @apply text-label-sm;
        }
        .label-text {
            @apply truncate;
            max-width: 23.75rem;
        }
    }
}
</style>
