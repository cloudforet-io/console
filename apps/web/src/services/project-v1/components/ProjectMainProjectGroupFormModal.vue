<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';


import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import { PButtonModal, PFieldGroup, PTextInput } from '@cloudforet/mirinae';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { ProjectGroupCreateParameters } from '@/schema/identity/project-group/api-verbs/create';
import type { ProjectGroupListParameters } from '@/schema/identity/project-group/api-verbs/list';
import type { ProjectGroupUpdateParameters } from '@/schema/identity/project-group/api-verbs/update';
import type { ProjectGroupModel } from '@/schema/identity/project-group/model';
import { i18n } from '@/translations';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';
import { useProxyValue } from '@/common/composables/proxy-state';

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

const allReferenceStore = useAllReferenceStore();

const storeState = reactive({
    projectGroups: computed(() => allReferenceStore.getters.projectGroup),
});

const state = reactive({
    proxyVisible: useProxyValue('visible', props, emit),
    projectGroupNames: [] as string[],
    loading: false,
});
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
        if (state.projectGroupNames.includes(val)) return i18n.t('PROJECT.LANDING.MODAL_PROJECT_CREATE.MODAL_VALIDATION_DUPLICATED');
        return true;
    },
});

/* Api */
const projectGroupNameApiQuery = new ApiQueryHelper().setOnly('name', 'project_group_id');
const getProjectGroupNames = async () => {
    const res = await SpaceConnector.clientV2.identity.projectGroup.list<ProjectGroupListParameters, ListResponse<ProjectGroupModel>>({
        query: projectGroupNameApiQuery.data,
    });
    if (props.updateMode) {
        state.projectGroupNames = (res.results || []).filter((projectGroup) => projectGroup.project_group_id !== props.projectGroupId).map((item) => item.name);
    } else {
        state.projectGroupNames = (res.results || []).map((item) => item.name);
    }
};

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


/* Init */
(async () => {
    await getProjectGroupNames();
})();
</script>

<template>
    <p-button-modal :header-title="props.updateMode ? $t('PROJECT.LANDING.MODAL_UPDATE_PROJECT_GROUP_TITLE') : $t('PROJECT.LANDING.MODAL_CREATE_PROJECT_GROUP_TITLE')"
                    centered
                    size="sm"
                    fade
                    backdrop
                    :visible.sync="state.proxyVisible"
                    :disabled="state.loading || !isAllValid || storeState.projectGroups[props.projectGroupId]?.name === projectGroupName"
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
