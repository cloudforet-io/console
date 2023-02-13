<template>
    <section class="user-management-table">
        <p-toolbox-table
            search-type="query"
            searchable
            selectable
            sortable
            exportable
            :loading="loading"
            :items="users"
            :select-index.sync="selectedIndex"
            :fields="fields"
            :sort-by.sync="sortBy"
            :sort-desc="true"
            :total-count="totalCount"
            :key-item-sets="keyItemSets"
            :value-handler-map="valueHandlerMap"
            :query-tags="tags"
            :style="{height: `${tableHeight}px`}"
            @select="handleSelect"
            @change="handleChange"
            @refresh="handleChange()"
            @export="handleExport"
        >
            <template slot="toolbox-left">
                <p-button style-type="primary"
                          icon-left="ic_plus_bold"
                          :disabled="manageDisabled"
                          @click="clickAdd"
                >
                    {{ $t('IDENTITY.USER.MAIN.ADD') }}
                </p-button>
                <p-select-dropdown class="left-toolbox-item"
                                   :items="dropdownMenu"
                                   :disabled="manageDisabled"
                                   @select="handleSelectDropdown"
                >
                    {{ $t('IDENTITY.USER.MAIN.ACTION') }}
                </p-select-dropdown>
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
        <user-management-modal v-if="modalState.visible"
                               :visible="modalState.visible"
                               :header-title="modalState.title"
                               :sub-title="modalState.subTitle"
                               :theme-color="modalState.themeColor"
                               :mode="modalState.mode"
                               @confirm="listUsers()"
        />
        <user-create-modal v-if="userFormState.visible && !userFormState.updateMode"
                           :header-title="userFormState.headerTitle"
                           :item="userFormState.item"
                           :visible.sync="userFormState.visible"
                           @confirm="handleUserFormConfirm"
        />
        <user-update-modal v-if="userFormState.visible && userFormState.updateMode"
                           :header-title="userFormState.headerTitle"
                           :update-mode="userFormState.updateMode"
                           :item="userFormState.item"
                           :visible.sync="userFormState.visible"
                           @confirm="handleUserFormConfirm"
        />
    </section>
</template>

<script lang="ts">

import {
    computed, getCurrentInstance, reactive, toRefs, watch,
} from 'vue';
import type { Vue } from 'vue/types/vue';

import {
    PBadge,
    PButton,
    PSelectDropdown,
    PStatus, PToolboxTable,
} from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';
import type { KeyItemSet } from '@spaceone/design-system/types/inputs/search/query-search/type';

import { getApiQueryWithToolboxOptions } from '@cloudforet/core-lib/component-util/toolbox';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { store } from '@/store';
import { i18n } from '@/translations';

import { FILE_NAME_PREFIX } from '@/lib/excel-export';
import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';
import { replaceUrlQuery } from '@/lib/router-query-string';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { userSearchHandlers } from '@/services/administration/iam/user/lib/config';
import { calculateTime, userStateFormatter } from '@/services/administration/iam/user/lib/helper';
import UserCreateModal from '@/services/administration/iam/user/modules/user-management-modal/UserCreateModal.vue';
import UserManagementModal
    from '@/services/administration/iam/user/modules/user-management-modal/UserManagementModal.vue';
import UserUpdateModal from '@/services/administration/iam/user/modules/user-management-modal/UserUpdateModal.vue';
import type { User, UserType } from '@/services/administration/iam/user/type';
import { USER_TYPE } from '@/services/administration/iam/user/type';
import { administrationStore } from '@/services/administration/store';
import { MODAL_TYPE } from '@/services/administration/store/user/type';

