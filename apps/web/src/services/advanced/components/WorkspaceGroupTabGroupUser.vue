<script setup lang="ts">
import {
    reactive, watch, onUnmounted, computed,
} from 'vue';
import { useRoute } from 'vue-router/composables';

import { clone } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PHeading, PButton, PToolboxTable, PStatus, PSelectDropdown, PTooltip,
} from '@cloudforet/mirinae';
import type { DataTableFieldType } from '@cloudforet/mirinae/types/data-display/tables/data-table/type';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { RoleListParameters } from '@/schema/identity/role/api-verbs/list';
import { ROLE_STATE, ROLE_TYPE } from '@/schema/identity/role/constant';
import type { RoleModel } from '@/schema/identity/role/model';
import type { RoleType } from '@/schema/identity/role/type';
import type { WorkspaceGroupUpdateRoleParameters } from '@/schema/identity/workspace-group/api-verbs/update-role';
import type { WorkspaceUser } from '@/schema/identity/workspace-group/model';
import { store } from '@/store';
import { i18n } from '@/translations';

import type { PageAccessMap } from '@/lib/access-control/config';
import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { useRoleFormatter, groupUserStateFormatter } from '@/services/advanced/composables/refined-table-data';
import { useSelectDropDownList } from '@/services/advanced/composables/use-select-drop-down-list';
import { WORKSPACE_GROUP_MODAL_TYPE } from '@/services/advanced/constants/workspace-group-constant';
import { useWorkspaceGroupPageStore } from '@/services/advanced/store/workspace-group-page-store';

const workspaceGroupPageStore = useWorkspaceGroupPageStore();
const workspaceGroupPageState = workspaceGroupPageStore.state;
const workspaceGroupPageGetters = workspaceGroupPageStore.getters;

const route = useRoute();

const emit = defineEmits<{(e: 'refresh', payload: { isGroupUser?: boolean, isWorkspace?: boolean }): void; }>();

const storeState = reactive({
    pageAccessPermissionMap: computed<PageAccessMap>(() => store.getters['user/pageAccessPermissionMap']),
});
const state = reactive({
    selectedMenuId: computed(() => {
        const reversedMatched = clone(route.matched).reverse();
        const closestRoute = reversedMatched.find((d) => d.meta?.menuId !== undefined);
        return closestRoute?.meta?.menuId;
    }),
    hasReadWriteAccess: computed<boolean|undefined>(() => storeState.pageAccessPermissionMap[state.selectedMenuId]?.write),
});
const tableState = reactive({
    fields: computed<DataTableFieldType[]>(() => {
        const defaultFields: DataTableFieldType[] = [
            { name: 'user_id', label: 'User ID' },
            { name: 'user_name', label: 'Name' },
            { name: 'state', label: 'State' },
            { name: 'role', label: 'Role' },
        ];
        if (state.hasReadWriteAccess) {
            defaultFields.push({ name: 'remove_button', label: ' ', sortable: false });
        }
        return defaultFields;
    }),
    roleMap: computed(() => {
        const map: Record<string, RoleModel> = {};
        workspaceGroupPageState.roles.forEach((role) => {
            map[role.role_id] = role;
        });
        return map;
    }),
});

const {
    loading, searchText, menuList, selectedItems, handleClickShowMore,
} = useSelectDropDownList<RoleModel>({
    pageSize: 10,
    transformer: (_role) => ({
        label: _role.name,
        name: _role.role_id,
        role_type: _role.role_type,
    }),
    filter: [{ k: 'role_type', v: ROLE_TYPE.DOMAIN_ADMIN, o: '!=' }],
    fetcher: (apiQueryHelper) => SpaceConnector.clientV2.identity.role.list<RoleListParameters, ListResponse<RoleModel>>({
        query: {
            ...apiQueryHelper.data,
            filter: [
                ...(apiQueryHelper.data.filter || []),
                { k: 'state', v: ROLE_STATE.ENABLED, o: 'eq' },
            ],
        },
    }),
});

