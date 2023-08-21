<script lang="ts" setup>

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PAnchor, PButton,
    PButtonModal, PFieldGroup, PRadio, PTextarea, PTextInput,
} from '@spaceone/design-system';
import {
    computed, reactive, watch,
} from 'vue';
import { useI18n } from 'vue-i18n';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';
import ProjectSelectDropdown from '@/common/modules/project/ProjectSelectDropdown.vue';

import { ALERT_URGENCY } from '@/services/alert-manager/lib/config';
import { PROJECT_ROUTE } from '@/services/project/route-config';
import type { ProjectItemResp } from '@/services/project/type';

interface Props {
    visible: boolean;
    projectId: string;
}

const props = withDefaults(defineProps<Props>(), {
    visible: false,
});
const emit = defineEmits<{(e: 'update:visible', value: boolean): void;
    (e: 'confirm'): void;
}>();
const { t } = useI18n();

const state = reactive({
    proxyVisible: useProxyValue('visible', props, emit),
    loading: false,
    // inputs
    title: undefined as undefined|string,
    urgency: ALERT_URGENCY.HIGH,
    selectedProjectId: props.projectId,
    description: '',
    // validation
    titleInvalidText: computed(() => {
        if (!state.title?.trim()) return t('MONITORING.ALERT.ALERT_LIST.FORM.REQUIRED_TITLE');
        return undefined;
    }),
    titleInvalid: computed(() => state.title !== undefined && !!state.titleInvalidText),
    isProjectAlertSet: undefined as undefined|boolean,
    projectInvalidText: computed(() => {
        if (state.selectedProjectId === null) return t('MONITORING.ALERT.ALERT_LIST.FORM.REQUIRED_PROJECT');
        if (state.isProjectAlertSet === false) return t('MONITORING.ALERT.ALERT_LIST.FORM.NEED_TO_SET_PROJECT_ALERT');
        return undefined;
    }),
    projectInvalid: computed(() => state.selectedProjectId !== undefined && !!state.projectInvalidText),
    isAllValid: computed(() => state.title !== undefined && !state.titleInvalid && state.selectedProjectId && !state.projectInvalid),
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
        ErrorHandler.handleError(e);
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
        showSuccessMessage(t('MONITORING.ALERT.ALERT_LIST.ALT_S_CREATE'), '');
        emit('confirm');
    } catch (e) {
        ErrorHandler.handleRequestError(e, t('MONITORING.ALERT.ALERT_LIST.ALT_E_CREATE'));
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

const onSelectProject = async (projects: ProjectItemResp[]) => {
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
    <p-button-modal v-model:visible="state.proxyVisible"
                    :header-title="t('MONITORING.ALERT.ALERT_LIST.FORM.TITLE_CREATE')"
                    size="sm"
                    :disabled="!state.isAllValid"
                    :loading="state.loading"
                    @confirm="onConfirm"
    >
        <template #body>
            <p-field-group :label="t('MONITORING.ALERT.ALERT_LIST.FORM.LABEL_ALERT_TITLE')"
                           required
                           :invalid="state.titleInvalid"
                           :invalid-text="state.titleInvalidText"
            >
                <p-text-input v-model:value="state.title"
                              block
                              :placeholder="t('MONITORING.ALERT.ALERT_LIST.FORM.LABEL_ALERT_TITLE')"
                              :invalid="state.titleInvalid"
                />
            </p-field-group>
            <p-field-group :label="t('MONITORING.ALERT.ALERT_LIST.FORM.LABEL_URGENCY')"
                           required
            >
                <p-radio v-model:selected="state.urgency"
                         :value="ALERT_URGENCY.HIGH"
                >
                    {{ t('MONITORING.ALERT.ALERT_LIST.FORM.HIGH') }}
                </p-radio>
                <p-radio v-model:selected="state.urgency"
                         :value="ALERT_URGENCY.LOW"
                >
                    {{ t('MONITORING.ALERT.ALERT_LIST.FORM.LOW') }}
                </p-radio>
            </p-field-group>
            <p-field-group v-if="!projectId"
                           class="project-field-group"
                           :label="t('MONITORING.ALERT.ALERT_LIST.FORM.LABEL_PROJECT')"
                           required
                           :invalid="state.projectInvalid"
                           :invalid-text="state.projectInvalidText"
            >
                <template #label-extra>
                    <p-anchor class="go-project"
                              highlight
                              :to="{ name: PROJECT_ROUTE._NAME }"
                    >
                        {{ t('MONITORING.ALERT.ALERT_LIST.FORM.CREATE_PROJECT') }}
                    </p-anchor>
                </template>
                <project-select-dropdown :invalid="state.projectInvalid"
                                         project-selectable
                                         @select="onSelectProject"
                />
            </p-field-group>
            <p-button v-if="state.projectInvalid && state.isProjectAlertSet === false"
                      style-type="primary"
                      class="project-set-button"
                      size="sm"
                      @click="setProjectAlert"
            >
                {{ t('MONITORING.ALERT.ALERT_LIST.FORM.SET_PROJECT_ALERT_NOW') }}
            </p-button>

            <p-field-group :label="t('MONITORING.ALERT.ALERT_LIST.FORM.LABEL_DESCRIPTION')">
                <p-textarea v-model:value="state.description" />
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
