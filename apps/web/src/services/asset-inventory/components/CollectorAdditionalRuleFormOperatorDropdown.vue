<script setup lang="ts">
import { computed, reactive } from 'vue';

import { PSelectDropdown } from '@cloudforet/mirinae';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

import {
    COLLECTOR_RULE_CONDITION_OPERATOR,
    COLLECTOR_RULE_CONDITION_OPERATOR_LABEL,
} from '@/schema/inventory/collector-rule/constant';
import type { CollectorRuleConditionOperator } from '@/schema/inventory/collector-rule/type';

import { useProxyValue } from '@/common/composables/proxy-state';


interface Props {
    value?: CollectorRuleConditionOperator;
}
const props = withDefaults(defineProps<Props>(), {
    value: COLLECTOR_RULE_CONDITION_OPERATOR.eq,
});
const emit = defineEmits<{(e: 'update:value'): void,
}>();

const state = reactive({
    proxyValue: useProxyValue<CollectorRuleConditionOperator>('value', props, emit),
    menu: computed<SelectDropdownMenuItem[]>(() => Object.keys(COLLECTOR_RULE_CONDITION_OPERATOR).map((key) => ({
        label: COLLECTOR_RULE_CONDITION_OPERATOR_LABEL[key],
        name: key,
    }))),
});

const handleSelect = (value:CollectorRuleConditionOperator) => {
    state.proxyValue = value;
};
</script>

<template>
    <p-select-dropdown
        :selected="state.proxyValue"
        :menu="state.menu"
        is-fixed-width
        class="collector-additional-rule-form-operator-dropdown"
        @select="handleSelect"
    />
</template>
