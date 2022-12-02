<template>
    <div class="widget-data-table">
        <p-data-loader class="table-container"
                       :loading="loading"
                       :data="items"
                       show-data-from-scratch
        >
            <template #no-data>
                <!--                    song-lang-->
                {{ $t('No Data') }}
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
                                          [field?.textAlign || DATA_TABLE_CELL_TEXT_ALIGN.left]: true,
                                          'has-icon': field.tooltipText,
                                      }"
                                >
                                    <span class="th-text">
                                        <slot :name="`th-${field.name}-text`"
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
                            @click="handleClickRow({rowIndex, item})"
                        >
                            <td v-for="(field, colIndex) in fields"
                                :key="`td-${widgetKey}-${rowIndex}-${colIndex}`"
                                :class="{
                                    'has-width': !!field.width,
                                    [field?.textAlign || DATA_TABLE_CELL_TEXT_ALIGN.left]: true,
                                    [size]: true,
                                    'link-item': item[field?.name]?.link,
                                }"
                            >
                                <slot :name="`col-${field.name}`"
                                      v-bind="getColSlotProps(item, field, colIndex, rowIndex)"
                                >
                                    <span class="td-contents">
                                        <template v-if="colIndex === 0 && showLegend">
                                            <p-status v-if="showLegend"
                                                      class="toggle-button"
                                                      :text="showLegendIndex ? (getConvertedIndex(rowIndex) + 1)?.toString() : ''"
                                                      :icon-color="getLegendIconColor(rowIndex)"
                                                      :text-color="getLegendTextColor(rowIndex)"
                                                      @click.stop="handleClickLegend(rowIndex)"
                                            />
                                        </template>
                                        <template v-if="field?.icon">
                                            <p-i :name="getHandler(field.icon, item)"
                                                 :width="'1rem'"
                                                 :height="'1rem'"
                                                 class="icon"
                                            />
                                        </template>
                                        <slot :name="`col-${colIndex}-text`"
                                              v-bind="getColSlotProps(item, field, colIndex, rowIndex)"
                                        >
                                            <router-link v-if="getHandler(field.link, item)"
                                                         :to="getHandler(field.link, item)"
                                                         class="link"
                                            >
                                                {{ getValue(item, field) }}
                                            </router-link>
                                            <div v-else-if="getHandler(field.rapidIncrease, item)"
                                                 class="rapid-increase"
                                            ><span>{{ getValue(item, field) }}</span> <p-i name="ic_bold-arrow-up"
                                                                                           width="1rem"
                                                                                           height="1rem"
                                            />
                                            </div>
                                            <span v-else>{{ getValue(item, field) }}</span>
                                        </slot>
                                    </span>
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
        <div v-if="showPagination"
             class="table-pagination-wrapper"
        >
            this page : {{ proxyThisPage }}
        </div>
    </div>
</template>

<script lang="ts">

import {
    defineComponent, reactive, toRefs,
} from 'vue';
import type { PropType } from 'vue';

