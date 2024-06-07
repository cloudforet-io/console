<script lang="ts" setup>
import {
    computed, onMounted, reactive, watch,
} from 'vue';

import {
    PFieldGroup, PTextInput, PIconButton, PButton, PSelectDropdown,
} from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';
import { cloneDeep } from 'lodash';

import ColorInput from '@/common/components/inputs/ColorInput.vue';
import { useProxyValue } from '@/common/composables/proxy-state';
import type {
    WidgetFieldComponentProps,
    WidgetFieldComponentEmit,
    FormatRulesOptions, FormatRulesField,
} from '@/common/modules/widgets/types/widget-field-type';
import type { FormatRulesValue } from '@/common/modules/widgets/types/widget-field-value-type';

import { gray } from '@/styles/colors';


const props = withDefaults(defineProps<WidgetFieldComponentProps<FormatRulesOptions>>(), {
    widgetFieldSchema: () => ({}),
});
const emit = defineEmits<WidgetFieldComponentEmit<FormatRulesValue[]>>();
const state = reactive({
    proxyValue: useProxyValue('value', props, emit),
    menuItems: computed<MenuItem[]>(() => []), // TODO: generate menu items with options.dataTarget
    fields: computed<FormatRulesField[]>(() => props.widgetFieldSchema.options?.fields || []),
    isValid: computed<boolean>(() => state.proxyValue.every((d) => {
        if (state.fields.includes('name')) {
            if (d.name === undefined) return false;
        }
        if (state.fields.includes('dropdown')) {
            if (d.dropdownItem === undefined) return false;
        }
        return (d.threshold !== undefined) && (d.color !== undefined);
    })),
});

/* Util */
const getInitialFormatRulesValue = (): FormatRulesValue => {
    const initialFormatRule: FormatRulesValue = {
        threshold: 0,
        color: gray[200],
    };
    if (state.fields.includes('name')) {
        initialFormatRule.name = '';
    }
    if (state.fields.includes('dropdown')) {
        // TODO: set initial dropdown item
        initialFormatRule.dropdownItem = '';
    }
    return initialFormatRule;
};

/* Event */
const handleClickAddRule = () => {
    state.proxyValue = [...state.proxyValue, getInitialFormatRulesValue()];
};
const handleDelete = (idx: number) => {
    const _value = cloneDeep(state.proxyValue);
    _value.splice(idx, 1);
    state.proxyValue = _value;
};

/* Watcher */
watch(() => state.isValid, (isValid) => {
    emit('update:is-valid', isValid);
});

onMounted(() => {
    if (!state.proxyValue.length) {
        state.proxyValue = [getInitialFormatRulesValue()];
    }
});
</script>

<template>
    <div class="widget-field-format-rules">
        <p-field-group :label="$t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.FORMAT_RULES')"
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
                <div v-for="(formatRule, idx) in state.proxyValue"
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
                                   :disabled="state.proxyValue.length === 1"
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
