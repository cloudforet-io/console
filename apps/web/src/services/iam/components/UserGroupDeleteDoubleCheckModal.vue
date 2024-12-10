<script lang="ts" setup>
import { computed, reactive } from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { PDoubleCheckModal } from '@cloudforet/mirinae';

import type { UserGroupDeleteUserGroupParameters } from '@/schema/identity/user-group/api-verbs/delete';
import type { UserGroupModel } from '@/schema/identity/user-group/model';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { USER_GROUP_MODAL_TYPE } from '@/services/iam/constants/user-group-constant';
import { useUserGroupPageStore } from '@/services/iam/store/user-group-page-store';

const userGroupPageStore = useUserGroupPageStore();
const userGroupPageState = userGroupPageStore.state;
const userGroupPageGetters = userGroupPageStore.getters;

const storeState = reactive({
    selectedUserGroupIds: computed(() => userGroupPageGetters.selectedUserGroups.map((userGroup) => userGroup.user_group_id)),
});

const state = reactive({
    loading: false,
});

/* Component */
const handleConfirm = () => {
    try {
        state.loading = true;
        storeState.selectedUserGroupIds.forEach((userGroupId) => {
            fetchDeleteUserGroup({
                user_group_id: userGroupId,
            });
        });
    } finally {
        state.loading = false;
    }
};

const handleCancel = () => {
    console.log('cancel');
    state.loading = false;
    userGroupPageStore.$patch((_state) => {
        _state.state.modal.type = '';
    });
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
    <div class="user-group-delete-double-check-modal">
        <p-double-check-modal modal-size="sm"
                              :header-title="userGroupPageState.modal.title"
                              :loading="state.loading"
                              :visible="userGroupPageState.modal.type === USER_GROUP_MODAL_TYPE.DELETE"
                              verification-text="Delete"
                              @canfirm="handleConfirm"
                              @cancel="handleCancel"
        />
    </div>
</template>

<style scoped lang="postcss">
.user-group-delete-double-check-modal {
    min-height: 37.25rem;
}
</style>
