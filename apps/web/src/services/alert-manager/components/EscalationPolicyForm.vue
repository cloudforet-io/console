<script setup lang="ts">
import {
    computed, reactive, watch,
} from 'vue';

import {
    PFieldGroup, PRadio, PTextInput,
} from '@spaceone/design-system';

import { ESCALATION_POLICY_FINISH_CONDITION } from '@/schema/monitoring/escalation-policy/constant';
import type { EscalationPolicyModel } from '@/schema/monitoring/escalation-policy/model';
import { i18n } from '@/translations';

import { useFormValidator } from '@/common/composables/form-validator';

import EscalationPolicyFormRulesInput from '@/services/alert-manager/components/EscalationPolicyFormRulesInput.vue';
import { ACTION } from '@/services/alert-manager/constants/alert-constant';
import { useEscalationPolicyFormStore } from '@/services/alert-manager/stores/escalation-policy-form-store';
import type { ActionMode } from '@/services/alert-manager/types/alert-type';


const props = withDefaults(defineProps<{
    mode: ActionMode;
    escalationPolicyData?: EscalationPolicyModel;
}>(), {
    mode: ACTION.create,
    escalationPolicyData: undefined,
});
const escalationPolicyFormStore = useEscalationPolicyFormStore();
const escalationPolicyFormState = escalationPolicyFormStore.$state;
const state = reactive({
    finishConditions: computed(() => [
        { label: i18n.t('MONITORING.ALERT.ESCALATION_POLICY.FORM.ACKNOWLEDGED'), value: ESCALATION_POLICY_FINISH_CONDITION.acknowledged },
        { label: i18n.t('MONITORING.ALERT.ESCALATION_POLICY.FORM.RESOLVED'), value: ESCALATION_POLICY_FINISH_CONDITION.resolved },
    ]),
});

const {
    forms: { name },
    setForm,
    invalidState,
    invalidTexts,
    isAllValid,
} = useFormValidator({
    name: undefined as string|undefined,
    projectId: undefined as string|undefined,
}, {
    name(value) {
        if (!value) return i18n.t('MONITORING.ALERT.ESCALATION_POLICY.FORM.NAME_REQUIRED');
        if (value.length > 40) return i18n.t('MONITORING.ALERT.ESCALATION_POLICY.FORM.NAME_INVALID_TEXT');
        return true;
    },
    projectId(value) {
        if (!value) return i18n.t('MONITORING.ALERT.ESCALATION_POLICY.FORM.PROJECT_REQUIRED');
        return true;
    },
});

/* event */
const handleChangeFinishCondition = (value) => {
    escalationPolicyFormStore.$patch({ finishCondition: value });
};
const handleUpdateName = (_name) => {
    setForm('name', _name);
    escalationPolicyFormStore.$patch({ name: _name });
};

watch([() => props.mode, () => props.escalationPolicyData], ([mode, escalationPolicyData]) => {
    if (mode === ACTION.create) {
        escalationPolicyFormStore.$reset();
    } else if (props.escalationPolicyData?.escalation_policy_id) {
        escalationPolicyFormStore.initEscalationPolicyFormData(escalationPolicyData);
        setForm('name', escalationPolicyFormState.name);
        setForm('projectId', escalationPolicyFormState.projectId);
    }
}, { immediate: true });
watch(() => isAllValid.value, (_isAllValid) => {
    escalationPolicyFormStore.$patch({ isNameProjectIdFormValid: _isAllValid });
}, { immediate: true });
</script>

<template>
    <div class="escalation-policy-form">
        <p-field-group required
                       :label="$t('MONITORING.ALERT.ESCALATION_POLICY.FORM.NAME_LABEL')"
                       :invalid="invalidState.name"
                       :invalid-text="invalidTexts.name"
        >
            <template #default="{invalid}">
                <p-text-input :value="name"
                              :invalid="invalid"
                              class="w-1/2"
                              @update:value="handleUpdateName"
                />
            </template>
        </p-field-group>
        <p-field-group
            :label="$t('MONITORING.ALERT.ESCALATION_POLICY.FORM.FINISH_CONDITION_LABEL')"
            required
        >
            <p-radio v-for="(item, idx) in state.finishConditions"
                     :key="idx"
                     :selected="item.value"
                     :value="escalationPolicyFormState.finishCondition"
                     @change="handleChangeFinishCondition(item.value)"
            >
                {{ item.label }}
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
            <escalation-policy-form-rules-input />
        </p-field-group>
    </div>
</template>

<style lang="postcss" scoped>
.escalation-policy-form {
    /* custom design-system component - p-field-group */
    :deep(.project-field) {
        .label-box {
            display: block;
            .form-label {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
        }
        .link-text {
            font-weight: normal;
        }
        .title-wrapper {
            .title {
                width: 100%;
                justify-content: space-between;
                display: flex;
            }
        }
    }
    .p-text-input {
        .input-container {
            @apply rounded-md;
        }
    }
    .p-radio {
        &:first-of-type {
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