export default {
    name: 'UserManagementTable',
    components: {
        UserManagementModal,
        PToolboxTable,
        PButton,
        UserCreateModal,
        UserUpdateModal,
        PStatus,
        PSelectDropdown,
        PBadge,
    },
    props: {
        tableHeight: {
            type: Number,
            default: 400,
        },
        manageDisabled: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, { emit }) {
        const vm = getCurrentInstance()?.proxy as Vue;
        const userListApiQueryHelper = new ApiQueryHelper()
            .setPageStart(1).setPageLimit(15)
            .setSort('name', true)
            .setFiltersAsRawQueryString(vm.$route.query.filters);

        const state = reactive({
            loading: false,
            users: [] as User[],
            timezone: computed(() => store.state.user.timezone || 'UTC'),
            fields: computed(() => ([
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
            ])),
            excelFields: [
                { key: 'user_id', name: 'User ID' },
                { key: 'name', name: 'Name' },
                { key: 'state', name: 'State' },
                { key: 'user_type', name: 'Access Control' },
                { key: 'api_key_count', name: 'API Key' },
                { key: 'role_bindings.role_info.name', name: 'Role' },
                { key: 'backend', name: 'Auth Type' },
                { key: 'last_accessed_at', name: 'Last Activity', type: 'datetime' },
                { key: 'timezone', name: 'Timezone' },
            ],
            sortBy: 'name',
            totalCount: 0,
            // selected
            selectedIndex: [],
            selectedUsers: computed(() => {
                const users = [] as User[];
                state.selectedIndex.map((d) => users.push(state.users[d]));
                return users;
            }) || [],
            isSelected: computed(() => state.selectedIndex.length > 0),
            dropdownMenu: computed(() => ([
                {
                    type: 'item',
                    name: 'update',
                    label: vm.$t('IDENTITY.USER.MAIN.UPDATE'),
                    disabled: state.selectedIndex.length > 1 || !state.isSelected,
                },
                {
                    type: 'item', name: 'delete', label: vm.$t('IDENTITY.USER.MAIN.DELETE'), disabled: !state.isSelected,
                },
                { type: 'divider' },
                {
                    type: 'item', name: 'enable', label: vm.$t('IDENTITY.USER.MAIN.ENABLE'), disabled: !state.isSelected,
                },
                {
                    type: 'item', name: 'disable', label: vm.$t('IDENTITY.USER.MAIN.DISABLE'), disabled: !state.isSelected,
                },
            ] as MenuItem[])),
            keyItemSets: userSearchHandlers.keyItemSets as KeyItemSet[],
            valueHandlerMap: userSearchHandlers.valueHandlerMap,
            tags: userListApiQueryHelper.setKeyItemSets(userSearchHandlers.keyItemSets).queryTags,
        });

        const modalState = reactive({
            mode: '',
            title: '',
            subTitle: '',
            themeColor: undefined as string | undefined,
            isManagementModalVisible: computed(() => administrationStore.getters['user/isManagementModalVisible']),
            visible: computed(() => modalState.isManagementModalVisible),
        });
        const userFormState = reactive({
            visible: computed(() => userFormState.isCreateModalVisible || userFormState.isUpdateModalVisible),
            updateMode: false,
            headerTitle: '',
            item: undefined,
            roleOfSelectedUser: '',
            isCreateModalVisible: computed(() => administrationStore.getters['user/isCreateModalVisible']),
            isUpdateModalVisible: computed(() => administrationStore.getters['user/isUpdateModalVisible']),
        });

        const getArrayWithNotDuplicatedItem = (array) => [...new Set(array)];
        const getUserType = (userType: UserType) => {
            let formattedUserType;
            if (userType === USER_TYPE.API_USER) formattedUserType = 'API Only';
            else formattedUserType = 'Console, API';
            return formattedUserType;
        };

        let userListApiQuery = userListApiQueryHelper.data;
        const listUsers = async () => {
            state.loading = true;
            try {
                const res = await SpaceConnector.client.identity.user.list({
                    query: userListApiQuery,
                    only: ['user_id', 'name', 'email', 'state', 'timezone', 'user_type', 'backend', 'last_accessed_at', 'api_key_count', 'tags'],
                    include_role_binding: true,
                });
                state.users = res.results.map((d) => ({
                    ...d,
                    api_key_count: d.api_key_count || 0,
                    user_type: getUserType(d.user_type),
                    role_name: (getArrayWithNotDuplicatedItem(d.role_bindings.map((data) => data.role_info.name))).join(', '),
                    last_accessed_at: calculateTime(d.last_accessed_at, state.timezone),
                }));
                state.totalCount = res.total_count;
                state.selectedIndex = [];
            } catch (e) {
                ErrorHandler.handleError(e);
                state.users = [];
                state.totalCount = 0;
            } finally {
                state.loading = false;
            }
        };

        const saveRoleOfSelectedUser = (index) => {
            const selectedUser = state.users[index];
            const roleBindingsData = selectedUser.role_bindings?.find((data) => data.role_info?.role_type === 'DOMAIN');
            if (roleBindingsData) userFormState.roleOfSelectedUser = roleBindingsData.role_info?.role_id;
            else userFormState.roleOfSelectedUser = '';
        };

        const handleSelect = async (index) => {
            state.selectedIndex = index;
            if (index.length === 1) saveRoleOfSelectedUser(index);
        };

        const handleChange = async (options: any = {}) => {
            userListApiQuery = getApiQueryWithToolboxOptions(userListApiQueryHelper, options) ?? userListApiQuery;
            if (options.queryTags !== undefined) {
                await replaceUrlQuery('filters', userListApiQueryHelper.rawQueryStrings);
            }
            await listUsers();
        };

        const handleExport = async () => {
            await store.dispatch('file/downloadExcel', {
                url: '/identity/user/list',
                param: {
                    query: userListApiQuery,
                    include_role_binding: true,
                },
                fields: state.excelFields,
                file_name_prefix: FILE_NAME_PREFIX.user,
            });
        };

        /* Modal */
        const clickAdd = () => {
            userFormState.updateMode = false;
            userFormState.headerTitle = vm.$t('IDENTITY.USER.FORM.ADD_TITLE') as string;
            userFormState.item = undefined;
            administrationStore.dispatch('user/showModal', MODAL_TYPE.CREATE);
        };
        const clickUpdate = () => {
            userFormState.updateMode = true;
            userFormState.headerTitle = vm.$t('IDENTITY.USER.FORM.UPDATE_TITLE') as string;
            userFormState.item = state.users[state.selectedIndex[0]];
            administrationStore.dispatch('user/showModal', MODAL_TYPE.UPDATE);
        };
        const clickDelete = () => {
            modalState.mode = 'delete';
            modalState.title = vm.$t('IDENTITY.USER.MAIN.DELETE_MODAL_TITLE') as string;
            modalState.subTitle = vm.$tc('IDENTITY.USER.MAIN.DELETE_MODAL_DESC', state.selectedIndex.length);
            modalState.themeColor = 'alert';
            administrationStore.dispatch('user/showModal', MODAL_TYPE.MANAGEMENT);
        };
        const clickEnable = () => {
            modalState.mode = 'enable';
            modalState.title = vm.$t('IDENTITY.USER.MAIN.ENABLE_MODAL_TITLE') as string;
            modalState.subTitle = vm.$tc('IDENTITY.USER.MAIN.ENABLE_MODAL_DESC', state.selectedIndex.length);
            modalState.themeColor = 'safe';
            administrationStore.dispatch('user/showModal', MODAL_TYPE.MANAGEMENT);
        };
        const clickDisable = () => {
            modalState.mode = 'disable';
            modalState.title = vm.$t('IDENTITY.USER.MAIN.DISABLE_MODAL_TITLE') as string;
            modalState.subTitle = vm.$tc('IDENTITY.USER.MAIN.DISABLE_MODAL_DESC', state.selectedIndex.length);
            modalState.themeColor = 'alert';
            administrationStore.dispatch('user/showModal', MODAL_TYPE.MANAGEMENT);
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
            await SpaceConnector.client.identity.roleBinding.create({
                resource_type: 'identity.User',
                resource_id: userId,
                role_id: roleId,
            });
        };
        const unbindRole = async (userId, roleId) => {
            const res = await SpaceConnector.client.identity.roleBinding.list({
                resource_type: 'identity.User',
                resource_id: userId,
                role_id: roleId,
                role_type: 'DOMAIN',
            });
            const roleBindingId = res.results[0].role_binding_id;
            if (res.total_count > 0) {
                await SpaceConnector.client.identity.roleBinding.delete({
                    role_binding_id: roleBindingId,
                });
            }
        };
        const addUser = async (item, roleId) => {
            try {
                await SpaceConnector.client.identity.user.create({
                    ...item,
                });
                if (roleId.length > 0 || roleId !== '') {
                    await bindRole(item.user_id, roleId);
                }
                showSuccessMessage(i18n.t('IDENTITY.USER.MAIN.ALT_S_ADD_USER'), '');
            } catch (e) {
                ErrorHandler.handleRequestError(e, vm.$t('IDENTITY.USER.MAIN.ALT_E_ADD_USER'));
            } finally {
                state.selectedIndex = [];
            }
        };
        const updateUser = async (item, roleId) => {
            try {
                await SpaceConnector.client.identity.user.update({
                    ...item,
                });
                if (roleId && roleId !== userFormState.roleOfSelectedUser) {
                    await bindRole(item.user_id, roleId);
                    userFormState.roleOfSelectedUser = roleId;
                }
                if (roleId === '' && userFormState.roleOfSelectedUser !== '') {
                    await unbindRole(item.user_id, roleId);
                    userFormState.roleOfSelectedUser = roleId;
                }
                showSuccessMessage(i18n.t('IDENTITY.USER.MAIN.ALT_S_UPDATE_USER'), '');
            } catch (e) {
                ErrorHandler.handleRequestError(e, vm.$t('IDENTITY.USER.MAIN.ALT_E_UPDATE_USER'));
            } finally {
                await listUsers();
                state.selectedIndex = [];
            }
        };

        const handleUserFormConfirm = async (item, roleId) => {
            if (userFormState.updateMode) {
                await updateUser(item, roleId);
            } else {
                await addUser(item, roleId);
            }
            await listUsers();
        };

        (async () => {
            await listUsers();
        })();

        const saveSelectedValueToStore = (selectedIndex: number[]) => {
            administrationStore.dispatch('user/selectIndex', selectedIndex);
            administrationStore.dispatch('user/selectUsers', state.selectedUsers);
        };

        watch(() => state.selectedIndex, (after) => {
            saveSelectedValueToStore(after);
        });

        watch(() => state.totalCount, (value: number) => {
            emit('update-total-count', value);
        });

        return {
            ...toRefs(state),
            userFormState,
            userStateFormatter,
            modalState,
            listUsers,
            clickAdd,
            handleSelectDropdown,
            handleUserFormConfirm,
            handleSelect,
            handleChange,
            handleExport,
        };
    },

};
</script>

<style lang="postcss" scoped>
.left-toolbox-item {
    margin-left: 1rem;
    &:last-child {
        flex-grow: 1;
    }
}
</style>
