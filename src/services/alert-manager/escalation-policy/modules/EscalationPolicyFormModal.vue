<template>
    <p-button-modal
        class="escalation-policy-form-modal"
        :header-title="mode === ACTION.create ? $t('MONITORING.ALERT.ESCALATION_POLICY.CREATE_MODAL_TITLE') : $t('MONITORING.ALERT.ESCALATION_POLICY.UPDATE_MODAL_TITLE')"
        size="md"
        :fade="true"
        :backdrop="true"
        :visible.sync="proxyVisible"
        :disabled="!isAllValid"
        @confirm="onClickPolicyConfirm"
    >
        <template #body>
            <escalation-policy-form
                :mode="mode"
                :escalation-policy="escalationPolicy"
                :is-all-valid.sync="isAllValid"
                @change="onChangeInputModel"
            />
        </template>
        <template #confirm-button>
            {{ mode === ACTION.create ? $t('MONITORING.ALERT.ESCALATION_POLICY.CREATE') : $t('MONITORING.ALERT.ESCALATION_POLICY.UPDATE') }}
        </template>
    </p-button-modal>
</template>

<script lang="ts">

import type { SetupContext } from 'vue';
import {
    reactive, toRefs,
} from 'vue';

import { PButtonModal } from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';

import EscalationPolicyForm from '@/services/alert-manager/escalation-policy/modules/EscalationPolicyForm.vue';
import { ACTION, SCOPE } from '@/services/alert-manager/lib/config';
import type { EscalationPolicyFormModel } from '@/services/alert-manager/type';

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
            type: Object,
            default: undefined,
        },
    },
    setup(props, { emit }: SetupContext) {
        const state = reactive({
            proxyVisible: useProxyValue('visible', props, emit),
            inputModel: {} as EscalationPolicyFormModel,
            isAllValid: false,
        });

        /* api */
        const createEscalationPolicy = async () => {
            try {
                await SpaceConnector.client.monitoring.escalationPolicy.create(state.inputModel);
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
                    escalation_policy_id: props.escalationPolicy.escalation_policy_id,
                    name: state.inputModel.name,
                    rules: state.inputModel.rules,
                    repeat_count: state.inputModel.repeat_count,
                    finish_condition: state.inputModel.finish_condition,
                });
                showSuccessMessage(i18n.t('MONITORING.ALERT.ESCALATION_POLICY.FORM.ALT_S_UPDATE_POLICY'), '');
            } catch (e) {
                ErrorHandler.handleRequestError(e, i18n.t('MONITORING.ALERT.ESCALATION_POLICY.FORM.ALT_E_UPDATE_POLICY'));
            } finally {
                state.proxyVisible = false;
            }
        };

        /* event */
        const onChangeInputModel = (inputModel: EscalationPolicyFormModel) => {
            state.inputModel = inputModel;
        };
        const onClickPolicyConfirm = async () => {
            if (!state.isAllValid) return;

            if (props.mode === ACTION.create) await createEscalationPolicy();
            else if (props.mode === ACTION.update) await updateEscalationPolicy();
            emit('confirm');
        };

        return {
            ...toRefs(state),
            SCOPE,
            ACTION,
            onClickPolicyConfirm,
            onChangeInputModel,
            createEscalationPolicy,
        };
    },
};
</script>