const setupModal = (type) => {
    switch (type) {
    case WORKSPACE_GROUP_MODAL_TYPE.REMOVE_GROUP_USER: workspaceGroupPageStore.updateModalSettings({
        type: WORKSPACE_GROUP_MODAL_TYPE.REMOVE_GROUP_USER,
        title: i18n.t('IAM.WORKSPACE_GROUP.MODAL.DELETE_GROUP_USER_TITLE'),
        visible: WORKSPACE_GROUP_MODAL_TYPE.REMOVE_GROUP_USER,
        themeColor: 'alert',
    }); break;
    case WORKSPACE_GROUP_MODAL_TYPE.ADD_USERS: workspaceGroupPageStore.updateModalSettings({
        type: WORKSPACE_GROUP_MODAL_TYPE.ADD_USERS,
        title: i18n.t('IAM.WORKSPACE_GROUP.MODAL.ADD_USERS_TITLE', { name: workspaceGroupPageGetters.selectedWorkspaceGroup.name }),
        visible: WORKSPACE_GROUP_MODAL_TYPE.ADD_USERS,
    }); break;
    case WORKSPACE_GROUP_MODAL_TYPE.REMOVE_SINGLE_GROUP_USER: workspaceGroupPageStore.updateModalSettings({
        type: WORKSPACE_GROUP_MODAL_TYPE.REMOVE_SINGLE_GROUP_USER,
        title: i18n.t('IAM.WORKSPACE_GROUP.MODAL.DELETE_GROUP_USER_TITLE'),
        visible: WORKSPACE_GROUP_MODAL_TYPE.REMOVE_SINGLE_GROUP_USER,
        themeColor: 'alert',
    }); break;
    default:
        break;
    }
};

const handleSelect = (index) => {
    workspaceGroupPageStore.$patch((_state) => {
        _state.state.selectedUserIndices = index;
    });
};

const handleChange = (options: any = {}) => {
    if (options.pageStart) {
        workspaceGroupPageStore.$patch((_state) => {
            _state.state.groupUserPageStart = options.pageStart;
        });
    }

    if (options.pageLimit) {
        workspaceGroupPageStore.$patch((_state) => {
            _state.state.groupUserPageStart = 1;
            _state.state.groupUserPageLimit = options.pageLimit;
            _state.state.groupUserPage = 1;
        });
    }
};

const handleSelectMenu = async (value:{label:string, name:string, role_type: RoleType}) => {
    try {
        const selectedGroupUser = workspaceGroupPageGetters.selectedGroupUsersByIndices[0];

        const roleId = value.name;
        const userId = selectedGroupUser.user_id;
        const workspaceGroupId = workspaceGroupPageGetters.selectedWorkspaceGroup.workspace_group_id;

        await SpaceConnector.clientV2.identity.workspaceGroup.updateRole<WorkspaceGroupUpdateRoleParameters>({
            workspace_group_id: workspaceGroupId,
            user_id: userId,
            role_id: roleId,
        });
        showSuccessMessage(i18n.t('IAM.WORKSPACE_GROUP.ALT_S_UPDATE_ROLE'), '');
    } catch (e) {
        ErrorHandler.handleError(e);
    } finally {
        emit('refresh', { isGroupUser: true });
    }
};

const handleRefresh = () => {
    emit('refresh', { isGroupUser: true });
};

const handleAddUsersButtonClick = () => {
    setupModal(WORKSPACE_GROUP_MODAL_TYPE.ADD_USERS);
};

const handleSelectedGroupUsersRemoveButtonClick = () => {
    setupModal(WORKSPACE_GROUP_MODAL_TYPE.REMOVE_GROUP_USER);
};

const handleSelectedGroupUserRemoveButtonClick = (item:WorkspaceUser) => {
    setupModal(WORKSPACE_GROUP_MODAL_TYPE.REMOVE_SINGLE_GROUP_USER);
    workspaceGroupPageState.modalAdditionalData = {
        selectedGroupUser: item,
    };
};

const handleChangeSort = (name, isDesc) => {
    workspaceGroupPageStore.$patch((_state) => {
        if (name === 'role') {
            _state.state.groupUserSortBy = `${name}_type`;
        } else {
            _state.state.groupUserSortBy = name;
        }

        _state.state.selectedUserIndices = [];
        _state.state.isUserSortDesc = isDesc;
    });
};

watch(() => workspaceGroupPageState.groupUserSearchText, () => {
    workspaceGroupPageStore.$patch((_state) => {
        _state.state.selectedUserIndices = [];
    });
});

