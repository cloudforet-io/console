<script setup lang="ts">
import { computed } from 'vue';

import { useMutation } from '@tanstack/vue-query';

import { PButtonModal } from '@cloudforet/mirinae';

import { usePackageApi } from '@/api-clients/identity/package/composables/use-package-api';
import { getParticle, i18n as _i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import AssociatedCategories from '@/services/ops-flow/components/AssociatedCategories.vue';
import { useAssociatedCategoriesToPackage } from '@/services/ops-flow/composables/use-associated-categories-to-package';
import { usePackagesQuery } from '@/services/ops-flow/composables/use-packages-query';
import { useTaskManagementPageStore } from '@/services/ops-flow/stores/admin/task-management-page-store';


const taskManagementPageStore = useTaskManagementPageStore();

/* associated categories */
const { associatedCategoriesToPackage } = useAssociatedCategoriesToPackage({
    packageId: computed(() => taskManagementPageStore.state.targetPackageId),
});

/* delete package */
const { invalidateQueries: invalidatePackagesQuery } = usePackagesQuery();
const { packageAPI } = usePackageApi();
const { mutateAsync: deletePackage, isPending: isDeleting } = useMutation({
    mutationFn: packageAPI.delete,
    onSuccess: () => {
        invalidatePackagesQuery();
        showSuccessMessage(_i18n.t('OPSFLOW.ALT_S_DELETE_TARGET', { target: _i18n.t('OPSFLOW.PACKAGE') }) as string, '');
    },
    onError: (e) => {
        ErrorHandler.handleRequestError(e, _i18n.t('OPSFLOW.ALT_E_DELETE_TARGET', { target: _i18n.t('OPSFLOW.PACKAGE') }) as string);
    },
    onSettled: () => {
        taskManagementPageStore.closeDeletePackageModal();
    },
});

const deletable = computed(() => !associatedCategoriesToPackage.value.length);
const headerTitle = computed(() => (deletable.value
    ? _i18n.t('OPSFLOW.DELETE_TARGET_CONFIRMATION', {
        object: _i18n.t('OPSFLOW.PACKAGE'),
        particle: getParticle(_i18n.t('OPSFLOW.PACKAGE') as string, 'object'),
    })
    : _i18n.t('OPSFLOW.DELETE_TARGET', { target: _i18n.t('OPSFLOW.PACKAGE') })));


const handleConfirm = () => {
    if (!taskManagementPageStore.state.targetPackageId) {
        ErrorHandler.handleError(new Error('[Console Error] Cannot delete package without a target package'));
        return;
    }
    deletePackage({ package_id: taskManagementPageStore.state.targetPackageId });
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
                    :loading="isDeleting"
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
