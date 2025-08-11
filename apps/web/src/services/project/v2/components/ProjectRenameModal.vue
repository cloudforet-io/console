<script lang="ts" setup>
import { computed, ref, watch } from 'vue';

import { useMutation, useQueryClient } from '@tanstack/vue-query';

import { PButtonModal, PFieldGroup, PTextInput } from '@cloudforet/mirinae';

import { useProjectApi } from '@/api-clients/identity/project/composables/use-project-api';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';

import { useProjectQuery } from '@/services/project/v2/composables/queries/use-project-query';
import { useProjectListStore } from '@/services/project/v2/stores/project-list-store';
import { useProjectPageModalStore } from '@/services/project/v2/stores/project-page-modal-store';

const projectPageModalStore = useProjectPageModalStore();
const visible = computed(() => projectPageModalStore.state.projectRenameModalVisible);
const targetId = computed(() => projectPageModalStore.state.targetId);

const projectListStore = useProjectListStore();
const projectNames = computed(() => projectListStore.projects.filter((item) => item.project_id !== targetId.value).map((p) => p.name));

/* form */
const {
    forms: { projectName },
    invalidState,
    invalidTexts,
    setForm, isAllValid,
    resetValidations,
} = useFormValidator({
    projectName: undefined as string|undefined,
}, {
    projectName: (val?: string) => {
        if (!val?.length) return i18n.t('PROJECT.DETAIL.MODAL_VALIDATION_REQUIRED');
        if (val.length > 40) return i18n.t('PROJECT.DETAIL.MODAL_VALIDATION_LENGTH');
        if (projectNames.value.includes(val)) return i18n.t('PROJECT.DETAIL.MODAL_VALIDATION_DUPLICATED');
        return true;
    },
});

/* query */
const {
    data: project, isLoading, setQueryData,
} = useProjectQuery({
    projectId: targetId,
    enabled: visible,
});

const originalName = ref<string>('');

watch([visible, project], ([v, prj]) => {
    if (!v) return;
    if (prj) {
        setForm('projectName', prj.name);
        originalName.value = prj.name;
        resetValidations();
    }
}, { immediate: true });

/* mutations */
const { projectAPI } = useProjectApi();
const queryClient = useQueryClient();
const { key: projectListQueryKey } = useServiceQueryKey('identity', 'project', 'list');
const { mutateAsync: updateProject, isPending: isUpdatingProject } = useMutation({
    mutationFn: ({ projectId, name }: { projectId: string; name: string }) => projectAPI.update({
        project_id: projectId,
        name,
    }),
    onSuccess: (data) => {
        showSuccessMessage(i18n.t('PROJECT.DETAIL.ALT_S_UPDATE_PROJECT'), '');
        setQueryData(data);
        queryClient.invalidateQueries({ queryKey: projectListQueryKey });
    },
    onError: (e) => {
        ErrorHandler.handleRequestError(e, i18n.t('PROJECT.DETAIL.ALT_E_UPDATE_PROJECT'));
    },
});

/* Event */
const confirm = async () => {
    if (isUpdatingProject.value) return;
    if (!isAllValid.value) return;

    const name = projectName.value?.trim() as string;
    if (name !== originalName.value) {
        await updateProject({
            projectId: targetId.value as string,
            name,
        });
    }
    projectPageModalStore.closeProjectRenameModal();
};
</script>

<template>
    <p-button-modal :header-title="$t('PROJECT.DETAIL.MODAL_RENAME_PROJECT_TITLE')"
                    centered
                    size="sm"
                    fade
                    backdrop
                    :loading-backdrop="isLoading"
                    :visible="visible"
                    :loading="isUpdatingProject"
                    :disabled="!isAllValid"
                    @close="projectPageModalStore.closeProjectRenameModal"
                    @cancel="projectPageModalStore.closeProjectRenameModal"
                    @closed="projectPageModalStore.resetTarget"
                    @confirm="confirm"
    >
        <template #confirm-button>
            {{ $t('PROJECT.LANDING.SAVE_CHANGES') }}
        </template>
        <template #body>
            <p-field-group :label="$t('PROJECT.DETAIL.MODAL_CREATE_PROJECT_LABEL')"
                           :invalid-text="invalidTexts.projectName"
                           :invalid="invalidState.projectName"
                           required
            >
                <template #default="{invalid}">
                    <p-text-input :value="projectName"
                                  class="block w-full"
                                  :invalid="invalid"
                                  :placeholder="$t('PROJECT.DETAIL.MODAL_CREATE_PROJECT_PLACEHOLDER')"
                                  @update:value="setForm('projectName', $event)"
                    />
                </template>
            </p-field-group>
        </template>
    </p-button-modal>
</template>

