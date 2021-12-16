<template>
    <section>
        <p-tab v-if="selectedIndex.length === 1" :tabs="singleItemTabState.tabs"
               :active-tab.sync="singleItemTabState.activeTab"
        >
            <template #detail>
                <user-detail ref="userDetail"
                             :user-id="selectedUsers[0].user_id"
                             :timezone="timezone"
                />
            </template>
            <template #tag>
                <p-tags-panel :resource-id="selectedUsers[0].user_id"
                              resource-type="identity.User"
                              resource-key="user_id"
                />
            </template>
            <template #assigned_role>
                <user-assigned-role
                    :user-id="selectedUsers[0].user_id"
                />
            </template>
            <template #api_key>
                <section>
                    <p-panel-top>
                        {{ $t('IDENTITY.USER.MAIN.API_KEY') }}
                    </p-panel-top>
                    <user-a-p-i-key-table class="api-key-table"
                                          :user-id="selectedUsers[0].user_id"
                    />
                </section>
            </template>
            <template #notifications>
                <user-notifications :user-id="selectedUsers[0].user_id" />
            </template>
        </p-tab>
        <p-tab v-else-if="selectedIndex.length > 1" :tabs="multiItemTabState.tabs"
               :active-tab.sync="multiItemTabState.activeTab"
        >
            <template #data>
                <p-data-table :fields="fields"
                              :sortable="false"
                              :selectable="false"
                              :items="selectedUsers"
                              :col-copy="true"
                              class="selected-data-tab"
                >
                    <template #col-state-format="{value}">
                        <p-status v-bind="userStateFormatter(value)" class="capitalize" />
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
        <div v-else id="empty-space">
            <p-empty>{{ $t('IDENTITY.USER.MAIN.NO_SELECTED') }}</p-empty>
        </div>
    </section>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';

import {
    PEmpty, PStatus, PTab, PDataTable, PPanelTop,
} from '@spaceone/design-system';

import { TabItem } from '@spaceone/design-system/dist/src/navigation/tabs/tab/type';

import UserDetail from '@/services/identity/user/user-management/modules/user-management-tab/UserDetail.vue';
import UserAssignedRole from '@/services/identity/user/user-management/modules/user-management-tab/UserAssignedRole.vue';
import PTagsPanel from '@/common/modules/tags/tags-panel/TagsPanel.vue';
import UserAPIKeyTable from '@/services/identity/user/user-api-key/modules/APIKeyTable.vue';
import UserNotifications from '@/services/identity/user/user-management/modules/user-management-tab/UserNotifications.vue';

import { store } from '@/store';
import { userStateFormatter } from '@/services/identity/user/lib/helper';
import { i18n } from '@/translations';
import { User } from '@/services/identity/user/type';

export default {
    name: 'UserManagementTab',
    components: {
        PEmpty,
        PStatus,
        UserDetail,
        UserAssignedRole,
        UserAPIKeyTable,
        UserNotifications,
        PTab,
        PTagsPanel,
        PDataTable,
        PPanelTop,
    },
    setup() {
        const vm = getCurrentInstance() as ComponentRenderProxy;

        const state = reactive({
            loading: true,
            users: [] as User[],
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
            selectedIndex: computed<number[]>(() => store.state.service.user.selectedIndex),
            selectedUsers: computed<User[]>(() => store.state.service.user.selectedUsers),
            isSelected: computed<boolean>(() => store.getters['service/user/isUserSelected']),
        });

        const singleItemTabState = reactive({
            tabs: computed(() => ([
                { label: i18n.t('IDENTITY.USER.MAIN.DETAILS'), name: 'detail', keepAlive: true },
                { label: i18n.t('IDENTITY.USER.MAIN.TAG'), name: 'tag', keepAlive: true },
                { label: i18n.t('IDENTITY.USER.MAIN.ASSIGNED_ROLES'), name: 'assigned_role', keepAlive: true },
                { label: i18n.t('IDENTITY.USER.MAIN.API_KEY'), name: 'api_key', keepAlive: true },
                { label: i18n.t('IDENTITY.USER.MAIN.NOTIFICATION'), name: 'notifications', keepAlive: true },
            ] as TabItem[])),
            activeTab: 'detail',
        });

        const multiItemTabState = reactive({
            tabs: computed(() => ([
                { name: 'data', label: vm.$t('IDENTITY.USER.MAIN.TAB_SELECTED_DATA'), keepAlive: true },
            ] as TabItem[])),
            activeTab: 'data',
        });


        return {
            ...toRefs(state),
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

.api-key-table::v-deep {
    .main-table-wrapper {
        border: 0;
    }
}
</style>
