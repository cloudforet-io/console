<template>
    <p-button-modal :header-title="updateMode ? $t('PROJECT.LANDING.MODAL_UPDATE_PROJECT_GROUP_TITLE') : $t('PROJECT.LANDING.MODAL_CREATE_PROJECT_GROUP_TITLE')"
                    centered
                    :scrollable="false"
                    size="sm"
                    fade
                    backdrop
                    :visible.sync="proxyVisible"
                    :disabled="loading || (showValidation && !isValid)"
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
                                  @keydown.enter="confirm"
                    />
                </template>
            </p-field-group>
        </template>
    </p-button-modal>
</template>

<script lang="ts">
import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';

import { PButtonModal, PFieldGroup, PTextInput } from '@spaceone/design-system';

import { showErrorMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { ApiQueryHelper } from '@spaceone/console-core-lib/space-connector/helper';
import VueI18n from 'vue-i18n';
import { store } from '@/store';
import { i18n } from '@/translations';

import TranslateResult = VueI18n.TranslateResult;

export default {
    name: 'ProjectGroupFormModal',
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
    setup(props, { root }) {
        const state = reactive({
            proxyVisible: computed({
                get() { return store.state.service.project.projectGroupFormVisible; },
                set(val) { store.commit('service/project/setProjectGroupFormVisible', val); },
            }),
            updateMode: computed(() => store.state.service.project.projectGroupFormUpdateMode),
            currentGroupId: computed(() => store.getters['service/project/actionTargetNodeData']?.id),
            projectGroupNames: [] as string[],
            projectGroupName: undefined as undefined | string,
            projectGroupNameInvalidText: computed(() => {
                let invalidText = '' as TranslateResult;
                if (typeof state.projectGroupName === 'string') {
                    if (state.projectGroupName.length === 0) {
                        invalidText = i18n.t('PROJECT.DETAIL.MODAL_VALIDATION_REQUIRED');
                    } else if (state.projectGroupName.length > 40) {
                        invalidText = i18n.t('PROJECT.DETAIL.MODAL_VALIDATION_LENGTH');
                    } else if (state.projectGroupNames.includes(state.projectGroupName)) {
                        invalidText = i18n.t('PROJECT.DETAIL.MODAL_VALIDATION_DUPLICATED');
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
            loading: false,
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
                project_group_id: state.currentGroupId,
                query: projectGroupApiQuery.data,
            });
            state.projectGroupName = res.name;
        };

        const createProjectGroup = async (item) => {
            try {
                await store.dispatch('service/project/createProjectGroup', item);
                await store.dispatch('resource/projectGroup/load');
                showSuccessMessage(i18n.t('PROJECT.LANDING.ALT_S_CREATE_PROJECT_GROUP'), '', root);
            } catch (e) {
                showErrorMessage(i18n.t('PROJECT.LANDING.ALT_E_CREATE_PROJECT_GROUP'), e);
                throw new Error(e);
            }
        };

        const updateProjectGroup = async (item) => {
            try {
                await store.dispatch('service/project/updateProjectGroup', item);
                showSuccessMessage(i18n.t('PROJECT.LANDING.ALT_S_UPDATE_PROJECT_GROUP'), '', root);
            } catch (e) {
                showErrorMessage(i18n.t('PROJECT.LANDING.ALT_E_UPDATE_PROJECT_GROUP'), e);
                throw new Error(e);
            }
        };

        const confirm = async () => {
            if (state.loading) return;
            if (!state.showValidation) state.showValidation = true;
            if (!state.isValid) return;

            state.loading = true;
            const item = {
                name: state.projectGroupName,
            };

            state.showValidation = false;

            if (!state.updateMode) await createProjectGroup(item);
            else await updateProjectGroup(item);

            state.loading = false;
            store.commit('service/project/setProjectGroupFormVisible', false);
        };

        watch(() => state.currentGroupId, async (after) => {
            if (after && state.updateMode) await getProjectGroup();
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
