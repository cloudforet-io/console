<script lang="ts" setup>
import { useWindowSize } from '@vueuse/core';
import { computed, reactive } from 'vue';

import {
    PButton, PRadio, PSelectDropdown, PTextInput, PIconButton, PDivider, screens,
} from '@cloudforet/mirinae';

import { EVENT_RULE_CONDITIONS_POLICY } from '@/schema/alert-manager/event-rule/constant';
import { i18n } from '@/translations';

import { useProxyValue } from '@/common/composables/proxy-state';

import type {
    EventRuleConditionPolicyButtonType,
    EventRuleConditionKeyType,
    EventRuleConditionOperatorsType,
} from '@/services/alert-manager/types/alert-manager-type';

interface Props {
    conditionsPolicy?: string;
    conditions?: any[]; // HACK: set type
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
    operators: computed<EventRuleConditionOperatorsType[]>(() => ([
        {
            name: 'contain',
            label: i18n.t('ALERT_MANAGER.EVENT_RULE.CONTAINS'),
        },
        {
            name: 'not_contain',
            label: i18n.t('ALERT_MANAGER.EVENT_RULE.DOES_NOT_CONTAIN'),
        },
        {
            name: 'eq',
            label: i18n.t('ALERT_MANAGER.EVENT_RULE.EQUALS'),
        },
        {
            name: 'not',
            label: i18n.t('ALERT_MANAGER.EVENT_RULE.DOES_NOT_EQUAL'),
        },
    ])),
    proxyConditionsPolicy: useProxyValue('conditionsPolicy', props, emit),
    proxyConditions: useProxyValue('conditions', props, emit),
    conditionKeys: computed<EventRuleConditionKeyType[]>(() => ([
        { name: 'title', label: i18n.t('ALERT_MANAGER.EVENT_RULE.LABEL_TITLE') },
        { name: 'description', label: i18n.t('ALERT_MANAGER.EVENT_RULE.LABEL_DESC') },
        { name: 'rule', label: i18n.t('ALERT_MANAGER.EVENT_RULE.LABEL_RULE') },
        { name: 'severity', label: i18n.t('ALERT_MANAGER.EVENT_RULE.LABEL_SEVERITY') },
        { name: 'account', label: i18n.t('ALERT_MANAGER.EVENT_RULE.LABEL_ACCOUNT') },
        { name: 'additional_info', label: i18n.t('ALERT_MANAGER.EVENT_RULE.LABEL_ADDITIONAL_INFO') },
        { name: 'labels', label: i18n.t('ALERT_MANAGER.EVENT_RULE.LABEL_LABELS') },
        { name: 'period', label: i18n.t('ALERT_MANAGER.EVENT_RULE.LABEL_PERIOD') },
    ])),
});

/* event */
const handleClickAddButton = () => {
    state.proxyConditions.push({
        key: 'title',
        value: '',
        operator: 'contain',
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
                <div class="left-part">
                    <p-select-dropdown :selected.sync="condition.key"
                                       class="input"
                                       :menu="state.conditionKeys"
                                       use-fixed-menu-style
                                       is-fixed-width
                    />
                    <div class="left-part">
                        <p-select-dropdown class="input"
                                           :menu="state.operators"
                                           :selected.sync="condition.operator"
                                           use-fixed-menu-style
                                           is-fixed-width
                        />
                        <p-text-input v-model="condition.value"
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
