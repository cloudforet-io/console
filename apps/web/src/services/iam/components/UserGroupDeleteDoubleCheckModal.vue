<script lang="ts" setup>
import { computed, reactive } from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { PButtonModal } from '@cloudforet/mirinae';

import type { UserGroupDeleteUserGroupParameters } from '@/schema/identity/user-group/api-verbs/delete';
import type { UserGroupModel } from '@/schema/identity/user-group/model';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { USER_GROUP_MODAL_TYPE } from '@/services/iam/constants/user-group-constant';
import { useUserGroupPageStore } from '@/services/iam/store/user-group-page-store';

const emit = defineEmits<{(e: 'confirm'): void; }>();

const userGroupPageStore = useUserGroupPageStore();
const userGroupPageState = userGroupPageStore.state;
const userGroupPageGetters = userGroupPageStore.getters;

const storeState = reactive({
    selectedUserGroupIds: computed(() => userGroupPageGetters.selectedUserGroups.map((userGroup) => userGroup.user_group_id)),
    selectedUserGroupNames: computed(() => userGroupPageGetters.selectedUserGroups.map((userGroup) => userGroup.name)),
});

const state = reactive({
    loading: false,
});

/* Component */
const handleConfirm = () => {
    try {
        state.loading = true;
        storeState.selectedUserGroupIds.forEach(async (userGroupId) => {
            await fetchDeleteUserGroup({
                user_group_id: userGroupId,
            });
        });
        emit('confirm');
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
const fetchDeleteUserGroup = async (params: UserGroupDeleteUserGroupParameters) => {
    try {
        await SpaceConnector.clientV2.identity.userGroup.delete<UserGroupDeleteUserGroupParameters, UserGroupModel>(params);
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};
</script>

<template>
    <p-button-modal size="sm"
                    :header-title="userGroupPageState.modal.title"
                    :loading="state.loading"
                    :visible="userGroupPageState.modal.type === USER_GROUP_MODAL_TYPE.DELETE"
                    :theme-color="userGroupPageState.modal.themeColor"
                    @confirm="handleConfirm"
                    @cancel="handleCancel"
    />
</template>
