<script lang="ts" setup>
import { computed, reactive } from 'vue';

import { makeDistinctValueHandler } from '@cloudforet/core-lib/component-util/query-search';
import { PToolboxTable, PSelectDropdown } from '@cloudforet/mirinae';
import type { DataTableFieldType } from '@cloudforet/mirinae/types/data-display/tables/data-table/type';
import type { MenuItem } from '@cloudforet/mirinae/types/inputs/context-menu/type';

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

const queryTagHelper = useQueryTags({ keyItemSets: USER_GROUP_SEARCH_HANDLERS.keyItemSets });
const { queryTags } = queryTagHelper;

const tableState = reactive({
    fields: computed<DataTableFieldType[]>(() => {
        const baseFields = [
            { name: 'user_group_id', label: 'User Group ID' },
            { name: 'description', label: 'Description' },
            { name: 'notification', label: 'Notification' },
            { name: 'users', label: 'Users' },
            { name: 'created', label: 'Created' },
        ];

        return [...baseFields];
    }),
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
const handleChange = () => {
    console.log('TODO: handleChange');
};

/* API */
const handleSelectDropdown = async (inputText: string) => {
    dropdownState.loading = true;

    switch (inputText) {
    case USER_GROUP_MODAL_TYPE.UPDATE:
        console.log('TODO: Open Update User Group Modal');
        dropdownState.loading = false;
        break;
    case USER_GROUP_MODAL_TYPE.REMOVE:
        console.log('TODO: Remove API');
        dropdownState.loading = false;
        break;
    case USER_GROUP_MODAL_TYPE.ADD_NEW_USER:
        console.log('TODO: Open Add Users to Selected User Group Modal');
        dropdownState.loading = false;
        break;
    default:
        dropdownState.loading = false;
        break;
    }
};
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
                         :items="tableState.items"
                         :select-index="userGroupPageState.selectedIndices"
                         :key-item-sets="USER_GROUP_SEARCH_HANDLERS.keyItemSets"
                         :value-handler-map="tableState.valueHandlerMap"
                         :query-tags="queryTags"
                         :style="{height: `${props.tableHeight}px}`}"
                         @select="handleSelect"
                         @change="handleChange"
                         @refresh="handleChange"
        >
            <template v-if="props.hasReadWriteAccess"
                      #toolbox-left
            >
                <p-select-dropdown
                    :menu="dropdownState.menuItems"
                    placeholder="Action"
                    @select="handleSelectDropdown"
                />
            </template>
        </p-toolbox-table>
    </section>
</template>
