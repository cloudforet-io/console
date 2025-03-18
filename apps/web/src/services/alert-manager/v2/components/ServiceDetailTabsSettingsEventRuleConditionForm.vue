<script lang="ts" setup>
import { useWindowSize } from '@vueuse/core';
import { computed, reactive } from 'vue';

import {
    PButton, PRadio, PSelectDropdown, PTextInput, PIconButton, PDivider, screens,
} from '@cloudforet/mirinae';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

import { ALERT_SEVERITY } from '@/schema/alert-manager/alert/constants';
import { EVENT_RULE_CONDITIONS_POLICY } from '@/schema/alert-manager/event-rule/constant';
import type { EventRuleConditionsType } from '@/schema/alert-manager/event-rule/type';
import { i18n } from '@/translations';

import { useProxyValue } from '@/common/composables/proxy-state';

import type {
    EventRuleConditionPolicyButtonType,
    EventRuleConditionKeyType,
    EventRuleConditionOperatorsType,
} from '@/services/alert-manager/v2/types/alert-manager-type';

interface Props {
    conditionsPolicy?: string;
    conditions?: EventRuleConditionsType[];
    projectId?: string;
}
const props = withDefaults(defineProps<Props>(), {
    conditionsPolicy: 'ALL',
    conditions: () => ([]),
    projectId: undefined,
});

const emit = defineEmits<{(e: 'update:conditions-policy'): void;
    (e: 'update:conditions'): void;
}>();

const { width } = useWindowSize();

const state = reactive({
    isMobileSize: computed(() => width.value < screens.mobile.max),
    conditionsPolicies: computed<EventRuleConditionPolicyButtonType[]>(() => ([
        {
            name: EVENT_RULE_CONDITIONS_POLICY.ALL,
            label: i18n.t('ALERT_MANAGER.EVENT_RULE.ALL'),
        },
        {
            name: EVENT_RULE_CONDITIONS_POLICY.ANY,
            label: i18n.t('ALERT_MANAGER.EVENT_RULE.ANY'),
        },
    ])),
    proxyConditionsPolicy: useProxyValue('conditionsPolicy', props, emit),
    proxyConditions: useProxyValue('conditions', props, emit),
    conditionKeys: computed<EventRuleConditionKeyType[]>(() => ([
        { name: 'title', label: i18n.t('ALERT_MANAGER.EVENT_RULE.LABEL_TITLE') },
        { name: 'description', label: i18n.t('ALERT_MANAGER.EVENT_RULE.LABEL_DESC') },
        { name: 'rule', label: i18n.t('ALERT_MANAGER.EVENT_RULE.LABEL_RULE') },
        { name: 'severity', label: i18n.t('ALERT_MANAGER.EVENT_RULE.LABEL_SEVERITY') },
        { name: 'additional_info', label: i18n.t('ALERT_MANAGER.EVENT_RULE.LABEL_ADDITIONAL_INFO') },
        { name: 'labels', label: i18n.t('ALERT_MANAGER.EVENT_RULE.LABEL_LABELS') },
    ])),
    severityDropdownList: computed<SelectDropdownMenuItem[]>(() => [
        { name: ALERT_SEVERITY.CRITICAL, label: 'Critical' },
        { name: ALERT_SEVERITY.ERROR, label: 'Error' },
        { name: ALERT_SEVERITY.WARNING, label: 'Warning' },
        { name: ALERT_SEVERITY.INFO, label: 'Info' },
    ]),
});

const getDropdownMenu = (key: string): EventRuleConditionOperatorsType[] => {
    const _labels = {
        contain: i18n.t('ALERT_MANAGER.EVENT_RULE.CONTAINS'),
        notContain: i18n.t('ALERT_MANAGER.EVENT_RULE.DOES_NOT_CONTAIN'),
        equals: i18n.t('ALERT_MANAGER.EVENT_RULE.EQUALS'),
        notEquals: i18n.t('ALERT_MANAGER.EVENT_RULE.DOES_NOT_EQUAL'),
        atLeast: i18n.t('ALERT_MANAGER.EVENT_RULE.AT_LEAST'),
        lessThan: i18n.t('ALERT_MANAGER.EVENT_RULE.LESS_THAN_EQUAL'),
    };

    const defaultMenu: EventRuleConditionOperatorsType[] = [
        { name: 'contain', label: _labels.contain },
        { name: 'not_contain', label: _labels.notContain },
        { name: 'eq', label: _labels.equals },
        { name: 'not', label: _labels.notEquals },
    ];

    if (key === 'labels') {
        return [
            ...defaultMenu,
            { name: 'size_gte', label: _labels.atLeast },
            { name: 'size_lte', label: _labels.lessThan },
        ];
    }

    if (key === 'severity') {
        return [
            { name: 'eq', label: _labels.equals },
            { name: 'not', label: _labels.notEquals },
        ];
    }

    return defaultMenu;
};
const handleChangeKey = (key: string, subKey: string) => {
    const conditionIdx = state.proxyConditions.findIndex((i) => i.key === key && i.subKey === subKey);
    if (conditionIdx === -1) return;

    if (key === 'severity') {
        state.proxyConditions[conditionIdx].operator = 'eq';
        state.proxyConditions[conditionIdx].value = ALERT_SEVERITY.CRITICAL;
        return;
    }

    if (key.includes('additional_info')) {
        state.proxyConditions[conditionIdx].subKey = '';
    }
    state.proxyConditions[conditionIdx].value = '';
};
const handleClickAddButton = () => {
    state.proxyConditions.push({
        key: 'title',
        value: '',
        operator: 'contain',
        subKey: '',
    });
};
const handleClickDelete = (idx) => {
    const conditions = [...state.proxyConditions];
    conditions.splice(idx, 1);
    state.proxyConditions = conditions;
};
</script>

