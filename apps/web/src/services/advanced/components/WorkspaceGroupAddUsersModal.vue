<script setup lang="ts">
import { reactive } from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PButtonModal, PFieldGroup, PSelectDropdown, PIconButton,
} from '@cloudforet/mirinae';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { RoleListParameters } from '@/schema/identity/role/api-verbs/list';
import type { RoleModel } from '@/schema/identity/role/model';
import type { UserListParameters } from '@/schema/identity/user/api-verbs/list';
import type { UserModel } from '@/schema/identity/user/model';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import { useSelectDropDownList } from '@/services/advanced/composables/use-select-drop-down-list';
import { WORKSPACE_GROUP_MODAL_TYPE } from '@/services/advanced/constants/workspace-group-constant';
import { useWorkspaceGroupPageStore } from '@/services/advanced/store/workspace-group-page-store';
import { useRoleFormatter } from '@/services/iam/composables/refined-table-data';



const workspaceGroupPageStore = useWorkspaceGroupPageStore();
const workspaceGroupPageState = workspaceGroupPageStore.state;


const state = reactive({
    loading: false,
    users: [{
        // TODO: temp data
        user_id: 'Bradford_McDermott@hotmail.com',
    }],
});

const {
    loading: roleLoading, searchText: roleSearchText, menuList: roleMenuList, selectedItems: roleSelectedItems, handleClickShowMore: handleClickShowMoreRole,
} = useSelectDropDownList({
    pageSize: 10,
    transformer: (_role) => ({
        label: _role.name,
        name: _role.role_id,
        role_type: _role.role_type,
    }),
    fetcher: (apiQueryHelper) => SpaceConnector.clientV2.identity.role.list<RoleListParameters, ListResponse<RoleModel>>({
        query: apiQueryHelper.data,
    }),
});

const {
    loading: userLoading, searchText: userSearchText, menuList: userMenuList, selectedItems: userSelectedItems, handleClickShowMore: handleClickShowMoreUser,
} = useSelectDropDownList({
    pageSize: 10,
    transformer: (_user) => ({
        name: _user.name,
        user_id: _user.user_id,
    }),
    fetcher: (apiQueryHelper) => SpaceConnector.clientV2.identity.user.list<UserListParameters, ListResponse<UserModel>>({
        query: apiQueryHelper.data,
    }),
});

const handleConfirm = () => {
    showSuccessMessage(i18n.t('IAM.WORKSPACE_GROUP.MODAL.ALT_S_ADD_USRES'), '');
    workspaceGroupPageStore.closeModal();
};

const handleCloseModal = () => {
    workspaceGroupPageStore.closeModal();
};
</script>

<template>
    <p-button-modal class="workspace-group-add-users-modal"
                    :header-title="workspaceGroupPageState.modal.title"
                    :visible="workspaceGroupPageState.modal.visible === WORKSPACE_GROUP_MODAL_TYPE.ADD_USERS"
                    :loading="state.loading"
                    size="sm"
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
                                     :src="useRoleFormatter(roleSelectedItems[0]?.role_type).image"
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
                        <p-select-dropdown
                            is-filterable
                            use-fixed-menu-style
                            class="user-select-dropdown"
                            style-type="TERTIARY_ICON_BUTTON"
                            disable-handler
                            multi-selectable
                            :menu="userMenuList"
                            :selected.sync="userSelectedItems"
                            :search-text.sync="userSearchText"
                            :loading="userLoading"
                            :placeholder="$t('IAM.WORKSPACE_GROUP.MODAL.USER_DROP_DOWN_PLACEHOLDER')"
                            @click-show-more="handleClickShowMoreUser"
                        >
                            <template #menu-item--format="{ item }">
                                <div class="user-menu-item">
                                    <span class="role-user_id">{{ item.user_id }}({{ item.name }})</span>
                                    <p-icon-button name="ic_close"
                                                   size="md"
                                    />
                                </div>
                            </template>
                        </p-select-dropdown>
                    </template>
                </p-field-group>
            </div>
            <!-- TODO: selected user -->
            <div v-for="item in userSelectedItems"
                 :key="item.user_id"
            >
                {{ item.user_id }}
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

    .user-select-dropdown {
        .user-menu-item {
            @apply flex items-center justify-between;
            gap: 0.25rem;
        }

        :deep(.dropdown-button)::before {
            content: "Add Users";
        }

        :deep(.selection-display-wrapper) {
            display: none;
        }
    }
}
</style>
