<script lang="ts" setup>
import {
    computed, reactive,
} from 'vue';
import { useRoute } from 'vue-router/composables';

import {
    PBadge, PButton, PSelectDropdown, PStatus, PToolboxTable,
} from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';
import type { KeyItemSet } from '@spaceone/design-system/types/inputs/search/query-search/type';

import { getApiQueryWithToolboxOptions } from '@cloudforet/core-lib/component-util/toolbox';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import type { ListResponse } from '@/schema/_common/model';
import type { RoleCreateParameters } from '@/schema/identity/role-binding/api-verbs/create';
import type { RoleDeleteParameters } from '@/schema/identity/role-binding/api-verbs/delete';
import type { RoleListParameters } from '@/schema/identity/role-binding/api-verbs/list';
import type { RoleBindingModel } from '@/schema/identity/role-binding/model';
import type { UserCreateParameters } from '@/schema/identity/user/api-verbs/create';
import { USER_TYPE } from '@/schema/identity/user/constant';
import type { UserType } from '@/schema/identity/user/type';
import { store } from '@/store';
import { i18n } from '@/translations';

import { FILE_NAME_PREFIX } from '@/lib/excel-export/constant';
import { downloadExcel } from '@/lib/helper/file-download-helper';
import type { ExcelDataField } from '@/lib/helper/file-download-helper/type';
import { showErrorMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';
import { replaceUrlQuery } from '@/lib/router-query-string';

import ErrorHandler from '@/common/composables/error/errorHandler';

import UserManagementFormModal from '@/services/administration/components/UserManagementFormModal.vue';
import UserManagementStatusModal
    from '@/services/administration/components/UserManagementStatusModal.vue';
import { userSearchHandlers } from '@/services/administration/constants/user-table-constant';
import { calculateTime, userStateFormatter } from '@/services/administration/helpers/user-management-tab-helper';
import { useUserPageStore } from '@/services/administration/store/user-page-store';
import type { User } from '@/services/administration/types/user-type';

interface Props {
    tableHeight: number;
    manageDisabled: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    tableHeight: 400,
    manageDisabled: false,
});

const userPageStore = useUserPageStore();
const userPageState = userPageStore.$state;

const route = useRoute();

const userListApiQueryHelper = new ApiQueryHelper()
    .setPageStart(1).setPageLimit(15)
    .setSort('name', true)
    .setFiltersAsRawQueryString(route.query.filters);

const fields = [
    { name: 'user_id', label: 'User ID' },
    { name: 'name', label: 'Name' },
    { name: 'state', label: 'State' },
    { name: 'user_type', label: 'Access Control' },
    { name: 'api_key_count', label: 'API Key', sortable: false },
    { name: 'role_name', label: 'Role', sortable: false },
    { name: 'tags', label: 'Tags', sortable: false },
    { name: 'backend', label: 'Auth Type' },
    { name: 'last_accessed_at', label: 'Last Activity' },
    { name: 'timezone', label: 'Timezone' },
];

const excelFields:ExcelDataField[] = [
    { key: 'user_id', name: 'User ID' },
    { key: 'name', name: 'Name' },
    { key: 'state', name: 'State' },
    { key: 'user_type', name: 'Access Control' },
    { key: 'api_key_count', name: 'API Key' },
    { key: 'role_bindings.role_info.name', name: 'Role' },
    { key: 'backend', name: 'Auth Type' },
    { key: 'last_accessed_at', name: 'Last Activity', type: 'datetime' },
    { key: 'timezone', name: 'Timezone' },
];

const state = reactive({
    refinedUserItems: computed(() => userPageState.users.map((user) => ({
        ...user,
        user_type: getUserType(user.user_type),
        last_accessed_at: calculateTime(user.last_accessed_at, state.timezone),
    }))),
    isSelected: computed(() => userPageState.selectedIndices.length > 0),
    dropdownMenu: computed(() => ([
        {
            type: 'item',
            name: 'update',
            label: i18n.t('IDENTITY.USER.MAIN.UPDATE'),
            disabled: userPageState.selectedIndices.length > 1 || !state.isSelected,
        },
        {
            type: 'item', name: 'delete', label: i18n.t('IDENTITY.USER.MAIN.DELETE'), disabled: !state.isSelected,
        },
        { type: 'divider' },
        {
            type: 'item', name: 'enable', label: i18n.t('IDENTITY.USER.MAIN.ENABLE'), disabled: !state.isSelected,
        },
        {
            type: 'item', name: 'disable', label: i18n.t('IDENTITY.USER.MAIN.DISABLE'), disabled: !state.isSelected,
        },
    ] as MenuItem[])),
    keyItemSets: userSearchHandlers.keyItemSets as KeyItemSet[],
    valueHandlerMap: userSearchHandlers.valueHandlerMap,
    tags: userListApiQueryHelper.setKeyItemSets(userSearchHandlers.keyItemSets).queryTags,
    timezone: computed(() => store.state.user.timezone ?? 'UTC'),
});

