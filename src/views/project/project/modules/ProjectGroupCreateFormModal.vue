<template>
    <p-button-modal
        :header-title="updateMode ? $t('PROJECT.LANDING.MODAL_UPDATE_PROJECT_GROUP_TITLE') : $t('PROJECT.LANDING.MODAL_CREATE_PROJECT_GROUP_TITLE')"
        centered
        :scrollable="false"
        size="md"
        fade
        backdrop
        :visible.sync="proxyVisible"
        :disabled="showValidation && !isValid"
        @confirm="confirm"
    >
        <template #body>
            <p-field-group :label="$t('PROJECT.LANDING.MODAL_CREATE_PROJECT_GROUP_LABEL')"
                           :invalid-text="projectGroupNameInvalidText"
                           :invalid="showValidation && !isValid"
                           required
            >
                <template #default="{invalid}">
                    <p-text-input v-model="projectGroupName" class="block w-full" :invalid="showValidation && invalid"
                                  :placeholder="$t('PROJECT.LANDING.MODAL_CREATE_PROJECT_GROUP_PLACEHOLDER')"
                    />
                </template>
            </p-field-group>
        </template>
    </p-button-modal>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import {
    ComponentRenderProxy,
    computed, getCurrentInstance, reactive, toRefs, watch,
} from '@vue/composition-api';

import { PButtonModal, PFieldGroup, PTextInput } from '@spaceone/design-system';

import { ProjectGroup } from '@/views/project/project/type';

import { showErrorMessage, showSuccessMessage } from '@/lib/util';
import { makeProxy } from '@/lib/compostion-util';
import { SpaceConnector } from '@/lib/space-connector';
import { ApiQueryHelper } from '@/lib/space-connector/helper';
import VueI18n from 'vue-i18n';

import TranslateResult = VueI18n.TranslateResult;

interface Props {
    visible: boolean;
    updateMode: boolean;
    id?: string;
    parent: ProjectGroup|null;
}
export default {
    name: 'ProjectGroupCreateFormModal',
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
        updateMode: {
            type: Boolean,
            default: false,
        },
        parent: {
            type: Object,
            default: null,
        },
        id: {
            type: String,
            default: undefined,
        },
    },
    setup(props: Props, { emit, root }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;

        const state = reactive({
            proxyVisible: makeProxy('visible', props, emit),
            projectGroupNames: [] as string[],
            projectGroupName: undefined as undefined | string,
            projectGroupNameInvalidText: computed(() => {
                let invalidText = '' as TranslateResult;
                if (typeof state.projectGroupName === 'string') {
                    if (state.projectGroupName.length === 0) {
                        invalidText = vm.$t('PROJECT.DETAIL.MODAL_VALIDATION_REQUIRED');
                    } else if (state.projectGroupName.length > 40) {
                        invalidText = vm.$t('PROJECT.DETAIL.MODAL_VALIDATION_LENGTH');
                    } else if (state.projectGroupNames.includes(state.projectGroupName)) {
                        invalidText = vm.$t('PROJECT.DETAIL.MODAL_VALIDATION_DUPLICATED');
                    }
                }
                return invalidText;
            }),
            isValid: computed(() => {
                if (state.projectGroupName) {
                    return !(state.projectGroupName.length === 0 || state.projectGroupName.length > 40 || state.projectGroupNames.includes(state.projectGroupName));
                }
                return false;
            }),
            showValidation: false,
        });

        const projectGroupNameApiQuery = new ApiQueryHelper().setOnly('name');
        const getProjectGroupNames = async () => {
            const res = await SpaceConnector.client.identity.projectGroup.list({
                query: projectGroupNameApiQuery.data,
            });
            state.projectGroupNames = res.results.map(d => d.name);
        };


        const projectGroupApiQuery = new ApiQueryHelper().setOnly('project_group_id', 'name');
        const getProjectGroup = async () => {
            const res = await SpaceConnector.client.identity.projectGroup.get({
                project_group_id: props.id,
                query: projectGroupApiQuery.data,
            });
            state.projectGroupName = res.name;
        };

        const createProjectGroup = async (item) => {
            try {
                const params = item;
                if (props.parent) params.parent_project_group_id = props.parent.id;
                const res = await SpaceConnector.client.identity.projectGroup.create(params);
                showSuccessMessage(vm.$t('PROJECT.LANDING.ALT_S_CREATE_PROJECT_GROUP'), '', root);

                emit('create', {
                    id: res.project_group_id,
                    name: item.name,
                } as ProjectGroup, props);
            } catch (e) {
                showErrorMessage(vm.$t('PROJECT.LANDING.ALT_E_CREATE_PROJECT_GROUP'), e, root);
            }
        };

        const updateProjectGroup = async (item) => {
            try {
                const params = item;
                if (props.id) params.project_group_id = props.id;
                await SpaceConnector.client.identity.projectGroup.update(params);
                showSuccessMessage(vm.$t('PROJECT.LANDING.ALT_S_UPDATE_PROJECT_GROUP'), '', root);

                emit('update', {
                    id: props.id,
                    name: item.name,
                } as ProjectGroup, props);
            } catch (e) {
                showErrorMessage(vm.$t('PROJECT.LANDING.ALT_E_UPDATE_PROJECT_GROUP'), e, root);
            }
        };
        const confirm = async () => {
            if (!state.showValidation) state.showValidation = true;
            if (!state.isValid) return;
            const item = {
                name: state.projectGroupName,
            };
            if (!props.updateMode) {
                await createProjectGroup(item);
            } else {
                await updateProjectGroup(item);
            }
            state.showValidation = false;
        };

        watch(() => props.id, async (after) => {
            if (after) await getProjectGroup();
            else state.projectGroupName = undefined; // init form
        }, { immediate: true });

        const init = async () => {
            await getProjectGroupNames();
        };
        init();

        return {
            ...toRefs(state),
            confirm,
        };
    },
};
</script>
