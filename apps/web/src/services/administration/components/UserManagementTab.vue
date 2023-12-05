<script lang="ts" setup>
import {
    computed, reactive,
} from 'vue';

import {
    PEmpty, PStatus, PTab, PDataTable, PHeading,
} from '@spaceone/design-system';
import type { TabItem } from '@spaceone/design-system/types/navigation/tabs/tab/type';

import { store } from '@/store';
import { i18n } from '@/translations';

import PTagsPanel from '@/common/modules/tags/tags-panel/TagsPanel.vue';

import UserManagementTabAssignedRole from '@/services/administration/components/UserManagementTabAssignedRole.vue';
import UserManagementTabDetail from '@/services/administration/components/UserManagementTabDetail.vue';
import { userStateFormatter } from '@/services/administration/helpers/user-management-tab-helper';
import { useUserPageStore } from '@/services/administration/store/user-page-store';
import UserAPIKeyTable from '@/services/my-page/components/UserAPIKeyTable.vue';

interface Props {
    manageDisabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    manageDisabled: false,
});

const userPageStore = useUserPageStore();
const userPageState = userPageStore.$state;

const state = reactive({
    loading: true,
    timezone: computed(() => store.state.user.timezone || 'UTC'),
    fields: computed(() => ([
        { name: 'user_id', label: 'User ID' },
        { name: 'name', label: 'Name' },
        { name: 'state', label: 'State' },
        { name: 'user_type', label: 'Access Control' },
        { name: 'api_key_count', label: 'API Key' },
        { name: 'role_name', label: 'Role' },
        { name: 'backend', label: 'Auth Type' },
        { name: 'last_accessed_at', label: 'Last Activity' },
        { name: 'timezone', label: 'Timezone' },
    ])),
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
    tabs: computed(() => ([
        { name: 'data', label: i18n.t('IDENTITY.USER.MAIN.TAB_SELECTED_DATA'), keepAlive: true },
    ] as TabItem[])),
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
                <user-management-tab-detail ref="userDetail"
                                            :user-id="userPageStore.selectedUsers[0].user_id"
                                            :timezone="state.timezone"
                />
            </template>
            <template #tag>
                <p-tags-panel :resource-id="userPageStore.selectedUsers[0].user_id"
                              resource-type="identity.User"
                              resource-key="user_id"
                              :disabled="props.manageDisabled"
                />
            </template>
            <template #assigned_role>
                <user-management-tab-assigned-role
                    :user-id="userPageStore.selectedUsers[0].user_id"
                />
            </template>
            <template #api_key>
                <section>
                    <p-heading heading-type="sub"
                               :title="$t('IDENTITY.USER.MAIN.API_KEY')"
                    />
                    <user-a-p-i-key-table class="api-key-table"
                                          :user-id="userPageStore.selectedUsers[0].user_id"
                                          :disabled="props.manageDisabled"
                    />
                </section>
            </template>
            <!--            <template #notifications>-->
            <!--                <user-notifications :user-id="selectedUsers[0].user_id" />-->
            <!--            </template>-->
        </p-tab>
        <p-tab v-else-if="userPageState.selectedIndices.length > 1"
               :tabs="multiItemTabState.tabs"
               :active-tab.sync="multiItemTabState.activeTab"
        >
            <template #data>
                <p-data-table :fields="state.fields"
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

/* custom user-a-p-i-key-table */
:deep(.api-key-table) {
    /* custom design-system component - p-pane-layout */
    .main-table-wrapper {
        border: 0;
    }
}
</style>