onUnmounted(() => {
    workspaceGroupPageStore.resetGroupUser();
});
</script>

<template>
    <section class="workspace-group-tab-group-user">
        <p-heading class="workspace-group-tab-group-user-header"
                   :title="$t('IAM.WORKSPACE_GROUP.TAB.GROUP_USER')"
                   use-total-count
                   :total-count="workspaceGroupPageGetters.groupUserTotalCount"
                   heading-type="sub"
        >
            <template v-if="state.hasReadWriteAccess"
                      #extra
            >
                <div class="workspace-group-tab-group-user-button-wrapper">
                    <p-button style-type="negative-primary"
                              :disabled="!workspaceGroupPageGetters.selectedGroupUsersByIndices.length"
                              @click="handleSelectedGroupUsersRemoveButtonClick"
                    >
                        {{ $t('IAM.WORKSPACE_GROUP.TAB.REMOVE') }}
                    </p-button>
                    <p-button style-type="secondary"
                              icon-left="ic_plus_bold"
                              @click="handleAddUsersButtonClick"
                    >
                        {{ $t('IAM.WORKSPACE_GROUP.TAB.ADD_USER') }}
                    </p-button>
                </div>
            </template>
        </p-heading>
        <p-toolbox-table class="workspace-group-tab-group-user-table"
                         :loading="workspaceGroupPageState.loading"
                         :fields="tableState.fields"
                         :items="workspaceGroupPageGetters.workspaceGroupUsers"
                         :select-index="workspaceGroupPageState.selectedUserIndices"
                         :total-count="workspaceGroupPageGetters.groupUserTotalCount"
                         sort-by="user_id"
                         search-type="plain"
                         :sort-desc="true"
                         :this-page.sync="workspaceGroupPageState.groupUserPage"
                         :search-text.sync="workspaceGroupPageState.groupUserSearchText"
                         :selectable="state.hasReadWriteAccess"
                         sortable
                         searchable
                         @select="handleSelect"
                         @change="handleChange"
                         @refresh="handleRefresh()"
                         @changeSort="handleChangeSort"
        >
            <template #col-state-format="{ value }">
                <p-status v-bind="groupUserStateFormatter(value)"
                          class="capitalize"
                />
            </template>
            <template #col-role-format="{ item }">
                <span class="role-type">
                    <img :src="useRoleFormatter(item.role_type).image"
                         alt="role-type-icon"
                         class="role-type-icon"
                    >
                    <p-select-dropdown
                        is-filterable
                        use-fixed-menu-style
                        style-type="transparent"
                        class="role-select-dropdown"
                        :disabled="!state.hasReadWriteAccess"
                        :menu="menuList"
                        :selected.sync="selectedItems"
                        :search-text.sync="searchText"
                        :loading="loading"
                        disable-handler
                        page-size="10"
                        @click-show-more="handleClickShowMore"
                        @select="handleSelectMenu"
                    >
                        <template #dropdown-button>
                            <span>{{ tableState.roleMap[item.role_id].name }}</span>
                        </template>
                        <!-- eslint-disable vue/no-template-shadow -->
                        <template #menu-item--format="{ item }">
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
                </span>
            </template>
            <template #col-remove_button-format="{ item }">
                <p-button size="sm"
                          style-type="tertiary"
                          @click.stop="() => handleSelectedGroupUserRemoveButtonClick(item)"
                >
                    {{ $t('IAM.WORKSPACE_GROUP.TAB.REMOVE') }}
                </p-button>
            </template>
        </p-toolbox-table>
    </section>
</template>

<style lang="postcss" scoped>
.workspace-group-tab-group-user {
    .workspace-group-tab-group-user-button-wrapper {
        display: flex;
        gap: 1rem;
    }

    .workspace-group-tab-group-user-table {
        border: none;
    }

    .role-type {
        @apply flex items-center;
        gap: 0.5rem;

        .role-type-icon {
            @apply rounded-full;
            width: 1.5rem;
            height: 1.5rem;
        }
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

    /* custom design-system component - p-select-dropdown */
    :deep(.p-select-dropdown) {
        .no-data {
            position: initial;
        }
    }
}
</style>
