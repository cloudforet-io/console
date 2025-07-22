<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
import type { ComputedRef } from 'vue';

import { makeDistinctValueHandler } from '@cloudforet/core-lib/component-util/query-search';
import { getApiQueryWithToolboxOptions } from '@cloudforet/core-lib/component-util/toolbox';
import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import { PToolboxTable } from '@cloudforet/mirinae';
import type { ValueHandlerMap } from '@cloudforet/mirinae/types/controls/search/query-search/type';
import type { DataTableField } from '@cloudforet/mirinae/types/data-display/tables/data-table/type';
import type { ToolboxTableOptions } from '@cloudforet/mirinae/types/data-display/tables/toolbox-table/type';
import { iso8601Formatter } from '@cloudforet/utils';

import { useQueryTags } from '@/common/composables/query-tags';

import WorkspaceGroupTableToolbox from '@/services/advanced/components/WorkspaceGroupTableToolbox.vue';
import { useWorkspaceGroupListPaginationQuery } from '@/services/advanced/composables/querys/use-workspace-group-list-pagination-query';
import { WORKSPACE_GROUP_SEARCH_HANDLERS } from '@/services/advanced/constants/workspace-group-constant';
import { useWorkspaceGroupPageStore } from '@/services/advanced/store/workspace-group-page-store';


interface Props {
    tableHeight: number;
    hasReadWriteAccess?: boolean
}

const workspaceGroupPageStore = useWorkspaceGroupPageStore();
const workspaceGroupPageState = workspaceGroupPageStore.state;

const queryTagHelper = useQueryTags({ keyItemSets: WORKSPACE_GROUP_SEARCH_HANDLERS.keyItemSets });
const { queryTags } = queryTagHelper;

const props = withDefaults(defineProps<Props>(), {
    tableHeight: 400,
    hasReadWriteAccess: true,
});

const workspaceGroupListApiQueryHelper = new ApiQueryHelper().setPageStart(1).setPageLimit(15).setSort('name', true);

interface TableState {
    thisPage: number;
    pageStart: number;
    pageLimit: number;
    totalCount: number;
    sortBy: string;
    sortDesc: boolean;
    searchFilters: ConsoleFilter[];
    fields: DataTableField[];
    items: ComputedRef<{
        name: string;
        workspaces: number;
        users: number;
        created_at: string;
    }[]>;
    valueHandlerMap: ComputedRef<ValueHandlerMap>;
}

const tableState = reactive<TableState>({
    thisPage: 1,
    pageStart: 1,
    pageLimit: 15,
    totalCount: 0,
    sortBy: 'name',
    sortDesc: true,
    searchFilters: [],

    fields: [
        { name: 'name', label: 'Name' },
        { name: 'workspaces', label: 'Workspace' },
        { name: 'users', label: 'Group User' },
        { name: 'created_at', label: 'Created At' },
    ],
    items: computed(() => (data.value ?? []).map(({
        name, workspace_count, users, created_at,
    }) => ({
        name,
        workspaces: workspace_count ?? 0,
        users: users?.length ?? 0,
        created_at,
    }))),
    valueHandlerMap: computed(() => {
        const resourceType = 'identity.WorkspaceGroup';

        return {
            name: makeDistinctValueHandler(resourceType, 'name', 'string', [{ k: 'name', v: '', o: 'not' }]),
            created: makeDistinctValueHandler(resourceType, 'created', 'datetime'),
        };
    }),
});


const {
    data, isLoading, totalCount, refresh,
} = useWorkspaceGroupListPaginationQuery({
    thisPage: computed(() => tableState.thisPage),
    pageSize: computed(() => tableState.pageLimit),
    params: computed(() => {
        const query = getApiQueryWithToolboxOptions(workspaceGroupListApiQueryHelper, {
            queryTags: queryTags.value,
            sortBy: tableState.sortBy,
            sortDesc: tableState.sortDesc,
        }) || workspaceGroupListApiQueryHelper.data;
        return {
            query,
        };
    }),

});

watch(totalCount, (newTotalCount) => {
    tableState.totalCount = newTotalCount;
    workspaceGroupPageStore.$patch((_state) => {
        _state.state.totalCount = newTotalCount;
    });
});


// const handleUpdateSelectIndices = (indices: number[]) => {
//     workspaceGroupPageStore.$patch((_state) => {
//         _state.state.selectedIndices = indices;
//         _state.userTabState.selectedUserIndices = [];
//         _state.userTabState.searchText = '';
//         _state.workspaceTabState.selectedWorkspaceIndices = [];
//         _state.workspaceTabState.searchText = '';
//     });
// };
const handleUpdateSelectIndices = (indices: number[]) => {
    workspaceGroupPageStore.$patch((_state) => {
        _state.state.selectedIndices = indices;
        _state.state.selectedWorkspaceGroup = data.value?.[indices[0]];
    });
};


const handleChange = async (options: ToolboxTableOptions = {}) => {
    if (options.pageStart !== undefined) { tableState.pageStart = options.pageStart; }
    if (options.pageLimit !== undefined) { tableState.pageLimit = options.pageLimit; }
    if (options.queryTags !== undefined) { queryTagHelper.setQueryTags(options.queryTags); }
    if (options.sortBy !== undefined) { tableState.sortBy = options.sortBy; }
    if (options.sortDesc !== undefined) { tableState.sortDesc = options.sortDesc; }
};

</script>

<template>
    <section class="workspace-group-table">
        <p-toolbox-table
            search-type="query"
            :style="{height: `${props.tableHeight}px`}"
            selectable
            sortable
            searchable
            :fields="tableState.fields"
            :items="tableState.items"
            :loading="isLoading"
            :select-index="workspaceGroupPageState.selectedIndices"
            :key-item-sets="WORKSPACE_GROUP_SEARCH_HANDLERS.keyItemSets"
            :value-handler-map="tableState.valueHandlerMap"
            :total-count="tableState.totalCount"
            :this-page.sync="tableState.thisPage"
            :page-start="tableState.pageStart"
            :page-size="tableState.pageLimit"
            :sort-by="tableState.sortBy"
            :sort-desc="tableState.sortDesc"
            :query-tags="queryTags"
            :multi-select="false"
            @select="handleUpdateSelectIndices"
            @change="handleChange"
            @refresh="refresh"
        >
            <template v-if="props.hasReadWriteAccess"
                      #toolbox-left
            >
                <workspace-group-table-toolbox />
            </template>
            <template #col-created_at-format="{ value }">
                {{ iso8601Formatter(value, 'UTC') }}
            </template>
        </p-toolbox-table>
    </section>
</template>

<style lang="postcss" scoped>
.workspace-group-table {
    border: none;

    .th-tooltip {
        @apply flex items-center;
        gap: 0.25rem;
        .tooltip-wrapper {
            margin-top: -0.125rem;
        }
    }
}
</style>
