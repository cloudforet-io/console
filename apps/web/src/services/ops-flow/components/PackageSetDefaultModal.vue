<script setup lang="ts">
import { ref, computed } from 'vue';

import { PButtonModal } from '@cloudforet/mirinae';

import { i18n as _i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { usePackageStore } from '@/services/ops-flow/stores/admin/package-store';
import { useTaskManagementPageStore } from '@/services/ops-flow/stores/admin/task-management-page-store';

const taskManagementPageStore = useTaskManagementPageStore();
const packageStore = usePackageStore();

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
        showSuccessMessage(_i18n.t('OPSFLOW.ALT_S_CHANGE_DEFAULT_TARGET', { target: _i18n.t('OPSFLOW.PACKAGE') }), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, _i18n.t('OPSFLOW.ALT_E_CHANGE_DEFAULT_TARGET', { target: _i18n.t('OPSFLOW.PACKAGE') }));
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
