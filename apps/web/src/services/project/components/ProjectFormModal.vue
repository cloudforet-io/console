<script lang="ts" setup>
import {
    computed, reactive,
} from 'vue';
import VueI18n from 'vue-i18n';
import { useRouter } from 'vue-router/composables';

import { PButtonModal, PFieldGroup, PTextInput } from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { ProjectCreateParameters } from '@/schema/identity/project/api-verbs/create';
import type { ProjectListParameters } from '@/schema/identity/project/api-verbs/list';
import type { ProjectUpdateParameters } from '@/schema/identity/project/api-verbs/udpate';
import type { ProjectModel } from '@/schema/identity/project/model';
import { store } from '@/store';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';

import { useProjectPageStore } from '@/services/project/stores/project-page-store';

import TranslateResult = VueI18n.TranslateResult;


interface Props {
    visible?: boolean;
    projectGroupId?: string;
    project?: ProjectModel;
}
const props = withDefaults(defineProps<Props>(), {
    visible: false,
    projectGroupId: '',
    project: undefined,
});
const emit = defineEmits<{(e: 'complete', projectInfo?: ProjectModel): void;
    (e: 'update:visible'): void;
}>();
const router = useRouter();

const projectPageStore = useProjectPageStore();
const state = reactive({
    updateMode: computed(() => !!props.project),
    proxyVisible: useProxyValue('visible', props, emit),
    projectNames: [] as string[],
    projectName: props.project?.name as string|undefined,
    projectNameInvalidText: computed(() => {
        let invalidText = '' as TranslateResult;
        if (typeof state.projectName === 'string') {
            if ((state.projectName.trim()).length === 0) {
                invalidText = i18n.t('PROJECT.DETAIL.MODAL_VALIDATION_REQUIRED');
            } else if (state.projectName.length > 40) {
                invalidText = i18n.t('PROJECT.DETAIL.MODAL_VALIDATION_LENGTH');
            } else if (state.projectNames.includes(state.projectName)) {
                invalidText = i18n.t('PROJECT.DETAIL.MODAL_VALIDATION_DUPLICATED');
            }
        }
        return invalidText;
    }),
    isProjectNameValid: computed(() => {
        if (state.projectName) {
            return !(state.projectName.trim().length === 0 || state.projectName.trim().length > 40 || state.projectNames.includes(state.projectName));
        }
        return false;
    }),
    showValidation: false,
    loading: false,
});

const getProjectNames = async () => {
    try {
        const { results } = await SpaceConnector.clientV2.identity.project.list<ProjectListParameters, ListResponse<ProjectModel>>({
            project_group_id: props.projectGroupId,
            domain_id: store.state.domain.domainId, // TODO: remove domain_id after backend is ready
        });
        state.projectNames = results?.map((d) => d.name) ?? [];
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};

const createProject = async (): Promise<ProjectModel|undefined> => {
    const params: ProjectCreateParameters = {
        name: state.projectName.trim(),
        project_type: 'PRIVATE', // TODO: project_type
    };
    if (props.projectGroupId) params.project_group_id = props.projectGroupId;
    const projectInfo = await projectPageStore.createProject(params);
    await store.dispatch('reference/project/load');
    return projectInfo;
};

const updateProject = async (): Promise<ProjectModel|undefined> => {
    let updatedProject: ProjectModel|undefined;
    try {
        updatedProject = await SpaceConnector.clientV2.identity.project.update<ProjectUpdateParameters, ProjectModel>({
            name: state.projectName.trim(),
            project_id: props.project?.project_id || router.currentRoute.params.id,
            domain_id: store.state.domain.domainId, // TODO: remove domain_id after backend is ready
        });
        showSuccessMessage(i18n.t('PROJECT.DETAIL.ALT_S_UPDATE_PROJECT'), '');
    } catch (e: any) {
        ErrorHandler.handleRequestError(e, i18n.t('PROJECT.DETAIL.ALT_E_UPDATE_PROJECT'));
        throw new Error(e);
    }
    return updatedProject;
};

const confirm = async () => {
    if (state.loading) return;
    if (!state.showValidation) state.showValidation = true;
    if (!state.isProjectNameValid) return;

    state.loading = true;

    try {
        let projectInfo:ProjectModel|undefined;
        if (state.updateMode) {
            projectInfo = await updateProject();
        } else {
            projectInfo = await createProject();
        }
        emit('complete', projectInfo);
    } catch (e) {
        ErrorHandler.handleError(e);
    } finally {
        state.loading = false;
        state.proxyVisible = false;
        state.showValidation = false;
    }
};

/** Init */
(async () => {
    await getProjectNames();
})();
</script>

<template>
    <p-button-modal
        :header-title="state.updateMode ? $t('PROJECT.DETAIL.MODAL_UPDATE_PROJECT_TITLE') : $t('PROJECT.DETAIL.MODAL_CREATE_PROJECT_TITLE')"
        centered
        size="sm"
        fade
        backdrop
        :visible.sync="state.proxyVisible"
        :disabled="state.loading || (state.showValidation && !state.isProjectNameValid)"
        @confirm="confirm"
    >
        <template #body>
            <p-field-group :label="$t('PROJECT.DETAIL.MODAL_CREATE_PROJECT_LABEL')"
                           :invalid-text="state.projectNameInvalidText"
                           :invalid="state.showValidation && !state.isProjectNameValid"
                           required
            >
                <template #default="{invalid}">
                    <p-text-input v-model="state.projectName"
                                  class="block w-full"
                                  :invalid="state.showValidation && invalid"
                                  :placeholder="$t('PROJECT.DETAIL.MODAL_CREATE_PROJECT_PLACEHOLDER')"
                    />
                </template>
            </p-field-group>
        </template>
    </p-button-modal>
</template>
