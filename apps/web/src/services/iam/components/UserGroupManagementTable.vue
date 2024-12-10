<script lang="ts" setup>
import {
    computed, onMounted, reactive,
} from 'vue';

import { makeDistinctValueHandler } from '@cloudforet/core-lib/component-util/query-search';
import { getApiQueryWithToolboxOptions } from '@cloudforet/core-lib/component-util/toolbox';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import { PToolboxTable, PSelectDropdown } from '@cloudforet/mirinae';
import type { DataTableFieldType } from '@cloudforet/mirinae/types/data-display/tables/data-table/type';
import type { MenuItem } from '@cloudforet/mirinae/types/inputs/context-menu/type';

import type { UserGroupDeleteUserGroupParameters } from '@/schema/identity/user-group/api-verbs/delete';
import type { UserGroupModel } from '@/schema/identity/user-group/model';
import type { UserGroupListItemType } from '@/schema/identity/user-group/type';
import { i18n } from '@/translations';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useQueryTags } from '@/common/composables/query-tags';

import { USER_GROUP_MODAL_TYPE, USER_GROUP_SEARCH_HANDLERS } from '@/services/iam/constants/user-group-constant';
import { useUserGroupPageStore } from '@/services/iam/store/user-group-page-store';

interface Props {
  tableHeight: number;
  hasReadWriteAccess?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    tableHeight: 400,
    hasReadWriteAccess: true,
});

const userGroupPageStore = useUserGroupPageStore();
const userGroupPageState = userGroupPageStore.state;
const userGroupPageGetters = userGroupPageStore.getters;

const userGroupListApiQueryHelper = new ApiQueryHelper()
    .setPageStart(userGroupPageState.pageStart)
    .setPageLimit(userGroupPageState.pageLimit)
    .setSort('name', true);
let userGroupListApiQuery = userGroupListApiQueryHelper.data;
const queryTagHelper = useQueryTags({ keyItemSets: USER_GROUP_SEARCH_HANDLERS });
const { queryTags } = queryTagHelper;

const storeState = reactive({
    loading: computed<boolean>(() => userGroupPageState.loading),
});

const state = reactive({
    userGroupItems: computed<UserGroupListItemType[]>(() => userGroupPageState.userGroups),
});

const tableState = reactive({
    fields: computed<DataTableFieldType[]>(() => [
        { name: 'user_group_id', label: 'User Group ID' },
        { name: 'description', label: 'Description' },
        { name: 'notification', label: 'Notification' },
        { name: 'users', label: 'Users' },
        { name: 'created', label: 'Created' },
    ]),
    valueHandlerMap: computed(() => ({
        user_group_id: makeDistinctValueHandler('identity.UserGroup', 'user_group_id', 'string'),
        description: makeDistinctValueHandler('identity.UserGroup', 'description', 'string'),
        notification: makeDistinctValueHandler('identity.UserGroup', 'notification', 'integer'),
        users: makeDistinctValueHandler('identity.UserGroup', 'users', 'integer'),
        created: makeDistinctValueHandler('identity.UserGroup', 'created', 'datetime'),
        tags: makeDistinctValueHandler('identity.UserGroup', 'tags', 'object'),
    })),
    items: computed(() => [
        {
            user_group_id: 'Group01', description: 'description', notification: 2, users: 100, created: '2024-01-01 11:22:30',
        },
        {
            user_group_id: 'Group02', description: 'description', notification: 22, users: 30, created: '2024-11-21 02:22:30',
        },
    ]),
});

const editState = reactive({
    isRemoveAble: computed<boolean>(() => userGroupPageState.selectedIndices.length > 0),
    isEditable: computed<boolean>(() => userGroupPageState.selectedIndices.length === 1),
});

const dropdownState = reactive({
    visible: false,
    loading: false,
    selectedAction: '',
    menuItems: computed<MenuItem[]>(() => [
        {
            name: USER_GROUP_MODAL_TYPE.UPDATE, label: i18n.t('IAM.USER_GROUP.ACTION.UPDATE'), type: 'item', disabled: !editState.isEditable,
        },
        {
            name: USER_GROUP_MODAL_TYPE.REMOVE, label: i18n.t('IAM.USER_GROUP.ACTION.REMOVE'), type: 'item', disabled: !editState.isRemoveAble,
        },
        {
            type: 'divider',
        },
        {
            name: USER_GROUP_MODAL_TYPE.ADD_NEW_USER, label: i18n.t('IAM.USER_GROUP.ACTION.ADD_NEW_USER'), type: 'item', disabled: !editState.isEditable,
        },
    ]),
    // selectedMenuItems: [] as SelectDropdownMenuItem[],
});

