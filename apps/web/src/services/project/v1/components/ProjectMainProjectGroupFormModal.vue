<script lang="ts" setup>
import {
    onMounted, onUnmounted, reactive, ref, toRef, watch, computed,
} from 'vue';

import { useMutation, useQueryClient } from '@tanstack/vue-query';

import { PButtonModal, PFieldGroup, PTextInput } from '@cloudforet/mirinae';

import { useProjectGroupApi } from '@/api-clients/identity/project-group/composables/use-project-group-api';
import type { ProjectGroupModel } from '@/api-clients/identity/project-group/schema/model';
import { useServiceQueryKey } from '@/query/query-key/use-service-query-key';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';
import { useProxyValue } from '@/common/composables/proxy-state';

import { useProjectGroupQuery } from '@/services/project/v-shared/composables/queries/use-project-group-query';
import { useProjectGroupNames } from '@/services/project/v-shared/composables/use-project-group-names';


/* mutations */




interface Props {
    visible: boolean;
    projectGroupId?: string;
    updateMode: boolean;
    parentGroupId?: string;
}
const props = defineProps<Props>();
const emit = defineEmits<{(e: 'update:visible', value: boolean): void;
    (e: 'confirm', isCreating: boolean, projectGroup?: ProjectGroupModel): void;
}>();

/* project group */
const { data: projectGroup } = useProjectGroupQuery({
    projectGroupId: toRef(props, 'projectGroupId'),
});

/* modal active state */
const state = reactive({
    proxyVisible: useProxyValue('visible', props, emit),
});
const hasMounted = ref(false);
onMounted(() => {
    hasMounted.value = true;
});
onUnmounted(() => {
    hasMounted.value = false;
});

/* project group names */
const projectGroupNames = useProjectGroupNames({
    projectGroupId: computed(() => (props.updateMode ? undefined : props.projectGroupId)),
    enabled: computed(() => props.visible && hasMounted.value),
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
watch(() => props.projectGroupId, async (after) => {
    if (after && props.updateMode) {
        setForm('projectGroupName', projectGroup.value?.name);
    } else {
        initForm();
    }
}, { immediate: true });


const { projectGroupAPI } = useProjectGroupApi();
const { key: projectGroupListQueryKey } = useServiceQueryKey('identity', 'project-group', 'list');
const { withSuffix: projectGroupQueryKeyWithSuffix } = useServiceQueryKey('identity', 'project-group', 'get');
const queryClient = useQueryClient();
const { mutateAsync: createProjectGroup, isPending: isCreating } = useMutation({
    mutationFn: projectGroupAPI.create,
    onSuccess: () => {
        showSuccessMessage(i18n.t('PROJECT.LANDING.ALT_S_CREATE_PROJECT_GROUP'), '');
        queryClient.invalidateQueries({ queryKey: projectGroupListQueryKey.value });
    },
    onError: (e) => {
        ErrorHandler.handleRequestError(e, i18n.t('PROJECT.LANDING.ALT_E_CREATE_PROJECT_GROUP'));
    },
});

const { mutateAsync: updateProjectGroup, isPending: isUpdating } = useMutation({
    mutationFn: projectGroupAPI.update,
    onSuccess: (data) => {
        showSuccessMessage(i18n.t('PROJECT.LANDING.ALT_S_UPDATE_PROJECT_GROUP'), '');
        queryClient.invalidateQueries({ queryKey: projectGroupQueryKeyWithSuffix(data.project_group_id) });
        queryClient.invalidateQueries({ queryKey: projectGroupListQueryKey.value });
    },
    onError: (e) => {
        ErrorHandler.handleRequestError(e, i18n.t('PROJECT.LANDING.ALT_E_UPDATE_PROJECT_GROUP'));
    },
});
const isProcessing = computed(() => isCreating.value || isUpdating.value);



/* Event */
const confirm = async () => {
    if (isProcessing.value) return;
    if (!projectGroupName.value) return;
    if (!isAllValid.value) return;

    let result: ProjectGroupModel|undefined;

    if (props.updateMode) {
        if (!props.projectGroupId) {
            ErrorHandler.handleRequestError(new Error('projectGroupId is required'), 'projectGroupId is required', true);
            return;
        }
        const hasChanged = projectGroup.value?.name !== projectGroupName.value;
        result = hasChanged ? await updateProjectGroup({
            name: projectGroupName.value,
            project_group_id: props.projectGroupId,
        }) : projectGroup.value;
    } else {
        result = await createProjectGroup({
            name: projectGroupName.value,
            parent_group_id: props.parentGroupId,
        });
    }

    emit('confirm', !props.updateMode, result);
    state.proxyVisible = false;
};

</script>

<template>
    <p-button-modal :header-title="props.updateMode ? $t('PROJECT.LANDING.MODAL_UPDATE_PROJECT_GROUP_TITLE') : $t('PROJECT.LANDING.MODAL_CREATE_PROJECT_GROUP_TITLE')"
                    centered
                    size="sm"
                    fade
                    backdrop
                    :visible.sync="state.proxyVisible"
                    :disabled="isProcessing || !isAllValid || projectGroup?.name === projectGroupName"
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
