<script lang="ts" setup>
import {
    getCurrentInstance, reactive,
} from 'vue';
import type { Vue } from 'vue/types/vue';

import {
    PStatus, PTableCheckModal,
} from '@spaceone/design-system';
import { map } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { ROLE_TYPE } from '@/schema/identity/role/constant';
import type { UserDeleteParameters } from '@/schema/identity/user/api-verbs/delete';
import type { UserDisableParameters } from '@/schema/identity/user/api-verbs/disable';
import type { UserEnableParameters } from '@/schema/identity/user/api-verbs/enable';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { userStateFormatter } from '@/services/administration/composables/refined-user-data';
import { USER_STATUS_TABLE_FIELDS } from '@/services/administration/constants/user-table-constant';
import { useUserModalSettingStore } from '@/services/administration/store/user-modal-setting-store';
import { useUserPageStore } from '@/services/administration/store/user-page-store';

const vm = getCurrentInstance()?.proxy as Vue;

const userPageStore = useUserPageStore();
const modalSettingStore = useUserModalSettingStore();
const modalSettingState = modalSettingStore.$state;

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
        if (modalSettingState.mode === 'delete') {
            responses = await Promise.all(map(items, (item) => deleteUser(item.user_id)));
            userPageStore.$patch({ selectedIndices: [] });
        } else if (modalSettingState.mode === 'enable') {
            languagePrefix = 'ENABLE';
            responses = await Promise.all(map(items, (item) => enableUser(item.user_id)));
        } else if (modalSettingState.mode === 'disable') {
            languagePrefix = 'DISABLE';
            responses = await Promise.all(map(items, (item) => disableUser(item.user_id)));
        } else if (modalSettingState.mode === 'remove') {
            languagePrefix = 'REMOVE';
            responses = await Promise.all(map(items, (item) => removeUser(item?.role_binding_info.role_binding_id)));
        }

        const successCount = responses.filter((d) => d).length;
        const failCount = responses.length - successCount;
        if (successCount > 0) {
            const languageCode = `IDENTITY.USER.MAIN.ALT_S_${languagePrefix}_USER`;
            showSuccessMessage(vm.$tc(languageCode, successCount), '');
            emit('confirm');
        } if (failCount > 0) {
            const languageCode = `IDENTITY.USER.MAIN.ALT_E_${languagePrefix}_USER`;
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
    modalSettingStore.$patch((_state) => {
        _state.visible.status = false;
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
    <p-table-check-modal :visible="modalSettingState.visible.status"
                         :header-title="modalSettingState.title"
                         :theme-color="modalSettingState.themeColor"
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
                {{ value === ROLE_TYPE.WORKSPACE_OWNER ? $t('IDENTITY.USER.FORM.OWNER') : $t('IDENTITY.USER.FORM.MEMBER') }}
            </span>
        </template>
    </p-table-check-modal>
</template>