const modalState = reactive({
    mode: '',
    title: '',
    subTitle: '',
    themeColor: undefined as string | undefined,
    visible: computed(() => userPageState.visibleStatusModal),
});
const userFormState = reactive({
    visible: computed(() => userPageState.visibleCreateModal || userPageState.visibleUpdateModal),
    updateMode: false,
    headerTitle: '',
    item: undefined as undefined | User,
    roleOfSelectedUser: '',
});

let userListApiQuery = userListApiQueryHelper.data;

const saveRoleOfSelectedUser = (index) => {
    const selectedUser = userPageState.users[index];
    const roleBindingsData = selectedUser?.role_bindings?.find((data) => data.role_info?.role_type === 'DOMAIN');
    if (roleBindingsData) userFormState.roleOfSelectedUser = roleBindingsData.role_info?.role_id;
    else userFormState.roleOfSelectedUser = '';
};

const handleSelect = async (index) => {
    userPageStore.$patch({ selectedIndices: index });
    if (index.length === 1) saveRoleOfSelectedUser(index);
};

const handleChange = async (options: any = {}) => {
    userListApiQuery = getApiQueryWithToolboxOptions(userListApiQueryHelper, options) ?? userListApiQuery;
    if (options.queryTags !== undefined) {
        await replaceUrlQuery('filters', userListApiQueryHelper.rawQueryStrings);
    }
    await userPageStore.listUsers(userListApiQuery);
};

const handleExport = async () => {
    await downloadExcel({
        url: '/identity/user/list',
        param: {
            query: userListApiQuery,
            include_role_binding: true,
        },
        fields: excelFields,
        file_name_prefix: FILE_NAME_PREFIX.user,
        timezone: state.timezone,
    });
};
const getUserType = (userType: UserType) => {
    let formattedUserType: string;
    if (userType === USER_TYPE.API_USER) formattedUserType = 'API Only';
    else formattedUserType = 'Console, API';
    return formattedUserType;
};

/* Modal */
const clickAdd = () => {
    userFormState.updateMode = false;
    userFormState.headerTitle = i18n.t('IDENTITY.USER.FORM.ADD_TITLE') as string;
    userFormState.item = undefined;
    userPageStore.$patch({ visibleCreateModal: true });
};
const clickUpdate = () => {
    userFormState.updateMode = true;
    userFormState.headerTitle = i18n.t('IDENTITY.USER.FORM.UPDATE_TITLE') as string;
    userFormState.item = userPageState.users[userPageState.selectedIndices[0]];
    userPageStore.$patch({ visibleUpdateModal: true });
};
const clickDelete = () => {
    modalState.mode = 'delete';
    modalState.title = i18n.t('IDENTITY.USER.MAIN.DELETE_MODAL_TITLE') as string;
    modalState.subTitle = i18n.tc('IDENTITY.USER.MAIN.DELETE_MODAL_DESC', userPageState.selectedIndices.length);
    modalState.themeColor = 'alert';
    userPageStore.$patch({ visibleStatusModal: true });
};
const clickEnable = () => {
    modalState.mode = 'enable';
    modalState.title = i18n.t('IDENTITY.USER.MAIN.ENABLE_MODAL_TITLE') as string;
    modalState.subTitle = i18n.tc('IDENTITY.USER.MAIN.ENABLE_MODAL_DESC', userPageState.selectedIndices.length);
    modalState.themeColor = 'safe';
    userPageStore.$patch({ visibleStatusModal: true });
};
const clickDisable = () => {
    modalState.mode = 'disable';
    modalState.title = i18n.t('IDENTITY.USER.MAIN.DISABLE_MODAL_TITLE') as string;
    modalState.subTitle = i18n.tc('IDENTITY.USER.MAIN.DISABLE_MODAL_DESC', userPageState.selectedIndices.length);
    modalState.themeColor = 'alert';
    userPageStore.$patch({ visibleStatusModal: true });
};

const handleSelectDropdown = (name) => {
    switch (name) {
    case 'enable': clickEnable(); break;
    case 'disable': clickDisable(); break;
    case 'delete': clickDelete(); break;
    case 'update': clickUpdate(); break;
    default: break;
    }
};

