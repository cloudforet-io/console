<script lang="ts" setup>
import {
    getCurrentInstance, reactive,
} from 'vue';
import type { Vue } from 'vue/types/vue';

import {
    PStatus, PTableCheckModal,
} from '@spaceone/design-system';
import { cloneDeep, map } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { ROLE_TYPE } from '@/schema/identity/role/constant';
import type { UserDeleteParameters } from '@/schema/identity/user/api-verbs/delete';
import type { UserDisableParameters } from '@/schema/identity/user/api-verbs/disable';
import type { UserEnableParameters } from '@/schema/identity/user/api-verbs/enable';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { userStateFormatter } from '@/services/administration/composables/refined-table-data';
import { USER_MODAL_TYPE, USER_STATUS_TABLE_FIELDS } from '@/services/administration/constants/user-constant';
import { useUserPageStore } from '@/services/administration/store/user-page-store';

const vm = getCurrentInstance()?.proxy as Vue;

const userPageStore = useUserPageStore();
const userPageState = userPageStore.$state;

const emit = defineEmits<{(e: 'confirm'): void; }>();

const state = reactive({
    loading: false,
});

/* Component */
const checkModalConfirm = async (items) => {
    let responses: boolean[] = [];
    let languagePrefix = 'DELETE';
    state.loading = true;

    try {
        if (userPageStore.modal.type === USER_MODAL_TYPE.DELETE) {
            responses = await Promise.all(map(items, (item) => deleteUser(item.user_id)));
            userPageStore.$patch({ selectedIndices: [] });
        } else if (userPageStore.modal.type === USER_MODAL_TYPE.ENABLE) {
            languagePrefix = 'ENABLE';
            responses = await Promise.all(map(items, (item) => enableUser(item.user_id)));
        } else if (userPageStore.modal.type === USER_MODAL_TYPE.DISABLE) {
            languagePrefix = 'DISABLE';
            responses = await Promise.all(map(items, (item) => disableUser(item.user_id)));
        } else if (userPageStore.modal.type === USER_MODAL_TYPE.REMOVE) {
            languagePrefix = 'REMOVE';
            responses = await Promise.all(map(items, (item) => removeUser(item?.role_binding_info.role_binding_id)));
        }

        const successCount = responses.filter((d) => d).length;
        const failCount = responses.length - successCount;
        if (successCount > 0) {
            const languageCode = `IAM.USER.MAIN.MODAL.ALT_S_${languagePrefix}_USER`;
            showSuccessMessage(vm.$tc(languageCode, successCount), '');
            emit('confirm');
        } if (failCount > 0) {
            const languageCode = `IAM.USER.MAIN.MODAL.ALT_E_${languagePrefix}_USER`;
            ErrorHandler.handleRequestError(new Error(''), vm.$tc(languageCode, failCount));
        }
    } catch (e: any) {
        ErrorHandler.handleError(e);
    } finally {
        state.loading = false;
        handleClose();
    }
};
const handleClose = () => {
    userPageStore.$patch((_state) => {
        _state.modal.visible.status = false;
        _state.modal = cloneDeep(_state.modal);
    });
};

/* API */
const removeUser = async (role_binding_id: string): Promise<boolean> => {
    try {
        await SpaceConnector.clientV2.identity.roleBinding.delete({
            role_binding_id,
        });
        return true;
    } catch (e) {
        return false;
    }
};

const deleteUser = async (userId: string): Promise<boolean> => {
    try {
        await SpaceConnector.clientV2.identity.user.delete<UserDeleteParameters>({
            user_id: userId,
        });
        return true;
    } catch (e) {
        return false;
    }
};
const enableUser = async (userId: string): Promise<boolean> => {
    try {
        await SpaceConnector.clientV2.identity.user.enable<UserEnableParameters>({
            user_id: userId,
        });
        return true;
    } catch (e) {
        return false;
    }
};
const disableUser = async (userId: string): Promise<boolean> => {
    try {
        await SpaceConnector.clientV2.identity.user.disable<UserDisableParameters>({
            user_id: userId,
        });
        return true;
    } catch (e) {
        return false;
    }
};
</script>

<template>
    <p-table-check-modal :visible="userPageState.modal.visible.status"
                         :header-title="userPageState.modal.title"
                         :theme-color="userPageState.modal.themeColor"
                         :fields="USER_STATUS_TABLE_FIELDS"
                         :loading="state.loading"
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
        <template #col-role_type-format="{ value }">
            <span>
                {{ value === ROLE_TYPE.WORKSPACE_OWNER ? $t('IAM.USER.FORM.OWNER') : $t('IAM.USER.FORM.MEMBER') }}
            </span>
        </template>
    </p-table-check-modal>
</template>
