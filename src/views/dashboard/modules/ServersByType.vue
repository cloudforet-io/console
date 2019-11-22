<template>
    <p-board-layout title="Servers by Type">
        <div class="server-type-chart">
            <p-horizontal-stack-bar-chart :data="serverData"
                                          :loading="loading.server"
                                          :min-width="410"
                                          @legendClick="onServerTypeLegendClick"
            />
        </div>
        <p-card-layout>
            <template v-for="(d, key) in chartData" :slot="key">
                <p-horizontal-bar-chart :key="key"
                                        :data="d"
                                        :loading="loading[key]"
                                        :min-width="150"
                                        :style="{width: '100%'}"
                />
            </template>
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
    },
    data() {
        return {
            chartData: {
                vm: [],
                os: [],
                hypervisor: [],
            },
            loading: {
                server: true,
                vm: true,
                os: true,
                hypervisor: true,
            },
        };
    },
    watch: {
        serverData() {
            this.setLoading('server', false);
        },
        vmData(data) {
            this.setLoading('vm', false);
            this.setChartData('vm', data);
        },
        osData(data) {
            this.setLoading('os', false);
            this.setChartData('os', data);
        },
        hypervisorData(data) {
            this.setLoading('hypervisor', false);
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
        setLoading(type, val) {
            if (this.loading[type]) this.loading[type] = val;
        },
        setChartData(type, data) {
            if (data instanceof Array) this.chartData[type] = data;
            else {
                this.chartData[type] = Object.keys(data).map(key => ({
                    key,
                    value: data[key],
                }));
            }
        },
        onServerTypeLegendClick(key, val) {
            console.log('onLegendClick', key, val);
            this.$router.push({ path: '/inventory/server', query: { plan: 'private' } });
        },
    },
};
</script>

<style lang="scss" scoped>
.server-type-chart {
    padding: 1.375rem 0;
}
.sub-chart-container {
    display: table;
    width: 100%;
    border: 1px solid $gray2;
    border-radius: 2px;
    padding: 1rem 0;
    .sub-chart {
        display: table-cell;
        vertical-align: top;
        border-right: 1px solid $gray2;
        padding: 0 1rem;
        &:last-child {
            border-right: 0;
        }
    }
}
</style>
