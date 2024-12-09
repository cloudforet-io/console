<script lang="ts" setup>
import { reactive } from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { PButtonModal, PButton } from '@cloudforet/mirinae';

import type { UserGroupCreateParameters } from '@/schema/identity/user-group/api-verbs/create';
import type { UserGroupModel } from '@/schema/identity/user-group/model';

import ErrorHandler from '@/common/composables/error/errorHandler';

import UserGroupManagementAddGroupInfo from '@/services/iam/components/UserGroupManagementAddGroupInfo.vue';
import { USER_GROUP_MODAL_TYPE } from '@/services/iam/constants/user-group-constant';
import { useUserGroupPageStore } from '@/services/iam/store/user-group-page-store';


const userGroupPageStore = useUserGroupPageStore();
const userGroupPageState = userGroupPageStore.state;

const emit = defineEmits<{(e: 'confirm'): void; }>();

const state = reactive({
    loading: false,
    groupName: '',
    description: '',
});

/* Component */
const handleConfirm = async () => {
    state.loading = true;
    try {
        fetchCreateUserGroup();
        emit('confirm');
    } catch (e: any) {
        console.error(e);
    } finally {
        state.loading = false;
        handleClose();
    }
};

const handleClose = () => {
    userGroupPageState.modal.type = '';
};

const handleUpdateValues = (data) => {
    state.groupName = data.groupName;
    state.description = data.description;
};

/* API */
const handleCreate = () => {
    console.log('TODO: Create API');
};

const handleUpdate = () => {
    console.log('TODO: Update API');
};

const fetchCreateUserGroup = async () => {
    try {
        await SpaceConnector.clientV2.identity.userGroup.create<UserGroupCreateParameters, UserGroupModel>({
            name: state.groupName,
            description: state?.description,
        });
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
                    @confirm="handleConfirm"
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
                      @click="handleCreate"
            >
                {{ $t('IAM.USER_GROUP.MODAL.CREATE_USER_GROUP.CONFIRM') }}
            </p-button>
            <p-button v-else-if="userGroupPageState.modal.type === USER_GROUP_MODAL_TYPE.UPDATE"
                      theme="primary"
                      @click="handleUpdate"
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
