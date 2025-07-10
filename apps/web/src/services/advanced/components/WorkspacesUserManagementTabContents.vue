<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';
import { useRouter } from 'vue-router/composables';


import { makeDistinctValueHandler, makeEnumValueHandler } from '@cloudforet/core-lib/component-util/query-search';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PStatus, PToolboxTable, PHeading, PTooltip, PButton, PHeadingLayout,
} from '@cloudforet/mirinae';

import { useRoleBindingApi } from '@/api-clients/identity/role-binding/composables/use-role-binding-api';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useAllReferenceDataModel } from '@/query/resource-query/reference-model/use-all-reference-data-model';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';

import { useUserStore } from '@/store/user/user-store';

import { useQueryTags } from '@/common/composables/query-tags';

import { useWorkspaceUserListPaginationQuery } from '@/services/advanced/composables/use-workspace-user-list-pagination-query';
import { WORKSPACE_STATE, WORKSPACES_USER_SEARCH_HANDLERS } from '@/services/advanced/constants/workspace-constant';
import { useWorkspacePageStore } from '@/services/advanced/store/workspace-page-store';
import {
    calculateTime, userStateFormatter, useRoleFormatter,
} from '@/services/iam/composables/refined-table-data';
import { USER_STATE } from '@/services/iam/constants/user-constant';
import { IAM_ROUTE } from '@/services/iam/routes/route-constant';

const userStore = useUserStore();
const workspacePageStore = useWorkspacePageStore();
const workspacePageState = workspacePageStore.state;

const router = useRouter();

const referenceMap = useAllReferenceDataModel();

const { roleBindingAPI } = useRoleBindingApi();

const { key: roleBindingListQueryKey, params: roleBindingListQueryParams } = useServiceQueryKey('identity', 'role-binding', 'list');

const { data: roleBindingListQueryData } = useScopedQuery({
    queryKey: roleBindingListQueryKey,
    queryFn: async () => roleBindingAPI.list(roleBindingListQueryParams.value),
    enabled: computed(() => !!workspacePageState.selectedWorkspace),
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 2,
}, ['DOMAIN']);

const storeState = reactive({
    currentWorkspace: computed(() => workspacePageState.selectedWorkspace),
});
const state = reactive({
    currentWorkspaceId: computed(() => storeState.currentWorkspace?.workspace_id),
    roleBindingMap: computed(() => roleBindingListQueryData?.value?.results?.reduce((map, roleBinding) => {
        map[roleBinding.role_binding_id] = roleBinding;
        return map;
    }, {})),
    refinedUserItems: computed(() => workspaceUserListQueryData.value?.map((user) => ({
        ...user,
        role: referenceMap.role[state.roleBindingMap[user.role_binding_info.role_binding_id]?.role_id],
        last_accessed_at: calculateTime(user?.last_accessed_at, userStore.state.timezone),
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
const pagination = reactive({
    thisPage: 1,
    pageSize: 15,
});
const sort = reactive({
    sortKey: 'name',
    sortDesc: true,
});

const workspaceUserListApiQueryHelper = new ApiQueryHelper();
const queryTagHelper = useQueryTags({ keyItemSets: WORKSPACES_USER_SEARCH_HANDLERS.keyItemSets });
const { queryTags } = queryTagHelper;
const {
    data: workspaceUserListQueryData,
    totalCount: workspaceUserListQueryTotalCount,
    isLoading: isWorkspaceUserListFetching,
    refresh: refreshWorkspaceUserList,
} = useWorkspaceUserListPaginationQuery({
    params: computed(() => {
        workspaceUserListApiQueryHelper.setFilters([
            ...queryTagHelper.filters.value,
        ]);
        return {
            query: {
                ...workspaceUserListApiQueryHelper.data,
                sort: [{ key: sort.sortKey, desc: sort.sortDesc }],
            },
            workspace_id: state.currentWorkspaceId,
        };
    }),
    thisPage: computed(() => pagination.thisPage),
    pageSize: computed(() => pagination.pageSize),
});

const handleChange = async (options: any = {}) => {
    if (options.queryTags !== undefined) {
        queryTagHelper.setQueryTags(options.queryTags);
    }
};
const handleClickButton = () => {
    window.open(router.resolve({
        name: IAM_ROUTE.USER._NAME,
        params: {
            workspaceId: storeState.currentWorkspace?.workspace_id,
        },
    }).href, '_blank');
};

watch(() => workspacePageState.selectedWorkspace, async () => {
    await handleChange();
}, { immediate: true });

</script>

<template>
    <section class="workspace-user-management-tab-contents">
        <p-heading-layout class="pt-8 px-4 pb-4">
            <template #heading>
                <p-heading :title="$t('IAM.WORKSPACES.DETAIL.USERS')"
                           use-total-count
                           heading-type="sub"
                           :total-count="workspaceUserListQueryTotalCount"
                />
            </template>
            <template #extra>
                <p-button style-type="tertiary"
                          :disabled="storeState.currentWorkspace.state === WORKSPACE_STATE.DISABLE || storeState.currentWorkspace.is_dormant"
                          icon-left="ic_settings"
                          @click="handleClickButton"
                >
                    {{ $t('IAM.USER.NOTIFICATION.MANAGE') }}
                </p-button>
            </template>
        </p-heading-layout>
        <p-toolbox-table
            class="workspace-user-management-table"
            search-type="query"
            searchable
            sortable
            :loading="isWorkspaceUserListFetching"
            :items="state.refinedUserItems"
            :fields="tableState.workspaceUserTableFields"
            sort-by="name"
            :sort-desc="true"
            :this-page.sync="pagination.thisPage"
            :page-size.sync="pagination.pageSize"
            :total-count="workspaceUserListQueryTotalCount"
            :key-item-sets="WORKSPACES_USER_SEARCH_HANDLERS.keyItemSets"
            :value-handler-map="tableState.valueHandlerMap"
            :query-tags="queryTags"
            @change="handleChange"
            @refresh="refreshWorkspaceUserList"
        >
            <template #col-state-format="{value}">
                <p-status v-bind="userStateFormatter(value)"
                          class="capitalize"
                />
            </template>
            <template #col-role-format="{value}">
                <div class="role-type-wrapper">
                    <p-tooltip position="bottom"
                               :contents="useRoleFormatter(value.data.role_type).name"
                               class="tooltip"
                    >
                        <img :src="useRoleFormatter(value.data.role_type).image"
                             alt="role-type-icon"
                             class="role-type-icon"
                        >
                    </p-tooltip>
                    <span>{{ value.name }}</span>
                </div>
            </template>
            <template #col-last_accessed_at-format="{ value }">
                <span v-if="value === -1">
                    -
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
    .workspace-user-management-table {
        @apply border-0;
    }
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
