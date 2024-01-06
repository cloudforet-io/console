<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';

import {
    PEmpty, PStatus, PTab, PDataTable, PBadge,
} from '@spaceone/design-system';
import type { TabItem } from '@spaceone/design-system/types/navigation/tabs/tab/type';

import { i18n } from '@/translations';

import UserManagementTabDetail from '@/services/administration/components/UserManagementTabDetail.vue';
import UserManagementTabProjects from '@/services/administration/components/UserManagementTabProjects.vue';
import UserManagementTabTag from '@/services/administration/components/UserManagementTabTag.vue';
import UserManagementTabWorkspace from '@/services/administration/components/UserManagementTabWorkspace.vue';
import {
    calculateTime,
    useRoleFormatter,
    userStateFormatter,
} from '@/services/administration/composables/refined-table-data';
import { USER_TABS } from '@/services/administration/constants/user-constant';
import { useUserPageStore } from '@/services/administration/store/user-page-store';

const userPageStore = useUserPageStore();
const userPageState = userPageStore.$state;

const state = reactive({
    field: computed(() => ([
        { name: 'user_id', label: 'User ID', sortable: false },
        { name: 'name', label: 'Name', sortable: false },
        { name: 'state', label: 'State', sortable: false },
        { name: 'role_type', label: userPageState.isAdminMode ? 'Admin Role' : 'Workspace Role', sortable: false },
        { name: 'tags', label: 'Tags' },
        { name: 'auth_type', label: 'Auth Type', sortable: false },
        { name: 'last_accessed_at', label: 'Last Activity', sortable: false },
        { name: 'timezone', label: 'Timezone', sortable: false },
    ])),
});
const singleItemTabState = reactive({
    userTabs: computed<TabItem[]>(() => ([
        { label: i18n.t('IAM.USER.MAIN.DETAILS'), name: USER_TABS.DETAIL },
        { label: i18n.t('IAM.USER.MAIN.PROJECTS'), name: USER_TABS.PROJECTS },
        { label: i18n.t('IAM.USER.MAIN.TAG'), name: USER_TABS.TAG },
    ])),
    adminTabs: computed<TabItem[]>(() => ([
        { label: i18n.t('IAM.USER.MAIN.DETAILS'), name: USER_TABS.DETAIL },
        { label: i18n.t('IAM.USER.MAIN.WORKSPACE'), name: USER_TABS.WORKSPACE },
        { label: i18n.t('IAM.USER.MAIN.TAG'), name: USER_TABS.TAG },
    ])),
    activeTab: USER_TABS.DETAIL,
    selectedIndex: computed(() => userPageState.selectedIndices[0]),
    selectedUserId: computed(() => userPageState.users[singleItemTabState.selectedIndex].user_id),
});
const multiItemTabState = reactive({
    tabs: computed<TabItem[]>(() => ([
        { label: i18n.t('IAM.USER.MAIN.TAB_SELECTED_DATA'), name: USER_TABS.DATA },
    ])),
    activeTab: USER_TABS.DATA,
    refinedUserItems: computed(() => userPageStore.selectedUsers.map((user) => ({
        ...user,
        last_accessed_at: calculateTime(user?.last_accessed_at, userPageStore.timezone),
    }))),
});

/* API */
const initUserData = async (user_id?: string) => {
    if (!user_id) return;
    if (userPageState.isAdminMode) {
        await userPageStore.getUser({
            user_id: user_id || '',
        });
    } else {
        await userPageStore.getWorkspaceUser({
            user_id: user_id || '',
        });
    }
};

/* Watcher */
watch(() => userPageState.selectedIndices[0], (index) => {
    const user_id = userPageState.users[index]?.user_id;
    initUserData(user_id);
});
</script>

<template>
    <section>
        <p-tab v-if="userPageState.selectedIndices.length === 1"
               :tabs="userPageState.isAdminMode ? singleItemTabState.adminTabs : singleItemTabState.userTabs"
               :active-tab.sync="singleItemTabState.activeTab"
        >
            <template #detail>
                <user-management-tab-detail @refresh="initUserData" />
            </template>
            <template #workspace>
                <user-management-tab-workspace :active-tab="singleItemTabState.activeTab" />
            </template>
            <template #projects>
                <user-management-tab-projects :active-tab="singleItemTabState.activeTab" />
            </template>
            <template #tag>
                <user-management-tab-tag :active-tab="singleItemTabState.activeTab" />
            </template>
        </p-tab>
        <p-tab v-else-if="userPageState.selectedIndices.length > 1"
               :tabs="multiItemTabState.tabs"
               :active-tab.sync="multiItemTabState.activeTab"
        >
            <template #data>
                <p-data-table :fields="state.field"
                              :sortable="false"
                              :selectable="false"
                              :items="multiItemTabState.refinedUserItems"
                              :col-copy="true"
                              class="selected-data-tab"
                >
                    <template #col-state-format="{value}">
                        <p-status v-bind="userStateFormatter(value)"
                                  class="capitalize"
                        />
                    </template>
                    <template #col-last_accessed_at-format="{ value }">
                        <span v-if="value === -1">
                            No Activity
                        </span>
                        <span v-else-if="value === 0">
                            {{ $t('IAM.USER.MAIN.TODAY') }}
                        </span>
                        <span v-else-if="value === 1">
                            {{ $t('IAM.USER.MAIN.YESTERDAY') }}
                        </span>
                        <span v-else>
                            {{ value }} {{ $t('IAM.USER.MAIN.DAYS') }}
                        </span>
                    </template>
                    <template #col-role_type-format="{value}">
                        <div class="role-type-wrapper">
                            <img :src="useRoleFormatter(value).image"
                                 alt="role-type-icon"
                                 class="role-type-icon"
                            >
                            <span>{{ useRoleFormatter(value).name }}</span>
                        </div>
                    </template>
                    <template #col-tags-format="{value}">
                        <template v-if="!!Object.keys(value).length">
                            <p-badge v-for="([key, val], idx) in Object.entries(value)"
                                     :key="`${key}-${val}-${idx}`"
                                     badge-type="subtle"
                                     shape="square"
                                     style-type="gray200"
                                     class="mr-2"
                            >
                                {{ key }}: {{ val }}
                            </p-badge>
                        </template>
                        <template v-else>
                            <span />
                        </template>
                    </template>
                </p-data-table>
            </template>
        </p-tab>
        <div v-else
             id="empty-space"
        >
            <p-empty>{{ $t('IAM.USER.MAIN.NO_SELECTED') }}</p-empty>
        </div>
    </section>
</template>

<style lang="postcss" scoped>
#empty-space {
    @apply text-primary2 mt-6;
    text-align: center;
    margin-bottom: 0.5rem;
    font-size: 1.5rem;
}
.selected-data-tab {
    @apply mt-8;
    .role-type-wrapper {
        @apply flex items-center;
        gap: 0.25rem;
        .role-type-icon {
            @apply rounded-full;
            width: 1.5rem;
            height: 1.5rem;
        }
    }
}
</style>
