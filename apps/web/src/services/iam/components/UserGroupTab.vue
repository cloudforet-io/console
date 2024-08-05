<script setup lang="ts">
import { PEmpty, PTab } from '@cloudforet/mirinae';
import { i18n } from '@/translations';
import type { TabItem } from '@cloudforet/mirinae/types/navigation/tabs/tab/type';
import { USER_GROUP_TABS } from '@/services/iam/constants/user-group-constant';
import { reactive, computed } from 'vue';
import { useUserGroupPageStore } from '@/services/iam/store/user-group-page-store';

import UserGroupTabDetail from '@/services/iam/components/UserGroupTabDetail.vue';
import UserGroupTabUsers from '@/services/iam/components/UserGroupTabUsers.vue';
import UserGroupTabWorkspaces from '@/services/iam/components/UserGroupTabWorkspaces.vue';

const userGroupPageStore = useUserGroupPageStore();

const singleItemTabState = reactive({
    tabs: computed<TabItem[]>(() => ([
        { label: i18n.t('IAM.USERGROUP.MAIN.DETAIL'), name: USER_GROUP_TABS.DETAIL },
        { label: i18n.t('IAM.USERGROUP.MAIN.USER'), name: USER_GROUP_TABS.USER },
        { label: i18n.t('IAM.USERGROUP.MAIN.WORKSPACE'), name: USER_GROUP_TABS.WORKSPACE },
    ])),
    activeTab: USER_GROUP_TABS.DETAIL,
    // selectedIndex: computed(() => userPageState.selectedIndices[0]),
    // selectedUserId: computed(() => userPageState.users[singleItemTabState.selectedIndex].user_id),
});

const multiItemTabState = reactive({
    tabs: computed<TabItem[]>(() => ([
        { label: i18n.t('IAM.USERGROUP.MAIN.DETAIL'), name: USER_GROUP_TABS.DETAIL },    ])),
    activeTab: USER_GROUP_TABS.DETAIL,
});
</script>

<template>
    <section class="user-group-tab">
        <p-tab v-if="userGroupPageStore.selectedUsers.length === 1"
               :tabs="singleItemTabState.tabs"
               :active-tab.sync="singleItemTabState.activeTab"
        >
            <template #detail>
                <user-group-tab-detail />
            </template>
            <template #user>
                <user-group-tab-users />
            </template>
            <template #workspace>
                <user-group-tab-workspaces />
            </template>
        </p-tab>
        <p-tab v-else-if="userGroupPageStore.selectedUsers.length > 1"
               :tabs="multiItemTabState.tabs"
               :active-tab.sync="multiItemTabState.activeTab"
        >
            <template #detail>
                유저 그룹들
            </template>
        </p-tab>
        <div v-else
             id="empty-space"
        >
            <p-empty>{{ i18n.t('IAM.USERGROUP.MAIN.NO_SELECTED') }}</p-empty>
        </div>
    </section>
</template>

<style lang="postcss" scoped>
.user-group-tab {
    #empty-space {
        @apply text-primary2 mt-6;
        text-align: center;
        margin-bottom: 0.5rem;
        font-size: 1.5rem;
    }
    .selected-data-tab {
        @apply mt-8;
    }
    .role-type {
        @apply flex items-center;
        gap: 0.5rem;
        .role-type-icon {
            @apply rounded-full;
            width: 1rem;
            height: 1rem;
        }
    }
}

</style>
