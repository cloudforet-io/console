<template>
    <p-table-check-modal
        v-if="!!mode"
        :visible="userPageState.visibleManagementModal"
        :header-title="headerTitle"
        :sub-title="subTitle"
        :theme-color="themeColor"
        :fields="fields"
        :items="userPageGetters.selectedUsers"
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
import { useUserPageStore } from '@/services/administration/store/user-page-store';


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
        const userPageStore = useUserPageStore();
        const userPageState = userPageStore.state;
        const userPageGetters = userPageStore.getters;

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
        });

        const getUsersParam = (items) => ({ users: map(items, 'user_id') });

        const deleteUser = async (items) => {
            try {
                await SpaceConnector.client.identity.user.delete(getUsersParam(items));
                userPageState.selectedIndices = [];
                showSuccessMessage(i18n.tc('IDENTITY.USER.MAIN.ALT_S_DELETE_USER', userPageState.selectedIndices.length), '');
            } catch (e) {
                ErrorHandler.handleRequestError(e, vm.$tc('IDENTITY.USER.MAIN.ALT_E_DELETE_USER', userPageState.selectedIndices.length));
            } finally {
                emit('confirm');
                userPageState.visibleManagementModal = false;
            }
        };
        const enableUser = async (items) => {
            try {
                await SpaceConnector.client.identity.user.enable(getUsersParam(items));
                showSuccessMessage(vm.$tc('IDENTITY.USER.MAIN.ALT_S_ENABLE', userPageState.selectedIndices.length), '');
            } catch (e) {
                ErrorHandler.handleRequestError(e, vm.$tc('IDENTITY.USER.MAIN.ALT_E_ENABLE', userPageState.selectedIndices.length));
            } finally {
                emit('confirm');
                userPageState.visibleManagementModal = false;
            }
        };
        const disableUser = async (items) => {
            try {
                await SpaceConnector.client.identity.user.disable(getUsersParam(items));
                showSuccessMessage(vm.$tc('IDENTITY.USER.MAIN.ALT_S_DISABLE', userPageState.selectedIndices.length), '');
            } catch (e) {
                ErrorHandler.handleRequestError(e, vm.$tc('IDENTITY.USER.MAIN.ALT_E_DISABLE', userPageState.selectedIndices.length));
            } finally {
                emit('confirm');
                userPageState.visibleManagementModal = false;
            }
        };
        const checkModalConfirm = async (item) => {
            if (props.mode === 'delete') await deleteUser(item);
            else if (props.mode === 'enable') await enableUser(item);
            else if (props.mode === 'disable') await disableUser(item);
        };

        const handleClose = () => {
            userPageState.visibleManagementModal = false;
        };

        return {
            userStateFormatter,
            ...toRefs(state),
            userPageState,
            userPageGetters,
            checkModalConfirm,
            handleClose,
        };
    },
};
</script>
