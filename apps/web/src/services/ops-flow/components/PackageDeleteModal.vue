<script setup lang="ts">
import { ref, computed } from 'vue';

import { PButtonModal } from '@cloudforet/mirinae';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import AssociatedCategories from '@/services/ops-flow/components/AssociatedCategories.vue';
import AssociatedWorkspaces from '@/services/ops-flow/components/AssociatedWorkspaces.vue';
import { useTaskManagementPageStore } from '@/services/ops-flow/stores/admin/task-management-page-store';

const taskManagementPageStore = useTaskManagementPageStore();
const packageStore = taskManagementPageStore.packageStore;

const deletable = computed(() => !taskManagementPageStore.getters.associatedCategoriesToPackage.length
        && !taskManagementPageStore.getters.associatedWorkspacesToPackage.length);
const loading = ref<boolean>(false);
const handleConfirm = async () => {
    loading.value = true;
    try {
        if (!taskManagementPageStore.state.targetPackageId) {
            throw new Error('[Console Error] Cannot delete package without a target package');
        }
        await packageStore.delete(taskManagementPageStore.state.targetPackageId);
        showSuccessMessage('Successfully deleted the package', '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, 'Failed to delete package');
    } finally {
        taskManagementPageStore.closeDeletePackageModal();
        loading.value = false;
    }
};
const handleCloseOrCancel = () => {
    taskManagementPageStore.closeDeletePackageModal();
};
</script>

<template>
    <p-button-modal :visible="taskManagementPageStore.state.visibleDeletePackageModal"
                    theme-color="alert"
                    :header-title="deletable ? 'Are you sure you want to delete this package?' : 'Delete Package'"
                    :size="deletable ? 'sm' : 'md'"
                    :loading="loading"
                    :disabled="!deletable"
                    @confirm="handleConfirm"
                    @close="handleCloseOrCancel"
                    @cancel="handleCloseOrCancel"
    >
        <template #body>
            <p v-if="!deletable"
               class="text-paragraph-lg font-bold mb-4"
            >
                To reassign them to a different package, update the associations before deleting.
            </p>
            <associated-categories v-if="!!taskManagementPageStore.getters.associatedCategoriesToPackage.length" />
            <associated-workspaces v-if="!!taskManagementPageStore.getters.associatedWorkspacesToPackage.length" />
        </template>
    </p-button-modal>
</template>
