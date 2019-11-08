<template>
    <div>
        <button @click="init">
            refresh
        </button>
        <p v-if="showTitle" class="board-title">
            Servers by Type
        </p>
        <b-row>
            <b-col v-for="(data, type) in chartDataList"
                   :key="type"
                   cols="6"
            >
                <b-row>
                    <b-col cols="12">
                        <div class="chart-container">
                            <p-horizontal-bar-chart-d3
                                ref="chart"
                                :data="getChartDataConfig(type)"
                                :loading="isLoading[type]"
                                :min-height="95"
                                :min-width="345"
                            />
                        </div>
                    </b-col>
                    <b-col cols="12">
                        <div class="legend-container">
                            <div v-for="(count, label, idx) in data"
                                 :key="label"
                                 cols="4"
                                 class="legend"
                            >
                                <span class="indicator"
                                      :style="{ color: colorSets[idx] }"
                                >
                                    <i class="fas fa-square" />
                                </span>
                                <span class="title">{{ label }}</span>
                                <span class="count">{{ count }}</span>
                            </div>
                        </div>
                    </b-col>
                </b-row>
            </b-col>
        </b-row>
    </div>
</template>

<script>
import PHorizontalBarChartD3 from '@/components/organisms/charts/horizontal-bar-chart/HorizontalBarChartD3';
import PChartD3 from '@/components/molecules/charts/ChartD3';
import { sampleDataGenerator } from '@/components/organisms/charts/horizontal-bar-chart/HorizontalBarChartD3.map';

export default {
    name: 'ServersByType',
    components: {
        PHorizontalBarChartD3,
        PChartD3,
    },
    props: {
        drawBy: {
            type: Object,
            default: null,
            // default: () => ({ 'region_id': 'region-2a8873d89c8c' })
        },
        showTitle: {
            type: Boolean,
            default: true,
        },
    },
    data() {
        return {
            colorSets: [
                'rgba(72,86,242,1.0)',
                'rgba(45,158,110,1.0)',
                'rgba(255,174,8,1.0)',
                'rgba(217,0,57,1.0)',
                'rgba(0,0,0,1.0)',
            ],
            vmData: {
                AWS: 0,
                AZURE: 0,
                GCP: 0,
                OPENSTACK: 0,
                VMWARE: 0,
            },
            osData: {
                WINDOWS: 0,
                LINUX: 0,
            },
            loadingState: {
                vm: true,
                os: true,
            },
            isLoading: [true, true],
        };
    },
    computed: {
        chartDataList() {
            return {
                vm_type: this.vmData,
                os_type: this.osData,
            };
        },
        chartTypes() {
            return this._.keys(this.chartDataList);
        },
    },
    created() {
        this.init();
    },
    methods: {
        init() {
            this.chartTypes.forEach((item) => {
                this.listData(item);
            });
        },
        async listData(itemType) {
            this.$set(this.isLoading, itemType, true);
            try {
                const res = await this.$axios.post('/statistics/server-type', this.getParams(itemType));
                this.setData(itemType, res.data);
                this.$set(this.isLoading, itemType, false);
            } catch (err) {
                console.error(err);
            }
        },
        getParams(itemType) {
            const params = {
                domain_id: sessionStorage.getItem('domainId'),
                item_type: itemType,
            };
            if (this.drawBy) {
                this._.assignIn(params, this.drawBy);
            }
            return params;
        },
        setData(itemType, data) {
            if (itemType === 'vm_type') {
                this.setVMData(data);
            } else if (itemType === 'os_type') {
                this.setOSData(data);
            }
        },
        setVMData(data) {
            this._.forIn(data, (val, key) => {
                this.vmData[key] = data[key];
            });
            this.loadingState.vm = false;
        },
        setOSData(data) {
            this._.forIn(data, (val, key) => {
                this.osData[key] = data[key];
            });
            this.loadingState.os = false;
        },
        getCenterText(key) {
            return key.split('_')[0].toUpperCase();
        },
        getChartOptions(key) {
            return {
                cutoutPercentage: 70,
                centerText: {
                    display: true,
                    text: this.getCenterText(key),
                    fontSize: 20,
                },
                legend: {
                    display: false,
                },
            };
        },
        getChartLabels(key) {
            return this._.keys(this.chartDataList[key]);
        },
        getChartData(key) {
            return this._.values(this.chartDataList[key]);
        },
        getChartDataConfig(key) {
            // return {
            //     labels: this.getChartLabels(key),
            //     datasets: [{
            //         data: this.getChartData(key),
            //         borderWidth: 0,
            //         hoverBorderWidth: 10,
            //     }],
            // };
            return sampleDataGenerator();
        },
        updateChartDataConfig(chart, key) {
            chart.data.labels = this.getChartLabels(key);
            chart.data.datasets[0].data = this.getChartData(key);
        },
        updateChartOptions(chart, key) {
            chart.options.centerText.text = this.getCenterText(key);
        },
        updateChart() {
            this.$refs.chart.forEach((ref) => {
                this.updateChartDataConfig(ref.chart, ref.$vnode.key);
                this.updateChartOptions(ref.chart, ref.$vnode.key);
                ref.chart.update();
            });
        },
        async updateDataAndChart() {
            await this.chartTypes.map(async (item, idx) => {
                await this.listData(item);
                const ref = this.$refs.chart[idx];
                this.updateChartDataConfig(ref.chart, ref.$vnode.key);
                this.updateChartOptions(ref.chart, ref.$vnode.key);
                ref.chart.update();
            });
        },
    },
};
</script>

<style lang="scss" scoped>

.chart-container {
    @extend %sheet;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    background-color: $white;
    position: relative;
    padding: 0px;
}

.legend-container {
    padding-top: 20px;
    display: flex;
    flex-wrap: wrap;
    flex-direction: column;
    height: 150px;
    .legend {
        margin-bottom: 10px;
        vertical-align: middle;
        .indicator {
            margin-right: 5px;
        }
        .title {
            margin-right: 5px;
        }
        .count {
            font-weight: 800;
            font-size: 1.1em;
        }
    }
}

</style>
