<script lang="ts" setup>
import { reactive } from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { PButtonModal } from '@cloudforet/mirinae';

import type { UserGroupRemoveUsersParameters } from '@/schema/identity/user-group/api-verbs/remove-users';
import type { UserGroupModel } from '@/schema/identity/user-group/model';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { USER_GROUP_MODAL_TYPE } from '@/services/iam/constants/user-group-constant';
import { useUserGroupPageStore } from '@/services/iam/store/user-group-page-store';

const userGroupPageStore = useUserGroupPageStore();
const userGroupPageState = userGroupPageStore.state;
const userGroupPageGetters = userGroupPageStore.getters;

const state = reactive({
    loading: false,
});

/* Component */
const handleConfirm = () => {
    try {
        const users: (string | undefined)[] = [];
        userGroupPageState.users.selectedIndices.forEach((d: number) => {
            if (userGroupPageState.users.list) users.push(userGroupPageState.users.list[d]?.user_id);
        });
        fetchRemoveUser({
            user_group_id: userGroupPageGetters.selectedUserGroups[0].user_group_id,
            users,
        });
    } finally {
        state.loading = false;
        handleCancel();
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
