<template>
    <section>
        <p-tab v-if="userPageState.selectedIndices.length === 1"
               :tabs="singleItemTabState.tabs"
               :active-tab.sync="singleItemTabState.activeTab"
        >
            <template #detail>
                <user-detail ref="userDetail"
                             :user-id="userPageGetters.selectedUsers[0].user_id"
                             :timezone="timezone"
                />
            </template>
            <template #tag>
                <p-tags-panel :resource-id="userPageGetters.selectedUsers[0].user_id"
                              resource-type="identity.User"
                              resource-key="user_id"
                              :disabled="manageDisabled"
                />
            </template>
            <template #assigned_role>
                <user-assigned-role
                    :user-id="userPageGetters.selectedUsers[0].user_id"
                />
            </template>
            <template #api_key>
                <section>
                    <p-heading heading-type="sub"
                               :title="$t('IDENTITY.USER.MAIN.API_KEY')"
                    />
                    <user-a-p-i-key-table class="api-key-table"
                                          :user-id="userPageGetters.selectedUsers[0].user_id"
                                          :disabled="manageDisabled"
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
                <p-data-table :fields="fields"
                              :sortable="false"
                              :selectable="false"
                              :items="userPageGetters.selectedUsers"
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

<script lang="ts">
import {
    computed, reactive, toRefs,
} from 'vue';

import {
    PEmpty, PStatus, PTab, PDataTable, PHeading,
} from '@spaceone/design-system';
import type { TabItem } from '@spaceone/design-system/types/navigation/tabs/tab/type';

import { store } from '@/store';
import { i18n } from '@/translations';

import PTagsPanel from '@/common/modules/tags/tags-panel/TagsPanel.vue';

import { userStateFormatter } from '@/services/administration/iam/user/lib/helper';
import UserAssignedRole from '@/services/administration/iam/user/modules/user-management-tab/UserAssignedRole.vue';
import UserDetail from '@/services/administration/iam/user/modules/user-management-tab/UserDetail.vue';
import { useUserPageStore } from '@/services/administration/store/user-page-store';
import UserAPIKeyTable from '@/services/my-page/my-account/user-api-key/modules/APIKeyTable.vue';

export default {
    name: 'UserManagementTab',
    components: {
        PEmpty,
        PStatus,
        UserDetail,
        UserAssignedRole,
        UserAPIKeyTable,
        // UserNotifications,
        PTab,
        PTagsPanel,
        PDataTable,
        PHeading,
    },
    props: {
        manageDisabled: {
            type: Boolean,
            default: false,
        },
    },
    setup() {
        const userPageStore = useUserPageStore();
        const userPageState = userPageStore.state;
        const userPageGetters = userPageStore.getters;

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
            tabs: computed(() => ([
                { label: i18n.t('IDENTITY.USER.MAIN.DETAILS'), name: 'detail', keepAlive: true },
                { label: i18n.t('IDENTITY.USER.MAIN.TAG'), name: 'tag', keepAlive: true },
                { label: i18n.t('IDENTITY.USER.MAIN.ASSIGNED_ROLES'), name: 'assigned_role', keepAlive: true },
                { label: i18n.t('IDENTITY.USER.MAIN.API_KEY'), name: 'api_key', keepAlive: true },
                // { label: i18n.t('IDENTITY.USER.MAIN.NOTIFICATION'), name: 'notifications', keepAlive: true },
            ] as TabItem[])),
            activeTab: 'detail',
        });

        const multiItemTabState = reactive({
            tabs: computed(() => ([
                { name: 'data', label: i18n.t('IDENTITY.USER.MAIN.TAB_SELECTED_DATA'), keepAlive: true },
            ] as TabItem[])),
            activeTab: 'data',
        });

        return {
            ...toRefs(state),
            userPageState,
            userPageGetters,
            userStateFormatter,
            singleItemTabState,
            multiItemTabState,
        };
    },

};
</script>

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
