<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';
import VueI18n from 'vue-i18n';
import { useRouter } from 'vue-router/composables';

import { PButtonModal, PFieldGroup, PTextInput } from '@spaceone/design-system';
import { isEmpty } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ProjectUpdateParameters } from '@/schema/identity/project/api-verbs/udpate';
import type { ProjectModel } from '@/schema/identity/project/model';
import { store } from '@/store';
import { i18n } from '@/translations';

import type { ProjectReferenceItem, ProjectReferenceMap } from '@/store/modules/reference/project/type';
import { useProjectStore } from '@/store/reference/project-store';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';

import TranslateResult = VueI18n.TranslateResult;


interface Props {
    visible?: boolean;
    projectGroupId?: string;
    projectId?: string;
}
const props = withDefaults(defineProps<Props>(), {
    visible: false,
    projectGroupId: undefined,
    projectId: undefined,
});
const emit = defineEmits<{(e: 'confirm', project?: ProjectModel): void;
    (e: 'update:visible', visible?: boolean): void;
}>();
const router = useRouter();
const projectStore = useProjectStore();

const state = reactive({
    project: computed<ProjectModel>(() => projectStore.getters.projectItems?.[props.projectId] ?? {}),
    proxyVisible: useProxyValue('visible', props, emit),
    projectNames: computed<string[]>(() => {
        const projectItems: ProjectReferenceMap = projectStore.getters.projectItems;
        if (isEmpty(projectItems)) return [];
        return Object.values(projectItems).map((project: ProjectReferenceItem) => project.name);
    }),
    projectName: undefined as string|undefined,
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

const updateProject = async (): Promise<ProjectModel|undefined> => {
    let updatedProject: ProjectModel|undefined;
    try {
        updatedProject = await SpaceConnector.clientV2.identity.project.update<ProjectUpdateParameters, ProjectModel>({
            name: state.projectName.trim(),
            project_id: props.projectId || router.currentRoute.params.id,
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
        const project: ProjectModel|undefined = await updateProject();
        if (project) {
            state.proxyVisible = false;
            emit('confirm', project);
        }
    } catch (e) {
        ErrorHandler.handleError(e);
    } finally {
        state.loading = false;
        state.proxyVisible = false;
        state.showValidation = false;
    }
};

watch(() => state.project, async (project) => {
    if (!isEmpty(project)) state.projectName = project?.name;
    else state.projectName = undefined; // init form
}, { immediate: true });
</script>

<template>
    <p-button-modal
        :header-title="$t('PROJECT.DETAIL.MODAL_UPDATE_PROJECT_TITLE')"
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
