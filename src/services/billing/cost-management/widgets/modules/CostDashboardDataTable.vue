<template>
    <div class="cost-dashboard-data-table">
        <p-data-table :fields="fields"
                      :items="slicedItems"
                      :total-count="totalCount"
                      :loading="loading"
                      table-style-type="simple"
                      disable-hover
        >
            <template #col-format="{field: { name }, value, index}">
                <div>
                    <template v-if="fields[0].name === name">
                        <p-status v-if="showLegend"
                                  class="toggle-button"
                                  :text="getStatusText(index)"
                                  :icon-color="getStatusIconColor(index)"
                                  :text-color="getStatusTextColor(index)"
                                  @click="handleClickLegend(index)"
                        />
                        <slot :name="`${name}-format`" v-bind="{ value }">
                            {{ value }}
                        </slot>
                    </template>
                    <template v-else-if="typeof value === 'string'">
                        {{ value }}
                    </template>
                    <template v-else>
                        {{ currencyMoneyFormatter(value, currency, currencyRates) }}
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
        <div v-if="paginationVisible" class="table-pagination-wrapper">
            <p-text-pagination :all-page="allPage"
                               :this-page.sync="proxyThisPage"
            />
        </div>
    </div>
</template>

<script lang="ts">
import { PieChart, TreeMap, XYChart } from '@amcharts/amcharts4/charts';

import {
    computed, reactive, toRefs,
} from '@vue/composition-api';

import {
    PDataTable, PTextPagination, PStatus,
} from '@spaceone/design-system';

import { makeProxy } from '@/lib/helper/composition-helpers';
import { toggleSeries } from '@/lib/amcharts/helper';
import { DEFAULT_CHART_COLORS, DISABLED_LEGEND_COLOR } from '@/styles/colorsets';

import { currencyMoneyFormatter } from '@/lib/helper/currency-helper';
import { CURRENCY } from '@/store/modules/display/config';


// interface Item {
//     [key: string]: number | string;
// }

export default {
    name: 'CostDashboardDataTable',
    components: {
        PDataTable,
        PTextPagination,
        PStatus,
    },
    props: {
        loading: {
            type: Boolean,
            default: false,
        },
        fields: {
            type: Array,
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
        showLegend: {
            type: Boolean,
            default: false,
        },
        chart: {
            type: Object,
            default: undefined,
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
    },
    setup(props, { emit }) {
        const state = reactive({
            // convertedItems: [] as Item[],
            slicedItems: computed(() => {
                const startIndex = state.proxyThisPage * props.pageSize - props.pageSize;
                const endIndex = state.proxyThisPage * props.pageSize;
                return props.items.slice(startIndex, endIndex);
            }),
            totalCount: computed(() => props.items.length),
            allPage: computed(() => Math.ceil(state.totalCount / props.pageSize) || 1),
            proxyThisPage: makeProxy('thisPage', props, emit),
        });

        /* util */
        const getStatusText = (index) => {
            const tableIndex = index + ((state.proxyThisPage - 1) * props.pageSize) + 1;
            return tableIndex.toString();
        };
        const getStatusIconColor = (index) => {
            const convertedIndex = index + ((state.proxyThisPage - 1) * props.pageSize);
            const legend = props.legends[convertedIndex];
            if (legend?.disabled) return DISABLED_LEGEND_COLOR;
            return DEFAULT_CHART_COLORS[convertedIndex];
        };
        const getStatusTextColor = (index) => {
            const convertedIndex = index + ((state.proxyThisPage - 1) * props.pageSize);
            const legend = props.legends[convertedIndex];
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
            const convertedIndex = index + ((state.proxyThisPage - 1) * props.pageSize);
            toggleSeries(props.chart as XYChart | PieChart | TreeMap, convertedIndex);
            emit('toggle-legend', convertedIndex);
        };

        // watch([() => props.showSharpRises, () => props.items], ([showSharpRises, items]) => {
        //     if (showSharpRises && items.length) {
        //         state.convertedItems = getConvertedItems(items);
        //     }
        // }, { immediate: true });

        return {
            ...toRefs(state),
            getStatusText,
            getStatusIconColor,
            getStatusTextColor,
            handleClickLegend,
            currencyMoneyFormatter,
        };
    },
};
</script>

<style lang="postcss" scoped>
.cost-dashboard-data-table {
    .table-pagination-wrapper {
        text-align: center;
        font-size: 0.875rem;
    }
    .p-data-table {
        .toggle-button {
            cursor: pointer;
        }
        .raised {
            @apply text-alert;
        }
    }
}
</style>
