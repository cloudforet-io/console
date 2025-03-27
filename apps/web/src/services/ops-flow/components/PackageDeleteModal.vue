<script setup lang="ts">
import { ref, computed } from 'vue';

import { PButtonModal } from '@cloudforet/mirinae';

import { getParticle, i18n as _i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import AssociatedCategories from '@/services/ops-flow/components/AssociatedCategories.vue';
import { usePackageStore } from '@/services/ops-flow/stores/admin/package-store';
import { useTaskManagementPageStore } from '@/services/ops-flow/stores/admin/task-management-page-store';

const taskManagementPageStore = useTaskManagementPageStore();
const packageStore = usePackageStore();

const deletable = computed(() => !taskManagementPageStore.getters.associatedCategoriesToPackage.length);
const headerTitle = computed(() => (deletable.value
    ? _i18n.t('OPSFLOW.DELETE_TARGET_CONFIRMATION', {
        object: _i18n.t('OPSFLOW.PACKAGE'),
        particle: getParticle(_i18n.t('OPSFLOW.PACKAGE') as string, 'object'),
    })
    : _i18n.t('OPSFLOW.DELETE_TARGET', { target: _i18n.t('OPSFLOW.PACKAGE') })));

const loading = ref<boolean>(false);
const handleConfirm = async () => {
    loading.value = true;
    try {
        if (!taskManagementPageStore.state.targetPackageId) {
            throw new Error('[Console Error] Cannot delete package without a target package');
        }
        await packageStore.delete(taskManagementPageStore.state.targetPackageId);
        showSuccessMessage(_i18n.t('OPSFLOW.ALT_S_DELETE_TARGET', { target: _i18n.t('OPSFLOW.PACKAGE') }) as string, '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, _i18n.t('OPSFLOW.ALT_E_DELETE_TARGET', { target: _i18n.t('OPSFLOW.PACKAGE') }) as string);
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
    <p-button-modal :visible="taskManagementPageStore.state.visibleDeletePackageModal"
                    theme-color="alert"
                    :header-title="headerTitle"
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
                <div class="mb-6 flex items-end justify-between">
                    <p class="text-paragraph-lg font-bold ">
                        {{ $t('OPSFLOW.TASK_MANAGEMENT.PACKAGE.DELETE_UNAVAILABLE') }}
                    </p>
                </div>
                <associated-categories />
            </div>
        </template>
    </p-button-modal>
</template>
