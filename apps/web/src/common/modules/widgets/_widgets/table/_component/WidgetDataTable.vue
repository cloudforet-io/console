<script setup lang="ts">

import { computed, reactive } from 'vue';


import type { Query } from '@cloudforet/core-lib/space-connector/type';
import { PI, PTooltip } from '@cloudforet/mirinae';
import { numberFormatter } from '@cloudforet/utils';

import type { PrivateDataTableModel } from '@/schema/dashboard/private-data-table/model';
import type { PublicDataTableModel } from '@/schema/dashboard/public-data-table/model';

import type { Currency } from '@/store/display/type';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { ProjectReferenceMap } from '@/store/reference/project-reference-store';

import { hexToRgba } from '@/lib/helper/color-convert-helper';

import { useProxyValue } from '@/common/composables/proxy-state';
import { REFERENCE_FIELD_MAP } from '@/common/modules/widgets/_constants/widget-constant';
import {
    DEFAULT_COMPARISON_COLOR, SUB_TOTAL_NAME,
    TABLE_DEFAULT_MINIMUM_WIDTH,
} from '@/common/modules/widgets/_constants/widget-field-constant';
import {
    getFormattedDate,
    getRefinedDateFormatByGranularity,
} from '@/common/modules/widgets/_helpers/widget-date-helper';
import { getFormattedNumber } from '@/common/modules/widgets/_helpers/widget-helper';
import type {
    CustomColumnWidthItem,
    CustomTableColumnWidthValue,
} from '@/common/modules/widgets/_widget-fields/custom-table-column-width/type';
import type { DataFieldHeatmapColorValue } from '@/common/modules/widgets/_widget-fields/data-field-heatmap-color/type';
import type { DateFormatValue } from '@/common/modules/widgets/_widget-fields/date-format/type';
import type { MissingValueValue } from '@/common/modules/widgets/_widget-fields/missing-value/type';
import type { NumberFormatValue } from '@/common/modules/widgets/_widget-fields/number-format/type';
import type { TableColumnComparisonValue } from '@/common/modules/widgets/_widget-fields/table-column-comparison/type';
import type { TableColumnWidthValue } from '@/common/modules/widgets/_widget-fields/table-column-width/type';
import type { TextWrapValue } from '@/common/modules/widgets/_widget-fields/text-wrap/type';
import type { TotalValue } from '@/common/modules/widgets/_widget-fields/total/type';
import type { TableWidgetField } from '@/common/modules/widgets/types/widget-data-table-type';
import type { TableDataItem } from '@/common/modules/widgets/types/widget-data-type';
import type { WidgetSize } from '@/common/modules/widgets/types/widget-display-type';
import type { DataInfo } from '@/common/modules/widgets/types/widget-model';

import {
    blue, green, red, yellow,
} from '@/styles/colors';

const HEATMAP_COLOR_HEX_MAP = {
    RED: red[200],
    BLUE: blue[200],
    YELLOW: yellow[200],
    GREEN: green[200],
};

type TableDataValue = number | undefined | null;
const TABLE_MISSING_VALUE_SYMBOL = '-';

interface Props {
  fields: TableWidgetField[];
  items?: any[];
  currency?: Currency;
  size?: WidgetSize;
  widgetId: string;
  dataInfo?: DataInfo;
  sortBy: Query['sort'];
  thisPage: number;
  dataField?: string[];
  granularity?: string;
  isPivotDataTable?: boolean;
  dataTable?: PublicDataTableModel|PrivateDataTableModel;
  // optional field info
  tableColumnComparisonInfo?: TableColumnComparisonValue;
  subTotalInfo?: TotalValue;
  totalInfo?: TotalValue;
  dateFormatInfo?: DateFormatValue;
  numberFormatInfo?: NumberFormatValue;
  dataFieldHeatmapColorInfo?: DataFieldHeatmapColorValue;
  tableColumnWidthInfo?: TableColumnWidthValue;
  customTableColumnWidthInfo?: CustomTableColumnWidthValue;
  textWrapInfo?: TextWrapValue;
  missingValueInfo?: MissingValueValue;
}
const props = defineProps<Props>();
const emit = defineEmits<{(e: 'update:sort-by', value: Query['sort']): void;
  (e: 'update:this-page', value: number): void;
}>();
const allReferenceStore = useAllReferenceStore();

