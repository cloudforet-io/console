<script lang="ts" setup>
import {
    computed, watch,
} from 'vue';

import { PButtonModal, PFieldGroup, PTextInput } from '@cloudforet/mirinae';

import { i18n } from '@/translations';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';

import { useDashboardUpdateMutation } from '@/services/_shared/dashboard/core/composables/mutations/use-dashboard-update-mutation';
import { useProjectDashboardQuery } from '@/services/project/v2/composables/queries/use-project-dashboard-query';
import { useProjectOrGroupId } from '@/services/project/v2/composables/use-project-or-group-id';
import { useProjectDashboardModalStore } from '@/services/project/v2/stores/Project-dashboard-modal-store';

interface Props {
    projectGroupOrProjectId?: string;
}
const props = defineProps<Props>();
const projectDashboardModalStore = useProjectDashboardModalStore();
const visible = computed(() => projectDashboardModalStore.state.dashboardNameEditModalVisible);
const dashboardId = computed(() => projectDashboardModalStore.state.targetId);
const projectGroupOrProjectId = computed(() => props.projectGroupOrProjectId);
const { projectGroupId, projectId } = useProjectOrGroupId(projectGroupOrProjectId);

/* Query */
const {
    dashboardList,
    invalidateAllQueries: invalidateDashboardList,
} = useProjectDashboardQuery({
    projectId,
    projectGroupId,
});
const existingNameList = computed<string[]>(() => dashboardList.value.map((d) => d.name));
const originName = computed<string>(() => {
    const dashboard = dashboardList.value.find((d) => d.dashboard_id === dashboardId.value);
    return dashboard?.name || '';
});

const {
    forms: {
        name,
    },
    setForm,
    invalidState,
    invalidTexts,
    isAllValid,
} = useFormValidator({
    name: '',
}, {
    name(value: string) {
        if (loading.value) return '';
        if (value === originName.value) return '';
        if (value.length > 100) return i18n.t('DASHBOARDS.FORM.VALIDATION_DASHBOARD_NAME_LENGTH');
        if (!value.trim().length) return i18n.t('DASHBOARDS.FORM.VALIDATION_DASHBOARD_NAME_INPUT');
        if (existingNameList.value.find((d) => d === value)) return i18n.t('DASHBOARDS.FORM.VALIDATION_DASHBOARD_NAME_UNIQUE');
        return '';
    },
});

const { mutate: updateDashboard, isPending: loading } = useDashboardUpdateMutation({
    onSuccess: () => {
        invalidateDashboardList();
    },
    onError: (e) => {
        ErrorHandler.handleRequestError(e, i18n.t('DASHBOARDS.FORM.ALT_E_EDIT_NAME'));
    },
    onSettled() {
        projectDashboardModalStore.closeDashboardNameEditModal();
    },
});

const handleConfirm = async () => {
    if (!dashboardId.value) {
        console.error('dashboardId is required');
        return;
    }
    updateDashboard({
        dashboard_id: dashboardId.value,
        name: name.value,
    });
};

/* Watcher */
watch(visible, (_visible) => {
    if (!_visible) return;
    setForm('name', originName.value || '');
}, { immediate: true });
</script>

<template>
    <p-button-modal :visible="visible"
                    :header-title="$t('DASHBOARDS.FORM.UPDATE_TITLE')"
                    :disabled="!isAllValid"
                    size="sm"
                    class="dashboard-name-edit-modal"
                    @confirm="handleConfirm"
                    @closed="projectDashboardModalStore.resetTarget"
                    @cancel="projectDashboardModalStore.closeDashboardNameEditModal"
                    @close="projectDashboardModalStore.closeDashboardNameEditModal"
    >
        <template #body>
            <p-field-group :label="$t('DASHBOARDS.FORM.LABEL_DASHBOARD_NAME')"
                           :invalid="!loading && invalidState.name"
                           :invalid-text="loading ? '' : invalidTexts.name"
                           required
            >
                <template #default="{invalid}">
                    <p-text-input :value="name"
                                  :invalid="invalid"
                                  @update:value="setForm('name', $event)"
                    />
                </template>
            </p-field-group>
        </template>
    </p-button-modal>
</template>

<style lang="postcss" scoped>
.dashboard-name-edit-modal {
    .p-text-input {
        @apply w-full;
    }
}
</style>
