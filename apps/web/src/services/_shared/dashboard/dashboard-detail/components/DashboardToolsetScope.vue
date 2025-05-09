<script lang="ts" setup="">
import { computed, reactive, watch } from 'vue';

import { isEqual } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PSelectDropdown, PCheckbox, PButtonModal, PStatus, PScopedNotification,
} from '@cloudforet/mirinae';
import type { SelectDropdownMenuItem, AutocompleteHandler } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { WorkspaceListParameters } from '@/api-clients/identity/workspace/schema/api-verbs/list';
import type { WorkspaceModel } from '@/api-clients/identity/workspace/schema/model';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { WorkspaceReferenceMap } from '@/store/reference/workspace-reference-store';

import ErrorHandler from '@/common/composables/error/errorHandler';
import WorkspaceLogoIcon from '@/common/modules/navigations/top-bar/modules/top-bar-header/WorkspaceLogoIcon.vue';

import { useDashboardDetailInfoStore } from '@/services/_shared/dashboard/dashboard-detail/stores/dashboard-detail-info-store';
import { workspaceStateFormatter } from '@/services/advanced/composables/refined-table-data';
import { WORKSPACE_STATE } from '@/services/advanced/constants/workspace-constant';



const allReferenceStore = useAllReferenceStore();
const dashboardDetailStore = useDashboardDetailInfoStore();
const dashboardDetailState = dashboardDetailStore.state;
const storeState = reactive({
    workspaces: computed<WorkspaceReferenceMap>(() => allReferenceStore.getters.workspace),
});
const state = reactive({
    selectedWorkspaceItems: [] as SelectDropdownMenuItem[],
    performanceDelayModalVisible: false as boolean,
});

const workspaceHandler: AutocompleteHandler = async (keyword: string, pageStart = 1, pageLimit = 10) => {
    try {
        const { results } = await SpaceConnector.clientV2.identity.workspace.list<WorkspaceListParameters, ListResponse<WorkspaceModel>>({
            query: {
                keyword,
                filter: [
                    { k: 'is_dormant', v: false, o: 'eq' },
                ],
            },
        });
        const refinedMenuItems = (results ?? []).map((d) => ({
            name: d.workspace_id,
            label: d.name,
            is_dormant: d.is_dormant,
            tags: d.tags,
        }));
        const totalCount = pageStart - 1 + Number(pageLimit);
        const slicedResults = refinedMenuItems?.slice(pageStart - 1, totalCount);
        return {
            results: slicedResults,
            more: totalCount < refinedMenuItems.length,
        };
    } catch (e) {
        ErrorHandler.handleError(e);
        return {
            results: [],
            more: false,
        };
    }
};
const initSelectedWorkspace = () => {
    const _defaultWorkspace = Object.values(storeState.workspaces)[0];
    dashboardDetailStore.setSelectedWorkspaceId(_defaultWorkspace?.key);
    state.selectedWorkspaceItems = [{
        name: _defaultWorkspace?.key,
        label: _defaultWorkspace?.label,
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
watch(() => storeState.workspaces, (workspaces) => {
    if (workspaces) initSelectedWorkspace();
}, { immediate: true });
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
                               :selected="state.selectedWorkspaceItems"
                               menu-position="left"
                               show-select-marker
                               use-fixed-menu-style
                               :disabled="dashboardDetailState.selectedWorkspaceId === 'all'"
                               :page-size="10"
                               @update:selected="handleSelectWorkspace"
            >
                <template #menu-item--format="{item}">
                    <div class="menu-item-wrapper">
                        <div class="label">
                            <workspace-logo-icon :text="item?.label || ''"
                                                 :theme="item?.tags?.theme"
                                                 size="xs"
                            />
                            <span class="label-text">{{ item.label }}</span>
                            <p-status v-if="item?.is_dormant"
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
