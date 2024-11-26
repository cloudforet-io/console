<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';

import { cloneDeep } from 'lodash';

import {
    PFieldTitle, PToggleButton, PFieldGroup, PSelectDropdown, PI, PTooltip,
} from '@cloudforet/mirinae';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/inputs/dropdown/select-dropdown/type';

import { i18n } from '@/translations';

import ColorInput from '@/common/components/inputs/ColorInput.vue';
import { useProxyValue } from '@/common/composables/proxy-state';
import { DEFAULT_COMPARISON_COLOR } from '@/common/modules/widgets/_constants/widget-field-constant';
import { isDateField, isIncludingDateField } from '@/common/modules/widgets/_helpers/widget-field-helper';
import type { ComparisonFormat, ComparisonValue, ComparisonOptions } from '@/common/modules/widgets/_widget-fields/comparison/type';
import type { GroupByValue } from '@/common/modules/widgets/_widget-fields/group-by/type';
import type { TableDataFieldValue } from '@/common/modules/widgets/_widget-fields/table-data-field/type';
import type { WidgetFieldComponentProps, WidgetFieldComponentEmit } from '@/common/modules/widgets/types/widget-field-type';



const emit = defineEmits<WidgetFieldComponentEmit<ComparisonValue|undefined>>();

const props = withDefaults(defineProps<WidgetFieldComponentProps<ComparisonOptions, ComparisonValue>>(), {
    widgetFieldSchema: () => ({
        options: {
            toggle: false,
        },
    }),
});

const state = reactive({
    toggleValue: false,
    proxyValue: useProxyValue<ComparisonValue|undefined>('value', props, emit),
    disabled: computed<boolean>(() => { // NOTE: EXCEPTION FOR ONLY TABLE WIDGET
        const tableDataField = props.allValueMap?.tableDataField as TableDataFieldValue;
        if (!tableDataField) return false;
        const _tableDataFieldFieldValue = tableDataField.fieldType === 'staticField' ? tableDataField.staticFieldInfo?.fieldValue : tableDataField.dynamicFieldInfo?.fieldValue;
        const groupByField = props.allValueMap?.groupBy as GroupByValue;
        return !Array.isArray(_tableDataFieldFieldValue) && isDateField(_tableDataFieldFieldValue)
            || Array.isArray(_tableDataFieldFieldValue) && isIncludingDateField(_tableDataFieldFieldValue)
            || Array.isArray(groupByField?.value) && isIncludingDateField(groupByField.value);
    }),
    infoText: computed<TranslateResult>(() => {
        const tableDataField = props.allValueMap?.tableDataField as TableDataFieldValue;
        if (tableDataField) return i18n.t('COMMON.WIDGETS.COMPARISON.INFO_TOOLTIP_TABLE');
        return i18n.t('COMMON.WIDGETS.COMPARISON.INFO_TOOLTIP');
    }),
    initialValue: computed<ComparisonValue>(() => ({
        decreaseColor: DEFAULT_COMPARISON_COLOR.DECREASE,
        increaseColor: DEFAULT_COMPARISON_COLOR.INCREASE,
        format: 'all',
        toggleValue: true,
    })),
    formatMenu: computed<SelectDropdownMenuItem[]>(() => [
        { label: i18n.t('COMMON.WIDGETS.COMPARISON.ALL'), name: 'all' },
        { label: `${i18n.t('COMMON.WIDGETS.COMPARISON.PERCENT')}(%)`, name: 'percent' },
        { label: i18n.t('COMMON.WIDGETS.COMPARISON.FIXED'), name: 'fixed' },
    ]),
});

const handleUpdateColor = (key:string, color:string) => {
    if (!state.proxyValue || !state.proxyValue?.toggleValue) return;
    const clonedValue = cloneDeep(state.proxyValue);
    clonedValue[key] = color;
    state.proxyValue = clonedValue;
};
const handleUpdateToggle = (value: boolean) => {
    if (value) {
        state.proxyValue = cloneDeep(state.initialValue);
    } else {
        state.proxyValue = {
            toggleValue: false,
        };
    }
};

const handleUpdateFormat = (format: ComparisonFormat) => {
    if (!state.proxyValue) return;
    const clonedValue = cloneDeep(state.proxyValue);
    clonedValue.format = format;
    state.proxyValue = clonedValue;
};

const checkValue = ():boolean => {
    if (state.proxyValue?.toggleValue) {
        return !!state.proxyValue?.decreaseColor && !!state.proxyValue?.increaseColor && !!state.proxyValue?.format;
    }
    return true;
};

watch(() => state.proxyValue, (_value) => {
    emit('update:is-valid', checkValue());
    if (!_value && props.widgetFieldSchema?.options?.toggle) {
        state.proxyValue = cloneDeep(state.initialValue);
    }
}, { immediate: true });
</script>

<template>
    <div class="widget-field-total">
        <div class="field-header">
            <p-field-title>
                {{ $t('COMMON.WIDGETS.COMPARISON.COMPARISON') }}
                <p-tooltip :contents="state.infoText">
                    <p-i name="ic_info-circle"
                         width="0.875rem"
                         height="0.875rem"
                    />
                </p-tooltip>
            </p-field-title>
            <p-toggle-button :value="state.proxyValue?.toggleValue"
                             :disabled="state.disabled"
                             @change-toggle="handleUpdateToggle"
            />
        </div>
        <template v-if="state.proxyValue?.toggleValue">
            <div class="compare-with-wrapper">
                <p-field-group :label="$t('COMMON.WIDGETS.COMPARISON.COMPARE_WITH')"
                               class="left-part"
                               style-type="secondary"
                               required
                >
                    <span class="previous-period-text">{{ $t('COMMON.WIDGETS.COMPARISON.PREVIOUS_PERIOD') }}</span>
                </p-field-group>
            </div>
            <div class="compare-input-wrapper">
                <div class="left-part">
                    <p-field-group :label="$t('COMMON.WIDGETS.COMPARISON.DECREASE')"
                                   style-type="secondary"
                                   required
                    >
                        <color-input :value="state.proxyValue.decreaseColor"
                                     @update:value="(color) => handleUpdateColor('decreaseColor', color)"
                        />
                    </p-field-group>
                    <p-field-group :label="$t('COMMON.WIDGETS.COMPARISON.INCREASE')"
                                   style-type="secondary"
                                   required
                    >
                        <color-input :value="state.proxyValue.increaseColor"
                                     @update:value="(color) => handleUpdateColor('increaseColor', color)"
                        />
                    </p-field-group>
                </div>
                <p-field-group :label="$t('COMMON.WIDGETS.COMPARISON.FORMAT')"
                               class="w-full"
                               style-type="secondary"
                               required
                >
                    <p-select-dropdown :menu="state.formatMenu"
                                       use-fixed-menu-style
                                       :selected="state.proxyValue.format"
                                       block
                                       @update:selected="(format) => handleUpdateFormat(format)"
                    />
                </p-field-group>
            </div>
        </template>
    </div>
</template>

<style lang="postcss" scoped>
.widget-field-total {
    .field-header {
        @apply flex items-center gap-1 justify-between;
    }

    .compare-with-wrapper {
        @apply flex gap-2;
        .left-part {
            flex-shrink: 0;
        }
        .previous-period-text {
            @apply text-label-md text-gray-800;
        }
    }

    .compare-input-wrapper {
        @apply flex gap-2;
        .left-part {
            @apply flex gap-3;
            flex-shrink: 0;
        }
    }
}
</style>
