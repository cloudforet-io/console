<script lang="ts" setup>
import {
    computed, watch,
} from 'vue';

import { PButtonModal, PFieldGroup, PTextInput } from '@cloudforet/mirinae';

import { i18n } from '@/translations';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';

import { useProjectGroupMutations } from '@/services/project/v-shared/composables/mutations/use-project-group-mutations';
import { useProjectGroupQuery } from '@/services/project/v-shared/composables/queries/use-project-group-query';
import { useProjectGroupNames } from '@/services/project/v-shared/composables/use-project-group-names';
import { useProjectPageModalStore } from '@/services/project/v2/stores/project-page-modal-store';

const props = defineProps<{
    targetParentGroupId?: string;
}>();

const projectPageModalStore = useProjectPageModalStore();
const visible = computed(() => projectPageModalStore.state.projectFormModalVisible
&& projectPageModalStore.state.targetType === 'projectGroup');
const targetId = computed(() => projectPageModalStore.state.targetId);
const updateMode = computed(() => projectPageModalStore.state.targetId !== undefined);

/* project group */
const { data: projectGroup } = useProjectGroupQuery({
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
watch([visible, projectGroup], async ([v, pg]) => {
    if (!v) return;
    if (updateMode.value) {
        setForm('projectGroupName', pg?.name);
    } else {
        initForm();
    }
}, { immediate: true });


/* mutations */
const { createProjectGroup, updateProjectGroup, isProcessing } = useProjectGroupMutations();

/* Event */
const confirm = async () => {
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
            updateProjectGroup({
                name: projectGroupName.value,
                project_group_id: targetId.value,
            });
        }
    } else {
        createProjectGroup({
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
                    :visible="visible"
                    :disabled="isProcessing || !isAllValid || projectGroup?.name === projectGroupName"
                    @close="projectPageModalStore.closeFormModal"
                    @cancel="projectPageModalStore.closeFormModal"
                    @closed="projectPageModalStore.resetTarget"
                    @confirm="confirm"
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
                                  @keydown.enter="confirm"
                                  @update:value="setForm('projectGroupName', $event)"
                    />
                </template>
            </p-field-group>
        </template>
    </p-button-modal>
</template>
