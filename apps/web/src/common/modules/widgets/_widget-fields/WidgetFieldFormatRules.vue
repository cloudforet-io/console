<script lang="ts" setup>
import { computed, onMounted, reactive } from 'vue';

import {
    PFieldGroup, PTextInput, PIconButton, PButton, PSelectDropdown,
} from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';

import ColorInput from '@/common/components/inputs/ColorInput.vue';
import type { WidgetFieldSchema, FormatRulesOptions, FormatRulesField } from '@/common/modules/widgets/types/widget-config-type';

import { gray } from '@/styles/colors';


interface Props {
    widgetFieldSchema: WidgetFieldSchema<FormatRulesOptions>;
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
    dropdown?: string;
}

const state = reactive({
    menuItems: computed<MenuItem[]>(() => []), // TODO: generate menu items with options.dataTarget
    fields: computed<FormatRulesField[]>(() => props.widgetFieldSchema.options?.fields || []),
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
    if (state.fields.includes('dropdown')) {
        initialFormatRule.dropdown = '';
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
                       required
        >
            <div class="format-rules-wrapper">
                <p-button icon-left="ic_plus_bold"
                          style-type="tertiary"
                          class="add-button"
                          @click="handleClickAddRule"
                >
                    {{ $t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.ADD_RULE') }}
                </p-button>
                <div v-for="(formatRule, idx) in state.formatRules"
                     :key="`format-rule-${formatRule.threshold}-${formatRule.color}-${idx}`"
                     class="format-rules-input-wrapper"
                >
                    <p-text-input v-if="state.fields.includes('name')"
                                  :value="formatRule.name"
                                  placeholder="Name"
                    />
                    <p-select-dropdown v-if="state.fields.includes('dropdown')"
                                       :value="formatRule.dropdown"
                                       :menu="state.menuItems"
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
            </div>
        </p-field-group>
    </div>
</template>

<style lang="postcss" scoped>
/* custom design-system component - p-field-group */
:deep(.p-field-group) {
    margin-bottom: 0.75rem;
    padding: 0;
}

.format-rules-wrapper {
    @apply bg-gray-100 rounded-md;
    padding: 0.5rem;
    .add-button {
        margin-bottom: 0.5rem;
    }
    .format-rules-input-wrapper {
        display: flex;
        gap: 0.5rem;
        align-items: center;
        padding-bottom: 0.5rem;
        .p-select-dropdown {
            flex: 1;
            width: 100%;
        }
        .p-text-input {
            flex: 1;
            width: 100%;
            min-width: 30%;
        }
        .delete-button {
            width: 2rem;
        }
    }
}
</style>
