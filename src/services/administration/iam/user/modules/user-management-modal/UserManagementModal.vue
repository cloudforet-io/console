<template>
    <p-table-check-modal
        v-if="!!mode"
        :visible.sync="visible"
        :header-title="headerTitle"
        :sub-title="subTitle"
        :theme-color="themeColor"
        :fields="fields"
        :items="selectedUsers"
        modal-size="md"
        @confirm="checkModalConfirm"
        @cancel="handleClose"
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

import type { SetupContext } from 'vue';
import {
    computed, getCurrentInstance, reactive, toRefs,
} from 'vue';
import type { Vue } from 'vue/types/vue';

import {
    PStatus, PTableCheckModal,
} from '@spaceone/design-system';
import { map } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { userStateFormatter } from '@/services/administration/iam/user/lib/helper';
import type { User } from '@/services/administration/iam/user/type';
import { administrationStore } from '@/services/administration/store';

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
    setup(props, { emit }: SetupContext) {
        const vm = getCurrentInstance()?.proxy as Vue;
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
                get() { return administrationStore.getters['user/isManagementModalVisible']; },
                set(val) { administrationStore.commit('user/setVisibleManagementModal', val); },
            }),
            selectedIndex: computed<number[]>(() => administrationStore.state.user.selectedIndex),
            selectedUsers: computed<User[]>(() => administrationStore.state.user.selectedUsers),
        });

        const getUsersParam = (items) => ({ users: map(items, 'user_id') });

        const deleteUser = async (items) => {
            try {
                await SpaceConnector.client.identity.user.delete(getUsersParam(items));
                await administrationStore.dispatch('user/selectIndex', []);
                showSuccessMessage(i18n.tc('IDENTITY.USER.MAIN.ALT_S_DELETE_USER', state.selectedIndex.length), '');
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
                showSuccessMessage(vm.$tc('IDENTITY.USER.MAIN.ALT_S_ENABLE', state.selectedIndex.length), '', vm);
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
                showSuccessMessage(vm.$tc('IDENTITY.USER.MAIN.ALT_S_DISABLE', state.selectedIndex.length), '', vm);
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
            checkModalConfirm,
            handleClose,
        };
    },
};
</script>
