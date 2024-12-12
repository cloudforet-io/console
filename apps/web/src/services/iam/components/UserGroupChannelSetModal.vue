<script lang="ts" setup>
import { reactive } from 'vue';

import { PButtonModal } from '@cloudforet/mirinae';

import { USER_GROUP_MODAL_TYPE } from '@/services/iam/constants/user-group-constant';
import { useUserGroupPageStore } from '@/services/iam/store/user-group-page-store';

const userGroupPageStore = useUserGroupPageStore();
const userGroupPageState = userGroupPageStore.state;

const state = reactive({
    loading: false,
});

/* Component */
const handleConfirm = async () => {
    try {
        state.loading = true;
        await fetchCreateUserGroupChannel();
    } finally {
        state.loading = false;
        handleCancel();
    }
};

const handleCancel = () => {
    userGroupPageState.modal = {
        type: '',
        title: '',
        themeColor: 'Primary',
    };
};

/* API */
const fetchCreateUserGroupChannel = async () => {};
</script>

<template>
    <div>
        <p-button-modal size="md"
                        :visible="userGroupPageState.modal.type === USER_GROUP_MODAL_TYPE.CREATE_NOTIFICATIONS_SECOND"
                        :header-title="userGroupPageState.modal.title"
                        :theme-color="userGroupPageState.modal.themeColor"
                        @confirm="handleConfirm"
                        @cancel="handleCancel"
        >
            <template #body>
                <div class="flex flex-col gap-1 mb-8">
                    <!--              TODO: need to modify-->
                    <p class="text-xs">
                        <span>Step 2</span>
                        <span class="text-gray-500">/2</span>
                    </p>
                    <span class="text-gray-700 leading-4 text-sm">Configure teh notifications to ensure you are promptly informed of any alerts or incidents as they occur.</span>
                </div>
                <span>TODO: </span>
            </template>
            <template #confirm-button>
                <span>Create</span>
            </template>
        </p-button-modal>
    </div>
</template>
