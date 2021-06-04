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
            <p-field-group
                :label="$t('MONITORING.ALERT.ESCALATION_POLICY.FORM.NAME_LABEL')"
                required
                :invalid="!isNameValid"
                :invalid-text="nameInvalidText"
            >
                <p-text-input v-model="inputModel.name"
                              :invalid="!isNameValid"
                              class="w-1/2"
                />
            </p-field-group>
            <p-field-group
                :label="$t('MONITORING.ALERT.ESCALATION_POLICY.FORM.SCOPE_LABEL')"
                required
            >
                <template #default>
                    <div v-if="mode === 'create'">
                        <p-radio v-for="(item, idx) in scopes" :key="idx"
                                 :selected="item.value"
                                 :value="inputModel.scope"
                        >
                            <span class="radio-label" @click="onChangeScope(item.value)">{{ item.label }}</span>
                        </p-radio>
                        <escalation-policy-project-tree v-if="inputModel.scope === SCOPE.project"
                                                        :selected-project-id.sync="inputModel.project_id"
                        />
                    </div>
                </template>
                <template #label-extra>
                    <span v-if="mode === 'update'" class="scope-text">
                        {{ inputModel.scope }}
                    </span>
                </template>
            </p-field-group>
            <p-field-group
                :label="$t('MONITORING.ALERT.ESCALATION_POLICY.FORM.FINISH_CONDITION_LABEL')"
                required
            >
                <p-radio v-for="(item, idx) in finishConditions" :key="idx"
                         :selected="item.value"
                         :value="inputModel.finish_condition"
                >
                    <span class="radio-label" @click="onChangeFinishCondition(item.value)">{{ item.label }}</span>
                </p-radio>
            </p-field-group>
            <p-field-group
                :label="$t('MONITORING.ALERT.ESCALATION_POLICY.FORM.ESCALATION_RULES_LABEL')"
                required
            >
                <template #help>
                    <span class="help-text">
                        {{ $t('MONITORING.ALERT.ESCALATION_POLICY.FORM.ESCALATION_RULES_HELP_TEXT') }}
                    </span>
                </template>
                <escalation-rules-input-form
                    :scope="inputModel.scope"
                    :rules.sync="inputModel.rules"
                    :repeat-count.sync="inputModel.repeat_count"
                />
            </p-field-group>
        </template>
        <template #confirm-button>
            {{ mode === ACTION.create ? $t('MONITORING.ALERT.ESCALATION_POLICY.CREATE') : $t('MONITORING.ALERT.ESCALATION_POLICY.UPDATE') }}
        </template>
    </p-button-modal>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import {
    computed, reactive, toRefs, watch, ComponentRenderProxy, getCurrentInstance,
} from '@vue/composition-api';

import {
    PButtonModal, PFieldGroup, PTextInput, PRadio,
} from '@spaceone/design-system';

import EscalationPolicyProjectTree from '@/views/monitoring/alert/modules/EscalationPolicyProjectTree.vue';
import EscalationRulesInputForm from '@/views/monitoring/alert/modules/EscalationRulesInputForm.vue';
import { makeProxy } from '@/lib/compostion-util';
import { SpaceConnector } from '@/lib/space-connector';
import { showErrorMessage, showSuccessMessage } from '@/lib/util';
import {
    ACTION, FINISH_CONDITION, SCOPE, EscalationPolicyFormModel,
} from '@/views/monitoring/alert/type';


const DEFAULT_REPEAT_COUNT = 0;
const DEFAULT_NOTIFICATION_LEVEL = 'LV1';

export default {
    name: 'EscalationPolicyFormModal',
    components: {
        EscalationRulesInputForm,
        EscalationPolicyProjectTree,
        PButtonModal,
        PFieldGroup,
        PTextInput,
        PRadio,
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
            inputModel: {
                name: '',
                scope: SCOPE.global,
                rules: [{ notification_level: 'ALL', escalate_minutes: undefined }],
                finish_condition: FINISH_CONDITION.acknowledged,
                repeat_count: DEFAULT_REPEAT_COUNT,
                project_id: undefined,
            } as EscalationPolicyFormModel,
            scopes: computed(() => [
                {
                    label: vm.$t('MONITORING.ALERT.ESCALATION_POLICY.FORM.GLOBAL'), value: SCOPE.global,
                }, {
                    label: vm.$t('MONITORING.ALERT.ESCALATION_POLICY.FORM.PROJECT'), value: SCOPE.project,
                },
            ]),
            finishConditions: computed(() => [
                {
                    label: vm.$t('MONITORING.ALERT.ESCALATION_POLICY.FORM.ACKNOWLEDGED'), value: FINISH_CONDITION.acknowledged,
                }, {
                    label: vm.$t('MONITORING.ALERT.ESCALATION_POLICY.FORM.RESOLVED'), value: FINISH_CONDITION.resolved,
                },
            ]),
            //
            showValidation: false,
            proxyVisible: makeProxy('visible', props, emit),
            isNameValid: computed(() => {
                if (!state.showValidation) return true;
                return state.inputModel.name.length <= 40 && state.inputModel.name.length > 0;
            }),
            nameInvalidText: computed(() => {
                if (!state.inputModel.name) {
                    return vm.$t('MONITORING.ALERT.ESCALATION_POLICY.FORM.NAME_REQUIRED');
                }
                if (state.inputModel.name.length > 40) {
                    return vm.$t('MONITORING.ALERT.ESCALATION_POLICY.FORM.NAME_INVALID_TEXT');
                }
                return undefined;
            }),
            isAllValid: computed(() => state.isNameValid),
        });

        /* util */
        const initInputModel = () => {
            if (props.mode === ACTION.create) {
                state.inputModel.name = '';
                state.inputModel.scope = SCOPE.global;
                state.inputModel.rules = [{ notification_level: DEFAULT_NOTIFICATION_LEVEL, escalate_minutes: undefined }];
                state.inputModel.finish_condition = FINISH_CONDITION.acknowledged;
                state.inputModel.repeat_count = DEFAULT_REPEAT_COUNT;
                state.inputModel.project_id = undefined;
            } else {
                state.inputModel = props.escalationPolicy;
            }
        };

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
        const onClickPolicyConfirm = async () => {
            state.showValidation = true;
            if (!state.isAllValid) return;

            state.loading = true;
            if (props.mode === ACTION.create) await createEscalationPolicy();
            else if (props.mode === ACTION.update) await updateEscalationPolicy();
            emit('confirm');
        };
        const onChangeScope = (value) => {
            state.inputModel.scope = value;
            if (value === SCOPE.global) state.inputModel.project_id = undefined;
        };
        const onChangeFinishCondition = (value) => {
            state.inputModel.finish_condition = value;
        };

        watch(() => props.visible, (visible) => {
            if (visible) {
                state.showValidation = false;
                initInputModel();
            }
        });

        return {
            ...toRefs(state),
            SCOPE,
            ACTION,
            onClickPolicyConfirm,
            onChangeScope,
            onChangeFinishCondition,
            createEscalationPolicy,
        };
    },
};
</script>

<style lang="postcss" scoped>
.escalation-policy-form-modal {
    .p-text-input {
        .input-container {
            border-radius: 0.25rem;
        }
    }
    .radio-label {
        font-size: 0.875rem;
        line-height: 1.2;

        &:first-child {
            margin-right: 1.125rem;
        }
    }
    .scope-text {
        text-transform: capitalize;
        font-weight: normal;
        padding-left: 0.5rem;
    }
    .help-text {
        @apply text-gray-900;
        font-size: 0.875rem;
    }
}
</style>
