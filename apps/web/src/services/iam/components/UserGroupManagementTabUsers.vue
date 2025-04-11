<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';

import { makeDistinctValueHandler } from '@cloudforet/core-lib/component-util/query-search';
import { getApiQueryWithToolboxOptions } from '@cloudforet/core-lib/component-util/toolbox';
import { QueryHelper } from '@cloudforet/core-lib/query';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PHeadingLayout, PHeading, PButton, PToolboxTable,
} from '@cloudforet/mirinae';
import type { DataTableFieldType } from '@cloudforet/mirinae/types/data-display/tables/data-table/type';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { UserListParameters } from '@/api-clients/identity/user/schema/api-verbs/list';
import type { UserModel } from '@/api-clients/identity/user/schema/model';
import type { WorkspaceUserListParameters } from '@/api-clients/identity/workspace-user/schema/api-verbs/list';
import type { WorkspaceUserModel } from '@/api-clients/identity/workspace-user/schema/model';
import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useQueryTags } from '@/common/composables/query-tags';

import { calculateTime } from '@/services/iam/composables/refined-table-data';
import { makeUserValueHandler } from '@/services/iam/composables/user-data-helper';
import {
    USER_GROUP_MODAL_TYPE,
    USER_GROUP_USERS_SEARCH_HANDLERS,
} from '@/services/iam/constants/user-group-constant';
import { useUserGroupPageStore } from '@/services/iam/store/user-group-page-store';
import type { UserListItemType } from '@/services/iam/types/user-type';

interface Props {
  hasReadWriteAccess: boolean;
}

const props = defineProps<Props>();

const appContextStore = useAppContextStore();
const userGroupPageStore = useUserGroupPageStore();
const userGroupPageState = userGroupPageStore.state;
const userGroupPageGetters = userGroupPageStore.getters;

const userListApiQueryHelper = new ApiQueryHelper()
    .setPageStart(userGroupPageState.users.pageStart)
    .setPageLimit(userGroupPageState.users.pageLimit)
    .setSort('name', true);
let userListApiQuery = userListApiQueryHelper.data;

const queryTagHelper = useQueryTags({ keyItemSets: USER_GROUP_USERS_SEARCH_HANDLERS });
const { queryTags } = queryTagHelper;

const storeState = reactive({
    usersList: computed<UserListItemType[]>(() => userGroupPageState.users.list),
});

const state = reactive({
    loading: false,
    userItems: computed<UserListItemType[]>(() => {
        if (storeState.usersList) {
            return storeState.usersList.map((user) => ({
                user_id: user.user_id,
                name: user.name,
                auth_type: user.auth_type,
                last_accessed_at: user.last_accessed_at,
                timezone: user.timezone,
            }));
        }
        return [];
    }),
    userItemTotalCount: computed<number>(() => userGroupPageState.users.totalCount),
    filteredUserList: [] as UserListItemType[],
    totalCount: 0,
    isAdminMode: computed<boolean>(() => appContextStore.getters.isAdminMode),
});

const tableState = reactive({
    fields: computed<DataTableFieldType[]>(() => [
        { name: 'user_id', label: 'User ID' },
        { name: 'name', label: 'Name' },
        { name: 'auth_type', label: 'Auth Type' },
        { name: 'last_accessed_at', label: 'Last Activity' },
    ]),
    items: [] as { user_id: string; name: string; auth_type: string; last_accessed_at: string;}[],
    valueHandlerMap: computed(() => ({
        user_id: makeUserValueHandler('identity.WorkspaceUser', 'user_id', 'string', userGroupPageGetters.selectedUserGroups[0].users, [], 50),
        name: makeUserValueHandler('identity.WorkspaceUser', 'name', 'string', state.filteredUserList.map((user) => user.name), [{ k: 'name', v: '', o: 'not' }], 50),
        auth_type: makeDistinctValueHandler('identity.WorkspaceUser', 'auth_type'),
        last_accessed_at: makeDistinctValueHandler('identity.WorkspaceUser', 'last_accessed_at', 'datetime'),
    })),
});

const isUserSelected = computed<boolean>(() => userGroupPageState.users.selectedIndices.length > 0);

/* Component */
const handleSelect = async (index) => {
    userGroupPageState.users.selectedIndices = index;
};

const handleAddUser = () => {
    userGroupPageStore.updateModalSettings({
        type: USER_GROUP_MODAL_TYPE.ADD_NEW_USER,
        title: i18n.t('IAM.USER_GROUP.MODAL.ADD_NEW_USER.TITLE'),
        themeColor: 'primary',
    });
};

const handleRemoveUser = () => {
    userGroupPageStore.updateModalSettings({
        type: USER_GROUP_MODAL_TYPE.REMOVE_USER,
        title: i18n.t('IAM.USER_GROUP.MODAL.REMOVE_USER.TITLE'),
        themeColor: 'alert',
    });
};

