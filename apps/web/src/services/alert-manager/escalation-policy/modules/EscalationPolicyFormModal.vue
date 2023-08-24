<script lang="ts" setup>
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { PButtonModal } from '@spaceone/design-system';
import {
    computed, reactive,
} from 'vue';
import { useI18n } from 'vue-i18n';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';

import EscalationPolicyForm from '@/services/alert-manager/escalation-policy/modules/EscalationPolicyForm.vue';
import { useEscalationPolicyFormStore } from '@/services/alert-manager/escalation-policy/store/escalation-policy-form';
import { ACTION } from '@/services/alert-manager/lib/config';
import type { EscalationPolicyDataModel } from '@/services/alert-manager/type';

interface Props {
    visible: boolean;
    mode?: ACTION;
    escalationPolicy?: EscalationPolicyDataModel;
}

const props = withDefaults(defineProps<Props>(), {
    visible: false,
    mode: undefined,
    escalationPolicy: undefined,
});
const emit = defineEmits<{(e: 'update:visible', value: boolean): void;
    (e: 'confirm'): void;
}>();
const { t } = useI18n();

const escalationPolicyFormStore = useEscalationPolicyFormStore();
const escalationPolicyFormState = escalationPolicyFormStore.$state;
const state = reactive({
    proxyVisible: useProxyValue('visible', props, emit),
    inputModel: computed<Partial<EscalationPolicyDataModel>>(() => ({
        name: escalationPolicyFormState.name,
        rules: escalationPolicyFormState.rules,
        scope: escalationPolicyFormState.scope,
        finish_condition: escalationPolicyFormState.finishCondition,
        repeat_count: escalationPolicyFormState.repeatCount,
        project_id: escalationPolicyFormState.projectId,
    })),
});

/* api */
const createEscalationPolicy = async () => {
    try {
        await SpaceConnector.client.monitoring.escalationPolicy.create({
            name: escalationPolicyFormState.name,
            rules: escalationPolicyFormState.rules,
            scope: escalationPolicyFormState.scope,
            finish_condition: escalationPolicyFormState.finishCondition,
            repeat_count: escalationPolicyFormState.repeatCount,
            project_id: escalationPolicyFormState.projectId,
        });
        showSuccessMessage(t('MONITORING.ALERT.ESCALATION_POLICY.FORM.ALT_S_CREATE_POLICY'), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, t('MONITORING.ALERT.ESCALATION_POLICY.FORM.ALT_E_CREATE_POLICY'));
    } finally {
        state.proxyVisible = false;
    }
};
const updateEscalationPolicy = async () => {
    try {
        await SpaceConnector.client.monitoring.escalationPolicy.update({
            escalation_policy_id: escalationPolicyFormState?.escalationPolicyData?.escalation_policy_id,
            name: escalationPolicyFormState.name,
            rules: escalationPolicyFormState.rules,
            repeat_count: escalationPolicyFormState.repeatCount,
            finish_condition: escalationPolicyFormState.finishCondition,
        });
        showSuccessMessage(t('MONITORING.ALERT.ESCALATION_POLICY.FORM.ALT_S_UPDATE_POLICY'), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, t('MONITORING.ALERT.ESCALATION_POLICY.FORM.ALT_E_UPDATE_POLICY'));
    } finally {
        state.proxyVisible = false;
    }
};

/* event */
const handleConfirm = async () => {
    if (!escalationPolicyFormStore.isAllValid) return;

    if (props.mode === ACTION.create) await createEscalationPolicy();
    else if (props.mode === ACTION.update) await updateEscalationPolicy();
    emit('confirm');
};

</script>

<template>
    <p-button-modal
        v-model:visible="state.proxyVisible"
        class="escalation-policy-form-modal"
        :header-title="mode === ACTION.create ? t('MONITORING.ALERT.ESCALATION_POLICY.CREATE_MODAL_TITLE') : t('MONITORING.ALERT.ESCALATION_POLICY.UPDATE_MODAL_TITLE')"
        size="md"
        :fade="true"
        :backdrop="true"
        :disabled="!escalationPolicyFormStore.isAllValid"
        @confirm="handleConfirm"
    >
        <template #body>
            <escalation-policy-form :escalation-policy-data="escalationPolicy"
                                    :mode="mode"
            />
        </template>
        <template #confirm-button>
            {{ mode === ACTION.create ? t('MONITORING.ALERT.ESCALATION_POLICY.CREATE') : t('MONITORING.ALERT.ESCALATION_POLICY.UPDATE') }}
        </template>
    </p-button-modal>
</template>
