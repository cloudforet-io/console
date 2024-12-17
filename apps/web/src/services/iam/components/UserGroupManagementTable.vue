<script lang="ts" setup>
import {
    computed, onMounted, reactive,
} from 'vue';

import dayjs from 'dayjs';

import { makeDistinctValueHandler } from '@cloudforet/core-lib/component-util/query-search';
import { getApiQueryWithToolboxOptions } from '@cloudforet/core-lib/component-util/toolbox';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import { PToolboxTable, PSelectDropdown } from '@cloudforet/mirinae';
import type { DataTableFieldType } from '@cloudforet/mirinae/types/data-display/tables/data-table/type';
import type { MenuItem } from '@cloudforet/mirinae/types/inputs/context-menu/type';

import type { UserGroupListItemType } from '@/schema/identity/user-group/type';
import { i18n } from '@/translations';

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
    userGroupItems: computed<UserGroupListItemType[]>(() => userGroupPageState.userGroups.map((userGroup) => ({
        ...userGroup,
        notification_channel: userGroup.notification_channel?.length ?? 0,
    }))),
});

const tableState = reactive({
    fields: computed<DataTableFieldType[]>(() => [
        { name: 'user_group_id', label: 'User Group ID' },
        { name: 'name', label: 'User Group Name' },
        { name: 'description', label: 'Description' },
        { name: 'notification_channel', label: 'Notification Channel' }, // TODO: get from other api
        { name: 'users', label: 'Users' },
        { name: 'created_at', label: 'Created' },
    ]),
    valueHandlerMap: computed(() => ({
        user_group_id: makeDistinctValueHandler('identity.UserGroup', 'user_group_id', 'string'),
        description: makeDistinctValueHandler('identity.UserGroup', 'description', 'string'),
        notification: makeDistinctValueHandler('identity.UserGroup', 'notification', 'integer'),
        users: makeDistinctValueHandler('identity.UserGroup', 'users', 'integer'),
        created: makeDistinctValueHandler('identity.UserGroup', 'created', 'datetime'),
        tags: makeDistinctValueHandler('identity.UserGroup', 'tags', 'object'),
    })),
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
            name: USER_GROUP_MODAL_TYPE.DELETE, label: i18n.t('IAM.USER_GROUP.ACTION.DELETE'), type: 'item', disabled: !editState.isRemoveAble,
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

const handleChange = async (options: any = {}) => {
    userGroupListApiQuery = getApiQueryWithToolboxOptions(userGroupListApiQueryHelper, options) ?? userGroupListApiQuery;
    if (options.queryTags !== undefined) {
        userGroupPageStore.$patch((_state) => {
            _state.state.searchFilters = userGroupListApiQueryHelper.filters;
        });
    }
    if (options.pageStart !== undefined) userGroupPageState.pageStart = options.pageStart;
    if (options.pageLimit !== undefined) userGroupPageState.pageLimit = options.pageLimit;
    await fetchUserGroupList();
};

const handleSelectDropdown = async (inputText: string) => {
    switch (inputText) {
    case USER_GROUP_MODAL_TYPE.UPDATE:
        userGroupPageStore.updateModalSettings({
            type: USER_GROUP_MODAL_TYPE.UPDATE,
            title: i18n.t('IAM.USER_GROUP.MODAL.CREATE_USER_GROUP.UPDATE_TITLE'),
            themeColor: 'primary',
        });
        break;
    case USER_GROUP_MODAL_TYPE.DELETE:
        userGroupPageStore.updateModalSettings({
            type: USER_GROUP_MODAL_TYPE.DELETE,
            title: i18n.t('IAM.USER_GROUP.MODAL.DELETE.TITLE'),
            themeColor: 'alert',
        });
        break;
    case USER_GROUP_MODAL_TYPE.ADD_NEW_USER:
        userGroupPageStore.updateModalSettings({
            type: USER_GROUP_MODAL_TYPE.ADD_NEW_USER,
            title: i18n.t('IAM.USER_GROUP.MODAL.ADD_NEW_USER.TITLE'),
            themeColor: 'primary',
        });
        break;
    default:
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
                         sort-by="name"
                         :total-count="userGroupPageState.totalCount"
                         :fields="tableState.fields"
                         :items="state.userGroupItems"
                         :select-index="userGroupPageState.selectedIndices"
                         :key-item-sets="USER_GROUP_SEARCH_HANDLERS"
                         :value-handler-map="tableState.valueHandlerMap"
                         :query-tags="queryTags"
                         :loading="storeState.loading"
                         :style="{height: `${props.tableHeight}px`}"
                         @select="handleSelect"
                         @change="handleChange"
                         @refresh="handleChange()"
        >
            <template v-if="props.hasReadWriteAccess"
                      #toolbox-left
            >
                <p-select-dropdown
                    :menu="dropdownState.menuItems"
                    placeholder="Action"
                    reset-selection-on-menu-close
                    @select="handleSelectDropdown"
                />
            </template>
            <template #col-users-format="{value}">
                {{ Array.isArray(value) && value.length > 0 ? value.length : 0 }}
            </template>
            <template #col-created_at-format="{value}">
                {{ dayjs(value).format('YYYY-MM-DD HH:mm:ss') }}
            </template>
        </p-toolbox-table>
    </section>
</template>
