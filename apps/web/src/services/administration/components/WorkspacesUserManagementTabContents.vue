<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';

import {
    PStatus, PToolboxTable, PHeading, PTooltip,
} from '@spaceone/design-system';

import { makeDistinctValueHandler, makeEnumValueHandler } from '@cloudforet/core-lib/component-util/query-search';
import { getApiQueryWithToolboxOptions } from '@cloudforet/core-lib/component-util/toolbox';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';


import { useQueryTags } from '@/common/composables/query-tags';

import {
    calculateTime, userStateFormatter, useRoleFormatter,
} from '@/services/administration/composables/refined-table-data';
import { USER_STATE } from '@/services/administration/constants/user-constant';
import { WORKSPACES_USER_SEARCH_HANDLERS } from '@/services/administration/constants/workspace-constant';
import { useWorkspacePageStore } from '@/services/administration/store/workspace-page-store';

const workspacePageStore = useWorkspacePageStore();
const workspacePageState = workspacePageStore.$state;

const workspaceUserListApiQueryHelper = new ApiQueryHelper()
    .setPageStart(workspacePageState.usersPageStart).setPageLimit(workspacePageState.usersPageLimit)
    .setSort('name', true);
let workspaceUserListApiQuery = workspaceUserListApiQueryHelper.data;
const queryTagHelper = useQueryTags({ keyItemSets: WORKSPACES_USER_SEARCH_HANDLERS.keyItemSets });
const { queryTags } = queryTagHelper;

const state = reactive({
    currentWorkspaceId: computed(() => workspacePageStore.selectedWorkspaces[0]?.workspace_id),
    refinedUserItems: computed(() => workspacePageState.workspaceUsers.map((user) => ({
        ...user,
        role: workspacePageStore.roleMap[workspacePageStore.roleBindingMap[user.role_binding_info.role_binding_id].role_id],
        last_accessed_at: calculateTime(user?.last_accessed_at, workspacePageStore.timezone),
    }))),
});
const tableState = reactive({
    removeLoading: false,
    workspaceUserTableFields: computed(() => [
        { name: 'user_id', label: 'User ID' },
        { name: 'name', label: 'Name' },
        { name: 'state', label: 'State' },
        {
            name: 'role', label: 'Role', sortable: true, sortKey: 'role_type',
        },
        { name: 'auth_type', label: 'Auth Type' },
        { name: 'last_accessed_at', label: 'Last Activity' },
    ]),
    valueHandlerMap: computed(() => {
        const resourceType = 'identity.WorkspaceUser';
        // NOTE: extra params (such as workspace_id) is not included in makeDistinctValueHandler. So, added in last argument of makeDistinctValueHandle.
        const restArgs = [undefined, undefined, { workspace_id: state.currentWorkspaceId }] as const;
        return {
            user_id: makeDistinctValueHandler(resourceType, 'user_id', undefined, ...restArgs),
            name: makeDistinctValueHandler(resourceType, 'name', undefined, ...restArgs),
            state: makeEnumValueHandler(USER_STATE),
            email: makeDistinctValueHandler(resourceType, 'email', undefined, ...restArgs),
            auth_type: makeDistinctValueHandler(resourceType, 'auth_type', undefined, ...restArgs),
            last_accessed_at: makeDistinctValueHandler(resourceType, 'last_accessed_at', 'datetime', ...restArgs),
            timezone: makeDistinctValueHandler(resourceType, 'timezone', undefined, ...restArgs),
        };
    }),
});

const handleChange = async (options: any = {}) => {
    workspaceUserListApiQuery = getApiQueryWithToolboxOptions(workspaceUserListApiQueryHelper, options) ?? workspaceUserListApiQuery;
    if (options.queryTags !== undefined) {
        workspacePageStore.$patch((_state) => {
            _state.usersSearchfilters = workspaceUserListApiQueryHelper.filters;
        });
    }
    if (options.pageStart !== undefined) workspacePageStore.$patch({ usersPageStart: options.pageStart });
    if (options.pageLimit !== undefined) workspacePageStore.$patch({ usersPageLimit: options.pageLimit });
    await workspacePageStore.listWorkspaceUsers({
        workspace_id: state.currentWorkspaceId,
        query: workspaceUserListApiQuery,
    });
};

watch(() => workspacePageStore.selectedWorkspaces, async () => {
    await handleChange();
}, { immediate: true });

</script>

<template>
    <section class="workspace-user-management-tab-contents">
        <p-heading :title="$t('IAM.WORKSPACES.DETAIL.USERS')"
                   use-total-count
                   heading-type="sub"
                   :total-count="workspacePageState.usersTotalCount"
        />
        <p-toolbox-table
            search-type="query"
            searchable
            sortable
            :loading="workspacePageState.workspaceUsersLoading"
            :items="state.refinedUserItems"
            :fields="tableState.workspaceUserTableFields"
            sort-by="name"
            :sort-desc="true"
            :total-count="workspacePageState.usersTotalCount"
            :key-item-sets="WORKSPACES_USER_SEARCH_HANDLERS.keyItemSets"
            :value-handler-map="tableState.valueHandlerMap"
            :query-tags="queryTags"
            @change="handleChange"
            @refresh="handleChange()"
        >
            <template #col-state-format="{value}">
                <p-status v-bind="userStateFormatter(value)"
                          class="capitalize"
                />
            </template>
            <template #col-role-format="{value}">
                <div class="role-type-wrapper">
                    <p-tooltip position="bottom"
                               :contents="useRoleFormatter(value.role_type).name"
                               class="tooltip"
                    >
                        <img :src="useRoleFormatter(value.role_type).image"
                             alt="role-type-icon"
                             class="role-type-icon"
                        >
                    </p-tooltip>
                    <span>{{ value.name }}</span>
                </div>
            </template>
            <template #col-last_accessed_at-format="{ value }">
                <span v-if="value === -1">
                    No Activity
                </span>
                <span v-else-if="value === 0">
                    {{ $t('IAM.USER.MAIN.TODAY') }}
                </span>
                <span v-else-if="value === 1">
                    {{ $t('IAM.USER.MAIN.YESTERDAY') }}
                </span>
                <span v-else>
                    {{ value }} {{ $t('IAM.USER.MAIN.DAYS') }}
                </span>
            </template>
        </p-toolbox-table>
    </section>
</template>

<style lang="postcss" scoped>
.workspace-user-management-tab-contents {
    .role-type-wrapper {
        @apply flex items-center;
        gap: 0.25rem;
        .tooltip {
            @apply rounded-full;
            width: 1.5rem;
            height: 1.5rem;
            margin-right: 0.25rem;
        }
        .role-type-icon {
            @apply rounded-full;
            width: 1.5rem;
            height: 1.5rem;
        }
    }
}
</style>
