<script setup lang="ts">
import { computed, reactive, watch } from 'vue';

import { debounce } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PButtonModal, PFieldGroup, PSelectDropdown, PIconButton, PAvatar, PTextInput,
} from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/inputs/context-menu/type';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { RoleListBasicRoleParameters } from '@/schema/identity/role/api-verbs/list-basic-role';
import { ROLE_STATE, ROLE_TYPE } from '@/schema/identity/role/constant';
import type { BasicRoleModel, RoleModel } from '@/schema/identity/role/model';
import type { MyWorkspaceGroupModel } from '@/schema/identity/user-profile/model';
import type { WorkspaceGroupUserAddParameters } from '@/schema/identity/workspace-group-user/api-verbs/add';
import type { WorkspaceGroupUserFindParameters } from '@/schema/identity/workspace-group-user/api-verbs/find';
import type {
    WorkspaceGroupUserModel,
    WorkspaceGroupUserSummaryModel,
} from '@/schema/identity/workspace-group-user/model';
import type { WorkspaceGroupModel } from '@/schema/identity/workspace-group/model';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';

import { useSelectDropDownList } from '@/services/advanced/composables/use-select-drop-down-list';
import { useRoleFormatter } from '@/services/iam/composables/refined-table-data';
import { USER_STATE } from '@/services/iam/constants/user-constant';

const emit = defineEmits<{(e: 'confirm'): void;
    (e: 'update:visible'): void;
}>();

interface Props {
    workspaceGroup?: WorkspaceGroupModel | MyWorkspaceGroupModel
    visible: boolean;
}

const props = defineProps<Props>();

const state = reactive({
    loading: false,
    proxyVisible: useProxyValue('visible', props, emit),
    isAllValid: computed(() => roleSelectedItems.value.length > 0 && userDropdownState.selectedItems.length > 0),
});

const {
    loading: roleLoading, searchText: roleSearchText, menuList: roleMenuList, selectedItems: roleSelectedItems, handleClickShowMore: handleClickShowMoreRole,
} = useSelectDropDownList<RoleModel>({
    pageSize: 10,
    transformer: (_role) => ({
        label: _role.name,
        name: _role.role_id,
        role_type: _role.role_type,
    }),
    filter: [{ k: 'role_type', v: ROLE_TYPE.DOMAIN_ADMIN, o: '!=' }],
    fetcher: (apiQueryHelper) => SpaceConnector.clientV2.identity.role.listBasicRole<RoleListBasicRoleParameters, ListResponse<BasicRoleModel>>({
        query: {
            ...apiQueryHelper.data,
            filter: [
                ...(apiQueryHelper.data.filter || []),
                { k: 'state', v: ROLE_STATE.ENABLED, o: 'eq' },
            ],
        },
    }),
});

const resetState = () => {
    roleSelectedItems.value = [];
    userDropdownState.menuList = [];
};

const handleConfirm = async () => {
    try {
        state.loading = true;
        if (!props.workspaceGroup?.workspace_group_id) throw Error('Invalid Workspace Group Id.');
        await SpaceConnector.clientV2.identity.workspaceGroupUser.add<WorkspaceGroupUserAddParameters, WorkspaceGroupUserModel>({
            workspace_group_id: props.workspaceGroup?.workspace_group_id,
            users: userDropdownState.selectedItems.map((item) => ({
                user_id: item, role_id: roleSelectedItems.value[0]?.name,
            })),
        });
        showSuccessMessage(i18n.t('IAM.WORKSPACE_GROUP.MODAL.ALT_S_ADD_USERS'), '');
        emit('confirm');
    } catch (e) {
        ErrorHandler.handleError(e);
    } finally {
        resetState();
        state.proxyVisible = false;
        state.loading = false;
    }
};

const handleCloseModal = () => {
    state.proxyVisible = false;
};

const handleRemoveUser = (item: string) => {
    userDropdownState.selectedItems = userDropdownState.selectedItems.filter((selectedItem) => selectedItem !== item);
};
// userFind logic
const userDropdownState = reactive({
    userList: [] as WorkspaceGroupUserSummaryModel[],
    menuList: computed(() => userDropdownState.userList.map((user) => ({
        label: user.user_id,
        name: user.user_id,
        disabled: userDropdownState.selectedItems.includes(user.user_id),
    }))),
    inputSelectedItem: [] as MenuItem[],
    selectedItems: [] as string[],
    searchText: '',
    loading: false,
    pageLimit: 10,
});
const fetchUserFindList = async ():Promise<WorkspaceGroupUserSummaryModel[]> => {
    userDropdownState.loading = true;

    try {
        if (!props.workspaceGroup?.workspace_group_id) throw Error('Invalid Workspace Group Id.');
        const { results } = await SpaceConnector.clientV2.identity.workspaceGroupUser.find<WorkspaceGroupUserFindParameters, ListResponse<WorkspaceGroupUserSummaryModel>>({
            workspace_group_id: props.workspaceGroup?.workspace_group_id,
            keyword: userDropdownState.searchText,
            state: USER_STATE.ENABLE,
            page: {
                start: 0,
                limit: userDropdownState.pageLimit,
            },
        });
        return results ?? [];
    } catch (e) {
        ErrorHandler.handleError(e);
        return [];
    } finally {
        userDropdownState.loading = false;
    }
};
const handleEnter = (user: [MenuItem]) => {
    const selectedUser = user[0]?.name;
    const isExistUser = userDropdownState.selectedItems.find((selectedItem:string) => selectedItem === selectedUser);
    if (!selectedUser || isExistUser) return;
    userDropdownState.selectedItems.push(selectedUser);
    userDropdownState.inputSelectedItem = [];
};

