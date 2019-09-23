<template>
  <div>
    <p v-if="showTitle" class="board-title">
      Server State
    </p>
    <div class="chart">
      <BaseChart ref="chart" 
                 type="horizontalBar"
                 :data="chartDataConfig"
                 :options="chartOptions"
                 :width="550" :height="50"
      />
    </div>
    <b-row align-h="between" class="legend-container">
      <b-col v-for="(count, state) in serverStates"
             :key="state" 
             cols="4"
      >
        <div class="legend-card">
          <p class="title">
            <BaseStateTag 
              state="SERVER_STATE" 
              :data="state"
              inline
            />
          </p>
          <span class="count">{{ count }}</span>
        </div>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import BaseChart from '@/components/base/charts/BACT_009_BaseChart';
const BaseStateTag = () => import('@/components/base/tags/BATG_002_BaseStateTag');

export default {
    name: 'ServerState',
    components: {
        BaseChart,
        BaseStateTag
    },
    props: {
        drawBy: {
            type: Object,
            // default: null
            default: () => ({ 'region_id': 'region-2a8873d89c8c' })
        },
        showTitle: {
            type: Boolean,
            default: true
        }
    },
    data() {
        return {
            serverStates: {
                INSERVICE: 0,
                MAINTENANCE: 0,
                CLOSED: 0
            },
            colorSets: {
                INSERVICE: {
                    backgroundColor: 'rgba(45,158,110,1.0)',
                    hoverBorderColor: 'rgba(45,158,110,0.5)'
                },
                MAINTENANCE: {
                    backgroundColor: 'rgba(255,174,8,1.0)',
                    hoverBorderColor: 'rgba(255,174,8,0.5)'
                },
                CLOSED: {
                    backgroundColor: 'rgba(217,0,57,1.0)',
                    hoverBorderColor: 'rgba(217,0,57,0.5)'
                }
            },
            chartOptions: {
                scales: {
                    xAxes: [{
                        display: false,
                        stacked: true,
                        scaleLabel: { display: false }
                    }],
                    yAxes: [{
                        display: false,
                        stacked: true,
                        scaleLabel: { display: false }
                    }]
                },
                legend: { display: false }
            },
            isMounted: false,
            isLoading: true
        };
    },
    computed: {
        isReadyToDrawChart () {
            return !this.isLoading && this.isMounted;
        },
        chartDataConfig () {
            return {
                labels: this._.keys(this.serverStates),
                datasets: this._.map(this.serverStates, (val, key) => {
                    return {
                        data: [val],
                        backgroundColor: this.colorSets[key].backgroundColor,
                        hoverBorderColor: this.colorSets[key].hoverBorderColor,
                        borderWidth: 0,
                        hoverBorderWidth: 10
                    };
                })
            };
        },
        totalServerStateCount () {
            return this._.sum(this._.values(this.serverStates));
        }
    },
    watch: {
        isReadyToDrawChart (val) {
            if (val) {
                if (this.drawBy) {
                    this.updateDataAndChart();
                } else {
                    this.updateCharts();
                }
            }
        },
        drawBy (obj) {
            if (obj) {
                this.isLoading = true;
            }
        }
    },
    created () {
        this.init();
    },
    mounted () {
        this.isMounted = true;
    },
    methods: {
        async init () {
            await this.listServerStates();
        },
        async listServerStates () {
            try {
                let res = await this.$axios.post('/statistics/server-state', this.getParams());
                this.serverStates = res.data;
                this.isLoading = false;
            } catch (err) {
                console.error(err);
            }
        },
        getParams () {
            let params = {
                domain_id: sessionStorage.getItem('domainId')
            };
            if (this.drawBy) {
                this._.assignIn(params, this.drawBy);
            }
            return params;
        },
        updateCharts () {
            let chart = this.$refs.chart.chart;
            this.updateChartDataConfig(chart);
            chart.update();
        },
        updateChartDataConfig (chart) {
            chart.data.labels = this.chartDataConfig.labels;
            chart.data.datasets = this.chartDataConfig.datasets;
        },
        async updateDataAndChart () {
            await this.listServerStates();
            this.updateCharts();
        }
    }
};
</script>

<style lang="scss" scoped>

.legend-container {
    .legend-card {
        @extend %sheet;
        padding: 5px 10px;
        text-align: center;
        vertical-align: middle;
        background-color: $white;
        .title {
            font-size: 1.2em;
            margin-bottom: 5px;
        }
        .count {
            padding: 5px;
            font-weight: 700;
            font-size: 1.4em;
        }
    }
}
</style>