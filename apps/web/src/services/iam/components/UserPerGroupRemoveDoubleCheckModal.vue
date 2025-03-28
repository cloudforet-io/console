<script lang="ts" setup>
import { reactive } from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { PButtonModal } from '@cloudforet/mirinae';

import type { UserGroupRemoveUsersParameters } from '@/api-clients/identity/user-group/schema/api-verbs/remove-users';
import type { UserGroupModel } from '@/api-clients/identity/user-group/schema/model';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { USER_GROUP_MODAL_TYPE } from '@/services/iam/constants/user-group-constant';
import { useUserGroupPageStore } from '@/services/iam/store/user-group-page-store';

const emit = defineEmits<{(e: 'confirm'): void; }>();

const userGroupPageStore = useUserGroupPageStore();
const userGroupPageState = userGroupPageStore.state;
const userGroupPageGetters = userGroupPageStore.getters;

const state = reactive({
    loading: false,
});

/* Component */
const handleConfirm = async () => {
    try {
        const users: (string | undefined)[] = [];
        userGroupPageState.users.selectedIndices.forEach((d: number) => {
            if (userGroupPageState.users.list) users.push(userGroupPageState.users.list[d]?.user_id);
        });
        await fetchRemoveUser({
            user_group_id: userGroupPageGetters.selectedUserGroups[0].user_group_id,
            users,
        });
        emit('confirm');
        showSuccessMessage('', i18n.t('IAM.USER_GROUP.MODAL.REMOVE_USER.SHOW_SUCCESS_MESSAGE'));
    } finally {
        state.loading = false;
        handleCancel();
        userGroupPageStore.$patch((_state) => {
            _state.state.users.selectedIndices = [];
        });
    }
};

const handleCancel = () => {
    state.loading = false;
    userGroupPageState.modal = {
        type: '',
        title: '',
        themeColor: 'primary',
    };
};

/* API */
const fetchRemoveUser = async (params: UserGroupRemoveUsersParameters) => {
    try {
        await SpaceConnector.clientV2.identity.userGroup.removeUsers<UserGroupRemoveUsersParameters, UserGroupModel>(params);
    } catch (e) {
        ErrorHandler.handleError(e, true);
    }
};
</script>

<template>
    <p-button-modal size="sm"
                    :header-title="userGroupPageState.modal.title"
                    :loading="state.loading"
                    :visible="userGroupPageState.modal.type === USER_GROUP_MODAL_TYPE.REMOVE_USER"
                    :theme-color="userGroupPageState.modal.themeColor"
                    @confirm="handleConfirm"
                    @cancel="handleCancel"
    >
        <template #confirm-button>
            <span>{{ $t('IAM.USER_GROUP.TAB.USERS.REMOVE') }}</span>
        </template>
    </p-button-modal>
</template>
