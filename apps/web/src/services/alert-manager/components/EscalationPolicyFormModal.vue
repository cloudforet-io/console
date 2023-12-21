<script setup lang="ts">
import { reactive } from 'vue';

import { PButtonModal } from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { EscalationPolicyCreateParameters } from '@/schema/monitoring/escalation-policy/api-verbs/create';
import type { EscalationPolicyUpdateParameters } from '@/schema/monitoring/escalation-policy/api-verbs/update';
import type { EscalationPolicyModel } from '@/schema/monitoring/escalation-policy/model';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';

import EscalationPolicyForm from '@/services/alert-manager/components/EscalationPolicyForm.vue';
import { ACTION } from '@/services/alert-manager/constants/alert-constant';
import { useEscalationPolicyFormStore } from '@/services/alert-manager/stores/escalation-policy-form-store';
import type { ActionMode } from '@/services/alert-manager/types/alert-type';

const props = defineProps<{
    visible: boolean;
    mode: ActionMode;
    escalationPolicy?: EscalationPolicyModel;
}>();

const emit = defineEmits<{(event: 'update:visible', value: boolean): void;
    (event: 'confirm'): void;
}>();

const escalationPolicyFormStore = useEscalationPolicyFormStore();
const escalationPolicyFormState = escalationPolicyFormStore.$state;
const state = reactive({
    proxyVisible: useProxyValue('visible', props, emit),
});

/* api */
const createEscalationPolicy = async () => {
    try {
        if (!escalationPolicyFormState.name) throw new Error('name is required');
        await SpaceConnector.clientV2.monitoring.escalationPolicy.create<EscalationPolicyCreateParameters, EscalationPolicyModel>({
            name: escalationPolicyFormState.name,
            rules: escalationPolicyFormState.rules,
            resource_group: escalationPolicyFormState.resource_group,
            finish_condition: escalationPolicyFormState.finishCondition,
            repeat_count: escalationPolicyFormState.repeatCount,
            project_id: escalationPolicyFormState.projectId,
        });
        showSuccessMessage(i18n.t('MONITORING.ALERT.ESCALATION_POLICY.FORM.ALT_S_CREATE_POLICY'), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('MONITORING.ALERT.ESCALATION_POLICY.FORM.ALT_E_CREATE_POLICY'));
    } finally {
        state.proxyVisible = false;
    }
};
const updateEscalationPolicy = async () => {
    try {
        const escalationPolicyId = escalationPolicyFormState?.escalationPolicyData?.escalation_policy_id;
        if (!escalationPolicyId) throw new Error('escalationPolicyId is required');
        await SpaceConnector.clientV2.monitoring.escalationPolicy.update<EscalationPolicyUpdateParameters, EscalationPolicyModel>({
            escalation_policy_id: escalationPolicyId,
            name: escalationPolicyFormState.name,
            rules: escalationPolicyFormState.rules,
            repeat_count: escalationPolicyFormState.repeatCount,
            finish_condition: escalationPolicyFormState.finishCondition,
        });
        showSuccessMessage(i18n.t('MONITORING.ALERT.ESCALATION_POLICY.FORM.ALT_S_UPDATE_POLICY'), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('MONITORING.ALERT.ESCALATION_POLICY.FORM.ALT_E_UPDATE_POLICY'));
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
        class="escalation-policy-form-modal"
        :header-title="props.mode === ACTION.create ? $t('MONITORING.ALERT.ESCALATION_POLICY.CREATE_MODAL_TITLE') : $t('MONITORING.ALERT.ESCALATION_POLICY.UPDATE_MODAL_TITLE')"
        size="md"
        :fade="true"
        :backdrop="true"
        :visible.sync="state.proxyVisible"
        :disabled="!escalationPolicyFormStore.isAllValid"
        @confirm="handleConfirm"
    >
        <template #body>
            <escalation-policy-form :escalation-policy-data="props.escalationPolicy"
                                    :mode="props.mode"
            />
        </template>
        <template #confirm-button>
            {{ props.mode === ACTION.create ? $t('MONITORING.ALERT.ESCALATION_POLICY.CREATE') : $t('MONITORING.ALERT.ESCALATION_POLICY.UPDATE') }}
        </template>
    </p-button-modal>
</template>
