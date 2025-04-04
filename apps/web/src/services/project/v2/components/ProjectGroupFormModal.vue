<script lang="ts" setup>
import {
    computed, watch,
} from 'vue';

import { useMutation, useQueryClient } from '@tanstack/vue-query';

import { PButtonModal, PFieldGroup, PTextInput } from '@cloudforet/mirinae';

import { useProjectGroupApi } from '@/api-clients/identity/project-group/composables/use-project-group-api';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';

import { useProjectGroupQuery } from '@/services/project/v-shared/composables/queries/use-project-group-query';
import { useProjectGroupNames } from '@/services/project/v-shared/composables/use-project-group-names';
import { useProjectPageModalStore } from '@/services/project/v2/stores/project-page-modal-store';

const props = defineProps<{
    targetParentGroupId?: string;
}>();
const emit = defineEmits<{(e: 'created', projectGroupId: string): void;
}>();

const projectPageModalStore = useProjectPageModalStore();
const visible = computed(() => projectPageModalStore.state.projectFormModalVisible
&& projectPageModalStore.state.targetType === 'projectGroup');
const targetId = computed(() => projectPageModalStore.state.targetId);
const updateMode = computed(() => projectPageModalStore.state.targetId !== undefined);

/* project group */
const { data: projectGroup, isLoading, setQueryData } = useProjectGroupQuery({
    projectGroupId: targetId,
    enabled: visible,
});


/* project group names */
const projectGroupNames = useProjectGroupNames({
    projectGroupId: targetId,
    enabled: visible,
});

/* form */
const {
    forms: { projectGroupName },
    invalidState,
    invalidTexts,
    setForm, isAllValid,
    initForm, resetValidations,
} = useFormValidator({
    projectGroupName: undefined as string|undefined,
}, {
    projectGroupName: (val?: string) => {
        if (!val?.length) return i18n.t('PROJECT.LANDING.MODAL_PROJECT_CREATE.MODAL_VALIDATION_REQUIRED');
        if (val.length > 40) return i18n.t('PROJECT.LANDING.MODAL_PROJECT_CREATE.MODAL_VALIDATION_LENGTH');
        if (projectGroupNames.value.includes(val)) return i18n.t('PROJECT.LANDING.MODAL_PROJECT_CREATE.MODAL_VALIDATION_DUPLICATED');
        return true;
    },
});
watch([visible, projectGroup], async ([v, pg]) => {
    if (!v) return;
    if (updateMode.value) {
        setForm('projectGroupName', pg?.name);
        resetValidations();
    } else {
        initForm();
    }
}, { immediate: true });


/* mutations */
const { projectGroupAPI, projectGroupListQueryKey } = useProjectGroupApi();
const queryClient = useQueryClient();

const { mutateAsync: createProjectGroup, isPending: isCreating } = useMutation({
    mutationFn: projectGroupAPI.create,
    onSuccess: (data) => {
        showSuccessMessage(i18n.t('PROJECT.LANDING.ALT_S_CREATE_PROJECT_GROUP'), '');
        queryClient.invalidateQueries({ queryKey: projectGroupListQueryKey.value });
        emit('created', data.project_group_id);
    },
    onError: (e) => {
        ErrorHandler.handleRequestError(e, i18n.t('PROJECT.LANDING.ALT_E_CREATE_PROJECT_GROUP'));
    },
});

const { mutateAsync: updateProjectGroup, isPending: isUpdating } = useMutation({
    mutationFn: projectGroupAPI.update,
    onSuccess: (data) => {
        showSuccessMessage(i18n.t('PROJECT.LANDING.ALT_S_UPDATE_PROJECT_GROUP'), '');
        setQueryData(data);
        queryClient.invalidateQueries({ queryKey: projectGroupListQueryKey.value });
    },
    onError: (e) => {
        ErrorHandler.handleRequestError(e, i18n.t('PROJECT.LANDING.ALT_E_UPDATE_PROJECT_GROUP'));
    },
});

const isProcessing = computed(() => isCreating.value || isUpdating.value);


/* Event */
const handleConfirm = async () => {
    if (isProcessing.value) return;
    if (!projectGroupName.value) return;
    if (!isAllValid.value) return;

    if (updateMode.value) {
        if (!targetId.value) {
            ErrorHandler.handleRequestError(new Error('projectGroupId is required'), 'projectGroupId is required', true);
            return;
        }
        const hasChanged = projectGroup.value?.name !== projectGroupName.value;
        if (hasChanged) {
            await updateProjectGroup({
                name: projectGroupName.value,
                project_group_id: targetId.value,
            });
        }
    } else {
        await createProjectGroup({
            name: projectGroupName.value,
            parent_group_id: props.targetParentGroupId,
        });
    }
    projectPageModalStore.closeFormModal();
};

</script>

<template>
    <p-button-modal :header-title="updateMode ? $t('PROJECT.LANDING.MODAL_UPDATE_PROJECT_GROUP_TITLE') : $t('PROJECT.LANDING.MODAL_CREATE_PROJECT_GROUP_TITLE')"
                    centered
                    size="sm"
                    fade
                    backdrop
                    :loading-backdrop="isLoading"
                    :visible="visible"
                    :loading="isProcessing"
                    :disabled="isProcessing || !isAllValid || projectGroup?.name === projectGroupName"
                    @close="projectPageModalStore.closeFormModal"
                    @cancel="projectPageModalStore.closeFormModal"
                    @closed="projectPageModalStore.resetTarget"
                    @confirm="handleConfirm"
    >
        <template #body>
            <p-field-group :label="$t('PROJECT.LANDING.MODAL_CREATE_PROJECT_GROUP_LABEL')"
                           :invalid-text="invalidTexts.projectGroupName"
                           :invalid="invalidState.projectGroupName"
                           required
            >
                <template #default="{invalid}">
                    <p-text-input :value="projectGroupName"
                                  class="block w-full"
                                  :invalid="invalid"
                                  :placeholder="$t('PROJECT.LANDING.MODAL_CREATE_PROJECT_GROUP_PLACEHOLDER')"
                                  @keydown.enter="handleConfirm"
                                  @update:value="setForm('projectGroupName', $event)"
                    />
                </template>
            </p-field-group>
        </template>
    </p-button-modal>
</template>
