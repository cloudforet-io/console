<template>
    <p-board-layout :title="$t('DASHBOARD.SERVER_STATE')">
        <div class="chart">
            <p-donut-chart
                :data="chartData"
                :loading="loading"
                :height="188"
                @legendClick="onLegendClick"
            />
        </div>
    </p-board-layout>
</template>

<script>
import PBoardLayout from '@/components/organisms/layouts/board-layout/BoardLayout';
import PDonutChart from '@/components/organisms/charts/d3/donut-chart/DonutChart';
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
            chartData: [
                { key: 'Pending', value: 0 },
                { key: 'In-Service', label: 'In Service', value: 0 },
                { key: 'Maintenance', value: 0 },
                { key: 'Closed', value: 0 },
            ],
        };
    },
    watch: {
        data() {
            if (this.loading) this.loading = false;
            this.setDataMap();
        },
    },
    created() {
        DashboardEventBus.$emit('listServerState');
    },
    methods: {
        setDataMap() {
            this.chartData.forEach((d) => {
                d.value = this.data[d.key];
            });
        },
        onLegendClick(key, val) {
            this.$router.push({ path: '/inventory/server' });
        },
    },
};
</script>

<style lang="postcss" scoped>
.chart {
    padding-top: 1.5rem;
}
</style>
