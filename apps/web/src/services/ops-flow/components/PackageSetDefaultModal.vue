<script setup lang="ts">
import { ref, computed } from 'vue';

import { PButtonModal } from '@cloudforet/mirinae';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { useTaskManagementPageStore } from '@/services/ops-flow/stores/admin/task-management-page-store';

const taskManagementPageStore = useTaskManagementPageStore();
const packageStore = taskManagementPageStore.packageStore;
const loading = ref<boolean>(false);
const name = computed(() => taskManagementPageStore.getters.targetPackage?.name ?? '');
const handleConfirm = async () => {
    loading.value = true;
    try {
        if (!taskManagementPageStore.state.targetPackageId) {
            throw new Error('[Console Error] Cannot set default package without a target package');
        }
        await packageStore.setDefaultPackage(taskManagementPageStore.state.targetPackageId);
        taskManagementPageStore.closeSetDefaultPackageModal();
        showSuccessMessage('Successfully set the default package', '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, 'Failed to set default package');
    } finally {
        loading.value = false;
    }
};
const handleCloseOrCancel = () => {
    taskManagementPageStore.closeSetDefaultPackageModal();
};
const handleClosed = () => {
    taskManagementPageStore.resetTargetPackageId();
};
</script>

<template>
    <p-button-modal :visible="taskManagementPageStore.state.visibleSetDefaultPackageModal"
                    size="sm"
                    :loading="loading"
                    @confirm="handleConfirm"
                    @close="handleCloseOrCancel"
                    @cancel="handleCloseOrCancel"
                    @closed="handleClosed"
    >
        <template #header-title>
            Set <strong>{{ name }}</strong> as the default package.
        </template>
        <template #body>
            This will make it the primary package for related operations.
        </template>
    </p-button-modal>
</template>