<template>
    <section class="service-detail-tabs-settings-event-rule-condition-form"
             :class="{ 'is-mobile': state.isMobileSize }"
    >
        <div class="policy-wrapper">
            <p-radio v-for="policy in state.conditionsPolicies"
                     :key="policy.name"
                     v-model="state.proxyConditionsPolicy"
                     :value="policy.name"
                     class="mr-2"
            >
                <p class="inline-flex items-center gap-1 ml-1">
                    <span>{{ policy.label }}</span>
                    <span class="text-gray-500">
                        {{ policy.name === EVENT_RULE_CONDITIONS_POLICY.ALL ? $t('ALERT_MANAGER.EVENT_RULE.AND') : $t('ALERT_MANAGER.EVENT_RULE.OR') }}
                    </span>
                </p>
            </p-radio>
            <span class="m  l-5 text-gray-500">{{ $t('ALERT_MANAGER.EVENT_RULE.OF_THE_FOLLOWING_ARE_MET') }}</span>
        </div>
        <p-divider v-if="state.proxyConditions.length > 0" />
        <div class="flex flex-col gap-2 pt-6 pb-3">
            <div v-for="(condition, idx) of state.proxyConditions"
                 :key="`condition-${idx}`"
                 class="flex gap-2"
            >
                <div class="left-part"
                     :class="{'additional-info': condition.key.includes('additional_info')}"
                >
                    <p-select-dropdown :selected.sync="condition.key"
                                       class="input"
                                       :menu="state.conditionKeys"
                                       use-fixed-menu-style
                                       is-fixed-width
                                       @update:selected="handleChangeKey(condition.key, condition.subKey)"
                    />
                    <p-text-input v-if="condition.key.includes('additional_info')"
                                  v-model="condition.subKey"
                                  class="input"
                    />
                    <div class="left-part">
                        <p-select-dropdown class="input"
                                           :menu="getDropdownMenu(condition.key)"
                                           :selected.sync="condition.operator"
                                           use-fixed-menu-style
                                           is-fixed-width
                        />
                        <div v-if="condition.key === 'labels'"
                             :key="condition.operator"
                             class="input"
                        >
                            <p-text-input v-if="condition.operator === 'size_gte' || condition.operator === 'size_lte'"
                                          v-model="condition.value"
                                          type="number"
                                          :min="0"
                                          :max="100"
                                          block
                            />
                            <p-text-input v-else
                                          v-model="condition.value"
                                          block
                            />
                        </div>
                        <p-select-dropdown v-else-if="condition.key === 'severity'"
                                           class="input"
                                           :menu="state.severityDropdownList"
                                           :selected.sync="condition.value"
                                           use-fixed-menu-style
                                           is-fixed-width
                        />
                        <p-text-input v-else
                                      v-model="condition.value"
                                      class="input"
                        />
                    </div>
                </div>
                <p-icon-button v-if="state.proxyConditions.length > 1"
                               name="ic_delete"
                               @click="handleClickDelete(idx)"
                />
            </div>
        </div>
        <p-button icon-left="ic_plus_bold"
                  class="w-full mt-3 mb-3"
                  style-type="tertiary"
                  size="md"
                  @click="handleClickAddButton"
        >
            {{ $t('COMMON.BUTTONS.ADD') }}
        </p-button>
    </section>
</template>

<style lang="postcss" scoped>
.service-detail-tabs-settings-event-rule-condition-form {
    .policy-wrapper {
        @apply flex items-center text-label-md pt-3 pb-6;
    }
    .left-part {
        @apply flex w-full justify-between gap-2;
        flex-grow: 1;

        .input {
            min-width: calc((100% - 1rem) / 3);
            width: inherit;
            flex-basis: 0;
            flex-grow: 1;
        }
        &.additional-info {
            .input {
                min-width: calc((100% - 1rem) / 4);
            }
        }
    }
    &.is-mobile {
        .policy-wrapper {
            @apply flex flex-col gap-2 items-start;
        }
        .left-part {
            @apply flex flex-col;
        }
    }
}
</style>
