<script lang="ts" setup>
import { computed, reactive, watch } from 'vue';

import { useMutation, useQueryClient } from '@tanstack/vue-query';

import { PButtonModal } from '@cloudforet/mirinae';

import { useUserGroupApi } from '@/api-clients/identity/user-group/composables/use-user-group-api';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import UserGroupManagementAddGroupInfo from '@/services/iam/components/UserGroupManagementAddGroupInfo.vue';
import { USER_GROUP_MODAL_TYPE } from '@/services/iam/constants/user-group-constant';
import { useUserGroupPageStore } from '@/services/iam/store/user-group-page-store';


const userGroupPageStore = useUserGroupPageStore();
const userGroupPageState = userGroupPageStore.state;
const userGroupPageGetters = userGroupPageStore.getters;

const emit = defineEmits<{(e: 'confirm'): void; }>();

const storeState = reactive({
    modalType: computed<string>(() => userGroupPageState.modal.type),
});

const state = reactive({
    loading: false,
    groupName: '',
    description: '',
    disabled: false,
    isGroupNameDuplicated: false,
    isFormEdited: false,
});

const { userGroupAPI } = useUserGroupApi();
const queryClient = useQueryClient();

const { key: userGroupListQueryKey } = useServiceQueryKey('identity', 'user-group', 'list');
const { withSuffix: userGroupGetQueryKey } = useServiceQueryKey('identity', 'user-group', 'get');

const { mutateAsync: createUserGroup, isPending: isCreateUserGroupPending } = useMutation({
    mutationFn: userGroupAPI.create,
    onSuccess: async () => {
        showSuccessMessage(i18n.t('IAM.USER_GROUP.MODAL.CREATE_USER_GROUP.SUCCESS_MESSAGE'), '');
        await queryClient.invalidateQueries({ queryKey: userGroupListQueryKey.value });
        await queryClient.invalidateQueries({ queryKey: userGroupGetQueryKey({ userGroupId: userGroupPageGetters.selectedUserGroups[0].user_group_id }) });
        emit('confirm');
    },
    onError: (e) => {
        ErrorHandler.handleError(e, true);
    },
    onSettled: () => {
        handleClose();
        userGroupPageStore.setSelectedIndices([]);
    },
});

const { mutateAsync: updateUserGroup, isPending: isUpdateUserGroupPending } = useMutation({
    mutationFn: userGroupAPI.update,
    onSuccess: async () => {
        showSuccessMessage(i18n.t('IAM.USER_GROUP.MODAL.CREATE_USER_GROUP.UPDATE_SUCCESS_MESSAGE'), '');
        await queryClient.invalidateQueries({ queryKey: userGroupListQueryKey.value });
        await queryClient.invalidateQueries({ queryKey: userGroupGetQueryKey({ userGroupId: userGroupPageGetters.selectedUserGroups[0].user_group_id }) });
        emit('confirm');
    },
    onError: (e) => {
        ErrorHandler.handleError(e, true);
    },
    onSettled: () => {
        handleClose();
        userGroupPageStore.setSelectedIndices([]);
    },
});

/* Component */
const handleConfirm = async () => {
    switch (storeState.modalType) {
    case USER_GROUP_MODAL_TYPE.CREATE:
        await createUserGroup({
            name: state.groupName,
            description: state?.description,
            tags: {
                key: '',
            },
        });
        break;
    case USER_GROUP_MODAL_TYPE.UPDATE:
        await updateUserGroup({
            user_group_id: userGroupPageGetters.selectedUserGroups[0].user_group_id,
            name: state.groupName,
            description: state?.description,
            tags: {
                key: '',
            },
        });
        break;
    default:
        break;
    }
};

const handleClose = () => {
    userGroupPageState.modal = {
        type: '',
        title: '',
        themeColor: 'primary',
    };
};

const handleUpdateValues = (data) => {
    state.groupName = data.groupName;
    state.description = data.description;
    state.isGroupNameDuplicated = data.isGroupNameDuplicated;
    state.isFormEdited = data.isFormEdited;
};

/* Watcher */
watch(() => state, () => {
    state.disabled = state.groupName.length > 0 && !state.isGroupNameDuplicated && state.isFormEdited;
}, { deep: true, immediate: true });
</script>

<template>
    <p-button-modal class="user-group-management-edit-modal"
                    :header-title="userGroupPageState.modal.title"
                    :visible="userGroupPageState.modal.type === USER_GROUP_MODAL_TYPE.CREATE || userGroupPageState.modal.type === USER_GROUP_MODAL_TYPE.UPDATE"
                    size="md"
                    :loading="isCreateUserGroupPending || isUpdateUserGroupPending"
                    :disabled="!state.disabled"
                    @cancel="handleClose"
                    @close="handleClose"
                    @confirm="handleConfirm"
    >
        <template #body>
            <div class="modal-contents">
                <user-group-management-add-group-info @update:values="handleUpdateValues" />
            </div>
        </template>
        <template #confirm-button>
            <span v-if="userGroupPageState.modal.type === USER_GROUP_MODAL_TYPE.CREATE">

                {{ $t('IAM.USER_GROUP.MODAL.CREATE_USER_GROUP.CONFIRM') }}
            </span>
            <span v-else-if="userGroupPageState.modal.type === USER_GROUP_MODAL_TYPE.UPDATE">

                {{ $t('IAM.USER_GROUP.MODAL.CREATE_USER_GROUP.UPDATE') }}
            </span>
        </template>
    </p-button-modal>
</template>

<style scoped lang="postcss">
.user-group-management-edit-modal {
    min-height: 34.875rem;
    .modal-contents {
        @apply flex flex-col bg-primary-4 rounded-md;
        padding: 1rem;
        gap: 1rem;
    }
}
</style>
