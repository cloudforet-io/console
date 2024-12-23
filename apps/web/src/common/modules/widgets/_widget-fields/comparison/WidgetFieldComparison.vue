<script lang="ts" setup>
import {
    computed, reactive,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';

import {
    PFieldTitle, PToggleButton, PFieldGroup, PSelectDropdown, PI, PTooltip,
} from '@cloudforet/mirinae';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/inputs/dropdown/select-dropdown/type';

import { i18n } from '@/translations';

import ColorInput from '@/common/components/inputs/ColorInput.vue';
import { isIncludingDateField } from '@/common/modules/widgets/_helpers/widget-field-helper';
import {
    widgetFieldDefaultValueMap,
} from '@/common/modules/widgets/_widget-field-value-manager/constant/default-value-registry';
import type { ComparisonFormat, ComparisonValue, ComparisonOptions } from '@/common/modules/widgets/_widget-fields/comparison/type';
import type { GroupByValue } from '@/common/modules/widgets/_widget-fields/group-by/type';
import type {
    WidgetFieldComponentProps,
} from '@/common/modules/widgets/types/widget-field-type';



const FIELD_KEY = 'comparison';

const props = defineProps<WidgetFieldComponentProps<ComparisonOptions>>();

const state = reactive({
    fieldValue: computed<ComparisonValue>(() => props.fieldManager.data[FIELD_KEY].value),
    disabled: computed<boolean>(() => { // NOTE: EXCEPTION FOR ONLY TABLE WIDGET
        // TODO: add disable case with PIVOT DT
        if (props.widgetConfig.widgetName !== 'table') return false;
        const groupByField = props.fieldManager.data.groupBy.value as GroupByValue;
        return Array.isArray(groupByField?.data) && isIncludingDateField(groupByField.data);
    }),
    infoText: computed<TranslateResult>(() => {
        if (props.widgetConfig.widgetName !== 'table') return i18n.t('COMMON.WIDGETS.COMPARISON.INFO_TOOLTIP_TABLE');
        return i18n.t('COMMON.WIDGETS.COMPARISON.INFO_TOOLTIP');
    }),
    initialValue: computed<ComparisonValue>(() => widgetFieldDefaultValueMap.comparison),
    formatMenu: computed<SelectDropdownMenuItem[]>(() => [
        { label: i18n.t('COMMON.WIDGETS.COMPARISON.ALL'), name: 'all' },
        { label: `${i18n.t('COMMON.WIDGETS.COMPARISON.PERCENT')}(%)`, name: 'percent' },
        { label: i18n.t('COMMON.WIDGETS.COMPARISON.FIXED'), name: 'fixed' },
    ]),
});

const handleUpdateColor = (key:'decreaseColor'|'increaseColor', color:string) => {
    props.fieldManager.setFieldValue(FIELD_KEY, {
        ...state.fieldValue,
        [key]: color,
    });
};
const handleUpdateToggle = (value: boolean) => {
    if (value) {
        props.fieldManager.setFieldValue(FIELD_KEY, state.initialValue);
    } else {
        props.fieldManager.setFieldValue(FIELD_KEY, {
            toggleValue: false,
        });
    }
};

const handleUpdateFormat = (format: ComparisonFormat) => {
    props.fieldManager.setFieldValue(FIELD_KEY, {
        ...state.fieldValue,
        format,
    });
};

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
            <p-toggle-button :value="state.fieldValue?.toggleValue"
                             :disabled="state.disabled"
                             @change-toggle="handleUpdateToggle"
            />
        </div>
        <template v-if="state.fieldValue?.toggleValue">
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
                        <color-input :value="state.fieldValue.decreaseColor"
                                     @update:value="(color) => handleUpdateColor('decreaseColor', color)"
                        />
                    </p-field-group>
                    <p-field-group :label="$t('COMMON.WIDGETS.COMPARISON.INCREASE')"
                                   style-type="secondary"
                                   required
                    >
                        <color-input :value="state.fieldValue.increaseColor"
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
                                       :selected="state.fieldValue.format"
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
