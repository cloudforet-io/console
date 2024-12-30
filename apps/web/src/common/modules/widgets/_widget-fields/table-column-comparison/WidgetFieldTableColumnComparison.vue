<script lang="ts" setup>
import {
    computed, reactive,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';

import { sortBy } from 'lodash';

import {
    PFieldTitle, PToggleButton, PFieldGroup, PSelectDropdown, PI, PTooltip,
} from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/inputs/context-menu/type';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/inputs/dropdown/select-dropdown/type';

import { i18n } from '@/translations';


import ColorInput from '@/common/components/inputs/ColorInput.vue';
import { DATA_TABLE_OPERATOR } from '@/common/modules/widgets/_constants/data-table-constant';
import { useWidgetGenerateStore } from '@/common/modules/widgets/_store/widget-generate-store';
import {
    widgetFieldDefaultValueMap,
} from '@/common/modules/widgets/_widget-field-value-manager/constant/default-value-registry';
import type { ComparisonFormat } from '@/common/modules/widgets/_widget-fields/comparison/type';
import type {
    TableColumnComparisonOptions,
    TableColumnComparisonValue,
} from '@/common/modules/widgets/_widget-fields/table-column-comparison/type';
import type {
    WidgetFieldComponentProps,
} from '@/common/modules/widgets/types/widget-field-type';

const FIELD_KEY = 'tableColumnComparison';

const props = defineProps<WidgetFieldComponentProps<TableColumnComparisonOptions>>();
const widgetGenerateStore = useWidgetGenerateStore();
const widgetGenerateGetters = widgetGenerateStore.getters;

const state = reactive({
    fieldValue: computed<TableColumnComparisonValue>(() => props.fieldManager.data[FIELD_KEY].value),
    infoText: computed<TranslateResult>(() => {
        if (props.widgetConfig.widgetName !== 'table') return i18n.t('COMMON.WIDGETS.COMPARISON.INFO_TOOLTIP_TABLE');
        return i18n.t('COMMON.WIDGETS.COMPARISON.INFO_TOOLTIP');
    }),
    initialValue: computed<TableColumnComparisonValue>(() => widgetFieldDefaultValueMap.tableColumnComparison),
    formatMenu: computed<SelectDropdownMenuItem[]>(() => [
        // { label: i18n.t('COMMON.WIDGETS.COMPARISON.ALL'), name: 'all' },
        { label: i18n.t('COMMON.WIDGETS.COMPARISON.FIXED'), name: 'fixed' },
        { label: `${i18n.t('COMMON.WIDGETS.COMPARISON.PERCENT')}(%)`, name: 'percent' },
    ]),
    fieldMenuItems: computed<SelectDropdownMenuItem[]>(() => {
        const isPivotDataTable = widgetGenerateGetters?.selectedDataTable?.operator === DATA_TABLE_OPERATOR.PIVOT;
        const pivotSortKeys = (widgetGenerateGetters.selectedDataTable?.sort_keys ?? []);

        const dataInfoList = Object.keys(widgetGenerateGetters.selectedDataTable?.data_info ?? {}) ?? [];
        const sortedDataInfoList = sortBy(dataInfoList, (item) => {
            const index = pivotSortKeys.indexOf(item);
            return index === -1 ? Infinity : index;
        });
        return (isPivotDataTable ? sortedDataInfoList : dataInfoList).map((d) => ({
            name: d,
            label: d,
        }));
    }),
    selectedFields: computed<SelectDropdownMenuItem[]>(() => (state.fieldValue?.fields ?? []).map((item) => ({
        name: item,
        label: item,
    }))),
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

const handleUpdateFields = (fields: MenuItem[]) => {
    props.fieldManager.setFieldValue(FIELD_KEY, {
        ...state.fieldValue,
        fields: fields.map((item) => item.name),
    });
};

</script>

<template>
    <div class="widget-field-tale-column-comparison">
        <div class="field-header">
            <!--                TODO: apply translation-->
            <!--                {{ $t('COMMON.WIDGETS.COMPARISON.COMPARISON') }}-->
            <p-field-title>
                {{ $t('Table Column Comparison UI') }}
                <p-tooltip :contents="state.infoText">
                    <p-i name="ic_info-circle"
                         width="0.875rem"
                         height="0.875rem"
                    />
                </p-tooltip>
            </p-field-title>
            <p-toggle-button :value="state.fieldValue?.toggleValue"
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
            <!--            TODO: apply translation after design fixed-->
            <p-field-group :label="$t('Fields')"
                           class="w-full"
                           style-type="secondary"
                           required
            >
                <p-select-dropdown :menu="state.fieldMenuItems"
                                   use-fixed-menu-style
                                   :selected="state.selectedFields"
                                   :invalid="!state.selectedFields?.length"
                                   multi-selectable
                                   show-select-marker
                                   appearance-type="badge"
                                   block
                                   @update:selected="handleUpdateFields"
                />
            </p-field-group>
        </template>
    </div>
</template>

<style lang="postcss" scoped>
.widget-field-tale-column-comparison {
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
