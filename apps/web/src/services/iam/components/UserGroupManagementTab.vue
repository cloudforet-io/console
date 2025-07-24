<script lang="ts" setup>

import {
    computed, reactive,
} from 'vue';

import { PTab } from '@cloudforet/mirinae';
import type { TabItem } from '@cloudforet/mirinae/types/navigation/tabs/tab/type';

import { i18n } from '@/translations';

import UserGroupManagementTabNotificationChannel
    from '@/services/iam/components/UserGroupManagementTabNotificationChannel.vue';
import UserGroupManagementTabUsers from '@/services/iam/components/UserGroupManagementTabUsers.vue';
import { USER_GROUP_TABS } from '@/services/iam/constants/user-group-constant';
import { useUserGroupPageStore } from '@/services/iam/store/user-group-page-store';

const userGroupPageStore = useUserGroupPageStore();
const userGroupPageState = userGroupPageStore.state;

interface Props {
  hasReadWriteAccess?: boolean;
}

const props = defineProps<Props>();

const userGroupTabs = reactive({
    activeTab: USER_GROUP_TABS.USERS,
    tabs: computed<TabItem[]>(() => ([
        { label: i18n.t('IAM.USER_GROUP.TAB.USERS.TITLE'), name: USER_GROUP_TABS.USERS },
        { label: i18n.t('IAM.USER_GROUP.TAB.NOTIFICATION_CHANNEL.TITLE'), name: USER_GROUP_TABS.NOTIFICATION_CHANNEL },
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
                <user-group-management-tab-users :has-read-write-access="props.hasReadWriteAccess ?? false" />
            </template>
            <template #notification_channel>
                <user-group-management-tab-notification-channel :has-read-write-access="props.hasReadWriteAccess ?? false" />
            </template>
        </p-tab>
    </section>
</template>
