<script setup lang="ts">

import { computed, reactive } from 'vue';

import { PI, PTooltip } from '@spaceone/design-system';
import bytes from 'bytes';

import { byteFormatter, numberFormatter } from '@cloudforet/utils';

import type { Currency } from '@/store/modules/settings/type';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { ProjectReferenceMap } from '@/store/reference/project-reference-store';

import { REFERENCE_FIELD_MAP } from '@/common/modules/widgets/_constants/widget-constant';
import { DEFAULT_COMPARISON_COLOR } from '@/common/modules/widgets/_constants/widget-field-constant';
import type { TableWidgetField } from '@/common/modules/widgets/types/widget-data-table-type';
import type { TableDataItem } from '@/common/modules/widgets/types/widget-data-type';
import type { WidgetSize } from '@/common/modules/widgets/types/widget-display-type';
import type { TableDataFieldValue, ComparisonValue, TotalValue } from '@/common/modules/widgets/types/widget-field-value-type';
import type { DataInfo } from '@/common/modules/widgets/types/widget-model';

import { SIZE_UNITS } from '@/services/asset-inventory/constants/asset-analysis-constant';


interface Props {
  fields: TableWidgetField[];
  items?: any[];
  currency?: Currency;
  size?: WidgetSize;
  widgetId: string;
  dataInfo?: DataInfo;
  fieldType: TableDataFieldValue['fieldType'];
  criteria?: string;
  dataField?: string|string[];
  granularity?: string;
  // optional field info
  comparisonInfo?: ComparisonValue;
  subTotalInfo?: TotalValue;
  totalInfo?: TotalValue;
}
const props = defineProps<Props>();
const allReferenceStore = useAllReferenceStore();

const storeState = reactive({
    project: computed<ProjectReferenceMap>(() => allReferenceStore.getters.project),
    workspace: computed(() => allReferenceStore.getters.workspace),
    region: computed(() => allReferenceStore.getters.region),
    serviceAccount: computed(() => allReferenceStore.getters.serviceAccount),
});

const getComparisonInfo = (fieldName: string) => `${fieldName} Compared to ${props.granularity || 'Previous'}`;
const getField = (field: TableWidgetField): string => {
    if (field.fieldInfo?.type === 'dataField' && field.fieldInfo?.reference) return storeState[field.fieldInfo.reference][field.label]?.name || field.label || field.name;
    return field.label || field.name;
};

const valueFormatter = (value, field: TableWidgetField) => {
    const _unit = field.fieldInfo?.unit;
    if (_unit && SIZE_UNITS.includes(_unit)) {
        const _originalVal = bytes.parse(`${value}${_unit}`);
        return byteFormatter(_originalVal);
    }
    return numberFormatter(value, { notation: 'compact' });
};

