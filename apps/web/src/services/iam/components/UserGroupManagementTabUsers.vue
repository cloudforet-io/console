<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';

import { makeDistinctValueHandler } from '@cloudforet/core-lib/component-util/query-search';
import {
    PHeadingLayout, PHeading, PButton, PToolboxTable,
} from '@cloudforet/mirinae';
import type { DataTableFieldType } from '@cloudforet/mirinae/types/data-display/tables/data-table/type';

import { i18n } from '@/translations';

import { calculateTime } from '@/services/iam/composables/refined-table-data';
import { USER_GROUP_MODAL_TYPE, USER_GROUP_USERS_SEARCH_HANDLERS } from '@/services/iam/constants/user-group-constant';
import { useUserGroupPageStore } from '@/services/iam/store/user-group-page-store';
import type { UserListItemType } from '@/services/iam/types/user-type';

const userGroupPageStore = useUserGroupPageStore();
const userGroupPageState = userGroupPageStore.state;
const userGroupPageGetters = userGroupPageStore.getters;

const state = reactive({
    userItems: computed<UserListItemType[]>(() => {
        if (userGroupPageState.users.list) {
            return userGroupPageState.users.list.map((user) => ({
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
});

const tableState = reactive({
    fields: computed<DataTableFieldType[]>(() => [
        { name: 'user_id', label: 'User ID' },
        { name: 'name', label: 'Name' },
        { name: 'auth_type', label: 'Auth Type' },
        { name: 'last_accessed_at', label: 'Last Activity' },
    ]),
    // TODO: Need to modify.
    valueHandlerMap: computed(() => ({
        user_id: makeDistinctValueHandler('identity.UserGroup', 'user_id', 'string'),
        name: makeDistinctValueHandler('identity.UserGroup', 'name', 'string'),
        auth_type: makeDistinctValueHandler('identity.UserGroup', 'auth_type', 'string'),
        last_activity: makeDistinctValueHandler('identity.UserGroup', 'last_accessed_at', 'string'),
        tags: makeDistinctValueHandler('identity.UserGroup', 'tags', 'string'),
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

/* Watcher */
watch(() => userGroupPageGetters.selectedUserGroups, async (nv_selectedUserGroups) => {
    if (nv_selectedUserGroups.length === 1) {
        const usersIdList: string[] | undefined = nv_selectedUserGroups[0].users;
        await userGroupPageStore.listUsers({});

        if (usersIdList && usersIdList.length > 0 && userGroupPageState.users.list && userGroupPageState.users.list.length > 0 && usersIdList && usersIdList.length > 0) {
            userGroupPageState.users.list = userGroupPageState.users.list.filter((user) => {
                if (user.user_id) return usersIdList.includes(user.user_id);
                return false;
            });
        } else {
            userGroupPageState.users.list = [];
            userGroupPageState.users.totalCount = 0;
        }
    }
}, { deep: true, immediate: true });

watch(() => userGroupPageState.users, (nv_users) => {
    if (nv_users.list && nv_users.list.length) nv_users.totalCount = nv_users.list.length;
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
            <template #extra>
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
                         sort-desc
                         :fields="tableState.fields"
                         :items="state.userItems"
                         :select-index="userGroupPageState.users.selectedIndices"
                         :key-item-sets="USER_GROUP_USERS_SEARCH_HANDLERS"
                         :total-count="state.userItemTotalCount"
                         @select="handleSelect"
        >
            <template #col-last_accessed_at-format="{value, item}">
                <span v-if="calculateTime(value, item.timezone) === -1">
                    {{ $t('IAM.USER_GROUP.TAB.USERS.TODAY') }}
                </span>
                <span v-else-if="calculateTime(value, item.timezone) === 0">
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
