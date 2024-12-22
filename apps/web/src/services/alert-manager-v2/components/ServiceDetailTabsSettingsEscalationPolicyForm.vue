<script setup lang="ts">
import { cloneDeep } from 'lodash';

import {
    PCard, PBadge, PIconButton, PI, PTextInput, PFieldGroup, PTextButton,
} from '@cloudforet/mirinae';

import type { EscalationPolicyRulesType } from '@/schema/alert-manager/escalation-policy/type';

import { useFormValidator } from '@/common/composables/form-validator';

import { gray } from '@/styles/colors';

import ServiceDetailTabsSettingsEscalationPolicyFormChannelDropdown
    from '@/services/alert-manager-v2/components/ServiceDetailTabsSettingsEscalationPolicyFormChannelDropdown.vue';

const {
    forms: {
        repeatCount,
        rules,
    },
    setForm,
    invalidState,
    invalidTexts,
} = useFormValidator({
    repeatCount: 0,
    rules: [{
        channels: [],
        escalate_minutes: 30,
    }] as EscalationPolicyRulesType[],
}, {
    repeatCount(value) {
        if (value === undefined) return true;
        if (Number.isNaN(value) || typeof value !== 'number') return 'Only numbers are allowed.';
        if (value < 0) return 'Must be 0 or greater.';
        return true;
    },
    rules(value: EscalationPolicyRulesType[]) {
        let result = '';
        value.forEach((d, idx) => {
            if (!repeatCount.value && idx === value.length - 1) return;
            if (d?.escalate_minutes === undefined) result = 'Only numbers are allowed.';
            else if (d?.escalate_minutes < 0) result = 'Must be 0 or greater.';
        });
        return result;
    },
});

const handleDeleteRule = (idx: number) => {
    const _rules = cloneDeep(rules.value);
    _rules.splice(idx, 1);
    if (_rules.length > 0 && !repeatCount.value) _rules[_rules.length - 1].escalate_minutes = 30;
    setForm('rules', _rules);
};
const handleAddStep = () => {
    const _rules = cloneDeep(rules.value);
    if (_rules.length > 0 && !repeatCount.value) _rules[_rules.length - 1].escalate_minutes = 30;
    _rules.push({
        channels: [],
        escalate_minutes: 30,
    });
    setForm('rules', _rules);
};
const handleUpdateRepeatCount = (_repeatCount: number) => {
    const _after = Number(_repeatCount);
    const _before = repeatCount.value;
    const _rules = cloneDeep(rules.value);
    //
    if (!_before && _after > 0) _rules[_rules.length - 1].escalate_minutes = 30;
    if (!_after) _rules[_rules.length - 1].escalate_minutes = 30;
    setForm('rules', _rules);
    setForm('repeatCount', _after);
};
</script>

<template>
    <div class="service-detail-tabs-settings-escalation-policy-form">
        <div class="header flex bg-white py-2 px-4 justify-between border-b border-gray-200">
            <div class="flex items-center gap-1">
                <p-i name="ic_repeat"
                     width="1.25rem"
                     height="1.25rem"
                />
                <p-field-group required
                               :invalid="invalidState.repeatCount"
                               :invalid-text="invalidTexts.repeatCount"
                               class="repeat-form"
                >
                    <template #default="{invalid}">
                        <p-text-input :value="repeatCount"
                                      type="number"
                                      :min="0"
                                      block
                                      :invalid="invalid"
                                      @update:value="handleUpdateRepeatCount"
                        />
                    </template>
                </p-field-group>
                <span>
                    {{ $t('ALERT_MANAGER.ESCALATION_POLICY.REPEAT') }}
                    <span class="text-gray-500">
                        ({{ $t('MONITORING.ALERT.ESCALATION_POLICY.FORM.REPEAT_LABEL_HELP_TEXT') }})
                    </span>
                </span>
            </div>
            <p-icon-button class="add-button"
                           shape="square"
                           name="ic_plus_bold"
                           style-type="tertiary"
                           :disabled="rules.length >= 5"
                           @click="handleAddStep"
            />
        </div>
        <div class="py-4 px-6">
            <p-card v-for="(rule, idx) in rules"
                    :key="`rule-${idx}`"
                    class="card"
            >
                <template #header>
                    <div class="flex items-center">
                        <p-i name="ic_drag-handle"
                             width="1rem"
                             height="1rem"
                             :coler="gray[500]"
                        />
                        <p-badge badge-type="solid-outline"
                                 style-type="gray500"
                                 class="ml-1"
                        >
                            {{ $t('ALERT_MANAGER.ESCALATION_POLICY.STEP', { step: idx + 1}) }}
                        </p-badge>
                        <p-icon-button v-if="rules.length > 1"
                                       class="ml-auto"
                                       name="ic_delete"
                                       size="sm"
                                       @click="handleDeleteRule(idx)"
                        />
                    </div>
                </template>
                <i18n path="ALERT_MANAGER.ESCALATION_POLICY.ESCALATES_AFTER"
                      class="flex items-center gap-2"
                >
                    <template #minute>
                        <p-field-group required
                                       :invalid="rule.escalate_minutes < 0"
                                       class="minute-form"
                        >
                            <template #default="{invalid}">
                                <p-text-input v-model.number="rule.escalate_minutes"
                                              type="number"
                                              :min="0"
                                              :invalid="invalid"
                                              block
                                />
                            </template>
                        </p-field-group>
                    </template>
                </i18n>
                <service-detail-tabs-settings-escalation-policy-form-channel-dropdown class="mt-2" />
            </p-card>
            <p-text-button class="add-rule-button mt-4 mx-auto "
                           icon-left="ic_plus_bold"
                           size="lg"
            >
                {{ $t('ALERT_MANAGER.ESCALATION_POLICY.ADD_RULE') }}
            </p-text-button>
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.service-detail-tabs-settings-escalation-policy-form {
    @apply bg-gray-100 text-label-md border border-gray-200 rounded-lg;
    .header {
        border-top-right-radius: 0.375rem;
        border-top-left-radius: 0.375rem;
        .repeat-form {
            width: 4rem;
            margin-bottom: 0;
        }
    }
    .card {
        box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.06);
        + .card {
            margin-top: 1rem;
        }
        .minute-form {
            width: 6.5rem;
            margin-bottom: 0;
        }
    }
    .add-rule-button {
        @apply text-black font-bold;
    }
}
</style>
