<template>
    <div class="cost-dashboard-data-table"
         :class="{'print-mode': printMode}"
    >
        <p-data-table :fields="items.length ? fields : []"
                      :items="slicedItems"
                      :total-count="totalCount"
                      :loading="loading"
                      :row-height-fixed="!printMode"
                      table-style-type="simple"
                      disable-hover
        >
            <template v-for="field in fields"
                      #[`th-${field.name}-format`]
            >
                <div :key="field.name"
                     class="tooltip-container"
                >
                    <span>{{ field.label }}</span>
                    <p-i v-if="field.tooltipText"
                         v-tooltip.bottom="field.tooltipText"
                         name="ic_question-mark-circle-filled"
                         width="0.875rem"
                         height="0.875rem"
                    />
                </div>
            </template>
            <template #col-format="{field: { name, type }, value, index, colIndex}">
                <div class="status-wrapper"
                     :class="{legend: showLegend && colIndex === 0}"
                >
                    <template v-if="fields[0].name === name && showIndex">
                        <p-status v-if="showLegend"
                                  class="toggle-button"
                                  :text="(getConvertedIndex(index) + 1)?.toString()"
                                  :icon-color="getLegendIconColor(index)"
                                  :text-color="getLegendTextColor(index)"
                                  @click="handleClickLegend(index)"
                        />
                        <slot :name="`${name}-format`"
                              v-bind="{ value }"
                        >
                            <span class="name"
                                  :style="{ color: labelColorFormatter(index) }"
                            >
                                {{ labelTextFormatter(index) }}
                            </span>
                        </slot>
                    </template>
                    <template v-else-if="typeof value === 'string'">
                        {{ value }}
                    </template>
                    <template v-else-if="typeof value === 'number'">
                        <template v-if="type === 'size'">
                            {{ byteFormatter(value) }}
                        </template>
                        <template v-else-if="type === 'number'">
                            {{ numberFormatter(value) }}
                        </template>
                        <template v-else>
                            {{ CURRENCY_SYMBOL[currency] }}{{ currencyMoneyFormatter(value, currency, currencyRates, true) }}
                        </template>
                    </template>
                    <template v-else>
                        --
                    </template>
                    <!--                    <template v-else>-->
                    <!--                        <span v-if="value.isRaised" :class="{raised: value.isRaised}">-->
                    <!--                            <span>{{ value.value }}</span>-->
                    <!--                            <p-i name="ic_bold-arrow-up" width="0.75rem" />-->
                    <!--                        </span>-->
                    <!--                        <span>{{ value.value }}</span>-->
                    <!--                    </template>-->
                </div>
            </template>
        </p-data-table>
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
    computed, reactive, toRefs,
} from 'vue';
import type { PropType } from 'vue';

import {
    PDataTable, PTextPagination, PStatus, PI,
} from '@spaceone/design-system';
import type { DataTableFieldType } from '@spaceone/design-system/types/data-display/tables/data-table/type';

import { byteFormatter, numberFormatter } from '@cloudforet/core-lib';

import { CURRENCY, CURRENCY_SYMBOL } from '@/store/modules/settings/config';

import { currencyMoneyFormatter } from '@/lib/helper/currency-helper';

import { useProxyValue } from '@/common/composables/proxy-state';

import { DEFAULT_CHART_COLORS, DISABLED_LEGEND_COLOR } from '@/styles/colorsets';

import { GROUP_BY } from '@/services/cost-explorer/lib/config';

