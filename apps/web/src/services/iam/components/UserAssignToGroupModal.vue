<script lang="ts" setup>
import { reactive } from 'vue';

import { cloneDeep } from 'lodash';

import { PButtonModal, PSelectDropdown } from '@cloudforet/mirinae';

import { useUserPageStore } from '@/services/iam/store/user-page-store';

const userPageStore = useUserPageStore();
const userPageState = userPageStore.state;

const state = reactive({
    loading: false,
});

/* Component */
const handleConfirm = () => {
    try {
        state.loading = true;
        console.log('TODO: Add users to user group API');
    } finally {
        state.loading = false;
        handleClose();
    }
};

const handleClose = () => {
    userPageStore.$patch((_state) => {
        _state.state.modal.visible = undefined;
        _state.state.modal = cloneDeep(_state.state.modal);
    });
};
</script>

<template>
    <p-button-modal class="user-assign-group-modal"
                    :header-title="userPageState.modal.title"
                    :visible="userPageState.modal.visible === 'assignToUserGroup'"
                    size="md"
                    :loading="state.loading"
                    @confirm="handleConfirm"
                    @cancel="handleClose"
                    @close="handleClose"
    >
        <template #body>
            <div class="modal-contents">
                <p>{{ userPageState.modal.title }}</p>
                <p-select-dropdown />
            </div>
        </template>
    </p-button-modal>
</template>
