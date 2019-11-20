<template>
    <p-board-layout title="Resources by Region"
                    :dropdown-menu="dropdownMenu"
                    :dropdown-selected="dropdownSelected"
                    @clickMenuEvent="onClickMenu"
    >
        <div class="chart">
            <p-bubble-chart :data="chartData"
                            :loading="loading"
                            :min-width="830"
                            :min-height="290"
                            :max-height="290"
                            @legendClick="onLegendClick"
            />
        </div>
    </p-board-layout>
</template>

<script>
import PBoardLayout from '@/components/organisms/layouts/board-layout/BoardLayout';
import PBubbleChart from '@/components/organisms/charts/bubble-chart/BubbleChart';
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
        showTitle: {
            type: Boolean,
            default: true,
        },
        data: {
            type: Object,
            required: true,
        },
    },
    data() {
        return {
            dropdownMenu: [
                { type: 'item', text: 'Server', event: 'Server' },
                { type: 'item', text: 'Cloud Service', event: 'CloudService' },
            ],
            dropdownSelected: 'Server',
            serverEventNames: {
                getServerList: 'getServerData',
                tagConfirmEvent: 'ServerTagConfirmEvent',
                tagResetEvent: 'resetTagEvent',
            },
            loading: true,
        };
    },
    computed: {
        chartData() {
            return Object.keys(this.data).map(key => ({
                key,
                value: this.data[key].count,
                longitude: this.data[key].coordinates.longitude,
                latitude: this.data[key].coordinates.latitude,
            }));
        },
    },
    watch: {
        data() {
            if (this.loading) this.loading = false;
        },
    },
    created() {
        DashboardEventBus.$emit('listRegionByServer');
    },
    methods: {
        onClickMenu(e) {
            this.dropdownSelected = e;
            this.loading = true;
            DashboardEventBus.$emit(`listRegionBy${e}`);
        },
        onLegendClick(key, val) {
            console.log('onLegendClick', key, val);
            this.$router.push({ path: '/inventory/data-center', query: { plan: 'private' } });
        },
    },
};
</script>

<style lang="scss" scoped>
.chart {
    padding: 1.5rem 0 0 0;
}
</style>
