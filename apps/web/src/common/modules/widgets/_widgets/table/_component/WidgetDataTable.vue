<script setup lang="ts">

import { PDataLoader } from '@spaceone/design-system';

import type { Currency } from '@/store/modules/settings/type';

import type { TableWidgetField } from '@/common/modules/widgets/types/widget-data-table-type';
import type { WidgetSize } from '@/common/modules/widgets/types/widget-display-type';
import type { TableDataFieldValue } from '@/common/modules/widgets/types/widget-field-value-type';


interface Props {
  loading: boolean;
  fields: TableWidgetField[];
  items?: any[];
  currency?: Currency;
  size?: WidgetSize;
  widgetId: string;
  fieldType: TableDataFieldValue['fieldType'];
  criteria?: string;
  dataField?: string|string[];
}
const props = defineProps<Props>();

const getValue = (item: any, field: TableWidgetField) => {
    if (field.fieldInfo?.type === 'labelField') {
        return item[field.name] || '-';
    }
    if (props.fieldType === 'staticField') {
        return item[field.name] || '-';
    }
    if (props.fieldType === 'dynamicField') {
        const dynamicData = item[props.criteria || ''] ?? [];
        const dynamicDataItem = dynamicData.find((data) => data[props.dataField as string] === field.name);
        return dynamicDataItem?.value || 0;
    }
    return '';
};
</script>

<template>
    <div class="widget-data-table">
        <p-data-loader class="table-container"
                       :loading="props.loading"
                       :data="props.items"
                       :loader-backdrop-opacity="1"
                       disable-empty-case
        >
            <template #default>
                <table ref="tableRef">
                    <thead>
                        <tr>
                            <th v-for="(field, fieldColIndex) in props.fields"
                                :key="`th-${props.widgetId}-${fieldColIndex}`"
                                :style="{
                                    minWidth: field.width || undefined,
                                    width: field.width || undefined,
                                }"
                                :class="{'last-label': fieldColIndex === props.fields.filter((_field) => _field.fieldInfo?.type === 'labelField').length - 1}"
                            >
                                <span class="th-contents"
                                      :class="{
                                          'data-field': field.fieldInfo?.type === 'dataField',
                                          'sub-total': field.fieldInfo?.additionalType === 'subTotal',
                                      }"
                                >
                                    <span class="th-text">
                                        {{ field.label ? field.label : field.name }}
                                    </span>
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
                                }"
                            >
                                <span ref="labelRef"
                                      class="td-contents"
                                      :class="{
                                          'data-field': field.fieldInfo?.type === 'dataField',
                                      }"
                                >
                                    <span class="common-text-box">{{ getValue(item, field) }}</span>
                                </span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </template>
        </p-data-loader>
    </div>
</template>

<style scoped lang="postcss">
.widget-data-table {
    @apply bg-white overflow-auto h-full w-full;
    height: 100%;
    overflow-y: scroll;

    table {
        @apply min-w-full;
        border-collapse: separate;
        border-spacing: 0;
    }

    th {
        @apply text-label-sm text-gray-700 border-t border-b-2 border-gray-200 bg-white;
        border-bottom-width: 0.225rem;
        font-weight: 500;
        height: 1.75rem;
        min-width: 8rem;
        padding: 0.1875rem 0.5rem;

        &.last-label {
            @apply border-r;
        }

        .th-contents {
            @apply flex justify-between pl-4;

            &.data-field {
                @apply justify-end;
            }
            &.sub-total {
                @apply font-bold text-gray-700;
            }
        }
        &:last-child {
            .th-contents:not(.has-icon) {
                padding-right: 1rem;
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
            }
        }
    }

    td {
        @apply z-0 align-middle min-w-28 text-sm;
        height: 1.75rem;
        padding: 0.1875rem 0.5rem;

        &:hover {
            @apply bg-gray-200;
        }
        &.last-label {
            @apply border-r border-gray-200;
        }

        &.sub-total {
            @apply bg-violet-100;

            .td-contents {
                @apply font-bold text-gray-900; }

            &:hover {
                background-color: rgba(theme('colors.violet.200'), 0.7);
            }
        }

        .td-contents {
            @apply flex justify-between pl-4;
            width: 100%;

            &.data-field {
                @apply justify-end;
            }
        }
    }
}
</style>
