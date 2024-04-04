<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';

import { PButtonModal, PFieldGroup, PTextInput } from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { ProjectGroupCreateParameters } from '@/schema/identity/project-group/api-verbs/create';
import type { ProjectGroupListParameters } from '@/schema/identity/project-group/api-verbs/list';
import type { ProjectGroupUpdateParameters } from '@/schema/identity/project-group/api-verbs/update';
import type { ProjectGroupModel } from '@/schema/identity/project-group/model';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';

import { useProjectPageStore } from '@/services/project/stores/project-page-store';


const projectPageStore = useProjectPageStore();
const projectPageGetters = projectPageStore.getters;
const projectPageState = projectPageStore.state;
const state = reactive({
    proxyVisible: computed({
        get() { return projectPageState.projectGroupFormVisible; },
        set(val) { projectPageStore.setProjectGroupFormVisible(val); },
    }),
    currentGroupId: computed(() => projectPageGetters.actionTargetNodeData?.id),
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
const projectGroupNameApiQuery = new ApiQueryHelper().setOnly('name');
const getProjectGroupNames = async () => {
    const res = await SpaceConnector.clientV2.identity.projectGroup.list<ProjectGroupListParameters, ListResponse<ProjectGroupModel>>({
        query: projectGroupNameApiQuery.data,
    });
    const names = res.results?.map((d) => d.name) ?? [];
    if (projectPageState.projectGroupFormUpdateMode) {
        state.projectGroupNames = names.filter((name) => name !== projectPageGetters.groupName);
    } else {
        state.projectGroupNames = names;
    }
};

const createProjectGroup = async (params: ProjectGroupCreateParameters) => {
    try {
        await projectPageStore.createProjectGroup(params);
        showSuccessMessage(i18n.t('PROJECT.LANDING.ALT_S_CREATE_PROJECT_GROUP'), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('PROJECT.LANDING.ALT_E_CREATE_PROJECT_GROUP'));
    }
};
const updateProjectGroup = async (params: Partial<ProjectGroupUpdateParameters>) => {
    try {
        await projectPageStore.updateProjectGroup(params);
        showSuccessMessage(i18n.t('PROJECT.LANDING.ALT_S_UPDATE_PROJECT_GROUP'), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('PROJECT.LANDING.ALT_E_UPDATE_PROJECT_GROUP'));
    }
};

/* Event */
const confirm = async () => {
    if (state.loading) return;
    if (!isAllValid.value) return;

    state.loading = true;
    const params: ProjectGroupCreateParameters | Partial<ProjectGroupUpdateParameters> = {
        name: projectGroupName.value,
    };

    if (!projectPageState.projectGroupFormUpdateMode) await createProjectGroup(params as ProjectGroupCreateParameters);
    else await updateProjectGroup(params);

    state.loading = false;
    projectPageStore.setProjectGroupFormVisible(false);
};

watch(() => state.currentGroupId, async (after) => {
    if (after && projectPageState.projectGroupFormUpdateMode) {
        setForm('projectGroupName', projectPageGetters.groupName);
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
    <p-button-modal :header-title="projectPageState.projectGroupFormUpdateMode ? $t('PROJECT.LANDING.MODAL_UPDATE_PROJECT_GROUP_TITLE') : $t('PROJECT.LANDING.MODAL_CREATE_PROJECT_GROUP_TITLE')"
                    centered
                    size="sm"
                    fade
                    backdrop
                    :visible.sync="state.proxyVisible"
                    :disabled="state.loading || !isAllValid"
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
