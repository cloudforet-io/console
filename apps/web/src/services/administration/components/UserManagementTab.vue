<script lang="ts" setup>
import {
    computed, reactive,
} from 'vue';

import {
    PEmpty, PStatus, PTab, PDataTable,
} from '@spaceone/design-system';
import type { TabItem } from '@spaceone/design-system/types/navigation/tabs/tab/type';

import { i18n } from '@/translations';

import UserManagementTabDetail from '@/services/administration/components/UserManagementTabDetail.vue';
import UserManagementTabPanels from '@/services/administration/components/UserManagementTabPanels.vue';
import { userStateFormatter } from '@/services/administration/composables/refined-table-data';
import { USER_TAB_TABLE_FIELDS, USER_TABS } from '@/services/administration/constants/user-tab-constant';
import { useUserPageStore } from '@/services/administration/store/user-page-store';

const userPageStore = useUserPageStore();
const userPageState = userPageStore.$state;

const singleItemTabState = reactive({
    tabs: computed<TabItem[]>(() => ([
        { label: i18n.t('IDENTITY.USER.MAIN.DETAILS'), name: USER_TABS.DETAIL },
        { label: i18n.t('IDENTITY.USER.MAIN.PROJECTS'), name: USER_TABS.PROJECTS },
        { label: i18n.t('IDENTITY.USER.MAIN.TAG'), name: USER_TABS.TAG },
    ])),
    activeTab: USER_TABS.DETAIL,
});
const multiItemTabState = reactive({
    tabs: computed<TabItem[]>(() => ([
        { label: i18n.t('IDENTITY.USER.MAIN.TAB_SELECTED_DATA'), name: USER_TABS.DATA },
    ])),
    activeTab: USER_TABS.DATA,
});
</script>

<template>
    <section>
        <p-tab v-if="userPageState.selectedIndices.length === 1"
               :tabs="singleItemTabState.tabs"
               :active-tab.sync="singleItemTabState.activeTab"
        >
            <template #detail>
                <user-management-tab-detail />
            </template>
            <template #projects>
                <user-management-tab-panels :type="USER_TABS.PROJECTS"
                                            :active-tab="singleItemTabState.activeTab"
                />
            </template>
            <template #tag>
                <user-management-tab-panels :type="USER_TABS.TAG"
                                            :active-tab="singleItemTabState.activeTab"
                />
            </template>
        </p-tab>
        <p-tab v-else-if="userPageState.selectedIndices.length > 1"
               :tabs="multiItemTabState.tabs"
               :active-tab.sync="multiItemTabState.activeTab"
        >
            <template #data>
                <p-data-table :fields="USER_TAB_TABLE_FIELDS"
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