const handleChange = async (options: any = {}) => {
    userListApiQuery = getApiQueryWithToolboxOptions(userListApiQueryHelper, options) ?? userListApiQuery;

    if (options.pageStart !== undefined) userGroupPageState.users.pageStart = options.pageStart;
    if (options.pageLimit !== undefined) userGroupPageState.users.pageLimit = options.pageLimit;

    try {
        state.loading = true;

        const usersIdList: string[] | undefined = userGroupPageGetters.selectedUserGroups[0].users;

        const searchQueryTagHelper = new QueryHelper().setKeyItemSets(USER_GROUP_USERS_SEARCH_HANDLERS);

        if (options.queryTags) {
            searchQueryTagHelper.setFiltersAsQueryTag(options.queryTags);
        }

        userListApiQueryHelper.setFilters([{ k: 'user_id', v: usersIdList, o: '' }, ...searchQueryTagHelper.filters]);
        await fetchWorkspaceUserList({
            query: userListApiQueryHelper.data,
        });
    } finally {
        state.loading = false;
    }
};

/* API */
const fetchWorkspaceUserList = async (params: WorkspaceUserListParameters) => {
    const fetcher = state.isAdminMode
        ? SpaceConnector.clientV2.identity.user.list<UserListParameters, ListResponse<UserModel>>
        : SpaceConnector.clientV2.identity.workspaceUser.list<WorkspaceUserListParameters, ListResponse<WorkspaceUserModel>>;
    try {
        const { results, total_count } = await fetcher(params);
        state.filteredUserList = results ?? [];
        userGroupPageState.users.list = results;
        state.totalCount = total_count ?? 0;
    } catch (e) {
        ErrorHandler.handleError(e, true);
    }
};

/* Watcher */
watch(() => userGroupPageGetters.selectedUserGroups, async (nv_selectedUserGroups, ov_selectedUserGroups) => {
    if (nv_selectedUserGroups !== ov_selectedUserGroups && nv_selectedUserGroups.length === 1) {
        const usersIdList: string[] | undefined = nv_selectedUserGroups[0].users;

        userListApiQueryHelper.setFilters([
            { k: 'user_id', v: usersIdList, o: '' },
        ]);

        try {
            state.loading = true;
            await fetchWorkspaceUserList({
                query: userListApiQueryHelper.data,
            });
        } finally {
            state.loading = false;
        }
    }
}, { deep: true, immediate: true });

watch(() => state.filteredUserList, (nv_filtered_user_list) => {
    if (nv_filtered_user_list) {
        tableState.items = nv_filtered_user_list.map((user) => ({
            user_id: user.user_id,
            name: user.name,
            auth_type: user.auth_type,
            last_accessed_at: user.last_accessed_at,
        }));
        userGroupPageStore.$patch((_state) => {
            _state.state.users.totalCount = nv_filtered_user_list.length;
        });
    }
}, { deep: true, immediate: true });

watch(() => userGroupPageState.users, (nv_users) => {
    if (nv_users.list && nv_users.list.length) nv_users.totalCount = nv_users.list.length ?? 0;
}, { deep: true, immediate: true });
</script>

<template>
    <div class="user-group-management-users">
        <p-heading-layout class="pt-8 px-4 pb-6">
            <template #heading>
                <p-heading heading-type="sub"
                           use-selected-count
                           use-total-count
                           :total-count="state.userItemTotalCount"
                           :title="`${i18n.t('IAM.USER_GROUP.TAB.USERS.TITLE')}`"
                />
            </template>
            <template v-if="props.hasReadWriteAccess"
                      #extra
            >
                <div class="toolbox-wrapper">
                    <div class="toolbox">
                        <p-button style-type="tertiary"
                                  icon-left="ic_plus"
                                  @click="handleAddUser"
                        >
                            {{ $t('IAM.USER_GROUP.TAB.USERS.ADD_USER') }}
                        </p-button>
                        <p-button style-type="tertiary"
                                  :disabled="!isUserSelected"
                                  @click="handleRemoveUser"
                        >
                            {{ $t('IAM.USER_GROUP.TAB.USERS.REMOVE') }}
                        </p-button>
                    </div>
                </div>
            </template>
        </p-heading-layout>
        <p-toolbox-table search-type="query"
                         searchable
                         selectable
                         multi-select
                         sortable
                         sort-desc
                         :fields="tableState.fields"
                         :items="tableState.items"
                         :select-index="userGroupPageState.users.selectedIndices"
                         :key-item-sets="USER_GROUP_USERS_SEARCH_HANDLERS"
                         :query-tags="queryTags"
                         :value-handler-map="tableState.valueHandlerMap"
                         :total-count="state.totalCount"
                         :loading="state.loading"
                         @select="handleSelect"
                         @change="handleChange"
                         @refresh="handleChange()"
        >
            <template #col-last_accessed_at-format="{value, item}">
                <span v-if="calculateTime(value, item.timezone) === -1">
                    -
                </span>
                <span v-else-if="calculateTime(value, item.timezone) === 0">
                    {{ $t('IAM.USER_GROUP.TAB.USERS.TODAY') }}
                </span>
                <span v-else-if="calculateTime(value, item.timezone) === 1">
                    {{ $t('IAM.USER_GROUP.TAB.USERS.YESTERDAY') }}
                </span>
                <span v-else>
                    {{ calculateTime(value, item.timezone) }} {{ $t('IAM.USER_GROUP.TAB.USERS.DAYS') }}
                </span>
            </template>
        </p-toolbox-table>
    </div>
</template>

<style scoped lang="postcss">
.user-group-management-users {
    .toolbox-wrapper {
        .toolbox {
            @apply flex;
            gap: 8px;
        }
    }
}
:deep(.p-toolbox-table) {
    border-width: 0;
}
</style>
