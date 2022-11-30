<template>
    <div class="widget-data-table">
        <p-data-loader class="table-container"
                       :loading="loading"
                       :data="items"
                       show-data-from-scratch
        >
            <template #no-data>
                <div class="no-data-wrapper"
                     :style="{minHeight: noDataMinHeight}"
                >
                    <!--                    song-lang-->
                    {{ $t('No Data') }}
                </div>
            </template>
            <table>
                <thead>
                    <tr>
                        <th v-for="(field, fieldColIndex) in fields"
                            :key="`th-${widgetKey}-${fieldColIndex}`"
                            :style="{
                                minWidth: field.width || undefined,
                                width: field.width || undefined,
                            }"
                        >
                            <slot :name="`th-${field.name}`"
                                  v-bind="getHeadSlotProps(field, fieldColIndex)"
                            >
                                <span class="th-contents"
                                      :class="{
                                          [field?.styleOptions?.align || DATA_TABLE_CELL_TEXT_ALIGN.left]: true,
                                          'has-icon': field.tooltipText,
                                      }"
                                >
                                    <span class="th-text">
                                        <slot :name="`th-${field.name}`"
                                              v-bind="getHeadSlotProps(field, fieldColIndex)"
                                        >
                                            {{ field.label ? field.label : field.name }}
                                        </slot>
                                        <template v-if="field.tooltipText">
                                            <p-tooltip :contents="field.tooltipText">
                                                <p-i name="ic_tooltip"
                                                     width="0.875rem"
                                                     height="0.875rem"
                                                     :color="gray[300]"
                                                     class="tooltip-icon"
                                                />
                                            </p-tooltip>
                                        </template>
                                    </span>
                                </span>
                            </slot>
                        </th>
                    </tr>
                </thead>
                <tbody ref="tbodyRef">
                    <slot name="body"
                          :items="items"
                          v-bind="{fields}"
                    >
                        <tr v-for="(item, rowIndex) in items"
                            :key="`tr-${widgetKey}-${rowIndex}`"
                            :data-index="rowIndex"
                            @click.left="() => {console.log('row click');}"
                        >
                            <td v-for="(field, colIndex) in fields"
                                :key="`td-${widgetKey}-${rowIndex}-${colIndex}`"
                                :class="{
                                    'has-width': !!field.width,
                                    [field?.styleOptions?.align || DATA_TABLE_CELL_TEXT_ALIGN.left]: true,
                                }"
                            >
                                <slot :name="`col-${field.name}`"
                                      v-bind="getColSlotProps(item, field, colIndex, rowIndex)"
                                >
                                    <slot :name="`col-${colIndex}`"
                                          v-bind="getColSlotProps(item, field, colIndex, rowIndex)"
                                    >
                                        {{ getValue(item, field) }}
                                    </slot>
                                </slot>
                            </td>
                        </tr>
                    </slot>
                </tbody>
                <tfoot>
                    <slot name="foot" />
                </tfoot>
            </table>
        </p-data-loader>
        <div v-if="paginationVisible"
             class="table-pagination-wrapper"
        >
            <p-text-pagination :all-page="allPage"
                               :this-page.sync="proxyThisPage"
            />
        </div>
    </div>
</template>

<script lang="ts">

import {
    computed, defineComponent, reactive, toRefs,
} from 'vue';
import type { PropType } from 'vue';

import {
    PTextPagination, PI, PDataLoader, PTooltip,
} from '@spaceone/design-system';
import { DATA_TABLE_CELL_TEXT_ALIGN } from '@spaceone/design-system/src/data-display/tables/data-table/config';
import { get } from 'lodash';

import { byteFormatter, numberFormatter } from '@cloudforet/core-lib';

import type { Currency } from '@/store/modules/display/config';
import { CURRENCY, CURRENCY_SYMBOL } from '@/store/modules/display/config';
import type { CurrencyRates } from '@/store/modules/display/type';

import { currencyMoneyFormatter } from '@/lib/helper/currency-helper';

import { useProxyValue } from '@/common/composables/proxy-state';

import { gray } from '@/styles/colors';

import type { Field, LegendOptions } from '@/services/dashboards/widgets/_components/type';

import { GROUP_BY } from '../config';

