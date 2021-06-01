<template>
    <p-button-modal
        class="escalation-policy-form-modal"
        :header-title="headerTitle"
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
                <p-text-input v-model="name"
                              :invalid="!isNameValid"
                              class="w-1/2"
                />
            </p-field-group>
            <p-field-group
                :label="$t('MONITORING.ALERT.ESCALATION_POLICY.FORM.SCOPE_LABEL')"
                required
            >
                <p-radio v-for="(item, idx) in scopes" :key="idx"
                         :selected="item.value"
                         :value="scope"
                >
                    <span class="radio-label" @click="onChangeScope(item.value)">{{ item.label }}</span>
                </p-radio>
                <escalation-policy-project-tree v-if="scope === SCOPE.project"
                                                :selected-project-id="selectedProjectId"
                />
            </p-field-group>
            <p-field-group
                :label="$t('MONITORING.ALERT.ESCALATION_POLICY.FORM.FINISH_CONDITION_LABEL')"
                required
            >
                <p-radio v-for="(item, idx) in finishConditions" :key="idx"
                         :selected="item.value"
                         :value="finishCondition"
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
                <escalation-rules-input-form />
            </p-field-group>
        </template>
        <template #confirm-button>
            {{ $t('MONITORING.ALERT.ESCALATION_POLICY.CREATE') }}
        </template>
    </p-button-modal>
</template>

<script lang="ts">
import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';

import {
    PButtonModal, PFieldGroup, PTextInput, PRadio,
} from '@spaceone/design-system';

import EscalationPolicyProjectTree from '@/views/monitoring/alert/modules/EscalationPolicyProjectTree.vue';
import EscalationRulesInputForm from '@/views/monitoring/alert/modules/EscalationRulesInputForm.vue';
import { makeProxy } from '@/lib/compostion-util';
import { SpaceConnector } from '@/lib/space-connector';

enum FORM_MODE {
    create = 'create',
    update = 'update',
}
enum SCOPE {
    global = 'global',
    project = 'project',
}
enum FINISH_CONDITION {
    acknowledged = 'Acknowledged',
    resolved = 'resolved',
}

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
            default: FORM_MODE.create,
            validator(mode) {
                return Object.values(FORM_MODE).includes(mode);
            },
        },
        headerTitle: {
            type: String,
            default: '',
        },
        confirmButtonText: {
            type: String,
            default: '',
        },
    },
    setup(props, { emit }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            loading: false,
            name: '',
            scope: SCOPE.global,
            scopes: computed(() => [
                {
                    label: vm.$t('MONITORING.ALERT.ESCALATION_POLICY.FORM.GLOBAL'), value: SCOPE.global,
                }, {
                    label: vm.$t('MONITORING.ALERT.ESCALATION_POLICY.FORM.PROJECT'), value: SCOPE.project,
                },
            ]),
            finishCondition: FINISH_CONDITION.acknowledged,
            finishConditions: computed(() => [
                {
                    label: vm.$t('MONITORING.ALERT.ESCALATION_POLICY.FORM.ACKNOWLEDGED'), value: FINISH_CONDITION.acknowledged,
                }, {
                    label: vm.$t('MONITORING.ALERT.ESCALATION_POLICY.FORM.RESOLVED'), value: FINISH_CONDITION.resolved,
                },
            ]),
            selectedProjectId: undefined,
            //
            proxyVisible: makeProxy('visible', props, emit),
            isNameValid: computed(() => (!state.showValidation || (state.name.length <= 40 && state.name.length > 0))),
            nameInvalidText: computed(() => {
                if (!state.name.length) {
                    return vm.$t('MONITORING.ALERT.ESCALATION_POLICY.FORM.NAME_REQUIRED');
                } if (state.name.length > 40) {
                    return vm.$t('MONITORING.ALERT.ESCALATION_POLICY.FORM.NAME_INVALID_TEXT');
                }
                return undefined;
            }),
            isAllValid: computed(() => state.isNameValid),
            showValidation: false,
        });

        /* event */
        const onClickPolicyConfirm = async () => {
            state.showValidation = true;
            if (!state.isAllValid) return;

            state.loading = true;
            console.log(props.mode);
        };
        const onChangeScope = (value) => {
            state.scope = value;
            if (value === SCOPE.global) state.selectedProjectId = undefined;
        };
        const onChangeFinishCondition = (value) => {
            state.finishCondition = value;
        };

        return {
            ...toRefs(state),
            SCOPE,
            onClickPolicyConfirm,
            onChangeScope,
            onChangeFinishCondition,
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
    .help-text {
        @apply text-gray-900;
        font-size: 0.875rem;
    }
}
</style>