const getValue = (item: TableDataItem, field: TableWidgetField) => {
    if (field.fieldInfo?.type === 'labelField') {
        if (Object.keys(REFERENCE_FIELD_MAP).includes(field.name)) {
            const referenceKey = REFERENCE_FIELD_MAP[field.name];
            const referenceValueKey = item[field.name];
            return storeState[referenceKey][referenceValueKey]?.label || storeState[referenceKey][referenceValueKey]?.name || referenceValueKey || '-';
        }
        return item[field.name] || '-';
    }
    if (props.fieldType === 'staticField') {
        const itemValue = item[field.name];
        if (field.fieldInfo?.additionalType === 'comparison') {
            const targetValue = itemValue?.target ?? 0;
            const subjectValue = itemValue?.subject ?? 0;
            const fixedValue = Math.abs(targetValue - subjectValue);
            const percentageValue = fixedValue / (targetValue || 1) * 100;
            if (!fixedValue || fixedValue === 0) return '-';
            if (props.comparisonInfo?.format === 'fixed') return valueFormatter(fixedValue, field);
            if (props.comparisonInfo?.format === 'percent') return `${numberFormatter(percentageValue)}%`;
            if (props.comparisonInfo?.format === 'all') return `${valueFormatter(fixedValue, field)} (${numberFormatter(percentageValue)}%)`;
            return '-';
        }
        return valueFormatter(itemValue, field) || '-';
    }
    if (props.fieldType === 'dynamicField') {
        const dynamicData = item[props.criteria || ''] ?? [];
        const dynamicDataItem = dynamicData.find((data) => data[props.dataField as string] === field.name);
        if (field.fieldInfo?.additionalType === 'comparison') {
            const targetValue = dynamicDataItem?.value?.target ?? 0;
            const subjectValue = dynamicDataItem?.value?.subject ?? 0;
            const fixedValue = Math.abs(targetValue - subjectValue);
            const percentageValue = fixedValue / (targetValue || 1) * 100;
            if (!fixedValue || fixedValue === 0) return '-';
            if (props.comparisonInfo?.format === 'fixed') return valueFormatter(fixedValue, field);
            if (props.comparisonInfo?.format === 'percent') return `${numberFormatter(percentageValue)}%`;
            if (props.comparisonInfo?.format === 'all') return `${valueFormatter(fixedValue, field)} (${numberFormatter(percentageValue)}%)`;
            return '-';
        }
        return valueFormatter(dynamicDataItem?.value, field) || 0;
    }
    return '-';
};
const getComparisonValueIcon = (item: TableDataItem, field: TableWidgetField): { icon: string; color: string; }|undefined => {
    if (props.fieldType === 'staticField') {
        const subtraction = (item?.[field.name]?.target ?? 0) - (item?.[field.name]?.subject ?? 0);
        if (subtraction > 0) return { icon: 'ic_arrow-up-bold-alt', color: props.comparisonInfo?.increaseColor || DEFAULT_COMPARISON_COLOR.INCREASE };
        if (subtraction < 0) return { icon: 'ic_arrow-down-bold-alt', color: props.comparisonInfo?.decreaseColor || DEFAULT_COMPARISON_COLOR.DECREASE };
    } else {
        const dynamicData = item[props.criteria || ''] ?? [];
        const dynamicDataItem = dynamicData.find((data) => data[props.dataField as string] === field.name);
        const subtraction = (dynamicDataItem?.value?.target ?? 0) - (dynamicDataItem?.value?.subject ?? 0);
        if (subtraction > 0) return { icon: 'ic_arrow-up-bold-alt', color: props.comparisonInfo?.increaseColor || DEFAULT_COMPARISON_COLOR.INCREASE };
        if (subtraction < 0) return { icon: 'ic_arrow-down-bold-alt', color: props.comparisonInfo?.decreaseColor || DEFAULT_COMPARISON_COLOR.DECREASE };
    }
    return undefined;
};
const getValueTooltipText = (item: TableDataItem, field: TableWidgetField) => {
    if (field.fieldInfo?.type === 'labelField' || field.fieldInfo?.additionalType === 'comparison') return '';
    if (props.fieldType === 'staticField') {
        const dataInfo = props.dataInfo?.[field.name || ''];
        return `• Unit: ${dataInfo?.unit ?? '-'} \n• ${field.name}: ${numberFormatter(item[field.name])}`;
    }
    const dataInfo = props.dataInfo?.[props.criteria || ''];
    const dynamicData = item[props.criteria || ''] ?? [];
    const dynamicDataItem = dynamicData.find((data) => data[props.dataField as string] === field.name);
    return `• Unit: ${dataInfo?.unit ?? '-'} \n• ${props.criteria}: ${numberFormatter(dynamicDataItem?.value) || 0}`;
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
                            minWidth: field.width || undefined,
                            width: field.width || undefined,
                        }"
                        :class="{
                            'last-label': fieldColIndex === props.fields.filter((_field) => _field.fieldInfo?.type === 'labelField').length - 1,
                            'sub-total-freeze': field.fieldInfo?.additionalType === 'subTotal' && props.subTotalInfo?.freeze,
                        }"
                    >
                        <span class="th-contents"
                              :class="{
                                  'data-field': field.fieldInfo?.type === 'dataField',
                                  'sub-total': field.fieldInfo?.additionalType === 'subTotal',
                              }"
                        >
                            <span class="th-text">
                                {{ field.fieldInfo?.additionalType === 'comparison' ? 'Δ' : "" }}{{ getField(field) }}
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
                            'sub-total': field.fieldInfo?.additionalType === 'subTotal',
                            'sub-total-freeze': field.fieldInfo?.additionalType === 'subTotal' && props.subTotalInfo?.freeze,
                            'total': item[props.fields[0].name] === 'Total' && props.items?.length === rowIndex + 1,
                            'total-freeze': item[props.fields[0].name] === 'Total' && props.items?.length === rowIndex + 1 && props.totalInfo?.freeze,
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
                            ><span class="common-text-box">{{ getValue(item, field) }}</span></p-tooltip>
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
    @apply bg-white h-full w-full relative;
    max-width: 81.5rem;
    max-height: 100%;
    overflow: auto;

    table {
        @apply min-w-full;
        border-collapse: separate;
        border-spacing: 0;
        padding: 0;
    }

    th {
        @apply text-label-sm text-gray-700 border-t border-b-2 border-gray-200 bg-white;
        border-bottom-width: 0.225rem;
        font-weight: 500;
        height: 1.75rem;
        min-width: 7.5rem;
        padding: 0.1875rem 0.5rem;

        &.last-label {
            @apply border-r;
        }
        &.sub-total-freeze {
            @apply border-l border-violet-200 sticky;
            right: 0;
            top: 0;
        }

        .th-contents {
            @apply flex items-center pl-4 gap-1;
            .comparison-info {
                min-width: 0.875rem;
            }

            &.data-field {
                @apply justify-end;
            }
            &.sub-total {
                @apply font-bold text-gray-700;
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
                        background-color: rgba(theme('colors.violet.200'), 0.7);
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

            .comparison-icon {
                min-width: 0.75rem;
            }

            &.data-field {
                @apply justify-end;
            }
        }
    }
}

</style>
