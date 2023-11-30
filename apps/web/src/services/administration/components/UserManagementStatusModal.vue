<template>
    <p-table-check-modal
        v-if="!!mode"
        :visible="userPageState.visibleStatusModal"
        :header-title="headerTitle"
        :sub-title="subTitle"
        :theme-color="themeColor"
        :fields="fields"
        :items="userPageStore.selectedUsers"
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

import type { UserDeleteRequestParams } from '@/schema/identity/user/api-verbs/delete';
import type { UserDisableRequestParams } from '@/schema/identity/user/api-verbs/disable';
import type { UserEnableRequestParams } from '@/schema/identity/user/api-verbs/enable';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { userStateFormatter } from '@/services/administration/helpers/user-management-tab-helper';
import { useUserPageStore } from '@/services/administration/store/user-page-store';


export default {
    name: 'UserManagementStatusModal',
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
        const userPageState = userPageStore.$state;

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

        const deleteUser = async (userId: string): Promise<boolean> => {
            try {
                await SpaceConnector.clientV2.identity.user.delete<UserDeleteRequestParams>({
                    user_id: userId,
                });
                return true;
            } catch (e) {
                return false;
            }
        };
        const enableUser = async (userId: string): Promise<boolean> => {
            try {
                await SpaceConnector.clientV2.identity.user.enable<UserEnableRequestParams>({
                    user_id: userId,
                });
                return true;
            } catch (e) {
                return false;
            }
        };
        const disableUser = async (userId: string): Promise<boolean> => {
            try {
                await SpaceConnector.clientV2.identity.user.disable<UserDisableRequestParams>({
                    user_id: userId,
                });
                return true;
            } catch (e) {
                return false;
            }
        };
        const checkModalConfirm = async (items) => {
            let responses: boolean[] = [];
            let languagePrefix = 'DELETE';

            if (props.mode === 'delete') {
                responses = await Promise.all(map(items, (item) => deleteUser(item.user_id)));
                userPageStore.$patch({ selectedIndices: [] });
            } else if (props.mode === 'enable') {
                languagePrefix = 'ENABLE';
                responses = await Promise.all(map(items, (item) => enableUser(item.user_id)));
            } else if (props.mode === 'disable') {
                languagePrefix = 'DISABLE';
                responses = await Promise.all(map(items, (item) => disableUser(item.user_id)));
            }

            const successCount = responses.filter((d) => d).length;
            const failCount = responses.length - successCount;
            if (successCount > 0) {
                const languageCode = `IDENTITY.USER.MAIN.ALT_S_${languagePrefix}_USER`;
                showSuccessMessage(vm.$tc(languageCode, successCount), '');
            } if (failCount > 0) {
                const languageCode = `IDENTITY.USER.MAIN.ALT_E_${languagePrefix}_USER`;
                ErrorHandler.handleRequestError(new Error(''), vm.$tc(languageCode, failCount));
            }
            emit('confirm');
            userPageStore.$patch({ visibleStatusModal: false });
        };

        const handleClose = () => {
            userPageStore.$patch({ visibleStatusModal: false });
        };

        return {
            userStateFormatter,
            ...toRefs(state),
            userPageStore,
            userPageState,
            checkModalConfirm,
            handleClose,
        };
    },
};
</script>
