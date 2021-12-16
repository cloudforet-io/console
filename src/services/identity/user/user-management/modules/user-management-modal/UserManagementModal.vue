<template>
    <p-table-check-modal
        v-if="!!mode"
        :visible.sync="visible"
        :header-title="headerTitle"
        :sub-title="subTitle"
        :theme-color="themeColor"
        :fields="fields"
        size="md"
        :selectable="false"
        :items="selectedUsers"
        @confirm="checkModalConfirm"
        @cancel="handleClose"
        @close="handleClose"
    >
        <template #col-state-format="{value}">
            <p-status v-bind="userStateFormatter(value)" class="capitalize" />
        </template>
        <template #col-last_accessed_at-format="{ value }">
            <span v-if="value === -1">
                No Activity
            </span>
            <span v-if="value === 0">
                {{ $t('IDENTITY.USER.MAIN.TODAY') }}
            </span>
            <span v-else-if="value === 1">
                {{ $t('IDENTITY.USER.MAIN.YESTERDAY') }}
            </span>
            <span v-else>
                {{ value }} {{ $t('IDENTITY.USER.MAIN.DAYS') }}
            </span>
        </template>
    </p-table-check-modal>
</template>

<script lang="ts">
import {
    PStatus, PTableCheckModal,
} from '@spaceone/design-system';
import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { userStateFormatter } from '@/services/identity/user/lib/helper';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';
import { map } from 'lodash';
import { store } from '@/store';
import { User } from '@/services/identity/user/type';

export default {
    name: 'UserManagementModal',
    components: {
        PStatus,
        PTableCheckModal,
    },
    props: {
        headerTitle: {
            type: String,
            required: true,
        },
        subTitle: {
            type: String,
            default: '',
        },
        themeColor: {
            type: String,
            default: 'alert',
        },
        mode: {
            type: String,
            default: '',
        },
    },
    setup(props, { emit, root }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
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
            visible: computed({
                get() { return store.getters['service/user/isManagementModalVisible']; },
                set(val) { store.commit('service/user/setVisibleManagementModal', val); },
            }),
            selectedIndex: computed<number[]>(() => store.state.service.user.selectedIndex),
            selectedUsers: computed<User[]>(() => store.state.service.user.selectedUsers),
        });

        const clickDelete = () => {
            props.mode = 'delete';
            props.headerTitle = vm.$t('IDENTITY.USER.MAIN.DELETE_MODAL_TITLE') as string;
            props.subTitle = vm.$tc('IDENTITY.USER.MAIN.DELETE_MODAL_DESC', state.selectedIndex.length);
            props.themeColor = 'alert';
        };
        const clickEnable = () => {
            props.mode = 'enable';
            props.headerTitle = vm.$t('IDENTITY.USER.MAIN.ENABLE_MODAL_TITLE') as string;
            props.subTitle = vm.$tc('IDENTITY.USER.MAIN.ENABLE_MODAL_DESC', state.selectedIndex.length);
            props.themeColor = 'safe';
        };
        const clickDisable = () => {
            props.mode = 'disable';
            props.headerTitle = vm.$t('IDENTITY.USER.MAIN.DISABLE_MODAL_TITLE') as string;
            props.subTitle = vm.$tc('IDENTITY.USER.MAIN.DISABLE_MODAL_DESC', state.selectedIndex.length);
            props.themeColor = 'alert';
        };

        const onSelectDropdown = (name) => {
            switch (name) {
            case 'enable': clickEnable(); break;
            case 'disable': clickDisable(); break;
            case 'delete': clickDelete(); break;
            default: break;
            }
        };

        const getUsersParam = items => ({ users: map(items, 'user_id') });

        const deleteUser = async (items) => {
            try {
                await SpaceConnector.client.identity.user.delete(getUsersParam(items));
                showSuccessMessage(vm.$tc('IDENTITY.USER.MAIN.ALT_S_DELETE_USER', state.selectedIndex.length), '', root);
            } catch (e) {
                ErrorHandler.handleRequestError(e, vm.$tc('IDENTITY.USER.MAIN.ALT_E_DELETE_USER', state.selectedIndex.length));
            } finally {
                emit('confirm');
                state.visible = false;
            }
        };
        const enableUser = async (items) => {
            try {
                await SpaceConnector.client.identity.user.enable(getUsersParam(items));
                showSuccessMessage(vm.$tc('IDENTITY.USER.MAIN.ALT_S_ENABLE', state.selectedIndex.length), '', root);
            } catch (e) {
                ErrorHandler.handleRequestError(e, vm.$tc('IDENTITY.USER.MAIN.ALT_E_ENABLE', state.selectedIndex.length));
            } finally {
                emit('confirm');
                state.visible = false;
            }
        };
        const disableUser = async (items) => {
            try {
                await SpaceConnector.client.identity.user.disable(getUsersParam(items));
                showSuccessMessage(vm.$tc('IDENTITY.USER.MAIN.ALT_S_DISABLE', state.selectedIndex.length), '', root);
            } catch (e) {
                ErrorHandler.handleRequestError(e, vm.$tc('IDENTITY.USER.MAIN.ALT_E_DISABLE', state.selectedIndex.length));
            } finally {
                emit('confirm');
                state.visible = false;
            }
        };
        const checkModalConfirm = async (item) => {
            if (props.mode === 'delete') await deleteUser(item);
            else if (props.mode === 'enable') await enableUser(item);
            else if (props.mode === 'disable') await disableUser(item);
        };

        const handleClose = () => {
            state.visible = false;
        };

        return {
            userStateFormatter,
            ...toRefs(state),
            onSelectDropdown,
            checkModalConfirm,
            handleClose,
        };
    },
};
</script>
