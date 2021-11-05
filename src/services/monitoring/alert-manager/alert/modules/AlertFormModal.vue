<template>
    <p-button-modal :visible.sync="proxyVisible"
                    :header-title="$t('MONITORING.ALERT.ALERT_LIST.FORM.TITLE_CREATE')"
                    size="sm"
                    :disabled="!isAllValid"
                    :loading="loading"
                    @confirm="onConfirm"
    >
        <template #body>
            <p-field-group :label="$t('MONITORING.ALERT.ALERT_LIST.FORM.LABEL_ALERT_TITLE')" required
                           :invalid="titleInvalid"
                           :invalid-text="titleInvalidText"
            >
                <p-text-input v-model="title" block :placeholder="$t('MONITORING.ALERT.ALERT_LIST.FORM.LABEL_ALERT_TITLE')"
                              :invalid="titleInvalid"
                />
            </p-field-group>
            <p-field-group :label="$t('MONITORING.ALERT.ALERT_LIST.FORM.LABEL_URGENCY')" required>
                <p-radio v-model="urgency" :value="ALERT_URGENCY.HIGH">
                    {{ $t('MONITORING.ALERT.ALERT_LIST.FORM.HIGH') }}
                </p-radio>
                <p-radio v-model="urgency" :value="ALERT_URGENCY.LOW">
                    {{ $t('MONITORING.ALERT.ALERT_LIST.FORM.LOW') }}
                </p-radio>
            </p-field-group>
            <p-field-group class="project-field-group" :label="$t('MONITORING.ALERT.ALERT_LIST.FORM.LABEL_PROJECT')" required
                           :invalid="projectInvalid"
                           :invalid-text="projectInvalidText"
            >
                <template #label-extra>
                    <p-anchor v-if="!projectId" class="go-project" highlight
                              :to="{name: PROJECT_ROUTE._NAME }"
                    >
                        {{ $t('MONITORING.ALERT.ALERT_LIST.FORM.CREATE_PROJECT') }}
                    </p-anchor>
                </template>
                <project-select-dropdown :invalid="projectInvalid"
                                         :selected-project-ids="projectId ? [projectId] : undefined"
                                         :readonly="!!projectId"
                                         @select="onSelectProject"
                />
            </p-field-group>
            <p-button v-if="projectInvalid && isProjectAlertSet === false" class="project-set-button" style-type="secondary-dark"
                      size="sm" @click="setProjectAlert"
            >
                {{ $t('MONITORING.ALERT.ALERT_LIST.FORM.SET_PROJECT_ALERT_NOW') }}
            </p-button>

            <p-field-group :label="$t('MONITORING.ALERT.ALERT_LIST.FORM.LABEL_DESCRIPTION')">
                <p-textarea v-model="description" />
            </p-field-group>
        </template>
    </p-button-modal>
</template>

<script lang="ts">
import {
    PAnchor, PButton,
    PButtonModal, PFieldGroup, PRadio, PTextarea, PTextInput,
} from '@spaceone/design-system';
import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';
import { makeProxy } from '@/lib/helper/composition-helpers';
import { PROJECT_ROUTE } from '@/services/project/routes';
import ProjectSelectDropdown from '@/common/modules/project/ProjectSelectDropdown.vue';
import { i18n } from '@/translations';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { showErrorMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';
import { ProjectItemResp } from '@/services/project/type';
import { ALERT_URGENCY } from '@/services/monitoring/alert-manager/lib/config';

export default {
    name: 'AlertFormModal',
    components: {
        ProjectSelectDropdown,
        PButtonModal,
        PFieldGroup,
        PTextInput,
        PRadio,
        PAnchor,
        PButton,
        PTextarea,
    },
    props: {
        visible: {
            type: Boolean,
            default: false,
        },
        projectId: {
            type: String,
            default: undefined,
        },
    },
    setup(props, { emit, root }) {
        const state = reactive({
            proxyVisible: makeProxy('visible', props, emit),
            loading: false,
            // inputs
            title: undefined as undefined|string,
            urgency: ALERT_URGENCY.HIGH,
            selectedProjectId: props.projectId as undefined|null|string,
            description: '',
            // validation
            titleInvalidText: computed(() => {
                if (!state.title?.trim()) return i18n.t('MONITORING.ALERT.ALERT_LIST.FORM.REQUIRED_TITLE');
                return undefined;
            }),
            titleInvalid: computed(() => state.title !== undefined && !!state.titleInvalidText),
            isProjectAlertSet: undefined as undefined|boolean,
            projectInvalidText: computed(() => {
                if (state.selectedProjectId === null) return i18n.t('MONITORING.ALERT.ALERT_LIST.FORM.REQUIRED_PROJECT');
                if (state.isProjectAlertSet === false) return i18n.t('MONITORING.ALERT.ALERT_LIST.FORM.NEED_TO_SET_PROJECT_ALERT');
                return undefined;
            }),
            projectInvalid: computed(() => state.selectedProjectId !== undefined && !!state.projectInvalidText),
            isAllValid: computed(() => state.title !== undefined && !state.titleInvalid && state.selectedProjectId !== undefined && !state.projectInvalid),
        });

        const checkProject = async () => {
            state.isProjectAlertSet = undefined;
            try {
                await SpaceConnector.client.monitoring.projectAlertConfig.get({
                    project_id: state.selectedProjectId,
                });
                state.isProjectAlertSet = true;
            } catch (e) {
                state.isProjectAlertSet = false;
            }
        };

        const setProjectAlert = async () => {
            try {
                await SpaceConnector.client.monitoring.projectAlertConfig.create({
                    project_id: state.selectedProjectId,
                });
                state.isProjectAlertSet = true;
            } catch (e) {
                state.isProjectAlertSet = false;
                console.error(e);
            }
        };

        const createAlert = async () => {
            try {
                await SpaceConnector.client.monitoring.alert.create({
                    title: state.title,
                    urgency: state.urgency,
                    project_id: state.selectedProjectId,
                    description: state.description,
                });
                showSuccessMessage(i18n.t('MONITORING.ALERT.ALERT_LIST.ALT_S_CREATE'), '', root);
                emit('confirm');
            } catch (e) {
                showErrorMessage(i18n.t('MONITORING.ALERT.ALERT_LIST.ALT_E_CREATE'), e);
                throw e;
            }
        };


        const onConfirm = async () => {
            if (!state.isAllValid) return;

            state.loading = true;
            try {
                await createAlert();

                state.proxyVisible = false;
            } catch (e) {
                console.error(e);
            } finally {
                state.loading = false;
            }
        };

        const onSelectProject = async (projects: ProjectItemResp[]) => {
            state.selectedProjectId = projects[0]?.id ?? null;
            if (state.selectedProjectId) await checkProject();
        };

        const reset = () => {
            state.title = undefined;
            state.selectedProjectId = undefined;
            state.urgency = ALERT_URGENCY.HIGH;
            state.description = '';

            state.isProjectAlertSet = undefined;
        };

        watch(() => state.proxyVisible, (visible) => {
            if (!visible) reset();
        });

        return {
            ...toRefs(state),
            onConfirm,
            onSelectProject,
            setProjectAlert,
            ALERT_URGENCY,
            PROJECT_ROUTE,
        };
    },
};
</script>

<style lang="postcss" scoped>
.project-field-group::v-deep {
    .form-label {
        display: flex;
        width: 100%;
        justify-content: space-between;
        align-content: center;
    }
}
.go-project {
    font-size: 0.875rem;
    font-weight: normal;
}
.project-set-button {
    margin-bottom: 1.125rem;
}
</style>
