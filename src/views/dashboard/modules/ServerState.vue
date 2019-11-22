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
import PBoardLayout from '@/components/organisms/layouts/board-layout/BoardLayout';
import PDonutChart from '@/components/organisms/charts/donut-chart/DonutChart';
import DashboardEventBus from '@/views/dashboard/DashboardEventBus';

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
        data: {
            type: Object,
            required: true,
            default: () => ({}),
        },
    },
    data() {
        return {
            loading: true,
        };
    },
    computed: {
        chartData() {
            return Object.keys(this.data).map(key => ({ key, value: this.data[key] }));
        },
    },
    watch: {
        data() {
            if (this.loading) this.loading = false;
        },
    },
    created() {
        DashboardEventBus.$emit('listServerState');
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
