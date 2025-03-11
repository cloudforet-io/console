<script setup lang="ts">
import { computed } from 'vue';

import { useMutation, useQueryClient } from '@tanstack/vue-query';

import { PButtonModal } from '@cloudforet/mirinae';

import { usePackageApi } from '@/api-clients/identity/package/composables/use-package-api';
import { i18n as _i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { usePackagesQuery } from '@/services/ops-flow/composables/use-packages-query';
import { useTaskManagementPageStore } from '@/services/ops-flow/stores/admin/task-management-page-store';


const taskManagementPageStore = useTaskManagementPageStore();
const { packageAPI, packageQueryKey, packageListQueryKey } = usePackageApi();
const queryClient = useQueryClient();

/* package name */
const { packages } = usePackagesQuery();
const targetPackage = computed(() => {
    if (!taskManagementPageStore.state.targetPackageId || !packages.value) return undefined;
    return packages.value.find((pkg) => pkg.package_id === taskManagementPageStore.state.targetPackageId);
});
const name = computed(() => targetPackage.value?.name ?? '');

/* set default package */
const { mutateAsync: setDefaultPackage, isPending } = useMutation({
    mutationFn: packageAPI.setDefault,
    onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: packageListQueryKey.value });
        queryClient.invalidateQueries({
            queryKey: [
                ...packageQueryKey.value,
                { package_id: data.package_id },
            ],
        });
        taskManagementPageStore.closeSetDefaultPackageModal();
        showSuccessMessage(_i18n.t('OPSFLOW.ALT_S_CHANGE_DEFAULT_TARGET', { target: _i18n.t('OPSFLOW.PACKAGE') }), '');
    },
    onError: (e) => {
        ErrorHandler.handleRequestError(e, _i18n.t('OPSFLOW.ALT_E_CHANGE_DEFAULT_TARGET', { target: _i18n.t('OPSFLOW.PACKAGE') }));
    },
});

/* modal event handlers */
const handleConfirm = async () => {
    if (!taskManagementPageStore.state.targetPackageId) {
        throw new Error('[Console Error] Cannot set default package without a target package');
    }
    await setDefaultPackage({ package_id: taskManagementPageStore.state.targetPackageId });
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
                    :loading="isPending"
                    @confirm="handleConfirm"
                    @close="handleCloseOrCancel"
                    @cancel="handleCloseOrCancel"
                    @closed="handleClosed"
    >
        <template #header-title>
            <i18n path="OPSFLOW.TASK_MANAGEMENT.PACKAGE.SET_TARGET_AS_DEFAULT">
                <!-- eslint-disable-next-line vue/singleline-html-element-content-newline -->
                <template #target><strong>{{ name }}</strong></template>
            </i18n>
        </template>
        <template #body>
            {{ $t('OPSFLOW.TASK_MANAGEMENT.PACKAGE.SET_DEFAULT_DESC') }}
        </template>
    </p-button-modal>
</template>
