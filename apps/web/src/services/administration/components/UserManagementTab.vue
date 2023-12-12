<script lang="ts" setup>
import {
    computed, reactive,
} from 'vue';

import {
    PEmpty, PStatus, PTab, PDataTable,
} from '@spaceone/design-system';
import type { TabItem } from '@spaceone/design-system/types/navigation/tabs/tab/type';

import { i18n } from '@/translations';

import { useManagePermissionState } from '@/common/composables/page-manage-permission';
import PTagsPanel from '@/common/modules/tags/tags-panel/TagsPanel.vue';

import UserManagementTabAssignedRole from '@/services/administration/components/UserManagementTabAssignedRole.vue';
import UserManagementTabDetail from '@/services/administration/components/UserManagementTabDetail.vue';
import { userStateFormatter } from '@/services/administration/composables/refined-user-data';
import { userTabTableFields } from '@/services/administration/constants/user-tab-constant';
import { useUserPageStore } from '@/services/administration/store/user-page-store';

const userPageStore = useUserPageStore();
const userPageState = userPageStore.$state;

const state = reactive({
    hasManagePermission: useManagePermissionState(),
});
const singleItemTabState = reactive({
    tabs: computed<TabItem[]>(() => ([
        { label: i18n.t('IDENTITY.USER.MAIN.DETAILS'), name: 'detail', keepAlive: true },
        { label: i18n.t('IDENTITY.USER.MAIN.PROJECTS'), name: 'projects', keepAlive: true },
        { label: i18n.t('IDENTITY.USER.MAIN.TAG'), name: 'tag', keepAlive: true },
    ])),
    activeTab: 'detail',
});
const multiItemTabState = reactive({
    tabs: computed<TabItem[]>(() => ([
        { name: 'data', label: i18n.t('IDENTITY.USER.MAIN.TAB_SELECTED_DATA'), keepAlive: true },
    ])),
    activeTab: 'data',
});
</script>

<template>
    <section>
        <p-tab v-if="userPageState.selectedIndices.length === 1"
               :tabs="singleItemTabState.tabs"
               :active-tab.sync="singleItemTabState.activeTab"
        >
            <template #detail>
                <user-management-tab-detail ref="userDetail" />
            </template>
            <template #project>
                <user-management-tab-assigned-role
                    :user-id="userPageStore.selectedUsers[0].user_id"
                />
            </template>
            <template #tag>
                <p-tags-panel :resource-id="userPageStore.selectedUsers[0].user_id"
                              resource-type="identity.User"
                              resource-key="user_id"
                              :disabled="state.manageDisabled"
                />
            </template>
        </p-tab>
        <p-tab v-else-if="userPageState.selectedIndices.length > 1"
               :tabs="multiItemTabState.tabs"
               :active-tab.sync="multiItemTabState.activeTab"
        >
            <template #data>
                <p-data-table :fields="userTabTableFields"
                              :sortable="false"
                              :selectable="false"
                              :items="userPageStore.selectedUsers"
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
                            {{ $t('IDENTITY.USER.MAIN.TODAY') }}
                        </span>
                        <span v-else-if="value === 1">
                            {{ $t('IDENTITY.USER.MAIN.YESTERDAY') }}
                        </span>
                        <span v-else>
                            {{ value }} {{ $t('IDENTITY.USER.MAIN.DAYS') }}
                        </span>
                    </template>
                </p-data-table>
            </template>
        </p-tab>
        <div v-else
             id="empty-space"
        >
            <p-empty>{{ $t('IDENTITY.USER.MAIN.NO_SELECTED') }}</p-empty>
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
}
</style>