/* Component */
const handleSelect = async (index) => {
    userGroupPageState.selectedIndices = index;
};

// watch(() => userGroupPageGetters.selectedUserGroups, async (nv) => {
//     if (nv.length === 1) {
//         const usersIdList: string[] | undefined = nv[0].users;
//         await userGroupPageStore.listUsersPerGroup({});
//
//         if (userGroupPageState.users.list.length > 0 && usersIdList && usersIdList.length > 0) {
//             userGroupPageState.users.list = userGroupPageState.users.list.filter((user) => usersIdList.includes(user.user_id));
//         }
//     }
// }, { deep: true, immediate: true });

const handleChange = (options: any = {}) => {
    userGroupListApiQuery = getApiQueryWithToolboxOptions(userGroupListApiQueryHelper, options) ?? userGroupListApiQuery;
    if (options.queryTags !== undefined) {
        userGroupPageState.searchFilters = userGroupListApiQueryHelper.filters;
    }
    if (options.pageStart !== undefined) userGroupPageState.pageStart = options.pageStart;
    if (options.pageLimit !== undefined) userGroupPageState.pageLimit = options.pageLimit;
    fetchUserGroupList();
};

const handleSelectDropdown = async (inputText: string) => {
    dropdownState.loading = true;

    const selectedUserGroupIds = userGroupPageGetters.selectedUserGroups.map((userGroup) => userGroup.user_group_id);

    switch (inputText) {
    case USER_GROUP_MODAL_TYPE.UPDATE:
        userGroupPageStore.updateModalSettings({
            type: USER_GROUP_MODAL_TYPE.UPDATE,
            title: i18n.t('IAM.USER_GROUP.MODAL.CREATE_USER_GROUP.UPDATE_TITLE'),
            themeColor: 'primary',
        });
        dropdownState.loading = false;
        break;
    case USER_GROUP_MODAL_TYPE.REMOVE:
        selectedUserGroupIds.forEach(async (userGroupId) => {
            await fetchDeleteUserGroup({
                user_group_id: userGroupId,
            });
        });
        dropdownState.loading = false;
        break;
    case USER_GROUP_MODAL_TYPE.ADD_NEW_USER:
        userGroupPageStore.updateModalSettings({
            type: USER_GROUP_MODAL_TYPE.ADD_NEW_USER,
            title: i18n.t('IAM.USER_GROUP.MODAL.ADD_NEW_USER.TITLE'),
            themeColor: 'primary',
        });
        dropdownState.loading = false;
        break;
    default:
        dropdownState.loading = false;
        break;
    }
};

/* API */
const fetchUserGroupList = async () => {
    userGroupPageState.loading = true;
    try {
        await userGroupPageStore.listUserGroups({ query: userGroupListApiQuery });
    } finally {
        userGroupPageState.loading = false;
    }
};

const fetchDeleteUserGroup = async (params: UserGroupDeleteUserGroupParameters) => {
    try {
        await SpaceConnector.clientV2.identity.userGroup.delete<UserGroupDeleteUserGroupParameters, UserGroupModel>(params);
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};

/* Mounted */
onMounted(async () => {
    await fetchUserGroupList();
});
</script>

<template>
    <section class="user-group-management-table">
        <p-toolbox-table search-type="query"
                         searchable
                         selectable
                         sortable
                         multi-select
                         sort-desc
                         :fields="tableState.fields"
                         :items="state.userGroupItems"
                         :select-index="userGroupPageState.selectedIndices"
                         :key-item-sets="USER_GROUP_SEARCH_HANDLERS"
                         :value-handler-map="tableState.valueHandlerMap"
                         :query-tags="queryTags"
                         :loading="storeState.loading"
                         :style="{height: `${props.tableHeight}px}`}"
                         @select="handleSelect"
                         @change="handleChange"
                         @refresh="handleChange()"
        >
            <template v-if="props.hasReadWriteAccess"
                      #toolbox-left
            >
                <p-select-dropdown
                    :menu="dropdownState.menuItems"
                    :loading="dropdownState.loading"
                    placeholder="Action"
                    @select="handleSelectDropdown"
                />
            </template>
            <template #col-users-format="{value}">
                {{ Array.isArray(value) && value.length > 0 ? value.length : 0 }}
            </template>
        </p-toolbox-table>
    </section>
</template>
