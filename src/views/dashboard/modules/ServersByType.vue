<template>
    <p-board-layout title="Servers by Type">
        <div class="server-type-chart">
            <p-horizontal-stack-bar-chart :data="serverData"
                                          @legendClick="onServerTypeLegendClick"
            />
        </div>
        <p-card-layout :col-max="colMax" class="card-layout">
            <div v-for="(d, key) in chartData" :slot="key" :key="key">
                <p class="title">
                    {{ d.title }}
                </p>
                <p-horizontal-bar-chart :data="d.data"
                                        :style="{width: '100%'}"
                />
            </div>
        </p-card-layout>
    </p-board-layout>
</template>

<script>
import PBoardLayout from '@/components/organisms/layouts/board-layout/BoardLayout';
import PHorizontalStackBarChart from '@/components/organisms/charts/horizontal-stack-bar-chart/HorizontalStackBarChart';
import PHorizontalBarChart from '@/components/organisms/charts/horizontal-bar-chart/HorizontalBarChart';
import DashboardEventBus from '@/views/dashboard/DashboardEventBus';
import PCardLayout from '@/components/molecules/layouts/card-layout/CardLayout';

export default {
    name: 'ServersByType',
    components: {
        PBoardLayout,
        PHorizontalStackBarChart,
        PHorizontalBarChart,
        PCardLayout,
    },
    props: {
        drawBy: {
            type: Object,
            default: null,
            // default: () => ({ 'region_id': 'region-2a8873d89c8c' })
        },
        serverData: {
            type: Object,
            required: true,
        },
        vmData: {
            type: Object,
            required: true,
        },
        osData: {
            type: Object,
            required: true,
        },
        hypervisorData: {
            type: Object,
            required: true,
        },
        colMax: {
            type: Number,
            default: null,
        },
    },
    data() {
        return {
            test: 'test',
            chartData: {
                vm: { title: 'VM', data: [] },
                os: { title: 'OS', data: [] },
                hypervisor: { title: 'Hypervisor', data: [] },
            },
        };
    },
    watch: {
        vmData(data) {
            this.setChartData('vm', data);
        },
        osData(data) {
            this.setChartData('os', data);
        },
        hypervisorData(data) {
            this.setChartData('hypervisor', data);
        },
    },
    created() {
        DashboardEventBus.$emit('listServerType');
        DashboardEventBus.$emit('listVmType');
        DashboardEventBus.$emit('listOsType');
        DashboardEventBus.$emit('listHypervisorType');
    },
    methods: {
        setChartData(type, data) {
            if (data instanceof Array) this.chartData[type].data = data;
            else {
                this.chartData[type].data = Object.keys(data).map(key => ({
                    key,
                    value: data[key],
                }));
            }
        },
        onServerTypeLegendClick(key, val) {
            this.$router.push({ path: '/inventory/server', query: { plan: 'private' } });
        },
    },
};
</script>

<style lang="scss" scoped>
    .server-type-chart {
        padding: 1.375rem 0;
    }
    .title {
        font-weight: bold;
        font-size: 1rem;
        padding-bottom: 1rem;
    }
    .card-layout {
        border: 1px solid $gray2;
        border-radius: 2px;
    }
</style>
