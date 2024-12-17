<script setup lang="ts">
import { ref, computed } from 'vue';

import { PButtonModal } from '@cloudforet/mirinae';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import AssociatedCategories from '@/services/ops-flow/components/AssociatedCategories.vue';
import { usePackageStore } from '@/services/ops-flow/stores/admin/package-store';
import { useTaskManagementPageStore } from '@/services/ops-flow/stores/admin/task-management-page-store';

const props = defineProps<{
    visible: boolean;
}>();

const taskManagementPageStore = useTaskManagementPageStore();
const packageStore = usePackageStore();

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
const handleClosed = () => {
    taskManagementPageStore.resetTargetPackageId();
};
</script>

<template>
    <p-button-modal :visible="props.visible"
                    theme-color="alert"
                    :header-title="deletable ? 'Are you sure you want to delete this package?' : 'Delete Package'"
                    :size="deletable ? 'sm' : 'md'"
                    :loading="loading"
                    :disabled="!deletable"
                    @confirm="handleConfirm"
                    @close="handleCloseOrCancel"
                    @cancel="handleCloseOrCancel"
                    @closed="handleClosed"
    >
        <template #body>
            <div v-if="!deletable">
                <div class="mb-4 flex items-end justify-between">
                    <p class="text-paragraph-lg font-bold ">
                        연결된 카테고리가 존재하므로 패키지 삭제가 불가합니다.
                    </p>
                </div>
                <associated-categories v-if="!!taskManagementPageStore.getters.associatedCategoriesToPackage.length" />
            </div>
        </template>
    </p-button-modal>
</template>
