<template>
    <div class="widget-data-table">
        <p-data-loader class="table-container"
                       :loading="loading"
                       :data="items"
                       show-data-from-scratch
                       disable-empty-case
        >
            <template #default="{isEmpty}">
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
                        <p-empty v-if="isEmpty"
                                 class="no-data-wrapper"
                                 :colspan="fields.length"
                        >
                            <!--song-lang-->
                            {{ $t('No Data') }}
                        </p-empty>
                        <slot v-else
                              name="body"
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
                                        'link-item': field?.link,
                                        'detail-item': field?.detailOptions?.enabled,
                                    }"
                                >
                                    <slot :name="`col-${field.name}`"
                                          v-bind="getColSlotProps(item, field, colIndex, rowIndex)"
                                    >
                                        <div class="detail-item-wrapper">
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
                                                         width="1rem"
                                                         height="1rem"
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
                                            <template v-if="field?.detailOptions?.enabled">
                                                <p-popover position="bottom">
                                                    <span class="detail">Details</span><!--song-lang-->
                                                    <template #content>
                                                        <div class="popover-content">
                                                            <slot :name="`detail-${field.name}`"
                                                                  v-bind="getColSlotProps(item, field, colIndex, rowIndex)"
                                                            />
                                                        </div>
                                                    </template>
                                                </p-popover>
                                            </template>
                                        </div>
                                    </slot>
                                </td>
                            </tr>
                        </slot>
                    </tbody>
                    <tfoot>
                        <slot name="foot" />
                    </tfoot>
                </table>
            </template>
        </p-data-loader>
        <div v-if="showPagination"
             class="table-pagination-wrapper"
        >
            <p-text-pagination :this-page.sync="proxyThisPage"
                               :disable-next-page="disableNextPage"
            />
        </div>
    </div>
</template>

<script lang="ts">

import {
    defineComponent, reactive, toRefs,
} from 'vue';
import type { PropType } from 'vue';

import {
    PI, PDataLoader, PTooltip, PStatus, PEmpty, PPopover, PTextPagination,
} from '@spaceone/design-system';
import { DATA_TABLE_CELL_TEXT_ALIGN } from '@spaceone/design-system/src/data-display/tables/data-table/config';
import bytes from 'bytes';
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
import { TABLE_SIZE, UNIT_MAP } from '@/services/dashboards/widgets/_components/type';

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
    disableNextPage: boolean;
}
export default defineComponent<Props>({
    name: 'WidgetDataTable',
    components: {
        PPopover,
        PTooltip,
        PI,
        PDataLoader,
        PStatus,
        PEmpty,
        PTextPagination,
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
        disableNextPage: {
            type: Boolean,
            default: true,
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
        const textFormatter = (value:string|number, textOptions: Field['textOptions']) => {
            if (typeof value !== 'number') return value;
            if (textOptions?.type === 'size') {
                let data: number|null;
                const UNIT_SEPARATOR = ' ';

                if (typeof value === 'number') data = value;
                else if (typeof value === 'string') data = Number(value);
                else if (textOptions?.default !== undefined) data = textOptions?.default ?? 0;
                else data = null;

                let formattedValue: string;
                if (data === null) formattedValue = '-';
                else {
                    const displayUnit: bytes.Unit|undefined = UNIT_MAP[textOptions?.display_unit as string] || undefined;
                    const sourceUnit: bytes.Unit|undefined = UNIT_MAP[textOptions?.source_unit as string] || undefined;
                    const bytesOptions: bytes.BytesOptions = { unit: displayUnit, unitSeparator: UNIT_SEPARATOR };

                    if (sourceUnit) {
                        data = bytes.parse(`${value}${sourceUnit}`);
                    }

                    const res = bytes(data, bytesOptions);
                    if (!res) formattedValue = '-';
                    else if (res.split(UNIT_SEPARATOR)[1] === 'B') {
                        formattedValue = `${data} bytes`;
                    } else {
                        formattedValue = res;
                    }
                }
                return formattedValue;
            } if (textOptions?.type === 'cost') {
                return currencyMoneyFormatter(value, props.currency, props.currencyRates);
            } if (textOptions?.type === 'number') {
                return numberFormatter(value);
            } if (textOptions?.type === 'percent') {
                return `${value}%`;
            }
            return value;
        };
        const getValue = (item:string|number|object, field: Field):string|number => {
            if (typeof item === 'object') {
                return textFormatter(get(item, field.name), field.textOptions);
            }
            return textFormatter(item, field.textOptions);
        };
        const getHandler = (option: Field['icon']|Field['link']|Field['rapidIncrease'], item): string|boolean|undefined => {
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
            emit('toggle-legend', index);
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
    display: flex;
    flex-direction: column;
    .p-data-loader {
        flex-grow: 1;
        flex-shrink: 0;
    }
    .table-container {
        @apply overflow-auto w-full;
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
    tbody {
        .no-data-wrapper {
            position: absolute;
            height: calc(100% - 2rem);
            max-height: 12.875rem;
        }
        tr {
            &:nth-child(odd) {
                @apply bg-gray-100;
            }
            &:hover {
                background-color: rgba(theme('colors.gray.200'), 0.7);
            }
        }
    }
    td {
        @apply px-4 z-0 align-middle min-w-28 text-sm;
        .detail-item-wrapper {
            @apply flex justify-between items-center;

            .td-contents {
                @apply inline-flex gap-2;

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

            .detail {
                @apply text-blue-700;
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

    .table-pagination-wrapper {
        flex-shrink: 0;
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
