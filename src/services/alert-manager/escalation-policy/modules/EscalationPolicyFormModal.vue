<template>
    <p-button-modal
        class="escalation-policy-form-modal"
        :header-title="mode === ACTION.create ? $t('MONITORING.ALERT.ESCALATION_POLICY.CREATE_MODAL_TITLE') : $t('MONITORING.ALERT.ESCALATION_POLICY.UPDATE_MODAL_TITLE')"
        size="md"
        :fade="true"
        :backdrop="true"
        :visible.sync="proxyVisible"
        :disabled="!escalationPolicyFormState.isAllValid"
        @confirm="handleConfirm"
    >
        <template #body>
            <escalation-policy-form :escalation-policy-data="escalationPolicy"
                                    :mode="mode"
            />
        </template>
        <template #confirm-button>
            {{ mode === ACTION.create ? $t('MONITORING.ALERT.ESCALATION_POLICY.CREATE') : $t('MONITORING.ALERT.ESCALATION_POLICY.UPDATE') }}
        </template>
    </p-button-modal>
</template>

<script lang="ts">
import type { PropType, SetupContext } from 'vue';
import {
    computed, reactive, toRefs,
} from 'vue';

import { PButtonModal } from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';

import EscalationPolicyForm from '@/services/alert-manager/escalation-policy/modules/EscalationPolicyForm.vue';
import { useEscalationPolicyFormStore } from '@/services/alert-manager/escalation-policy/store/escalation-policy-form';
import { ACTION } from '@/services/alert-manager/lib/config';
import type { EscalationPolicyDataModel } from '@/services/alert-manager/type';


export default {
    name: 'EscalationPolicyFormModal',
    components: {
        EscalationPolicyForm,
        PButtonModal,
    },
    props: {
        visible: {
            type: Boolean,
            default: false,
        },
        mode: {
            type: String,
            default: '',
        },
        escalationPolicy: {
            type: Object as PropType<EscalationPolicyDataModel>,
            default: undefined,
        },
    },
    setup(props, { emit }: SetupContext) {
        const escalationPolicyFormStore = useEscalationPolicyFormStore();
        const escalationPolicyFormOriginState = escalationPolicyFormStore.originState;
        const escalationPolicyFormState = escalationPolicyFormStore.state;
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
                showSuccessMessage(i18n.t('MONITORING.ALERT.ESCALATION_POLICY.FORM.ALT_S_CREATE_POLICY'), '');
            } catch (e) {
                ErrorHandler.handleRequestError(e, i18n.t('MONITORING.ALERT.ESCALATION_POLICY.FORM.ALT_E_CREATE_POLICY'));
            } finally {
                state.proxyVisible = false;
            }
        };
        const updateEscalationPolicy = async () => {
            try {
                await SpaceConnector.client.monitoring.escalationPolicy.update({
                    escalation_policy_id: escalationPolicyFormOriginState?.escalationPolicyData?.escalation_policy_id,
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
            if (!escalationPolicyFormState.isAllValid) return;

            if (props.mode === ACTION.create) await createEscalationPolicy();
            else if (props.mode === ACTION.update) await updateEscalationPolicy();
            emit('confirm');
        };

        return {
            ...toRefs(state),
            escalationPolicyFormState,
            ACTION,
            handleConfirm,
            createEscalationPolicy,
        };
    },
};
</script>
