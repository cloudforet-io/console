<script lang="ts" setup>
import {
    computed, reactive,
    watch,
} from 'vue';

import { makeDistinctValueHandler } from '@cloudforet/core-lib/component-util/query-search';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PHeadingLayout, PHeading, PButton, PToolboxTable,
} from '@cloudforet/mirinae';
import type { DataTableFieldType } from '@cloudforet/mirinae/types/data-display/tables/data-table/type';

import type { UserGroupModel } from '@/api-clients/identity/user-group/schema/model';
import type { AuthType } from '@/api-clients/identity/user/schema/type';
import { i18n } from '@/translations';

import { useQueryTags } from '@/common/composables/query-tags';

import { calculateTime } from '@/services/iam/composables/refined-table-data';
import { useWorkspaceUserListPaginationQuery } from '@/services/iam/composables/use-workspace-user-list-pagination-query';
import { makeUserValueHandler } from '@/services/iam/composables/user-data-helper';
import {
    USER_GROUP_MODAL_TYPE,
    USER_GROUP_USERS_SEARCH_HANDLERS,
} from '@/services/iam/constants/user-group-constant';
import { useUserGroupPageStore } from '@/services/iam/store/user-group-page-store';



interface Props {
  hasReadWriteAccess: boolean;
}

interface TableItemType {
    user_id: string;
    name: string | undefined;
    auth_type: AuthType | undefined;
    last_accessed_at: string | undefined;
}

const props = defineProps<Props>();

const userGroupPageStore = useUserGroupPageStore();
const userGroupPageState = userGroupPageStore.state;
const userGroupPageGetters = userGroupPageStore.getters;

const userListApiQueryHelper = new ApiQueryHelper().setSort('name', true);
const queryTagHelper = useQueryTags({ keyItemSets: USER_GROUP_USERS_SEARCH_HANDLERS });
const { queryTags } = queryTagHelper;

const tableState = reactive({
    fields: computed<DataTableFieldType[]>(() => [
        { name: 'user_id', label: 'User ID' },
        { name: 'name', label: 'Name' },
        { name: 'auth_type', label: 'Auth Type' },
        { name: 'last_accessed_at', label: 'Last Activity' },
    ]),
    items: computed<TableItemType[]>(() => userList.value?.map((user) => ({
        user_id: user.user_id ?? '',
        name: user.name,
        auth_type: user.auth_type,
        last_accessed_at: user.last_accessed_at,
    }))),
    valueHandlerMap: computed(() => ({
        user_id: makeUserValueHandler('identity.WorkspaceUser', 'user_id', 'string', userGroupPageGetters.selectedUserGroups[0].users ?? [], [], 50),
        name: makeUserValueHandler('identity.WorkspaceUser', 'name', 'string', userList.value?.map((user) => user.name ?? ''), [{ k: 'name', v: '', o: 'not' }], 50),
        auth_type: makeDistinctValueHandler('identity.WorkspaceUser', 'auth_type'),
        last_accessed_at: makeDistinctValueHandler('identity.WorkspaceUser', 'last_accessed_at', 'datetime'),
    })),
    thisPage: 1,
    pageSize: 15,
});

const filterState = reactive({
    sortKey: 'name',
    sortDesc: true,
});

const isUserSelected = computed<boolean>(() => userGroupPageState.users.selectedIndices.length > 0);

const usersIdList = computed<string[]>(() => userGroupPageGetters.selectedUserGroups[0].users ?? []);
const {
    data: userList, totalCount: userTotalCount, isLoading: userIsLoading, refresh: userRefresh,
} = useWorkspaceUserListPaginationQuery({
    params: computed(() => {
        userListApiQueryHelper.setSort(filterState.sortKey, filterState.sortDesc);
        userListApiQueryHelper.setFilters([{ k: 'user_id', v: usersIdList.value, o: '' }, ...queryTagHelper.filters.value]);

        return {
            query: userListApiQueryHelper.data,
        };
    }),
    thisPage: computed(() => tableState.thisPage),
    pageSize: computed(() => tableState.pageSize),
    selectedUserGroup: computed(() => userGroupPageGetters.selectedUserGroups[0] as UserGroupModel),
});

/* Component */
const handleSelect = async (index) => {
    userGroupPageStore.setSelectedUserIdx(index);
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
    if (options.sortBy !== undefined) filterState.sortKey = options.sortBy;
    if (options.sortDesc !== undefined) filterState.sortDesc = options.sortDesc;
    if (options.queryTags !== undefined) queryTagHelper.setQueryTags(options.queryTags);
};

const handleRefresh = async () => {
    await userRefresh();
};

watch(() => userGroupPageGetters.selectedUserGroups[0].user_group_id, () => {
    userRefresh();
}, { immediate: true });

watch(userList, (nv_user_list) => {
    if (nv_user_list) {
        userGroupPageStore.setSelectedUserGroupUsers(nv_user_list);
    }
}, { immediate: true });
</script>

<template>
    <div class="user-group-management-users">
        <p-heading-layout class="pt-8 px-4 pb-6">
            <template #heading>
                <p-heading heading-type="sub"
                           use-selected-count
                           use-total-count
                           :total-count="userTotalCount"
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
                         :total-count="userTotalCount"
                         :loading="userIsLoading"
                         :this-page.sync="tableState.thisPage"
                         :page-size.sync="tableState.pageSize"
                         @select="handleSelect"
                         @change="handleChange"
                         @refresh="handleRefresh"
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
