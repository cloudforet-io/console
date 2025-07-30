<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PEmpty, PStatus, PTab, PDataTable, PBadge, PTooltip, PSelectDropdown, PTag,
} from '@cloudforet/mirinae';
import type {
    AutocompleteHandler,
    SelectDropdownMenuItem,
} from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';
import type { TabItem } from '@cloudforet/mirinae/types/navigation/tabs/tab/type';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { RoleBindingUpdateRoleParameters } from '@/api-clients/identity/role-binding/schema/api-verbs/update-role';
import type { RoleBindingModel } from '@/api-clients/identity/role-binding/schema/model';
import { ROLE_STATE, ROLE_TYPE } from '@/api-clients/identity/role/constant';
import type { RoleListParameters } from '@/api-clients/identity/role/schema/api-verbs/list';
import type { RoleModel } from '@/api-clients/identity/role/schema/model';
import { i18n } from '@/translations';

import { useUserStore } from '@/store/user/user-store';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import UserManagementTabDetail from '@/services/iam/components/UserManagementTabDetail.vue';
import UserManagementTabProjects from '@/services/iam/components/UserManagementTabProjects.vue';
import UserManagementTabTag from '@/services/iam/components/UserManagementTabTag.vue';
import UserManagementTabWorkspace from '@/services/iam/components/UserManagementTabWorkspace.vue';
import {
    calculateTime,
    useRoleFormatter,
    userStateFormatter,
} from '@/services/iam/composables/refined-table-data';
import { USER_TABS } from '@/services/iam/constants/user-constant';
import { useUserPageStore } from '@/services/iam/store/user-page-store';
import type { ExtendUserListItemType } from '@/services/iam/types/user-type';

interface Props {
    hasReadWriteAccess?: boolean;
}

const props = defineProps<Props>();

const userPageStore = useUserPageStore();
const userPageState = userPageStore.state;
const userPageGetters = userPageStore.getters;
const userStore = useUserStore();

