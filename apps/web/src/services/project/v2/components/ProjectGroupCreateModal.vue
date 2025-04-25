<script lang="ts" setup>
import {
    computed, watch,
} from 'vue';

import { useMutation, useQueryClient } from '@tanstack/vue-query';

import { PButtonModal, PFieldGroup, PTextInput } from '@cloudforet/mirinae';

import { useProjectGroupApi } from '@/api-clients/identity/project-group/composables/use-project-group-api';
import { useServiceQueryKey } from '@/query/query-key/use-service-query-key';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';

import { useProjectGroupNames } from '@/services/project/v-shared/composables/use-project-group-names';
import { useProjectPageModalStore } from '@/services/project/v2/stores/project-page-modal-store';

const props = defineProps<{
    targetParentGroupId?: string;
}>();
const emit = defineEmits<{(e: 'created', projectGroupId: string): void;
}>();

const projectPageModalStore = useProjectPageModalStore();
const visible = computed(() => projectPageModalStore.state.projectGroupCreateModalVisible);

/* project group names */
const projectGroupNames = useProjectGroupNames({
    enabled: visible,
});

/* form */
const {
    forms: { projectGroupName },
    invalidState,
    invalidTexts,
    setForm, isAllValid,
    initForm,
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
watch(visible, (v) => {
    if (!v) return;
    initForm();
}, { immediate: true });


/* mutations */
const { projectGroupAPI } = useProjectGroupApi();
const { key: projectGroupListQueryKey } = useServiceQueryKey('identity', 'project-group', 'list');
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

/* Event */
const handleConfirm = async () => {
    if (isCreating.value) return;
    if (!projectGroupName.value) return;
    if (!isAllValid.value) return;

    await createProjectGroup({
        name: projectGroupName.value,
        parent_group_id: props.targetParentGroupId,
    });

    projectPageModalStore.closeProjectGroupCreateModal();
};

</script>

<template>
    <p-button-modal :header-title="$t('PROJECT.LANDING.MODAL_CREATE_PROJECT_GROUP_TITLE')"
                    centered
                    size="sm"
                    fade
                    backdrop
                    :visible="visible"
                    :loading="isCreating"
                    :disabled="isCreating || !isAllValid"
                    @close="projectPageModalStore.closeProjectGroupCreateModal"
                    @cancel="projectPageModalStore.closeProjectGroupCreateModal"
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
