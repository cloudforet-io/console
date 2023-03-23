<template>
    <p-button-modal
        :header-title="updateMode ? $t('PROJECT.DETAIL.MODAL_UPDATE_PROJECT_TITLE') : $t('PROJECT.DETAIL.MODAL_CREATE_PROJECT_TITLE')"
        centered
        size="sm"
        fade
        backdrop
        :visible.sync="proxyVisible"
        :disabled="loading || (showValidation && !isProjectNameValid)"
        @confirm="confirm"
    >
        <template #body>
            <p-field-group :label="$t('PROJECT.DETAIL.MODAL_CREATE_PROJECT_LABEL')"
                           :invalid-text="projectNameInvalidText"
                           :invalid="showValidation && !isProjectNameValid"
                           required
            >
                <template #default="{invalid}">
                    <p-text-input v-model="projectName"
                                  class="block w-full"
                                  :invalid="showValidation && invalid"
                                  :placeholder="$t('PROJECT.DETAIL.MODAL_CREATE_PROJECT_PLACEHOLDER')"
                    />
                </template>
            </p-field-group>
        </template>
    </p-button-modal>
</template>

<script lang="ts">

import {
    computed, getCurrentInstance, reactive, toRefs,
} from 'vue';
import VueI18n from 'vue-i18n';
import type { Vue } from 'vue/types/vue';

import { PButtonModal, PFieldGroup, PTextInput } from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { store } from '@/store';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';

import { useProjectPageStore } from '@/services/project/store/project-page-store';
import type { ProjectModel } from '@/services/project/type';

import TranslateResult = VueI18n.TranslateResult;


export default {
    name: 'ProjectFormModal',
    components: {
        PTextInput,
        PFieldGroup,
        PButtonModal,
    },
    directives: {
        focus: {
            inserted(el) {
                el.focus();
            },
        },
    },
    props: {
        visible: {
            type: Boolean,
            default: false,
            required: true,
        },
        projectGroupId: {
            type: String,
            default: '',
            required: true,
        },
        project: {
            type: Object,
            default: undefined,
        },
    },
    setup(props, { emit }) {
        const vm = getCurrentInstance()?.proxy as Vue;
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

        const apiQuery = new ApiQueryHelper();
        const getProjectNames = async () => {
            apiQuery.setOnly('name');
            const res = await SpaceConnector.client.identity.projectGroup.listProjects({
                // eslint-disable-next-line camelcase
                project_group_id: props.projectGroupId,
                query: apiQuery.data,
            });
            state.projectNames = res.results.map((d) => d.name);
        };

        const createProject = async (params) => {
            const projectInfo = await projectPageStore.createProject(params);
            await store.dispatch('reference/project/load');
            return projectInfo;
        };

        const updateProject = async (params): Promise<ProjectModel|undefined> => {
            let projectInfo:ProjectModel|undefined;
            try {
                projectInfo = await SpaceConnector.client.identity.project.update({
                    ...params,
                    project_id: props.project?.project_id || vm.$router.currentRoute.params.id,
                });
                showSuccessMessage(i18n.t('PROJECT.DETAIL.ALT_S_UPDATE_PROJECT'), '');
            } catch (e: any) {
                ErrorHandler.handleRequestError(e, i18n.t('PROJECT.DETAIL.ALT_E_UPDATE_PROJECT'));
                throw new Error(e);
            }
            return projectInfo;
        };

        const confirm = async () => {
            if (state.loading) return;
            if (!state.showValidation) state.showValidation = true;
            if (!state.isProjectNameValid) return;

            state.loading = true;
            const params = {
                project_group_id: props.projectGroupId,
                name: state.projectName.trim(),
            };

            try {
                let projectInfo:ProjectModel|undefined;
                if (state.updateMode) {
                    projectInfo = await updateProject(params);
                } else {
                    projectInfo = await createProject(params);
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

        return {
            ...toRefs(state),
            confirm,
        };
    },
};
</script>
