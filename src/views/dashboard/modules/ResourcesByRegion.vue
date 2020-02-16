<template>
    <p-board-layout :title="tr('DASHBOARD.RES_REGION')"
                    :dropdown-menu="dropdownMenu"
                    :dropdown-selected="dropdownMenu[selectedIdx].label"
                    @clickMenuEvent="onClickMenu"
    >
        <p-bubble-chart class="chart"
                        :data="chartData"
                        :loading="loading"
                        :max-height="310"
                        :legend-position="legendPosition"
                        @legendClick="onLegendClick"
        />
    </p-board-layout>
</template>

<script>
import PBoardLayout from '@/components/organisms/layouts/board-layout/BoardLayout.vue';
import PBubbleChart from '@/components/organisms/charts/bubble-chart/BubbleChart.vue';
import DashboardEventBus from '@/views/dashboard/DashboardEventBus';

export default {
    name: 'ResourcesByRegion',
    components: {
        PBoardLayout,
        PBubbleChart,
    },
    props: {
        drawBy: {
            type: Object,
            default: null,
        },
        data: {
            type: Object,
            required: true,
        },
        legendPosition: {
            type: String,
            default: 'left',
        },
        loading: {
            type: Boolean,
            default: true,
        },
    },
    data() {
        return {
            dropdownMenu: [
                { type: 'item', label: 'Server', name: 'Server' },
                { type: 'item', label: 'Cloud Service', name: 'CloudService' },
            ],
            selectedIdx: 0,
            serverEventNames: {
                getServerList: 'getServerData',
                tagConfirmEvent: 'ServerTagConfirmEvent',
                tagResetEvent: 'resetTagEvent',
            },
        };
    },
    computed: {
        chartData() {
            return Object.keys(this.data).map(key => ({
                key: this.data[key].name,
                value: this.data[key].count,
                longitude: this.data[key].longitude,
                latitude: this.data[key].latitude,
            }));
        },
    },
    // watch: {
    //     data() {
    //         if (this.loading) this.loading = false;
    //     },
    // },
    created() {
        DashboardEventBus.$emit('listRegionByServer');
    },
    methods: {
        onClickMenu(name, idx) {
            this.selectedIdx = idx;
            DashboardEventBus.$emit(`listRegionBy${name}`);
        },
        onLegendClick(key, val) {
            this.$router.push({ path: '/inventory/data-center'  });
        },
    },
};
</script>

<style lang="scss" scoped>
.chart {
    padding: 1.5rem 0 0 0;
    height: 312px;
}
</style>
