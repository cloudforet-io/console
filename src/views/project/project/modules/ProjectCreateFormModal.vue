<template>
    <p-button-modal
        :header-title="updateMode ? $t('PROJECT.DETAIL.MODAL_UPDATE_PROJECT_TITLE') : $t('PROJECT.DETAIL.MODAL_CREATE_PROJECT_TITLE')"
        centered
        size="md"
        fade
        :scrollable="false"
        backdrop
        :visible.sync="proxyVisible"
        :disabled="showValidation && !isProjectNameValid"
        @confirm="confirm"
    >
        <template #body>
            <p-field-group :label="$t('PROJECT.DETAIL.MODAL_CREATE_PROJECT_LABEL')"
                           :invalid-text="projectNameInvalidText"
                           :invalid="showValidation && !isProjectNameValid"
                           required
            >
                <template #default="{invalid}">
                    <p-text-input v-model="projectName" class="block w-full" :invalid="showValidation && invalid"
                                  :placeholder="$t('PROJECT.DETAIL.MODAL_CREATE_PROJECT_PLACEHOLDER')"
                    />
                </template>
            </p-field-group>
        </template>
    </p-button-modal>
</template>

<script lang="ts">
import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';

import { PButtonModal, PFieldGroup, PTextInput } from '@spaceone/design-system';

import { SpaceConnector } from '@/lib/space-connector';
import { ApiQueryHelper } from '@/lib/space-connector/helper';
import { makeProxy } from '@/lib/compostion-util';
import VueI18n from 'vue-i18n';

import TranslateResult = VueI18n.TranslateResult;

export default {
    name: 'ProjectCreateFormModal',
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
        },
        schemaNames: {
            type: Array,
            default: () => ([]),
        },
        item: {
            type: Object,
            default: () => ({
                properties: {},
            }),
        },
        updateMode: {
            type: Boolean,
            default: false,
        },
        projectGroupId: {
            type: String,
            default: '',
        },
        currentProject: {
            type: String,
            default: undefined,
        },
    },
    setup(props, { emit }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            proxyVisible: makeProxy('visible', props, emit),
            projectNames: [] as string[],
            projectName: props.currentProject,
            projectNameInvalidText: computed(() => {
                let invalidText = '' as TranslateResult;
                if (typeof state.projectName === 'string') {
                    if (state.projectName.length === 0) {
                        invalidText = vm.$t('PROJECT.DETAIL.MODAL_VALIDATION_REQUIRED');
                    } else if (state.projectName.length > 40) {
                        invalidText = vm.$t('PROJECT.DETAIL.MODAL_VALIDATION_LENGTH');
                    } else if (state.projectNames.includes(state.projectName)) {
                        invalidText = vm.$t('PROJECT.DETAIL.MODAL_VALIDATION_DUPLICATED');
                    }
                }
                return invalidText;
            }),
            isProjectNameValid: computed(() => {
                if (state.projectName) {
                    return !(state.projectName.length === 0 || state.projectName.length > 40 || state.projectNames.includes(state.projectName));
                }
                return false;
            }),
            showValidation: false,
        });


        const apiQuery = new ApiQueryHelper();
        const getProjectNames = async () => {
            apiQuery.setOnly('name');
            const res = await SpaceConnector.client.identity.projectGroup.listProjects({
                // eslint-disable-next-line camelcase
                project_group_id: props.projectGroupId,
                query: apiQuery.data,
            });
            state.projectNames = res.results.map(d => d.name);
        };

        const confirm = async () => {
            if (!state.showValidation) state.showValidation = true;
            if (!state.isProjectNameValid) return;

            const item = {
                name: state.projectName,
            };
            emit('confirm', item);
            state.showValidation = false;
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
