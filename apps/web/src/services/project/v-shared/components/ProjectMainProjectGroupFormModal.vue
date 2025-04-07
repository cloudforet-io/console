<script lang="ts" setup>
import {
    computed, onMounted, onUnmounted, reactive, ref, toRef, watch,
} from 'vue';


import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { PButtonModal, PFieldGroup, PTextInput } from '@cloudforet/mirinae';

import type { ProjectGroupCreateParameters } from '@/api-clients/identity/project-group/schema/api-verbs/create';
import type { ProjectGroupUpdateParameters } from '@/api-clients/identity/project-group/schema/api-verbs/update';
import type { ProjectGroupModel } from '@/api-clients/identity/project-group/schema/model';
import { i18n } from '@/translations';

import { useProjectGroupReferenceStore } from '@/store/reference/project-group-reference-store';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';
import { useProxyValue } from '@/common/composables/proxy-state';

import { useProjectGroupQuery } from '@/services/project/v-shared/composables/queries/use-project-group-query';
import { useProjectGroupNames } from '@/services/project/v-shared/composables/use-project-group-names';

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


const projectGroupReferenceStore = useProjectGroupReferenceStore();
const storeState = reactive({
    projectGroups: computed(() => projectGroupReferenceStore.getters.projectGroupItems),
});
const { data: projectGroup } = useProjectGroupQuery({
    projectGroupId: toRef(props, 'projectGroupId'),
});

const state = reactive({
    proxyVisible: useProxyValue('visible', props, emit),
    loading: false,
});

/* hasMounted */
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


/* Api */
const createProjectGroup = async (params: ProjectGroupCreateParameters): Promise<ProjectGroupModel|undefined> => {
    try {
        const result = await SpaceConnector.clientV2.identity.projectGroup.create<ProjectGroupCreateParameters, ProjectGroupModel>(params);
        showSuccessMessage(i18n.t('PROJECT.LANDING.ALT_S_CREATE_PROJECT_GROUP'), '');
        return result;
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('PROJECT.LANDING.ALT_E_CREATE_PROJECT_GROUP'));
        return undefined;
    }
};
const updateProjectGroup = async (params: ProjectGroupUpdateParameters): Promise<ProjectGroupModel|undefined> => {
    try {
        const result = await SpaceConnector.clientV2.identity.projectGroup.update<ProjectGroupUpdateParameters, ProjectGroupModel>(params);
        showSuccessMessage(i18n.t('PROJECT.LANDING.ALT_S_UPDATE_PROJECT_GROUP'), '');
        return result;
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('PROJECT.LANDING.ALT_E_UPDATE_PROJECT_GROUP'));
        return undefined;
    }
};

/* Event */
const confirm = async () => {
    if (state.loading) return;
    if (!projectGroupName.value) return;
    if (!isAllValid.value) return;

    state.loading = true;
    const updateParams: ProjectGroupUpdateParameters = {
        name: projectGroupName.value,
        project_group_id: props.projectGroupId as string,
    };

    const createParams: ProjectGroupCreateParameters = {
        name: projectGroupName.value,
        parent_group_id: props.parentGroupId,
    };

    let result: ProjectGroupModel|undefined;

    if (!props.updateMode) result = await createProjectGroup({ ...createParams } as ProjectGroupCreateParameters);
    else result = await updateProjectGroup({ ...updateParams });

    emit('confirm', !props.updateMode, result);
    state.loading = false;
    state.proxyVisible = false;
};

watch(() => props.projectGroupId, async (after) => {
    if (after && props.updateMode) {
        setForm('projectGroupName', storeState.projectGroups[after].name);
    } else {
        initForm();
    }
}, { immediate: true });


</script>

<template>
    <p-button-modal :header-title="props.updateMode ? $t('PROJECT.LANDING.MODAL_UPDATE_PROJECT_GROUP_TITLE') : $t('PROJECT.LANDING.MODAL_CREATE_PROJECT_GROUP_TITLE')"
                    centered
                    size="sm"
                    fade
                    backdrop
                    :visible.sync="state.proxyVisible"
                    :disabled="state.loading || !isAllValid || projectGroup?.name === projectGroupName"
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
