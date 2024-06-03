<script lang="ts" setup>
import { computed, onMounted, reactive } from 'vue';

import {
    PFieldGroup, PTextInput, PIconButton, PButton,
} from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';

import ColorInput from '@/common/components/inputs/ColorInput.vue';
import type { WidgetFieldSchema, FormatRulesOptions } from '@/common/modules/widgets/types/widget-config-type';

import { gray } from '@/styles/colors';


interface Props {
    widgetFieldSchema: WidgetFieldSchema<FormatRulesOptions>;
    required: boolean;
}
const props = withDefaults(defineProps<Props>(), {
    widgetFieldSchema: () => ({
        label: '',
    }),
});
interface FormatRule {
    threshold: number;
    color: string;
    name?: string;
    legend?: string;
}

const state = reactive({
    menuItems: computed<MenuItem[]>(() => []), // TODO: generate menu items with options.dataTarget
    fields: computed<string[]>(() => props.widgetFieldSchema.options?.fields || []),
    formatRules: [] as FormatRule[],
});

/* Util */
const getInitialFormatRule = (): FormatRule => {
    const initialFormatRule: FormatRule = {
        threshold: 0,
        color: gray[200],
    };
    if (state.fields.includes('name')) {
        initialFormatRule.name = '';
    }
    if (state.fields.includes('legend')) {
        initialFormatRule.legend = '';
    }
    return initialFormatRule;
};

/* Event */
const handleClickAddRule = () => {
    state.formatRules.push(getInitialFormatRule());
};
const handleDelete = (idx: number) => {
    state.formatRules.splice(idx, 1);
    state.formatRules = [...state.formatRules];
};

onMounted(() => {
    state.formatRules.push(getInitialFormatRule());
});
</script>

<template>
    <div class="widget-field-format-rules">
        <p-field-group :label="props.widgetFieldSchema.label"
                       :required="props.required"
        >
            <div v-for="(formatRule, idx) in state.formatRules"
                 :key="`format-rule-${formatRule.threshold}-${formatRule.color}-${idx}`"
                 class="format-rules-form-wrapper"
            >
                <p-text-input v-if="state.fields.includes('name')"
                              :value="formatRule.name"
                              placeholder="Name"
                />
                <p-text-input v-if="state.fields.includes('threshold')"
                              :value="formatRule.threshold"
                              type="number"
                              placeholder="Threshold"
                />
                <color-input v-if="state.fields.includes('color')"
                             :value="formatRule.color"
                             @update:value="formatRule.color = $event"
                />
                <p-icon-button name="ic_delete"
                               style-type="negative-transparent"
                               size="sm"
                               :disabled="state.formatRules.length === 1"
                               class="delete-button"
                               @click="handleDelete(idx)"
                />
            </div>
            <p-button icon-left="ic_plus_bold"
                      style-type="tertiary"
                      @click="handleClickAddRule"
            >
                Add Rule
            </p-button>
        </p-field-group>
    </div>
</template>

<style lang="postcss" scoped>
.format-rules-form-wrapper {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    padding-bottom: 0.5rem;
    .p-text-input {
        flex: 1;
        width: 100%;
    }
    .delete-button {
        width: 2rem;
    }
}
</style>
