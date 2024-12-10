<script lang="ts" setup>
import {
    computed, reactive, ref, watch, watchEffect,
} from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { PButtonModal, PSelectDropdown } from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/inputs/context-menu/type';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { UserGroupAddUsersParameters } from '@/schema/identity/user-group/api-verbs/add-users';
import type { UserGroupModel } from '@/schema/identity/user-group/model';
import type { WorkspaceUserListParameters } from '@/schema/identity/workspace-user/api-verbs/list';
import type { WorkspaceUserModel } from '@/schema/identity/workspace-user/model';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { USER_GROUP_MODAL_TYPE } from '@/services/iam/constants/user-group-constant';
import { useUserGroupPageStore } from '@/services/iam/store/user-group-page-store';

const emit = defineEmits<{(e: 'confirm'): void; }>();

const userGroupPageStore = useUserGroupPageStore();
const userGroupPageState = userGroupPageStore.state;
const userGroupPageGetters = userGroupPageStore.getters;

const emailList = computed(() => userGroupPageState.users.list.map((user) => ({
    name: user.user_id,
    label: user.user_id,
})));
const allUsersList = ref<MenuItem[]>([]);
const selectedUserList = ref<MenuItem[]>();

const state = reactive({
    loading: false,
});


/* Watcher */
watchEffect(async () => {
    const response = await SpaceConnector.clientV2.identity.workspaceUser.list<WorkspaceUserListParameters, ListResponse<WorkspaceUserModel>>({});
    if (response.results && response.results.length > 0) {
        allUsersList.value = response?.results.map((result) => ({
            name: result.user_id,
            label: result.user_id,
        })) || [];
    }
});

watch(() => [emailList, allUsersList], ([nv_emailList, nv_allUsersList]) => {
    selectedUserList.value = nv_emailList.value.filter((f_user) => {
        if (nv_allUsersList.value.map((user) => user.label).includes(f_user.label)) {
            return true;
        }
        return false;
    });
}, { deep: true, immediate: true });

/* Component */
const handleConfirm = () => {
    state.loading = true;
    try {
        if (selectedUserList.value && selectedUserList.value.length > 0) {
            const addedUsers = selectedUserList.value.slice(userGroupPageState.users.totalCount, selectedUserList.value.length);
            fetchAddUsers({
                user_group_id: userGroupPageGetters.selectedUserGroups[0].user_group_id,
                users: addedUsers.map((user) => user.name),
            });
            emit('confirm');
        }
    } catch (e) {
        console.error(e);
    } finally {
        state.loading = false;
        handleClose();
    }
};

const handleClose = () => {
    userGroupPageState.modal.type = '';
};

const handleSelectedUserList = () => {
    console.log('here!!');
};

/* API */
const fetchAddUsers = async (params: UserGroupAddUsersParameters) => {
    try {
        const response = await SpaceConnector.clientV2.identity.userGroup.addUsers<UserGroupAddUsersParameters, UserGroupModel>(params);
        console.log(response);
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};
</script>

<template>
    <p-button-modal class="user-group-management-add-users-modal"
                    :header-title="userGroupPageState.modal.title"
                    :visible="userGroupPageState.modal.type === USER_GROUP_MODAL_TYPE.ADD_NEW_USER"
                    size="md"
                    :loading="state.loading"
                    @confirm="handleConfirm"
                    @cancel="handleClose"
                    @close="handleClose"
    >
        <template #body>
            <div class="modal-contents">
                <p>{{ $t('IAM.USER_GROUP.MODAL.ADD_NEW_USER.USER') }}</p>
                <p-select-dropdown :menu="allUsersList"
                                   :selected.sync="selectedUserList"
                                   multi-selectable
                                   show-select-marker
                                   is-filterable
                                   appearance-type="stack"
                                   @change="handleSelectedUserList"
                />
            </div>
        </template>
    </p-button-modal>
</template>

<style scoped lang="postcss">
.user-group-management-add-users-modal {
    min-height: 34.875rem;
    .modal-contents {
        @apply flex flex-col bg-primary-4 rounded-md;
        margin-bottom: 9rem;
        padding: 1rem;
        gap: 1rem;
    }
}
</style>
