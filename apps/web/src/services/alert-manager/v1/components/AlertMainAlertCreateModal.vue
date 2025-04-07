<script setup lang="ts">
import {
    computed, reactive, watch,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PButton, PButtonModal, PFieldGroup, PRadio, PTextarea, PTextInput,
} from '@cloudforet/mirinae';


import type { AlertCreateParameters } from '@/schema/monitoring/alert/api-verbs/create';
import { ALERT_URGENCY } from '@/schema/monitoring/alert/constants';
import type { ProjectAlertConfigCreateParameters } from '@/schema/monitoring/project-alert-config/api-verbs/create';
import type { ProjectAlertConfigGetParameters } from '@/schema/monitoring/project-alert-config/api-verbs/get';
import type { ProjectAlertConfigModel } from '@/schema/monitoring/project-alert-config/model';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';
import type { ProjectTreeNodeData } from '@/common/modules/project/project-tree-type';
import ProjectSelectDropdown from '@/common/modules/project/ProjectSelectDropdown.vue';


const props = defineProps<{
    visible: boolean;
    projectId?: string;
}>();
const emit = defineEmits<{(event: 'update:visible', value: boolean): void;
    (event: 'confirm'): void;
}>();
const state = reactive({
    proxyVisible: useProxyValue('visible', props, emit),
    loading: false,
    // inputs
    title: undefined as undefined|string,
    urgency: ALERT_URGENCY.HIGH,
    selectedProjectId: props.projectId,
    description: '',
    // validation
    titleInvalidText: computed<TranslateResult|undefined>(() => {
        if (!state.title?.trim()) return i18n.t('MONITORING.ALERT.ALERT_LIST.FORM.REQUIRED_TITLE');
        return undefined;
    }),
    titleInvalid: computed<boolean>(() => state.title !== undefined && !!state.titleInvalidText),
    isProjectAlertSet: undefined as undefined|boolean,
    projectInvalidText: computed<TranslateResult|undefined>(() => {
        if (state.selectedProjectId === undefined) return i18n.t('MONITORING.ALERT.ALERT_LIST.FORM.REQUIRED_PROJECT');
        if (state.isProjectAlertSet === false) return i18n.t('MONITORING.ALERT.ALERT_LIST.FORM.NEED_TO_SET_PROJECT_ALERT');
        return undefined;
    }),
    projectInvalid: computed<boolean>(() => state.selectedProjectId !== undefined && !!state.projectInvalidText),
    isAllValid: computed<boolean>(() => state.title !== undefined && !state.titleInvalid && state.selectedProjectId && !state.projectInvalid),
});

const checkProject = async () => {
    state.isProjectAlertSet = undefined;
    try {
        await SpaceConnector.clientV2.monitoring.projectAlertConfig.get<ProjectAlertConfigGetParameters, ProjectAlertConfigModel>({
            project_id: state.selectedProjectId,
        });
        state.isProjectAlertSet = true;
    } catch (e) {
        state.isProjectAlertSet = false;
    }
};

const setProjectAlert = async () => {
    try {
        await SpaceConnector.clientV2.monitoring.projectAlertConfig.create<ProjectAlertConfigCreateParameters, ProjectAlertConfigModel>({
            project_id: state.selectedProjectId,
        });
        state.isProjectAlertSet = true;
    } catch (e) {
        state.isProjectAlertSet = false;
        ErrorHandler.handleError(e);
    }
};

const createAlert = async () => {
    try {
        await SpaceConnector.clientV2.monitoring.alert.create<AlertCreateParameters>({
            title: state.title,
            urgency: state.urgency,
            project_id: state.selectedProjectId,
            description: state.description,
        });
        showSuccessMessage(i18n.t('MONITORING.ALERT.ALERT_LIST.ALT_S_CREATE'), '');
        emit('confirm');
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('MONITORING.ALERT.ALERT_LIST.ALT_E_CREATE'));
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
        ErrorHandler.handleError(e);
    } finally {
        state.loading = false;
    }
};

const onSelectProject = async (projects: ProjectTreeNodeData[]) => {
    state.selectedProjectId = projects[0]?.id ?? null;
    if (state.selectedProjectId) await checkProject();
};

const reset = () => {
    state.title = undefined;
    state.selectedProjectId = props.projectId ?? undefined;
    state.urgency = ALERT_URGENCY.HIGH;
    state.description = '';

    state.isProjectAlertSet = undefined;
};

watch(() => state.proxyVisible, (visible) => {
    if (!visible) reset();
});
</script>

<template>
    <p-button-modal :visible.sync="state.proxyVisible"
                    :header-title="$t('MONITORING.ALERT.ALERT_LIST.FORM.TITLE_CREATE')"
                    size="sm"
                    :disabled="!state.isAllValid"
                    :loading="state.loading"
                    @confirm="onConfirm"
    >
        <template #body>
            <p-field-group :label="$t('MONITORING.ALERT.ALERT_LIST.FORM.LABEL_ALERT_TITLE')"
                           required
                           :invalid="state.titleInvalid"
                           :invalid-text="state.titleInvalidText"
            >
                <p-text-input v-model="state.title"
                              block
                              :placeholder="$t('MONITORING.ALERT.ALERT_LIST.FORM.LABEL_ALERT_TITLE')"
                              :invalid="state.titleInvalid"
                />
            </p-field-group>
            <p-field-group :label="$t('MONITORING.ALERT.ALERT_LIST.FORM.LABEL_URGENCY')"
                           required
            >
                <p-radio v-model="state.urgency"
                         :value="ALERT_URGENCY.HIGH"
                >
                    {{ $t('MONITORING.ALERT.ALERT_LIST.FORM.HIGH') }}
                </p-radio>
                <p-radio v-model="state.urgency"
                         :value="ALERT_URGENCY.LOW"
                >
                    {{ $t('MONITORING.ALERT.ALERT_LIST.FORM.LOW') }}
                </p-radio>
            </p-field-group>
            <p-field-group v-if="!props.projectId"
                           class="project-field-group"
                           :label="$t('MONITORING.ALERT.ALERT_LIST.FORM.LABEL_PROJECT')"
                           required
                           :invalid="state.projectInvalid"
                           :invalid-text="state.projectInvalidText"
            >
                <project-select-dropdown :invalid="state.projectInvalid"
                                         project-selectable
                                         :project-group-selectable="false"
                                         @select="onSelectProject"
                />
            </p-field-group>
            <p-button v-if="state.projectInvalid && state.isProjectAlertSet === false"
                      style-type="primary"
                      class="project-set-button"
                      size="sm"
                      @click="setProjectAlert"
            >
                {{ $t('MONITORING.ALERT.ALERT_LIST.FORM.SET_PROJECT_ALERT_NOW') }}
            </p-button>

            <p-field-group :label="$t('MONITORING.ALERT.ALERT_LIST.FORM.LABEL_DESCRIPTION')">
                <p-textarea v-model="state.description" />
            </p-field-group>
        </template>
    </p-button-modal>
</template>

<style lang="postcss" scoped>
/* custom design-system component - p-field-group */
:deep(.project-field-group) {
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
