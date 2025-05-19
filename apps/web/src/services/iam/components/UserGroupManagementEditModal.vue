<script lang="ts" setup>
import { computed, reactive, watch } from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { PButtonModal } from '@cloudforet/mirinae';

import type { UserGroupCreateParameters } from '@/api-clients/identity/user-group/schema/api-verbs/create';
import type { UserGroupUpdateParameters } from '@/api-clients/identity/user-group/schema/api-verbs/update';
import type { UserGroupModel } from '@/api-clients/identity/user-group/schema/model';
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
});

/* Watcher */
watch(() => state, () => {
    state.disabled = state.groupName.length > 0 && !state.isGroupNameDuplicated;
}, { deep: true, immediate: true });

/* Component */
const handleConfirm = async () => {
    switch (storeState.modalType) {
    case USER_GROUP_MODAL_TYPE.CREATE:
        state.loading = true;
        try {
            await fetchCreateUserGroup({
                name: state.groupName,
                description: state?.description,
                tags: {
                    key: '',
                },
            });
            emit('confirm');
            showSuccessMessage('', i18n.t('IAM.USER_GROUP.MODAL.CREATE_USER_GROUP.SUCCESS_MESSAGE'));
        } finally {
            state.loading = false;
            handleClose();
        }
        break;
    case USER_GROUP_MODAL_TYPE.UPDATE:
        state.loading = true;
        try {
            await fetchUpdateUserGroup({
                user_group_id: userGroupPageGetters.selectedUserGroups[0].user_group_id,
                name: state.groupName,
                description: state?.description,
                tags: {
                    key: '',
                },
            });
            emit('confirm');
            showSuccessMessage('', i18n.t('IAM.USER_GROUP.MODAL.CREATE_USER_GROUP.UPDATE_SUCCESS_MESSAGE'));
        } finally {
            state.loading = false;
            handleClose();
        }
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
};

/* API */
const fetchCreateUserGroup = async (params: UserGroupCreateParameters) => {
    try {
        await SpaceConnector.clientV2.identity.userGroup.create<UserGroupCreateParameters, UserGroupModel>(params);
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};

const fetchUpdateUserGroup = async (params: UserGroupUpdateParameters) => {
    try {
        await SpaceConnector.clientV2.identity.userGroup.update<UserGroupUpdateParameters, UserGroupModel>(params);
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};
</script>

<template>
    <p-button-modal class="user-group-management-edit-modal"
                    :header-title="userGroupPageState.modal.title"
                    :visible="userGroupPageState.modal.type === USER_GROUP_MODAL_TYPE.CREATE || userGroupPageState.modal.type === USER_GROUP_MODAL_TYPE.UPDATE"
                    size="md"
                    :loading="state.loading"
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