interface Props {
    loading: boolean;
    fields: Field[];
    items: any[];
    thisPage: number;
    pageSize: number;
    showIndex: number;
    legendOptions: LegendOptions;
    currency: Currency;
    currencyRates: CurrencyRates;
    paginationVisible: boolean;
    noDataMinHeight: string;
    widgetKey: string;
}
export default defineComponent<Props>({
    name: 'WidgetDataTable',
    components: {
        PTooltip,
        PTextPagination,
        PI,
        PDataLoader,
    },
    props: {
        loading: {
            type: Boolean,
            default: false,
        },
        fields: {
            type: Array as PropType<Field[]>,
            default: () => ([]),
        },
        items: {
            type: Array,
            default: () => ([]),
        },
        thisPage: {
            type: Number,
            default: 1,
        },
        pageSize: {
            type: Number,
            default: 5,
        },
        legendOption: {
            type: Object as PropType<LegendOptions>,
            default: () => ({
                enabled: false,
                index: false,
            }),
        },
        // legends: {
        //     type: Array,
        //     default: undefined,
        // },
        currency: {
            type: String as PropType<Currency>,
            default: CURRENCY.USD,
        },
        currencyRates: {
            type: Object as PropType<CurrencyRates>,
            default: () => ({}),
        },
        paginationVisible: {
            type: Boolean,
            default: true,
        },
        noDataMinHeight: {
            type: String,
            default: '7rem',
        },
        widgetKey: {
            type: String,
            default: '7rem',
        },
        // printMode: {
        //     type: Boolean,
        //     default: false,
        // },
    },
    setup(props, { emit }) {
        const state = reactive({
            // slicedItems: computed(() => {
            //     if (props.printMode) return props.items;
            //     const startIndex = state.proxyThisPage * props.pageSize - props.pageSize;
            //     const endIndex = state.proxyThisPage * props.pageSize;
            //     return props.items.slice(startIndex, endIndex);
            // }),
            totalCount: computed(() => props.items.length),
            allPage: computed(() => Math.ceil(state.totalCount / props.pageSize) || 1),
            proxyThisPage: useProxyValue('thisPage', props, emit),
        });

        /* util */
        // const getConvertedIndex = (index) => index + ((state.proxyThisPage - 1) * props.pageSize);
        // const labelColorFormatter = (index) => ((props.legends && props.legends[getConvertedIndex(index)]) ? props.legends[getConvertedIndex(index)].color : 'text-gray-900');
        // const labelTextFormatter = (index) => ((props.legends && props.legends[getConvertedIndex(index)]) ? props.legends[getConvertedIndex(index)].label : '');
        // const getIndexNumber = (index) => {
        //     const tableIndex = index + ((state.proxyThisPage - 1) * props.pageSize) + 1;
        //     return tableIndex?.toString();
        // };
        // const getLegendIconColor = (index) => {
        //     const legend = props.legends[getConvertedIndex(index)];
        //     if (legend?.disabled) return DISABLED_LEGEND_COLOR;
        //     if (legend?.color) return legend.color;
        //     return DEFAULT_CHART_COLORS[getConvertedIndex(index)];
        // };
        // const getLegendTextColor = (index) => {
        //     const legend = props.legends[getConvertedIndex(index)];
        //     if (legend?.disabled) return DISABLED_LEGEND_COLOR;
        //     return null;
        // };
        const getHeadSlotProps = (field, colIndex) => ({
            field, index: colIndex, colIndex,
        });
        const getValue = (item, field: Field) => {
            if (typeof item === 'object') {
                return get(item, field.name);
            }
            return item;
        };
        const getColSlotProps = (item, field, colIndex, rowIndex) => ({
            item, index: rowIndex, field, value: getValue(item, field), colIndex, rowIndex,
        });

        /* event */
        // const handleClickLegend = (index) => {
        //     if (props.printMode) return;
        //     emit('toggle-legend', index);
        // };

        return {
            ...toRefs(state),
            GROUP_BY,
            // getIndexNumber,
            // getConvertedIndex,
            // getLegendIconColor,
            // getLegendTextColor,
            // labelColorFormatter,
            // labelTextFormatter,
            // handleClickLegend,
            currencyMoneyFormatter,
            byteFormatter,
            numberFormatter,
            CURRENCY_SYMBOL,
            getHeadSlotProps,
            getColSlotProps,
            getValue,
            DATA_TABLE_CELL_TEXT_ALIGN,
            gray,
        };
    },
});
</script>

<style lang="postcss" scoped>
.widget-data-table {
    .table-container {
        @apply overflow-auto h-full w-full;
        .no-data-wrapper {
            @apply flex justify-center items-center;
        }
    }
    table {
        @apply min-w-full;
        border-collapse: separate;
        border-spacing: 0;
        table-layout: fixed;
    }
    thead {
        tr {
            position: sticky;
            top: 0;
            z-index: 1;
        }
    }
    th {
        @apply border-t border-b-2 border-gray-200 text-gray-600;
        line-height: 1.25rem;
        font-size: 0.75rem;
        font-weight: 700;
        letter-spacing: 0;
        white-space: nowrap;
        .th-contents {
            @apply flex justify-between pl-4;
            line-height: 2;
            .th-text {
                @apply inline-flex items-center gap-1;
            }
            &.right {
                justify-content: flex-end;
                padding-right: 1rem;
            }
            &.center {
                justify-content: center;
                padding-right: 1rem;
            }
        }
        .tooltip-icon {
            @apply float-right my-px;
        }
        &.fix-width {
            @apply min-w-19;
        }
        &:last-child {
            .th-contents:not(.has-icon) {
                padding-right: 1rem;
            }
        }
        &.all-select {
            @apply py-1 pl-4;
            width: 2.5rem;
            min-width: 2.5rem;
            max-width: 2.5rem;
        }
    }
    td {
        @apply h-10 px-4 z-0 align-middle min-w-28 text-sm;
        &.has-width {
            word-break: break-word;
            padding-top: 0.5rem;
            padding-bottom: 0.5rem;
        }
        &.right {
            @apply text-right;
        }
        &.center {
            @apply text-center;
        }
        i, span, div, input, textarea, article, main, ul, li {
            vertical-align: baseline;
        }
    }
    tr {
        &.row-height-fixed {
            td:not(.has-width) {
                overflow-x: hidden;
                white-space: nowrap;
            }
        }
        &.row-cursor-pointer {
            cursor: pointer;
        }
    }

    .table-pagination-wrapper {
        text-align: center;
    }

    &.print-mode {
        .table-container {
            overflow: hidden;
        }
        table {
            width: 100%;
        }
        .status-wrapper {
            min-width: 2rem;
            padding: 0.125rem 0;
        }
    }
}
</style>
