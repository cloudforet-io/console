<script lang="ts" setup>

import { computed, reactive } from 'vue';

import { PTab } from '@cloudforet/mirinae';
import type { TabItem } from '@cloudforet/mirinae/types/navigation/tabs/tab/type';

import UserGroupManagementTabNotificationChannel
    from '@/services/iam/components/UserGroupManagementTabNotificationChannel.vue';
import UserGroupManagementTabUsers from '@/services/iam/components/UserGroupManagementTabUsers.vue';
import { USER_GROUP_TABS } from '@/services/iam/constants/user-group-constant';
import { useUserGroupPageStore } from '@/services/iam/store/user-group-page-store';

const userGroupPageStore = useUserGroupPageStore();
const userGroupPageState = userGroupPageStore.state;

const userGroupTabs = reactive({
    activeTab: USER_GROUP_TABS.USERS,
    tabs: computed<TabItem[]>(() => ([
        { label: 'Users', name: USER_GROUP_TABS.USERS },
        { label: 'Notification Channel', name: USER_GROUP_TABS.NOTIFICATION_CHANNEL },
    ])),
});
</script>

<template>
    <section>
        <p-tab v-if="userGroupPageState.selectedIndices.length === 1"
               :tabs="userGroupTabs.tabs"
               :active-tab.sync="userGroupTabs.activeTab"
        >
            <template #users>
                <user-group-management-tab-users />
            </template>
            <template #notification_channel>
                <user-group-management-tab-notification-channel />
            </template>
        </p-tab>
    </section>
</template>