const storeState = reactive({
    project: computed<ProjectReferenceMap>(() => allReferenceStore.getters.project),
    workspace: computed(() => allReferenceStore.getters.workspace),
    region: computed(() => allReferenceStore.getters.region),
    serviceAccount: computed(() => allReferenceStore.getters.serviceAccount),
});

const state = reactive({
    proxySortBy: useProxyValue('sortBy', props, emit),
    proxyThisPage: useProxyValue('thisPage', props, emit),
    refinedDateFormat: computed<string|undefined>(() => {
        if (!props.granularity || !props.dateFormatInfo) return undefined;
        return getRefinedDateFormatByGranularity(props.granularity, props.dateFormatInfo.format);
    }),
    linearInterpolationValueMap: computed<Record<string, { min: number, max: number }>>(() => {
        if (!props.items || !props.items.length) return {};
        const dataItems = props.totalInfo?.toggleValue ? props.items.slice(0, -1) : props.items;
        return props.fields.reduce((acc, field) => {
            if (field.fieldInfo?.type === 'dataField') {
                const dataField = field.name;
                const maxValue = Math.max(...dataItems.map((item) => item[dataField] || 0));
                const minValue = Math.min(...dataItems.map((item) => item[dataField] || 0));
                return { ...acc, [dataField]: { min: minValue, max: maxValue } };
            }
            return acc;
        }, {});
    }),
    textWrapStyle: computed(() => {
        if (!props.textWrapInfo?.toggleValue) return {};
        return {
            display: 'inline-block',
            width: '100%',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
        };
    }),
    columnFieldForPivot: computed<string|undefined>(() => props.dataTable?.options?.PIVOT?.fields?.column),
});

const getComparisonInfo = (fieldName: string) => `${fieldName} Compared to ${props.granularity || 'Previous'}`;
const getField = (field: TableWidgetField): string => {
    if (field.fieldInfo?.type === 'dataField' && field.fieldInfo?.reference) {
        const referenceKey = REFERENCE_FIELD_MAP[field.fieldInfo?.reference];
        return storeState?.[referenceKey]?.[field.label]?.name || field.label || field.name;
    }
    if (field.fieldInfo?.type === 'dataField' && field.fieldInfo?.additionalType === 'dateFormat' && !!state.refinedDateFormat) {
        return getFormattedDate(field.name, state.refinedDateFormat);
    }
    return field.label || field.name;
};

const valueFormatter = (value: TableDataValue, field: TableWidgetField, numberFormatInfo: NumberFormatValue = {}, isPercentage?: boolean) => {
    // HACK: handle missing value after applying table missing value
    // handle missing value
    const isMissingValue = value === null || value === undefined || value === 0;
    if (isMissingValue && props.missingValueInfo?.type === 'lineBreaks') return TABLE_MISSING_VALUE_SYMBOL;

    const _value = value || 0;
    const _unit = field.fieldInfo?.unit;
    // const dataField = field.name?.replace('comparison_', '');
    if (isPercentage) return `${numberFormatter(_value)}%`;

    const fieldName = props.isPivotDataTable && state.columnFieldForPivot ? state.columnFieldForPivot : field.name;
    return getFormattedNumber(_value, numberFormatInfo?.[fieldName], _unit);
};

