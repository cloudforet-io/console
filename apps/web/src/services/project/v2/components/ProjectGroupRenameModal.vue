<script lang="ts" setup>
import {
    computed, onMounted, onUnmounted, ref, watch,
} from 'vue';

import { PButtonModal, PFieldGroup, PTextInput } from '@cloudforet/mirinae';

import type { ProjectGroupModel } from '@/api-clients/identity/project-group/schema/model';
import { i18n } from '@/translations';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';

import { useProjectGroupMutations } from '@/services/project/v-shared/composables/mutations/use-project-group-mutations';
import { useProjectGroupQuery } from '@/services/project/v-shared/composables/queries/use-project-group-query';
import { useProjectGroupNames } from '@/services/project/v-shared/composables/use-project-group-names';
import { useProjectPageModalStore } from '@/services/project/v2/stores/project-page-modal-store';

const projectPageModalStore = useProjectPageModalStore();
const visible = computed(() => !!projectPageModalStore.state.renameModalVisible && projectPageModalStore.state.targetType === 'projectGroup');
const updateMode = computed(() => projectPageModalStore.state.targetId !== undefined);

/* project group */
const projectGroupId = computed(() => (projectPageModalStore.state.targetType === 'projectGroup'
    ? projectPageModalStore.state.targetId
    : undefined));
const { data: projectGroup, setQueryData, invalidateAllQueries } = useProjectGroupQuery({
    projectGroupId,
});
const parentGroupId = computed(() => (projectGroup.value?.parent_group_id ? projectGroup.value.parent_group_id : undefined));

/* modal active state */
const hasMounted = ref(false);
onMounted(() => {
    hasMounted.value = true;
});
onUnmounted(() => {
    hasMounted.value = false;
});

/* project group names */
const projectGroupNames = useProjectGroupNames({
    projectGroupId: computed(() => (updateMode.value ? undefined : projectGroupId.value)),
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
watch(visible, async (v) => {
    if (!v) return;
    if (updateMode.value) {
        setForm('projectGroupName', projectGroup.value?.name);
        resetValidations();
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

    let result: ProjectGroupModel|undefined;

    if (updateMode.value) {
        if (!projectGroupId.value) {
            ErrorHandler.handleRequestError(new Error('projectGroupId is required'), 'projectGroupId is required', true);
            return;
        }
        const hasChanged = projectGroup.value?.name !== projectGroupName.value;
        result = hasChanged ? await updateProjectGroup({
            name: projectGroupName.value,
            project_group_id: projectGroupId.value,
        }) : projectGroup.value;
        if (result) setQueryData(result);
    } else {
        result = await createProjectGroup({
            name: projectGroupName.value,
            parent_group_id: parentGroupId.value,
        });
        invalidateAllQueries();
    }
    projectPageModalStore.closeRenameModal();
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
                    @close="projectPageModalStore.closeRenameModal()"
                    @cancel="projectPageModalStore.closeRenameModal()"
                    @closed="projectPageModalStore.resetTarget()"
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
