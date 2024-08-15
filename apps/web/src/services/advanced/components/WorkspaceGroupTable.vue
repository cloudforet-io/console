<script setup lang="ts">
import { computed, reactive } from 'vue';

import { makeDistinctValueHandler } from '@cloudforet/core-lib/component-util/query-search';
import { getApiQueryWithToolboxOptions } from '@cloudforet/core-lib/component-util/toolbox';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import { PToolboxTable } from '@cloudforet/mirinae';
import { iso8601Formatter } from '@cloudforet/utils';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { WorkspaceGroupListParameters } from '@/schema/identity/workspace-group/api-verbs/list';
import type { WorkspaceGroupModel } from '@/schema/identity/workspace-group/model';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useQueryTags } from '@/common/composables/query-tags';

import WorkspaceGroupTableToolbox from '@/services/advanced/components/WorkspaceGroupTableToolbox.vue';
import { WORKSPACE_GROUP_SEARCH_HANDLERS } from '@/services/advanced/constants/workspace-group-constant';
import { useWorkspaceGroupPageStore } from '@/services/advanced/store/workspace-group-page-store';

interface Props {
    tableHeight: number;
}

const workspaceGroupPageStore = useWorkspaceGroupPageStore();
const workspaceGroupPageState = workspaceGroupPageStore.state;

const queryTagHelper = useQueryTags({ keyItemSets: WORKSPACE_GROUP_SEARCH_HANDLERS.keyItemSets });
const { queryTags } = queryTagHelper;

const workspaceGroupListApiQueryHelper = new ApiQueryHelper()
    .setPageStart(workspaceGroupPageState.pageStart).setPageLimit(workspaceGroupPageState.pageLimit)
    .setSort('name', true);
let workspaceGroupListApiQuery = workspaceGroupListApiQueryHelper.data;


const props = withDefaults(defineProps<Props>(), {
    tableHeight: 400,
});

const tableState = reactive({
    fields: [
        { name: 'name', label: 'Name' },
        { name: 'workspace', label: 'Workspace' },
        { name: 'group_user', label: 'Group User' },
        { name: 'created_at', label: 'Created' },
        // TODO: Will be added when the design is changed
        // { name: 'all_users', label: 'All User' },
        // { name: 'service_account', label: 'Service Account' },
        // { name: 'cost', label: 'Cost' },
    ],
    items: computed(() => workspaceGroupPageState.groups.map(({
        name, workspaces, users, created_at,
    }) => ({
        name,
        workspace: workspaces.length,
        group_user: users.length,
        created_at,
    }))),
    valueHandlerMap: computed(() => {
        const resourceType = 'identity.WorkspaceGroup';

        return {
            name: makeDistinctValueHandler(resourceType, 'name', 'string', [{ k: 'name', v: '', o: 'not' }]),
            workspace: makeDistinctValueHandler(resourceType, 'workspace'),
            group_user: makeDistinctValueHandler(resourceType, 'group_user'),
            created: makeDistinctValueHandler(resourceType, 'created', 'datetime'),
        };
    }),
});

const fetchWorkspaceGroups = async () => {
    workspaceGroupPageState.loading = true;

    try {
        const { results } = await SpaceConnector.clientV2.identity.workspaceGroup.list<WorkspaceGroupListParameters, ListResponse<WorkspaceGroupModel>>({
            query: workspaceGroupListApiQuery,
        });

        workspaceGroupPageState.groups = results || [];
        workspaceGroupPageState.selectedIndices = [];
    } catch (e) {
        ErrorHandler.handleError(e);
        workspaceGroupPageState.groups = [];
    } finally {
        workspaceGroupPageState.loading = false;
    }
};

const handleUpdateSelectIndex = (indices: number[]) => {
    workspaceGroupPageStore.$patch((_state) => {
        _state.state.selectedIndices = indices;
    });
};

const handleChange = (options: any = {}) => {
    workspaceGroupListApiQuery = getApiQueryWithToolboxOptions(workspaceGroupListApiQueryHelper, options) ?? workspaceGroupListApiQuery;
    if (options.queryTags !== undefined) {
        workspaceGroupPageStore.$patch((_state) => {
            _state.state.searchFilters = workspaceGroupListApiQueryHelper.filters;
        });
    }

    if (options.pageStart !== undefined) {
        workspaceGroupPageStore.$patch((_state) => {
            _state.state.pageStart = options.pageStart;
        });
    }
    if (options.pageLimit !== undefined) {
        workspaceGroupPageStore.$patch((_state) => {
            _state.state.pageLimit = options.pageLimit;
        });
    }

    fetchWorkspaceGroups();
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
            :loading="workspaceGroupPageState.loading"
            :select-index="workspaceGroupPageState.selectedIndices"
            :key-item-sets="WORKSPACE_GROUP_SEARCH_HANDLERS.keyItemSets"
            :value-handler-map="tableState.valueHandlerMap"
            sort-by="name"
            :sort-desc="true"
            :query-tags="queryTags"
            :multi-select="false"
            @select="handleUpdateSelectIndex"
            @change="handleChange"
            @refresh="handleChange"
        >
            <template #toolbox-left>
                <workspace-group-table-toolbox />
            </template>
            <!-- TODO: Will be added when the design is changed -->
            <!-- <template #th-cost-format="{ field }">
                <div class="th-tooltip">
                    <span>{{ field.label }}</span>
                    <p-tooltip
                        :contents="$t('IAM.WORKSPACE_GROUP.TOOLTIP_COST')"
                        position="bottom"
                        class="tooltip-wrapper"
                        content-class="custom-tooltip-content"
                    >
                        <p-i name="ic_info-circle"
                             class="title-tooltip"
                             height="1rem"
                             width="1rem"
                             :color="gray[500]"
                        />
                    </p-tooltip>
                </div>
            </template> -->
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