(async () => {
    userDropdownState.userList = await fetchUserFindList();
})();

watch(() => userDropdownState.searchText, debounce(async () => {
    userDropdownState.userList = await fetchUserFindList() || [];
}, 300));
</script>

<template>
    <p-button-modal class="workspace-group-add-users-modal"
                    :header-title="$t('IAM.WORKSPACE_GROUP.MODAL.ADD_USERS_TITLE', { name: props.workspaceGroup?.name })"
                    :visible="props.visible"
                    :loading="state.loading"
                    size="sm"
                    :disabled="!state.isAllValid"
                    @confirm="handleConfirm"
                    @cancel="handleCloseModal"
                    @close="handleCloseModal"
    >
        <template #body>
            <div class="form-wrapper">
                <p-field-group required
                               :label="$t('IAM.WORKSPACE_GROUP.MODAL.ROLE_SELECT_DROP_DOWN_TITLE')"
                               style-type="secondary"
                >
                    <template #default>
                        <p-select-dropdown
                            is-filterable
                            use-fixed-menu-style
                            class="role-select-dropdown"
                            disable-handler
                            :menu="roleMenuList"
                            :selected.sync="roleSelectedItems"
                            :search-text.sync="roleSearchText"
                            :loading="roleLoading"
                            :placeholder="$t('IAM.WORKSPACE_GROUP.MODAL.ROLE_DROP_DOWN_PLACEHOLDER')"
                            @click-show-more="handleClickShowMoreRole"
                        >
                            <template #dropdown-left-area>
                                <img v-if="roleSelectedItems.length > 0"
                                     :src="useRoleFormatter(roleSelectedItems[0]?.role_type ?? 'USER').image"
                                     alt="role-type-icon"
                                     class="role-type-icon"
                                >
                            </template>
                            <template #menu-item--format="{ item }">
                                <div class="role-menu-item">
                                    <img :src="useRoleFormatter(item.role_type).image"
                                         alt="role-type-icon"
                                         class="role-type-icon"
                                    >
                                    <span class="role-label">{{ item.label }}</span>
                                    <span class="role-type">{{ useRoleFormatter(item.role_type, true).name }}</span>
                                </div>
                            </template>
                        </p-select-dropdown>
                    </template>
                </p-field-group>
                <p-field-group required
                               :label="$t('IAM.WORKSPACE_GROUP.MODAL.USER_SELECT_DROP_DOWN_TITLE')"
                               style-type="secondary"
                >
                    <template #default>
                        <p-text-input :value.sync="userDropdownState.searchText"
                                      class="user-search-input"
                                      :placeholder="$t('IAM.WORKSPACE_GROUP.MODAL.USER_DROP_DOWN_PLACEHOLDER')"
                                      :selected="userDropdownState.inputSelectedItem"
                                      use-auto-complete
                                      use-fixed-menu-style
                                      :menu="userDropdownState.menuList"
                                      @update:selected="handleEnter"
                        />
                    </template>
                </p-field-group>
            </div>
            <div v-for="item in userDropdownState.selectedItems"
                 :key="item"
                 class="selected-user-item"
            >
                <div class="flex items-center gap-2">
                    <p-avatar class="menu-icon"
                              size="md"
                    />
                    {{ item }}
                </div>
                <p-icon-button name="ic_close"
                               size="md"
                               @click="handleRemoveUser(item)"
                />
            </div>
        </template>
        <template #confirm-button>
            {{ $t('IAM.WORKSPACE_GROUP.MODAL.ADD') }}
        </template>
    </p-button-modal>
</template>

<style lang="postcss" scoped>
.workspace-group-add-users-modal {
    .role-select-dropdown {
        .role-type-icon {
            @apply rounded-full;
            width: 1.5rem;
            height: 1.5rem;
        }

        .role-menu-item {
            @apply flex items-center;
            gap: 0.25rem;

            .role-label {
                @apply truncate;
                flex-grow: 1;
            }

            .role-type {
                @apply text-label-sm text-gray-400;
            }
        }
    }

    .user-search-input {
        width: 100%;
    }

    .selected-user-item {
        @apply flex items-center justify-between rounded text-label-md;
        padding: 0.5rem;
        &:hover {
            @apply bg-blue-100;
        }
    }
}
</style>
