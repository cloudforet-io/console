<template>
    <div class="">
        <button @click="refresh">
            refresh
        </button>
        <p v-if="showTitle" class="board-title">
            Collection State
        </p>
        <b-row align-h="end" class="m-0">
            <div class="dropdown-container">
                <b-dropdown no-caret right
                            variant="outline-secondary"
                            class="no-selected"
                >
                    <template #button-content>
                        <span>{{ collectionStates[selectedItem].title }}</span> &nbsp;
                        <i class="fal fa-angle-down" />
                    </template>
                    <b-dropdown-item v-for="(datasets, key) in collectionStates"
                                     :key="key"
                                     @click="onSelectDropdownItem(key)"
                    >
                        <div class="item sm">
                            <span class="name">{{ datasets.title }}</span>
                        </div>
                    </b-dropdown-item>
                </b-dropdown>
            </div>
        </b-row>
        <b-row>
            <b-col cols="6">
                <div class="card-container">
                    <div v-for="(datasets, state) in cardData"
                         :key="state"
                         class="card"
                         :class="state"
                    >
                        <p class="card-title">
                            <BaseStateTag state="COLLECT_STATE"
                                          :data="state"
                                          inherit
                                          inline
                            />
                        </p>
                        <b-row v-for="(count, key) in datasets" :key="key"
                               class="card-item"
                               align-v="center"
                               :class="{active: key === selectedItem}"
                        >
                            <b-col cols="8" class="item-title">
                                {{ collectionStates[key].title }}
                            </b-col>
                            <b-col cols="4" class="item-count">
                                {{ count }}
                            </b-col>
                        </b-row>
                    </div>
                </div>
            </b-col>
            <b-col cols="6">
                <div class="chart-container">
                    <div class="chart">
                        <!--                        <p-chart ref="chart"-->
                        <!--                                 type="doughnut"-->
                        <!--                                 :data="chartData"-->
                        <!--                                 :options="chartOptions"-->
                        <!--                                 :plugins="{beforeDraw, beforeInit}"-->
                        <!--                                 :loading="loading"-->
                        <!--                        />-->
                        <p-donut-chart
                            :data="serverStates"
                            :options="chartOptions"
                            :loading="loading"
                        />
                    </div>
                </div>
            </b-col>
        </b-row>
    </div>
</template>

<script>
import PChart from '@/components/molecules/charts/Chart';
import PDonutChart from '@/components/organisms/charts/donut-chart/DonutChart';
import { sampleDataGenerator } from '@/components/organisms/charts/donut-chart/DonutChartD3.map';

