<script lang="ts" setup>
import {
    computed, reactive,
} from 'vue';

import { makeDistinctValueHandler } from '@cloudforet/core-lib/component-util/query-search';
import {
    PHeadingLayout, PHeading, PButton, PToolboxTable,
} from '@cloudforet/mirinae';
import type { DataTableFieldType } from '@cloudforet/mirinae/types/data-display/tables/data-table/type';

import { i18n } from '@/translations';

import { USER_GROUP_USERS_SEARCH_HANDLERS } from '@/services/iam/constants/user-group-constant';
import { useUserGroupUsersPageStore } from '@/services/iam/store/user-group-users-page-store';

const userGroupUsersPageStore = useUserGroupUsersPageStore();
const userGroupUsersPageState = userGroupUsersPageStore.state;

const tableState = reactive({
    fields: computed<DataTableFieldType[]>(() => [
        { name: 'user_id', label: 'User ID' },
        { name: 'name', label: 'Name' },
        { name: 'auth_type', label: 'Auth Type' },
        { name: 'last_activity', label: 'Last Activity' },
    ]),
    valueHandlerMap: computed(() => ({
        user_id: makeDistinctValueHandler('identity.UserGroup', 'user_id', 'string'),
        name: makeDistinctValueHandler('identity.UserGroup', 'name', 'string'),
        auth_type: makeDistinctValueHandler('identity.UserGroup', 'auth_type', 'string'),
        last_activity: makeDistinctValueHandler('identity.UserGroup', 'last_activity', 'string'),
        tags: makeDistinctValueHandler('identity.UserGroup', 'tags', 'string'),
    })),
    items: computed(() => ([
        {
            user_id: 'userid@mz.co.kr', name: 'username', auth_type: 'LOCAL', last_activity: 'No Activity',
        },
        { user_id: 'userid2@mz.co.kr', name: 'username2', last_activity: '2 days' },
    ])),
});

const isUserSelected = computed<boolean>(() => userGroupUsersPageState.selectedIndices.length === 1);

/* Component */
const handleSelect = async (index) => {
    userGroupUsersPageState.selectedIndices = index;
};
</script>

<template>
    <div class="user-group-management-users">
        <p-heading-layout class="pt-8 px-4 pb-6">
            <template #heading>
                <p-heading heading-type="sub"
                           use-selected-count
                           use-total-count
                           :total-count="userGroupUsersPageState.totalCount"
                           :title="`${i18n.t('IAM.USER_GROUP.TAB.USERS.TITLE')}`"
                />
            </template>
            <template #extra>
                <div class="toolbox-wrapper">
                    <div class="toolbox">
                        <p-button style-type="tertiary"
                                  icon-left="ic_plus"
                                  :disabled="!isUserSelected"
                        >
                            {{ $t('IAM.USER_GROUP.TAB.USERS.ADD_USER') }}
                        </p-button>
                        <p-button style-type="tertiary"
                                  :disabled="!isUserSelected"
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
                         sort-desc
                         :fields="tableState.fields"
                         :items="tableState.items"
                         :select-index="userGroupUsersPageState.selectedIndices"
                         :key-item-sets="USER_GROUP_USERS_SEARCH_HANDLERS.keyItemSets"
                         @select="handleSelect"
        />
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