const getValue = (item: TableDataItem, field: TableWidgetField) => {
    if (field.fieldInfo?.type === 'labelField') {
        if (Object.keys(REFERENCE_FIELD_MAP).includes(field.name)) {
            const referenceKey = REFERENCE_FIELD_MAP[field.name];
            const referenceValueKey = item[field.name];
            return storeState[referenceKey][referenceValueKey]?.label || storeState[referenceKey][referenceValueKey]?.name || referenceValueKey || '-';
        }
        if (field.fieldInfo?.additionalType === 'dateFormat' && !!state.refinedDateFormat && item[props.fields[0].name] !== 'Total') {
            return getFormattedDate(item[field.name], state.refinedDateFormat);
        }
        return item[field.name] || '-';
    }
    const itemValue = item[field.name];
    if (field.fieldInfo?.additionalType === 'comparison') {
        if (item[props.fields[0].name] === 'Total') return valueFormatter(Math.abs(itemValue || 0), field, props.numberFormatInfo);
        if (props.tableColumnComparisonInfo?.format === 'fixed') return valueFormatter(Math.abs(itemValue || 0), field, props.numberFormatInfo);
        if (props.tableColumnComparisonInfo?.format === 'percent') return valueFormatter(Math.abs(itemValue || 0), field, props.numberFormatInfo, true);
        // if (props.tableColumnComparisonInfo?.format === 'all') return `${valueFormatter(fixedValue, field)} (${numberFormatter(percentageValue)}%)`;
        return '-';
    }
    return valueFormatter(itemValue, field, props.numberFormatInfo);
};
const getComparisonValueIcon = (item: TableDataItem, field: TableWidgetField): { icon: string; color: string; }|undefined => {
    const value = item?.[field.name];
    if (value > 0) return { icon: 'ic_arrow-up-bold-alt', color: props.tableColumnComparisonInfo?.increaseColor || DEFAULT_COMPARISON_COLOR.INCREASE };
    if (value < 0) return { icon: 'ic_arrow-down-bold-alt', color: props.tableColumnComparisonInfo?.decreaseColor || DEFAULT_COMPARISON_COLOR.DECREASE };
    return undefined;
};
const getValueTooltipText = (item: TableDataItem, field: TableWidgetField) => {
    if (field.fieldInfo?.type === 'labelField' || field.fieldInfo?.additionalType === 'comparison') return '';
    let _unit;
    if (field.name === 'sub_total') {
        const filteredFieldWithUnit = (props.dataField as string[])?.filter((_field) => props.dataInfo?.[_field]?.unit);
        _unit = filteredFieldWithUnit?.map((_field) => (props.dataInfo ?? {})[_field]?.unit).join(', ');
    } else _unit = props.dataInfo?.[field.name || '']?.unit;
    return `• Unit: ${_unit ?? '-'} \n• ${field.name}: ${numberFormatter(item[field.name])}`;
};

const getSortIcon = (field: TableWidgetField) => {
    if (!state.proxySortBy.some((d) => d.key === field.name)) {
        return 'ic_caret-down';
    }
    return state.proxySortBy[0]?.desc ? 'ic_caret-down-filled' : 'ic_caret-up-filled';
};

const handleClickSort = async (sortKey: string) => {
    let resultSortBy: { key: string; desc: boolean }[];
    if (state.proxySortBy.length && state.proxySortBy[0].key === sortKey) {
        resultSortBy = [{ key: sortKey, desc: !state.proxySortBy[0].desc }];
    } else {
        resultSortBy = [{ key: sortKey, desc: true }];
    }
    state.proxySortBy = resultSortBy;
    state.proxyThisPage = 1;
};

const getHeatmapColorStyle = (item: TableDataItem, field: TableWidgetField) => {
    const BASE_OPACITY = 0.1;
    const _style: Record<string, string> = {};
    const heatmapSkipCondition = field.fieldInfo?.type === 'labelField'
        || field?.fieldInfo?.additionalType === 'comparison' || field.name === SUB_TOTAL_NAME;
    if (heatmapSkipCondition) return _style;

    const _dataField = field.name;
    let _value = 0;
    const minValue = state.linearInterpolationValueMap[_dataField].min;
    const maxValue = state.linearInterpolationValueMap[_dataField].max;
    const absGapValue = maxValue - minValue;
    _value = item[field.name] || 0;


    const opacity = absGapValue !== 0 ? (BASE_OPACITY + (0.9 * ((_value - minValue) / absGapValue))) : BASE_OPACITY;
    const _colorInfo = props.dataFieldHeatmapColorInfo?.[(props.isPivotDataTable && state.columnFieldForPivot) ? state.columnFieldForPivot : _dataField]?.colorInfo;
    if (_colorInfo && _colorInfo !== 'NONE') {
        const rgbaString = hexToRgba(HEATMAP_COLOR_HEX_MAP[_colorInfo], opacity);
        if (rgbaString) _style.backgroundColor = rgbaString;
    }

    return _style;
};

