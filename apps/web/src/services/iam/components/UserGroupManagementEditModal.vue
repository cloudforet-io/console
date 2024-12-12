<script lang="ts" setup>
import { computed, reactive } from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { PButtonModal, PButton } from '@cloudforet/mirinae';

import type { UserGroupCreateParameters } from '@/schema/identity/user-group/api-verbs/create';
import type { UserGroupUpdateParameters } from '@/schema/identity/user-group/api-verbs/update';
import type { UserGroupModel } from '@/schema/identity/user-group/model';

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
});

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
                    @cancel="handleClose"
                    @close="handleClose"
    >
        <template #body>
            <div class="modal-contents">
                <user-group-management-add-group-info @update:values="handleUpdateValues" />
            </div>
        </template>
        <template #confirm-button>
            <p-button v-if="userGroupPageState.modal.type === USER_GROUP_MODAL_TYPE.CREATE"
                      theme="primary"
                      @click="handleConfirm"
            >
                {{ $t('IAM.USER_GROUP.MODAL.CREATE_USER_GROUP.CONFIRM') }}
            </p-button>
            <p-button v-else-if="userGroupPageState.modal.type === USER_GROUP_MODAL_TYPE.UPDATE"
                      theme="primary"
                      @click="handleConfirm"
            >
                {{ $t('IAM.USER_GROUP.MODAL.CREATE_USER_GROUP.UPDATE') }}
            </p-button>
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
