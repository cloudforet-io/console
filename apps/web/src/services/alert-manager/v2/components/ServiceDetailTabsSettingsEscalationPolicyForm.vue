<script setup lang="ts">
import {
    reactive,
} from 'vue';
import draggable from 'vuedraggable';

import { cloneDeep } from 'lodash';

import {
    PBadge, PIconButton, PI, PTextInput, PFieldGroup, PTextButton,
} from '@cloudforet/mirinae';

import type { EscalationPolicyRulesType } from '@/schema/alert-manager/escalation-policy/type';

import { useProxyValue } from '@/common/composables/proxy-state';

import { gray } from '@/styles/colors';

import ServiceDetailTabsSettingsEscalationPolicyFormChannelDropdown
    from '@/services/alert-manager/v2/components/ServiceDetailTabsSettingsEscalationPolicyFormChannelDropdown.vue';

interface Props {
    rules: EscalationPolicyRulesType[];
    repeatCount: number;
}

const props = withDefaults(defineProps<Props>(), {
    rules: undefined,
    repeatCount: 0,
});

const emit = defineEmits<{(event: 'update:rules', rules: EscalationPolicyRulesType[]): void;
    (event: 'update:repeat-count', rules: EscalationPolicyRulesType[]): void;
}>();

const state = reactive({
    proxyRules: useProxyValue('rules', props, emit),
    proxyRepeatCount: useProxyValue('repeatCount', props, emit),
    list: props.rules || [],
});

const handleSelectChannelDropdown = (idx: number, ids: string[]) => {
    state.proxyRules[idx].channels = ids;
};
const handleDeleteRule = (idx: number) => {
    const _rules = cloneDeep(state.proxyRules);
    _rules.splice(idx, 1);
    state.proxyRules = _rules;
};
const handleAddStep = () => {
    const _rules = cloneDeep(state.proxyRules);
    _rules.push({
        channels: [],
        escalate_minutes: 30,
    });
    state.proxyRules = _rules;
};
const handleUpdateRepeatCount = (_repeatCount: string) => {
    state.proxyRepeatCount = Number(_repeatCount);
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
                               class="repeat-form"
                >
                    <template #default="{invalid}">
                        <p-text-input :value="state.proxyRepeatCount"
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
                           :disabled="state.proxyRules.length >= 10"
                           @click="handleAddStep"
            />
        </div>
        <div class="py-4 px-6">
            <draggable v-model="state.proxyRules"
                       ghost-class="ghost"
                       handle=".handle"
                       draggable=".card"
            >
                <div v-for="(rule, idx) in state.proxyRules"
                     :key="`rule-${idx}`"
                     class="card"
                >
                    <div class="header flex items-center p-2 bg-gray-150">
                        <div>
                            <p-i name="ic_drag-handle"
                                 width="1rem"
                                 height="1rem"
                                 :coler="gray[500]"
                                 class="handle handle-icon"
                            />
                            <p-badge badge-type="solid-outline"
                                     style-type="gray500"
                                     class="ml-1"
                            >
                                {{ $t('ALERT_MANAGER.ESCALATION_POLICY.STEP', { step: idx + 1}) }}
                            </p-badge>
                        </div>
                        <p-icon-button v-if="state.proxyRules.length > 1"
                                       class="ml-auto"
                                       name="ic_delete"
                                       size="sm"
                                       @click="handleDeleteRule(idx)"
                        />
                    </div>
                    <div class="content py-3 px-2 bg-white">
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
                        <service-detail-tabs-settings-escalation-policy-form-channel-dropdown :key="idx"
                                                                                              class="mt-2"
                                                                                              :selected-ids="rule.channels"
                                                                                              @update:selected-ids="handleSelectChannelDropdown(idx, $event)"
                        />
                    </div>
                </div>
            </draggable>
            <p-text-button :disabled="state.proxyRules.length >= 10"
                           class="add-rule-button mt-4 mx-auto "
                           icon-left="ic_plus_bold"
                           size="lg"
                           @click="handleAddStep"
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
        @apply border border-gray-200;
        border-radius: 0.375rem;
        box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.06);
        .header {
            border-top-right-radius: 0.375rem;
            border-top-left-radius: 0.375rem;
            .handle-icon {
                &:hover {
                    @apply cursor-pointer;
                }
            }
        }
        .content {
            border-bottom-right-radius: 0.375rem;
            border-bottom-left-radius: 0.375rem;
        }
        + .card {
            margin-top: 1rem;
        }
        .minute-form {
            width: 6.5rem;
            margin-bottom: 0;
        }
        &.sortable-chosen {
            .header {
                @apply bg-blue-200;
            }
            .content {
                @apply bg-blue-200;
            }
        }
    }
    .add-rule-button {
        @apply text-black font-bold;
    }
}
</style>
