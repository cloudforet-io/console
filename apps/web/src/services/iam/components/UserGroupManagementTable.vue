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

import { useUserGroupChannelApi } from '@/api-clients/alert-manager/user-group-channel/composables/use-user-group-channel-api';
import type { UserGroupChannelModel } from '@/api-clients/alert-manager/user-group-channel/schema/model';
import { useScopedQuery } from '@/query/composables/use-scoped-query';
import { useServiceQueryKey } from '@/query/query-key/use-service-query-key';
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

const { userGroupChannelAPI } = useUserGroupChannelApi();
const { key: userGroupChannelListQueryKey, params: userGroupChannelListQueryParams } = useServiceQueryKey('alert-manager', 'user-group-channel', 'list');
const { data: userGroupChannelListData } = useScopedQuery({
    queryKey: userGroupChannelListQueryKey,
    queryFn: async () => userGroupChannelAPI.list(userGroupChannelListQueryParams.value),
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 2,
}, ['DOMAIN', 'WORKSPACE']);


const storeState = reactive({
    loading: computed<boolean>(() => userGroupPageState.loading),
});

const state = reactive({
    userGroupItems: computed(() => userGroupPageState.userGroups.map((userGroup) => ({
        ...userGroup,
        notification_channel: countChannelsByUserGroupId(userGroupChannelListData.value?.results || [], userGroup.user_group_id || ''),
    }))),
});

const tableState = reactive({
    fields: computed<DataTableFieldType[]>(() => [
        { name: 'name', label: 'User Group Name' },
        { name: 'description', label: 'Description', width: '480px' },
        { name: 'notification_channel', label: 'Notification Channel', sortable: false },
        { name: 'users', label: 'Users', sortable: false },
        { name: 'created_at', label: 'Created' },
    ]),
    valueHandlerMap: computed(() => ({
        name: makeDistinctValueHandler('identity.UserGroup', 'name', 'string'),
        users: makeDistinctValueHandler('identity.UserGroup', 'users', 'string'),
        description: makeDistinctValueHandler('identity.UserGroup', 'description', 'string'),
        created: makeDistinctValueHandler('identity.UserGroup', 'created_at', 'datetime'),
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
});

/* Component */
const countChannelsByUserGroupId = (channels: UserGroupChannelModel[], targetId: string): number => {
    const grouped = channels.reduce<Record<string, UserGroupChannelModel[]>>((acc, item) => {
        const groupId = item.user_group_id;
        if (!acc[groupId]) acc[groupId] = [];
        acc[groupId].push(item);
        return acc;
    }, {});

    return grouped[targetId]?.length ?? 0;
};
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
            <template #col-notification_channel-format="{value}">
                {{ value }}
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
