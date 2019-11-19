<template>
    <p-board-layout title="Server States">
        <div class="chart">
            <p-donut-chart :data="chartData"
                           :loading="loading"
                           :min-width="188"
                           :min-height="188"
                           @legendClick="onLegendClick"
            />
        </div>
    </p-board-layout>
</template>

<script>
import PBoardLayout from '@/components/molecules/layouts/BoardLayout';
import PDonutChart from '@/components/organisms/charts/donut-chart/DonutChart';

export default {
    name: 'ServerState',
    components: {
        PBoardLayout,
        PDonutChart,
    },
    props: {
        drawBy: {
            type: Object,
            default: null,
        },
        showTitle: {
            type: Boolean,
            default: true,
        },
        loading: {
            type: Boolean,
            default: true,
        },
        data: {
            type: Object,
            required: true,
            default: () => ({
                INSERVICE: 0,
                MAINTENANCE: 0,
                CLOSED: 0,
            }),
        },
    },
    computed: {
        chartData() {
            return Object.keys(this.data).map(key => ({ key, value: this.data[key] }));
        },
    },
    methods: {
        onLegendClick(key, val) {
            console.log('onLegendClick', key, val);
            this.$router.push({ path: '/inventory/server', query: { plan: 'private' } });
        },
    },
};
</script>

<style lang="scss" scoped>
.chart {
    padding: 1.5rem 1.25rem 0 1.25rem;
}
</style>