const storeState = reactive({
    loginUserId: computed<string|undefined>(() => userStore.state.userId),
    timezone: computed<string|undefined>(() => userStore.state.timezone),
});
const state = reactive({
    fieldByMode: computed(() => (userPageState.isAdminMode
        ? [{ name: 'role_type', label: 'Admin Role', sortable: false }]
        : [{ name: 'role_binding', label: 'Role', sortable: false }, { name: 'user_group', label: 'User Group', sortable: false }])),
    field: computed(() => ([
        { name: 'user_id', label: 'User ID', sortable: false },
        { name: 'name', label: 'Name', sortable: false },
        { name: 'state', label: 'State', sortable: false },
        { name: 'type', label: 'Type', sortable: false },
        ...state.fieldByMode,
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
    refinedUserItems: computed<ExtendUserListItemType[]>(() => userPageGetters.selectedUsers.map((user) => ({
        ...user,
        type: user?.role_binding_info?.workspace_group_id ? 'Workspace Group' : 'Workspace',
        last_accessed_at: user?.last_accessed_at,
        tags: user?.tags ?? {},
    }))),
});

const dropdownState = reactive({
    loading: false,
    visibleMenu: false,
    searchText: '',
    menuItems: [] as SelectDropdownMenuItem[],
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
const roleListApiQueryHelper = new ApiQueryHelper();

const dropdownMenuHandler: AutocompleteHandler = async (inputText: string) => {
    dropdownState.loading = true;

    roleListApiQueryHelper.setFilters([
        { k: 'role_type', v: [ROLE_TYPE.WORKSPACE_OWNER, ROLE_TYPE.WORKSPACE_MEMBER], o: '=' },
        { k: 'state', v: ROLE_STATE.ENABLED, o: '=' },
    ]);
    if (inputText) {
        roleListApiQueryHelper.addFilter({
            k: 'name',
            v: inputText,
            o: '',
        });
    }
    try {
        const { results } = await SpaceConnector.clientV2.identity.role.list<RoleListParameters, ListResponse<RoleModel>>({
            query: {
                ...roleListApiQueryHelper.data,
                filter: [
                    ...(roleListApiQueryHelper.data?.filter || []),
                    { k: 'state', v: ROLE_STATE.ENABLED, o: 'eq' },
                ],
            },
        });
        dropdownState.menuItems = (results ?? []).map((role) => ({
            label: role.name,
            name: role.role_id,
            role_type: role.role_type,
        }));
    } catch (e) {
        ErrorHandler.handleError(e);
    } finally {
        dropdownState.loading = false;
    }

    return {
        results: dropdownState.menuItems,
    };
};
const handleSelectDropdownItem = async (value, rowIndex:number) => {
    try {
        const response = await SpaceConnector.clientV2.identity.roleBinding.updateRole<RoleBindingUpdateRoleParameters, RoleBindingModel>({
            role_binding_id: multiItemTabState.refinedUserItems[rowIndex]?.role_binding_info?.role_binding_id || '',
            role_id: value || '',
        });
        showSuccessMessage(i18n.t('IAM.USER.MAIN.ALT_S_CHANGE_ROLE'), '');
        const roleName = userPageGetters.roleMap[response.role_id]?.name ?? '';
        const originTableIndex = userPageState.selectedIndices[rowIndex];
        userPageState.users[originTableIndex] = {
            ...userPageState.users[originTableIndex],
            role_binding: {
                name: roleName,
                type: response.role_type,
            },
        };
    } catch (e: any) {
        ErrorHandler.handleRequestError(e, e.message);
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
                <user-management-tab-detail :has-read-write-access="props.hasReadWriteAccess"
                                            @refresh="initUserData"
                />
            </template>
            <template #workspace>
                <user-management-tab-workspace :active-tab="singleItemTabState.activeTab"
                                               :has-read-write-access="props.hasReadWriteAccess"
                />
            </template>
            <template #projects>
                <user-management-tab-projects :active-tab="singleItemTabState.activeTab"
                                              :has-read-write-access="props.hasReadWriteAccess"
                />
            </template>
            <template #tag>
                <user-management-tab-tag :active-tab="singleItemTabState.activeTab"
                                         :has-read-write-access="props.hasReadWriteAccess"
                />
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
                        <span v-if="calculateTime(value, storeState.timezone) === -1">
                            -
                        </span>
                        <span v-else-if="calculateTime(value, storeState.timezone) === 0">
                            {{ $t('IAM.USER.MAIN.TODAY') }}
                        </span>
                        <span v-else-if="calculateTime(value, storeState.timezone) === 1">
                            {{ $t('IAM.USER.MAIN.YESTERDAY') }}
                        </span>
                        <span v-else>
                            {{ calculateTime(value, storeState.timezone) }} {{ $t('IAM.USER.MAIN.DAYS') }}
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
                    <template #col-role_binding-format="{value, rowIndex}">
                        <div class="role-type-wrapper">
                            <p-tooltip position="bottom"
                                       :contents="useRoleFormatter(value?.type).name"
                                       class="tooltip"
                            >
                                <img :src="useRoleFormatter(value?.type).image"
                                     alt="role-type-icon"
                                     class="role-type-icon"
                                >
                            </p-tooltip>
                            <p-select-dropdown v-if="userPageGetters.isWorkspaceOwner && multiItemTabState.refinedUserItems[rowIndex].user_id !== storeState.loginUserId"
                                               is-filterable
                                               use-fixed-menu-style
                                               style-type="transparent"
                                               :visible-menu="dropdownState.visibleMenu"
                                               :loading="dropdownState.loading"
                                               :search-text.sync="dropdownState.searchText"
                                               :handler="dropdownMenuHandler"
                                               class="role-select-dropdown"
                                               @select="handleSelectDropdownItem($event, rowIndex)"
                            >
                                <template #dropdown-button>
                                    <span>{{ value.name }}</span>
                                </template>
                                <template #menu-item--format="{item}">
                                    <div class="role-menu-item">
                                        <img :src="useRoleFormatter(item.role_type).image"
                                             alt="role-type-icon"
                                             class="role-type-icon"
                                        >
                                        <p-tooltip position="bottom"
                                                   :contents="item.label"
                                                   class="role-label"
                                        >
                                            <span>{{ item.label }}</span>
                                        </p-tooltip>
                                        <span class="role-type">{{ useRoleFormatter(item.role_type, true).name }}</span>
                                    </div>
                                </template>
                            </p-select-dropdown>
                            <span v-else>{{ value.name }}</span>
                        </div>
                    </template>
                    <template #col-user_group-format="{value}">
                        <div v-if="value.length > 0">
                            <p-tag v-for="(v, i) in value"
                                   :key="`${v}-${i}`"
                                   :deletable="false"
                            >
                                {{ v.name }}
                            </p-tag>
                        </div>
                        <div v-else />
                    </template>
                    <template #col-tags-format="{value}">
                        <template v-if="value && typeof value === 'object' && Object.keys(value).length > 0">
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
        .tooltip {
            @apply rounded-full;
            width: 1.5rem;
            height: 1.5rem;
            margin-right: 0.25rem;
        }
        .role-type-icon {
            @apply rounded-full;
            width: 1.5rem;
            height: 1.5rem;
        }
        .role-select-dropdown {
            width: auto;
            .role-menu-item {
                @apply flex items-center;
                gap: 0.25rem;
                .role-type-icon {
                    width: 1rem;
                    height: 1rem;
                }
                .role-label {
                    @apply truncate;
                    width: 14.375rem;
                }
                .role-type {
                    @apply text-label-sm text-gray-400;
                }
            }
        }
    }
}
</style>
