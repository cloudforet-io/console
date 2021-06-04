<template>
    <p-button-modal
        class="escalation-policy-form-modal"
        :header-title="mode === ACTION.create ? $t('MONITORING.ALERT.ESCALATION_POLICY.CREATE_MODAL_TITLE') : $t('MONITORING.ALERT.ESCALATION_POLICY.UPDATE_MODAL_TITLE')"
        size="md"
        :fade="true"
        :backdrop="true"
        :visible.sync="proxyVisible"
        @confirm="onClickPolicyConfirm"
    >
        <template #body>
            <escalation-policy-form
                :mode="mode"
                :show-validation="showValidation"
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
/* eslint-disable camelcase */
import {
    reactive, toRefs, watch, ComponentRenderProxy, getCurrentInstance,
} from '@vue/composition-api';

import { PButtonModal } from '@spaceone/design-system';
import EscalationPolicyForm from '@/views/monitoring/alert/modules/EscalationPolicyForm.vue';

import { makeProxy } from '@/lib/compostion-util';
import { SpaceConnector } from '@/lib/space-connector';
import { showErrorMessage, showSuccessMessage } from '@/lib/util';
import { ACTION, SCOPE, EscalationPolicyFormModel } from '@/views/monitoring/alert/type';


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
    setup(props, { emit, root }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            loading: false,
            proxyVisible: makeProxy('visible', props, emit),
            inputModel: {} as EscalationPolicyFormModel,
            showValidation: false,
            isAllValid: false,
        });

        /* api */
        const createEscalationPolicy = async () => {
            try {
                await SpaceConnector.client.monitoring.escalationPolicy.create(state.inputModel);
                showSuccessMessage(vm.$t('MONITORING.ALERT.ESCALATION_POLICY.FORM.ALT_S_CREATE_POLICY'), '', root);
            } catch (e) {
                console.error(e);
                showErrorMessage(vm.$t('MONITORING.ALERT.ESCALATION_POLICY.FORM.ALT_E_CREATE_POLICY'), e, root);
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
                showSuccessMessage(vm.$t('MONITORING.ALERT.ESCALATION_POLICY.FORM.ALT_S_UPDATE_POLICY'), '', root);
            } catch (e) {
                console.error(e);
                showErrorMessage(vm.$t('MONITORING.ALERT.ESCALATION_POLICY.FORM.ALT_E_UPDATE_POLICY'), e, root);
            } finally {
                state.proxyVisible = false;
            }
        };

        /* event */
        const onChangeInputModel = (inputModel) => {
            state.inputModel = inputModel;
        };
        const onClickPolicyConfirm = async () => {
            state.showValidation = true;
            if (!state.isAllValid) return;

            state.loading = true;
            if (props.mode === ACTION.create) await createEscalationPolicy();
            else if (props.mode === ACTION.update) await updateEscalationPolicy();
            emit('confirm');
        };

        watch(() => props.visible, () => {
            state.showValidation = false;
        });

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

<style lang="postcss" scoped>
</style>