interface Field extends DataTableFieldType {
    type?: 'cost'|'size'|'number';
}
export default {
    name: 'CostDashboardDataTable',
    components: {
        PDataTable,
        PTextPagination,
        PStatus,
        PI,
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
        showIndex: {
            type: Boolean,
            default: true,
        },
        showLegend: {
            type: Boolean,
            default: false,
        },
        legends: {
            type: Array,
            default: undefined,
        },
        currency: {
            type: String,
            default: CURRENCY.USD,
        },
        currencyRates: {
            type: Object,
            default: () => ({}),
        },
        // showSharpRises: {
        //     type: Boolean,
        //     default: false,
        // },
        paginationVisible: {
            type: Boolean,
            default: true,
        },
        printMode: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, { emit }) {
        const state = reactive({
            slicedItems: computed(() => {
                if (props.printMode) return props.items;
                const startIndex = state.proxyThisPage * props.pageSize - props.pageSize;
                const endIndex = state.proxyThisPage * props.pageSize;
                return props.items.slice(startIndex, endIndex);
            }),
            totalCount: computed(() => props.items.length),
            allPage: computed(() => Math.ceil(state.totalCount / props.pageSize) || 1),
            proxyThisPage: useProxyValue('thisPage', props, emit),
        });

        /* util */
        const getConvertedIndex = (index) => index + ((state.proxyThisPage - 1) * props.pageSize);
        const labelColorFormatter = (index) => ((props.legends && props.legends[getConvertedIndex(index)]) ? props.legends[getConvertedIndex(index)].color : 'text-gray-900');
        const labelTextFormatter = (index) => ((props.legends && props.legends[getConvertedIndex(index)]) ? props.legends[getConvertedIndex(index)].label : '');
        const getIndexNumber = (index) => {
            const tableIndex = index + ((state.proxyThisPage - 1) * props.pageSize) + 1;
            return tableIndex?.toString();
        };
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
        // const getConvertedItems = (items) => {
        //     const convertedItems: Item[] = [];
        //     items.forEach((item) => {
        //         const convertedItem: Item = {};
        //         Object.entries(item).forEach(([k, v]) => {
        //             const date = dayjs.utc(k);
        //             if (date.isValid()) {
        //                 const pastDate = date.subtract(1, 'month').format('YYYY-MM');
        //                 const pastValue = item[pastDate] || undefined;
        //                 let isRaised = false;
        //                 const value: number = v as number;
        //                 if (value && pastValue && pastValue * 1.5 < value) {
        //                     isRaised = true;
        //                 }
        //                 convertedItem[k] = {
        //                     value: commaFormatter(numberFormatter(value)),
        //                     isRaised,
        //                 };
        //             } else {
        //                 convertedItem[k] = {
        //                     value: v,
        //                 };
        //             }
        //         });
        //         convertedItems.push(convertedItem);
        //     });
        //     return convertedItems;
        // };

        /* event */
        const handleClickLegend = (index) => {
            if (props.printMode) return;
            emit('toggle-legend', index);
        };

        // watch([() => props.showSharpRises, () => props.items], ([showSharpRises, items]) => {
        //     if (showSharpRises && items.length) {
        //         state.convertedItems = getConvertedItems(items);
        //     }
        // }, { immediate: true });

        return {
            ...toRefs(state),
            GROUP_BY,
            getIndexNumber,
            getConvertedIndex,
            getLegendIconColor,
            getLegendTextColor,
            handleClickLegend,
            labelColorFormatter,
            labelTextFormatter,
            currencyMoneyFormatter,
            byteFormatter,
            numberFormatter,
            CURRENCY_SYMBOL,
        };
    },
};
</script>

<style lang="postcss" scoped>
.cost-dashboard-data-table {
    .tooltip-container {
        @apply flex flex-wrap gap-2 items-end;
        line-height: 0.9375rem;
        .tooltip-button:hover {
            cursor: pointer;
        }
    }
    .table-pagination-wrapper {
        text-align: center;
        font-size: 0.875rem;
    }

    /* custom design-system component - p-data-table */
    :deep(.p-data-table) {
        .status-wrapper {
            display: inline-flex;
            .toggle-button {
                cursor: pointer;
                padding-right: 1rem;
                > .text {
                    flex-shrink: 0;
                    white-space: nowrap;
                }
            }
            &.legend {
                width: 100%;
                > .name {
                    word-break: break-all;
                }
            }
        }

        .raised {
            @apply text-alert;
        }
        tr:nth-of-type(even) {
            @apply bg-gray-100;
        }
        td {
            @apply border-none;
        }
    }

    &.print-mode {
        /* custom design-system component - p-data-table */
        :deep(.p-data-table) {
            .table-container {
                overflow: hidden;
            }
            table {
                width: 100%;
            }
            .toggle-button {
                cursor: default;
            }
        }
        .status-wrapper {
            min-width: 2rem;
            padding: 0.125rem 0;
        }
    }
}
</style>