const bindRole = async (userId, roleId) => {
    await SpaceConnector.clientV2.identity.roleBinding.create<RoleCreateParameters>({
        user_id: userId,
        role_id: roleId,
    });
};
const unbindRole = async (userId) => {
    const { results } = await SpaceConnector.clientV2.identity.roleBinding.list<RoleListParameters, ListResponse<RoleBindingModel>>({
        user_id: userId,
    });
    const roleBindingId = results?.[0].role_binding_id;
    if (roleBindingId) {
        await SpaceConnector.clientV2.identity.roleBinding.delete<RoleDeleteParameters>({
            role_binding_id: roleBindingId,
        });
    }
};
const addUser = async (item, roleId) => {
    userPageStore.$patch({
        modalLoading: true,
    });
    try {
        await SpaceConnector.clientV2.identity.user.create<UserCreateParameters>({
            ...item,
        });
        showSuccessMessage(i18n.t('IDENTITY.USER.MAIN.ALT_S_ADD_USER'), '');
        if (roleId.length > 0 || roleId !== '') {
            await bindRole(item.user_id, roleId);
        }
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('IDENTITY.USER.MAIN.ALT_E_ADD_USER'));
    } finally {
        userPageStore.$patch({
            selectedIndices: [],
            visibleCreateModal: false,
            modalLoading: false,
        });
    }
};
const updateUser = async (item, roleId) => {
    userPageStore.$patch({
        modalLoading: true,
    });
    try {
        await SpaceConnector.clientV2.identity.user.update({
            ...item,
        });
        if (roleId && roleId !== userFormState.roleOfSelectedUser) {
            await bindRole(item.user_id, roleId);
            userFormState.roleOfSelectedUser = roleId;
        }
        if (!roleId && userFormState.roleOfSelectedUser !== '') {
            await unbindRole(item.user_id);
            userFormState.roleOfSelectedUser = roleId;
        }
        showSuccessMessage(i18n.t('IDENTITY.USER.MAIN.ALT_S_UPDATE_USER'), '');
    } catch (e: any) {
        if (e.code === 'ERROR_UNABLE_TO_RESET_PASSWORD_IN_EXTERNAL_AUTH') {
            showErrorMessage(e.message, '');
        } else if (e.code === 'ERROR_PASSWORD_NOT_CHANGED') {
            ErrorHandler.handleRequestError(e, i18n.t('IDENTITY.USER.MAIN.ALT_E_SAME_PASSWORD'));
        } else {
            ErrorHandler.handleRequestError(e, i18n.t('IDENTITY.USER.MAIN.ALT_E_UPDATE_USER'));
        }
    } finally {
        await userPageStore.listUsers(userListApiQuery);
        userPageStore.$patch({
            selectedIndices: [],
            visibleUpdateModal: false,
            modalLoading: false,
        });
    }
};

const handleUserFormConfirm = async (item, roleId) => {
    if (userFormState.updateMode) {
        await updateUser(item, roleId);
    } else {
        await addUser(item, roleId);
    }
    await userPageStore.listUsers(userListApiQuery);
};
const handleUserStatusModalConfirm = () => {
    userPageStore.listUsers(userListApiQuery);
};

(async () => {
    await userPageStore.listUsers(userListApiQuery);
})();
</script>

<template>
    <section class="user-management-table">
        <p-toolbox-table
            search-type="query"
            searchable
            selectable
            sortable
            :loading="userPageState.loading"
            :items="state.refinedUserItems"
            :select-index="userPageState.selectedIndices"
            :fields="fields"
            sort-by="name"
            :sort-desc="true"
            :total-count="userPageState.totalCount"
            :key-item-sets="state.keyItemSets"
            :value-handler-map="state.valueHandlerMap"
            :query-tags="state.tags"
            :style="{height: `${props.tableHeight}px`}"
            @select="handleSelect"
            @change="handleChange"
            @refresh="handleChange()"
            @export="handleExport"
        >
            <template #toolbox-left>
                <p-button style-type="primary"
                          icon-left="ic_plus_bold"
                          :disabled="props.manageDisabled"
                          @click="clickAdd"
                >
                    {{ $t('IDENTITY.USER.MAIN.ADD') }}
                </p-button>
                <p-select-dropdown class="left-toolbox-item"
                                   :menu="state.dropdownMenu"
                                   :placeholder="$t('IDENTITY.USER.MAIN.ACTION')"
                                   :disabled="props.manageDisabled"
                                   @select="handleSelectDropdown"
                />
            </template>
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
            <template #col-tags-format="{value}">
                <template v-if="!!Object.keys(value).length">
                    <p-badge v-for="([key, val], idx) in Object.entries(value)"
                             :key="`${key}-${val}-${idx}`"
                             badge-type="subtle"
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
        </p-toolbox-table>
        <user-management-status-modal v-if="modalState.visible"
                                      :header-title="modalState.title"
                                      :sub-title="modalState.subTitle"
                                      :theme-color="modalState.themeColor"
                                      :mode="modalState.mode"
                                      @confirm="handleUserStatusModalConfirm()"
        />
        <user-management-form-modal v-if="userPageState.visibleCreateModal || userPageState.visibleUpdateModal"
                                    :header-title="userFormState.headerTitle"
                                    :item="userFormState.item"
                                    @confirm="handleUserFormConfirm"
        />
    </section>
</template>

<style lang="postcss" scoped>
.left-toolbox-item {
    min-width: 6.5rem;
    margin-left: 1rem;
    &:last-child {
        flex-grow: 1;
    }
}
</style>