import {
    PI, PDataLoader, PTooltip, PStatus,
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
import { DEFAULT_CHART_COLORS, DISABLED_LEGEND_COLOR } from '@/styles/colorsets';

import type {
    Field, LegendConfig, TableSize,
} from '@/services/dashboards/widgets/_components/type';
import { TABLE_SIZE } from '@/services/dashboards/widgets/_components/type';

import { GROUP_BY } from '../config';

interface Props {
    loading: boolean;
    fields: Field[];
    items: any[];
    thisPage: number;
    showLegend?: boolean;
    showLegendIndex?: boolean;
    legends: Array<any>;
    currency?: Currency;
    currencyRates?: CurrencyRates;
    showPagination?: boolean;
    widgetKey: string;
}
export default defineComponent<Props>({
    name: 'WidgetDataTable',
    components: {
        PTooltip,
        PI,
        PDataLoader,
        PStatus,
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
        showLegend: {
            type: Boolean,
            default: false,
        },
        showLegendIndex: {
            type: Boolean,
            default: false,
        },
        legends: {
            type: Array as PropType<LegendConfig[]>,
            default: undefined,
        },
        currency: {
            type: String as PropType<Currency>,
            default: CURRENCY.USD,
        },
        currencyRates: {
            type: Object as PropType<CurrencyRates>,
            default: () => ({}),
        },
        showPagination: {
            type: Boolean,
            default: true,
        },
        widgetKey: {
            type: String,
            default: '7rem',
        },
        size: {
            type: String as PropType<TableSize>,
            default: TABLE_SIZE.sm,
        },
        // printMode: {
        //     type: Boolean,
        //     default: false,
        // },
    },
    setup(props, { emit }) {
        const state = reactive({
            proxyThisPage: useProxyValue('thisPage', props, emit),
        });

        /* util */
        const getConvertedIndex = (index) => ((index + ((state.proxyThisPage - 1) * props.items.length)));
        const labelColorFormatter = (index) => ((props.legends && props.legends[getConvertedIndex(index)]) ? props.legends[getConvertedIndex(index)].color : 'text-gray-900');
        const labelTextFormatter = (index) => ((props.legends && props.legends[getConvertedIndex(index)]) ? props.legends[getConvertedIndex(index)].label : '');
        // const getIndexNumber = (index) => {
        //     const tableIndex = index + ((state.proxyThisPage - 1) * props.items.length) + 1;
        //     return tableIndex?.toString();
        // };
        const getLegendIconColor = (index) => {
            const legend = props.legends[getConvertedIndex(index)];
            if (legend?.disabled) return DISABLED_LEGEND_COLOR;
            if (legend?.color) return legend.color;
            return DEFAULT_CHART_COLORS[getConvertedIndex(index)];
        };
        const getLegendTextColor = (index) => {
            const legend = props.legends[getConvertedIndex(index)];
            if (legend?.disabled) return DISABLED_LEGEND_COLOR;
            return null;
        };
        const getHeadSlotProps = (field, colIndex) => ({
            field, index: colIndex, colIndex,
        });
        const getValue = (item, field: Field) => {
            if (typeof item === 'object') {
                return get(item, field.name);
            }
            return item;
        };
        const getHandler = (option: Field['icon']|Field['link']|Field['rapidIncrease'], item) => {
            if (typeof option === 'string' || typeof option === 'boolean') {
                return option;
            }
            if (option) return option(item);
            return undefined;
        };
        const getColSlotProps = (item, field, colIndex, rowIndex) => ({
            item, index: rowIndex, field, value: getValue(item, field), colIndex, rowIndex,
        });

        /* event */
        const handleClickLegend = (index) => {
            // if (props.printMode) return;
            emit('toggle-legend', props.legends[index]);
        };
        const handleClickRow = (rowData) => {
            // if (props.printMode) return;
            emit('click-row', rowData);
        };

        return {
            ...toRefs(state),
            GROUP_BY,
            // getIndexNumber,
            getConvertedIndex,
            getLegendIconColor,
            getLegendTextColor,
            labelColorFormatter,
            labelTextFormatter,
            handleClickLegend,
            handleClickRow,
            currencyMoneyFormatter,
            byteFormatter,
            numberFormatter,
            CURRENCY_SYMBOL,
            getHeadSlotProps,
            getColSlotProps,
            getValue,
            getHandler,
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
        @apply px-4 z-0 align-middle min-w-28 text-sm;
        .td-contents {
            @apply flex gap-2;
            .toggle-button {
                cursor: pointer;
                margin-right: -0.25rem;
            }
            .rapid-increase {
                @apply text-red-500 inline-flex justify-center gap-1;
            }
            .link {
                @apply text-blue-600 underline;
                cursor: pointer;
            }
        }
        &.has-width {
            word-break: break-word;
            padding-top: 0.5rem;
            padding-bottom: 0.5rem;
        }
        &.right {
            @apply text-right;
        }
        &.link-item:hover {
            @apply bg-blue-100;
        }

        &.sm {
            height: 1.75rem;
        }
        &.md {
            height: 2.125rem;
        }

        i, span, div, input, textarea, article, main, ul, li {
            vertical-align: baseline;
        }
    }
    tbody {
        tr {
            &:nth-child(odd) {
                @apply bg-gray-100;
            }
            &:hover {
                background: #dddddfb2;
            }
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