const getFieldMinWidth = (field: TableWidgetField): string|undefined => {
    const customWidthItem: CustomColumnWidthItem|undefined = props.customTableColumnWidthInfo?.widthInfos?.find((item) => {
        const labelKeys = Object.keys(props.dataTable?.labels_info ?? {});
        if (props.isPivotDataTable && !labelKeys.includes(field.name) && field.name !== SUB_TOTAL_NAME) {
            return item.fieldKey === state.columnFieldForPivot;
        }
        return item.fieldKey === field?.name;
    });

    const customWidth: string|number|undefined = customWidthItem?.width;

    const minimumWidth = props.tableColumnWidthInfo?.minimumWidth ?? TABLE_DEFAULT_MINIMUM_WIDTH;
    const fixedWidth = props.tableColumnWidthInfo?.widthType === 'fixed' ? props.tableColumnWidthInfo?.fixedWidth : undefined;
    const calculatedWidth = (customWidth ?? 0) < minimumWidth
        ? (fixedWidth || minimumWidth) : (customWidth || fixedWidth || minimumWidth);
    return calculatedWidth ? `${calculatedWidth}px` : undefined;
};
const getFieldWidth = (field: TableWidgetField): string|undefined => {
    const customWidth: string|number|undefined = props.customTableColumnWidthInfo?.widthInfos?.find((item) => item.fieldKey === field?.name)?.width;

    const fixedWidth = props.tableColumnWidthInfo?.widthType === 'fixed' ? props.tableColumnWidthInfo?.fixedWidth : undefined;
    const calculatedWidth = customWidth || fixedWidth;

    return calculatedWidth ? `${calculatedWidth}px` : undefined;
};



</script>

<template>
    <div class="widget-data-table">
        <table ref="tableRef">
            <thead>
                <tr>
                    <th v-for="(field, fieldColIndex) in props.fields"
                        :key="`th-${props.widgetId}-${fieldColIndex}`"
                        :style="{
                            minWidth: getFieldMinWidth(field),
                            width: getFieldWidth(field),
                            maxWidth: getFieldWidth(field),
                        }"
                        :class="{
                            'last-label': fieldColIndex === props.fields.filter((_field) => _field.fieldInfo?.type === 'labelField').length - 1,
                            'sub-total-freeze': field.name === SUB_TOTAL_NAME && props.subTotalInfo?.freeze,
                        }"
                    >
                        <span class="th-contents"
                              :class="{
                                  'data-field': field.fieldInfo?.type === 'dataField',
                                  'sub-total': field.name === SUB_TOTAL_NAME,
                              }"
                        >
                            <span class="th-text"
                                  :style="{ ...state.textWrapStyle }"
                            >
                                {{ field.fieldInfo?.additionalType === 'comparison' ? 'Δ' : "" }}{{ getField(field) }}
                                <!--                                <span class="timediff-sub-text">{{ getTimeDiffSubText(field) }}</span>-->
                            </span>
                            <p-tooltip v-if="field.fieldInfo?.additionalType === 'comparison'"
                                       class="comparison-info"
                                       position="bottom"
                                       :contents="getComparisonInfo(getField(field))"
                            >
                                <p-i name="ic_info-circle"
                                     width="0.875rem"
                                     height="0.875rem"
                                />
                            </p-tooltip>
                            <p-i v-else-if="true"
                                 :name="getSortIcon(field)"
                                 class="sort-icon"
                                 @click="handleClickSort(field.name)"
                            />
                        </span>
                    </th>
                </tr>
            </thead>
            <tbody ref="tbodyRef">
                <tr v-for="(item, rowIndex) in props.items"
                    :key="`tr-${props.widgetId}-${rowIndex}`"
                    :data-index="rowIndex"
                >
                    <td v-for="(field, colIndex) in props.fields"
                        :key="`td-${props.widgetId}-${rowIndex}-${colIndex}`"
                        :class="{
                            'link-item': field?.link,
                            'last-label': colIndex === props.fields.filter((_field) => _field.fieldInfo?.type === 'labelField').length - 1,
                            'sub-total': field.name === SUB_TOTAL_NAME,
                            'sub-total-freeze': field.name === SUB_TOTAL_NAME && props.subTotalInfo?.freeze,
                            'total': item[props.fields[0].name] === 'Total' && props.items?.length === rowIndex + 1,
                            'total-freeze': item[props.fields[0].name] === 'Total' && props.items?.length === rowIndex + 1 && props.totalInfo?.freeze,
                        }"
                        :style="{
                            minWidth: getFieldMinWidth(field),
                            width: getFieldWidth(field),
                            maxWidth: getFieldWidth(field),
                            ...(rowIndex !== props.items?.length - 1 || !props.totalInfo?.toggleValue ? getHeatmapColorStyle(item, field) : {}),
                        }"
                    >
                        <span ref="labelRef"
                              class="td-contents"
                              :class="{
                                  'data-field': field.fieldInfo?.type === 'dataField',
                              }"
                        >
                            <p-tooltip class="value-tooltip"
                                       :contents="getValueTooltipText(item, field)"
                                       position="bottom"
                            ><span class="common-text-box"
                                   :style="{ ...state.textWrapStyle }"
                            >{{ getValue(item, field) }}</span></p-tooltip>
                            <p-i v-if="field.fieldInfo?.additionalType === 'comparison' && getComparisonValueIcon(item, field)"
                                 :name="getComparisonValueIcon(item, field)?.icon"
                                 :color="getComparisonValueIcon(item, field)?.color"
                                 class="comparison-icon"
                                 width="0.75rem"
                                 height="0.75rem"
                            />
                        </span>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<style scoped lang="postcss">