const BaseStateTag = () => import('@/components/base/tags/BaseStateTag.vue');
export default {
    name: 'CollectionState',
    components: {
        PChart,
        PDonutChart,
        BaseStateTag,
    },
    props: {
        showTitle: {
            type: Boolean,
            default: true,
        },
    },
    data() {
        return {
            selectedItem: 'server',
            collectionStates: {
                server: {
                    title: 'Server',
                    data: {
                        NEW: 0,
                        ACTIVE: 0,
                        DUPLICATED: 0,
                        DISCONNECTED: 0,
                    },
                },
                network: {
                    title: 'Network',
                    data: {
                        NEW: 0,
                        ACTIVE: 0,
                        DUPLICATED: 0,
                        DISCONNECTED: 0,
                    },
                },
                ip_address: {
                    title: 'IP Address',
                    data: {
                        NEW: 0,
                        ACTIVE: 0,
                        DUPLICATED: 0,
                        DISCONNECTED: 0,
                    },
                },
            },
            // chartOptions: {
            //     cutoutPercentage: 70,
            //     centerText: {
            //         display: true,
            //         text: 'SERVER',
            //         fontSize: 20,
            //     },
            //     legendPad: {
            //         bottom: 10,
            //     },
            // },
            chartData: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: [
                        'rgba(72,86,242,1.0)',
                        'rgba(45,158,110,1.0)',
                        'rgba(255,174,8,1.0)',
                        'rgba(217,0,57,1.0)',
                    ],
                    borderWidth: 0,
                    hoverBorderColor: [
                        'rgba(72,86,242,0.5)',
                        'rgba(45,158,110,0.5)',
                        'rgba(255,174,8,0.5)',
                        'rgba(217,0,57,0.5)',
                    ],
                    hoverBorderWidth: 10,
                }],
            },
            loading: true,
            chartOptions: {
            },
            serverStates: [],
        };
    },
    computed: {
        cardData() {
            return {
                NEW: {
                    server: this.collectionStates.server.data.NEW,
                    network: this.collectionStates.network.data.NEW,
                    ip_address: this.collectionStates.ip_address.data.NEW,
                },
                ACTIVE: {
                    server: this.collectionStates.server.data.ACTIVE,
                    network: this.collectionStates.network.data.ACTIVE,
                    ip_address: this.collectionStates.ip_address.data.ACTIVE,
                },
                DUPLICATED: {
                    server: this.collectionStates.server.data.DUPLICATED,
                    network: this.collectionStates.network.data.DUPLICATED,
                    ip_address: this.collectionStates.ip_address.data.DUPLICATED,
                },
                DISCONNECTED: {
                    server: this.collectionStates.server.data.DISCONNECTED,
                    network: this.collectionStates.network.data.DISCONNECTED,
                    ip_address: this.collectionStates.ip_address.data.DISCONNECTED,
                },
            };
        },
    },
    created() {
        // this.listCollectionStates();
    },
    methods: {
        refresh() {
            this.loading = true;
            setTimeout(() => {
                // this.serverStates = sampleDataGenerator();
                this.serverStates = [
                    { key: 'Bob', value: 10 },
                    { key: 'Sam', value: 3 },
                    { key: 'Robin', value: 23 },
                    { key: 'Anne', value: 17 },
                    { key: 'Gina', value: 13 },
                ];
                this.loading = false;
            }, 1000);
        },
        async listCollectionStates() {
            this.loading = true;
            try {
                const res = await this.$http.post('/statistics/collection-state');
                this.setCollectionStates(res.data);
                this.updateChartDataConfig();
                this.loading = false;
            } catch (err) {
                console.error(err);
            }
        },
        updateChartDataConfig() {
            this.setChartCenterText();
            this.setChartLabels();
            this.setChartData();
        },
        setCollectionStates(data) {
            this._.forIn(data, (val, key) => {
                this.collectionStates[key].data = data[key];
            });
        },
        setChartLabels() {
            this.chartData.labels = this._.keys(this.cardData);
        },
        setChartCenterText(chart) {
            this.chartOptions.centerText.text = this.collectionStates[this.selectedItem].title.toUpperCase();
        },
        setChartData() {
            const dataSets = this.collectionStates[this.selectedItem].data;
            this.chartData.datasets[0].data = this._.values(dataSets);
        },
        onSelectDropdownItem(key) {
            this.selectedItem = key;
            this.listCollectionStates();
        },
        beforeInit(chart) {
            const { options } = chart;
            if (options.legendPad) {
                this.setLegendPad(chart, options.legendPad);
            }
        },
        setLegendPad(chart, padOptions) {
            chart.legend.afterFit = function () {
                this.height = this.height + (padOptions.bottom || 0);
            };
        },
        beforeDraw(chart) {
            const { options } = chart;
            if (options.centerText && options.centerText.display) {
                this.drawCenterText(chart);
            }
        },
        drawCenterText(chart) {
            const { ctx } = chart;
            ctx.restore();
            this.setCenterTextFont(ctx, chart);
            this.setCenterTextLocation(ctx, chart);
            ctx.save();
        },
        setCenterTextFont(ctx, chart) {
            const fontSize = chart.options.centerText.fontSize || 16;
            ctx.font = `${fontSize}px sans-serif`;
            ctx.textBaseline = 'middle';
        },
        setCenterTextLocation(ctx, chart) {
            const { top } = chart.chartArea;
            const { bottom } = chart.chartArea;
            const { right } = chart.chartArea;
            const { left } = chart.chartArea;

            const { text } = chart.options.centerText;
            const textX = Math.round((left + right - ctx.measureText(text).width) / 2);
            const textY = (bottom + top) / 2;

            ctx.fillText(text, textX, textY);
        },
    },
};
</script>

<style lang="scss" scoped>
.dropdown-container {
    margin-top: -55px;
    button.dropdown-toggle {
        background-color: transparent;
    }
}

.card-container {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    height: 100%;
    .card {
        padding: 10px;
        margin: 10px 10px 0 0;
        width: 47%;
        height: 170px;
        border: 0;
        padding: 10px;
        box-shadow: $box-shadow;
        color: $white;
        .card-title {
            padding: 5px;
            margin-bottom: 5px;
            text-align: center;
            font-size: 1.1em;
            font-weight: 500;
        }
        .card-item {
            margin: 0;
            padding: 3px 5px;
            border-radius: 3px;
            .item-title {
                font-size: 1.1em;
                text-align: left;
                padding: 0 3px;
            }
            .item-count {
                text-align: right;
                font-size: 1.2em;
                font-weight: 600;
                padding: 0 3px;
            }
            &.active {
                background-color: rgba($white, 0.35);
                color: black;
            }
        }
        &.NEW {
          background-color: $info;
          margin-top: 0;
        }
        &.ACTIVE {
          background-color: $success;
          margin-top: 0;
          margin-right: 0;
        }
        &.DUPLICATED {
          background-color: $warning;
          margin-bottom: 0;
        }
        &.DISCONNECTED {
          background-color: $danger;
          margin-bottom: 0;
          margin-right: 0;
        }
    }
}

.chart-container {
    @extend %sheet;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    background-color: $white;
    .chart {
        height: 100%;
        padding: 20px;
    }
}
</style>
