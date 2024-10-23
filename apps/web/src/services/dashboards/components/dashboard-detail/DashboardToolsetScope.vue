<script lang="ts" setup="">
import { reactive } from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PSelectDropdown, PCheckbox, PButtonModal, PStatus,
} from '@cloudforet/mirinae';
import type { SelectDropdownMenuItem, AutocompleteHandler } from '@cloudforet/mirinae/types/inputs/dropdown/select-dropdown/type';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { WorkspaceListParameters } from '@/schema/identity/workspace/api-verbs/list';
import type { WorkspaceModel } from '@/schema/identity/workspace/model';

import ScopedNotification from '@/common/components/scoped-notification/ScopedNotification.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';
import WorkspaceLogoIcon from '@/common/modules/navigations/top-bar/modules/top-bar-header/WorkspaceLogoIcon.vue';

import { workspaceStateFormatter } from '@/services/advanced/composables/refined-table-data';
import { WORKSPACE_STATE } from '@/services/advanced/constants/workspace-constant';



const state = reactive({
    selectedWorkspaceItems: [] as SelectDropdownMenuItem[],
    selectAllWorkspace: false as boolean,
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

/* Event */
const handleSelectWorkspace = (selected: SelectDropdownMenuItem[]) => {
    state.selectedWorkspaceItems = selected;
};
const handleToggleAllWorkspace = (value: boolean) => {
    if (value) {
        state.performanceDelayModalVisible = true;
    } else {
        state.selectAllWorkspace = value;
    }
};
const handleConfirmPerformanceDelay = () => {
    state.selectedWorkspaceItems = [];
    state.selectAllWorkspace = true;
    state.performanceDelayModalVisible = false;
};
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
                               :disabled="state.selectAllWorkspace"
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
            <p-checkbox :selected="state.selectAllWorkspace"
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
                <scoped-notification title-icon="ic_warning-filled"
                                     type="warning"
                                     :visible="true"
                                     no-title
                                     hide-header-close-button
                >
                    {{ $t('DASHBOARDS.DETAIL.PERFORMANCE_DELAY_WARNING') }}
                </scoped-notification>
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