.widget-data-table {
    @apply bg-white w-full relative;
    max-height: 100%;
    overflow: auto;

    table {
        @apply min-w-full;
        border-collapse: separate;
        border-spacing: 0;
        padding: 0;
    }
    thead {
        @apply sticky;
        top: 0;
        z-index: 1;
    }

    th {
        @apply text-label-sm text-gray-700 border-t border-b-2 border-gray-200 bg-white;
        border-bottom-width: 0.225rem;
        font-weight: 500;
        height: 1.75rem;
        min-width: 7.5rem;
        padding: 0 0.5rem;

        &.last-label {
            @apply border-r;
        }
        &.sub-total-freeze {
            @apply border-l border-violet-200 sticky;
            right: 0;
            top: 0;
        }

        .th-contents {
            @apply flex items-center justify-between pl-4 gap-1;
            text-align: left;

            .comparison-info {
                min-width: 0.875rem;
            }
            .th-text {
                @apply flex items-center gap-1;
                .timediff-sub-text {
                    @apply text-gray-400 text-paragraph-sm;
                }
            }

            &.data-field {
                @apply justify-end;
                text-align: right;
            }
            &.sub-total {
                @apply font-bold text-gray-700;
            }

            .sort-icon {
                @apply text-gray-500 float-right;
                &:hover { cursor: pointer; }
            }
        }
    }

    tbody {
        tr {
            &:nth-child(odd) {
                @apply bg-gray-100;
                td {
                    &.sub-total {
                        @apply bg-violet-150;
                    }
                }
            }
            &:hover {
                background-color: rgba(theme('colors.gray.200'), 0.7);
                td {
                    &.sub-total {
                        background-color: rgba(theme('colors.violet.200'), 1);
                    }
                }
            }
        }
    }

    td {
        @apply z-0 align-middle text-label-sm text-gray-900;
        height: 1.75rem;
        padding: 0.1875rem 0.5rem;
        min-width: 7.5rem;

        &:hover {
            @apply bg-gray-200;
        }
        &.last-label {
            @apply border-r border-gray-200;
        }

        &.sub-total {
            @apply bg-violet-100;

            .td-contents {
                @apply font-bold text-gray-900;
            }
        }
        &.sub-total-freeze {
            @apply border-l border-violet-200 sticky;
            right: 0;
            top: 0;
        }
        &.total {
            @apply bg-violet-100 font-bold text-gray-900 border-r-0;
        }
        &.total-freeze {
            @apply border-t border-violet-200 sticky;
            bottom: 0;
        }

        .td-contents {
            @apply flex items-center pl-4 gap-1;
            width: 100%;
            text-align: left;

            .value-tooltip {
                width: 100%;
            }

            .comparison-icon {
                min-width: 0.75rem;
            }

            &.data-field {
                @apply justify-end;
                text-align: right;
            }
        }
    }
}

</style>
