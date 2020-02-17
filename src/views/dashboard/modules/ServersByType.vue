<template>
    <p-board-layout :title="$t('DASHBOARD.SERVER_TYPE')">
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
import _ from 'lodash';
import { reactive, toRefs, watch } from '@vue/composition-api';
import DashboardEventBus from '@/views/dashboard/DashboardEventBus';

import PBoardLayout from '@/components/organisms/layouts/board-layout/BoardLayout.vue';
import PHorizontalStackBarChart from '@/components/organisms/charts/horizontal-stack-bar-chart/HorizontalStackBarChart.vue';
import PHorizontalBarChart from '@/components/organisms/charts/horizontal-bar-chart/HorizontalBarChart.vue';
import PCardLayout from '@/components/molecules/layouts/card-layout/CardLayout.vue';

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
    setup(props, context) {
        const state = reactive({
            chartData: {
                vm: { title: 'VM', data: [] },
                os: { title: 'OS', data: [] },
                hypervisor: { title: 'Hypervisor', data: [] },
            },
            onServerTypeLegendClick(key, val) {
                context.root.$router.push({ path: '/inventory/server' });
            },
        });

        const setChartData = (type, data) => {
            if (data instanceof Array) state.chartData[type].data = data;
            else {
                const items = _.flatMap(data, (d, k) => ({ key: k, value: d }));
                state.chartData[type].data = _.sortBy(items, ['key']);
            }
        };

        watch(() => props.vmData, (data) => {
            setChartData('vm', data);
        });
        watch(() => props.osData, (data) => {
            setChartData('os', data);
        });
        watch(() => props.hypervisorData, (data) => {
            setChartData('hypervisor', data);
        });

        DashboardEventBus.$emit('listServerType');
        DashboardEventBus.$emit('listVmType');
        DashboardEventBus.$emit('listOsType');
        DashboardEventBus.$emit('listHypervisorType');

        return {
            ...toRefs(state),
        };
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
