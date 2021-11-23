<template>
    <div class="cost-dashboard-data-table">
        <p-data-table :fields="fields"
                      :items="slicedItems"
                      :total-count="totalCount"
                      :loading="loading"
                      disable-hover
        >
            <template v-if="showLegend" #col-product-format="{value, index}">
                <span class="toggle-button" @click="handleClickLegend(index)">
                    <p-status :text="getStatusText(index)"
                              :icon-color="getStatusIconColor(index)"
                              :text-color="getStatusTextColor(index)"
                    />
                </span>
                {{ value ? value : '--' }}
            </template>
        </p-data-table>
        <div class="table-pagination-wrapper">
            <p-text-pagination :all-page="allPage"
                               :this-page.sync="proxyThisPage"
            />
        </div>
    </div>
</template>

<script lang="ts">
import { PieChart, TreeMap, XYChart } from '@amcharts/amcharts4/charts';

import { computed, reactive, toRefs } from '@vue/composition-api';

import {
    PDataTable, PTextPagination, PStatus,
} from '@spaceone/design-system';

import { CUSTOM_COLORS, DISABLED_COLOR, toggleSeries } from '@/common/composables/dynamic-chart';
import { makeProxy } from '@/lib/helper/composition-helpers';


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
    },
    setup(props, { emit }) {
        const state = reactive({
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
            if (legend?.disabled) return DISABLED_COLOR;
            return CUSTOM_COLORS[convertedIndex];
        };
        const getStatusTextColor = (index) => {
            const convertedIndex = index + ((state.proxyThisPage - 1) * props.pageSize);
            const legend = props.legends[convertedIndex];
            if (legend?.disabled) return DISABLED_COLOR;
            return null;
        };

        /* event */
        const handleClickLegend = (index) => {
            const convertedIndex = index + ((state.proxyThisPage - 1) * props.pageSize);
            toggleSeries(props.chart as XYChart | PieChart | TreeMap, convertedIndex);
            emit('toggle-legend', convertedIndex);
        };

        return {
            ...toRefs(state),
            getStatusText,
            getStatusIconColor,
            getStatusTextColor,
            handleClickLegend,
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
    }
}
</style>
