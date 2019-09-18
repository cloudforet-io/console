<template>
  <div class="pr-3 pl-2">
    <b-row align-h="end" class="m-0 pb-3">
      <div class="dropdown-container">
        <b-dropdown no-caret right
                    variant="outline-secondary"
                    class="no-selected"
        >
          <template #button-content>
            <span>Server</span> &nbsp;
            <i class="fal fa-angle-down" />
          </template>
          <b-dropdown-item>
            <div class="item sm">
              <span class="name">Server</span>
            </div>
          </b-dropdown-item>
        </b-dropdown>
      </div>
    </b-row>
    <b-row>
      <b-col cols="6">
        <div class="card-container">
          <div v-for="collection in cardData" 
               :key="collection.state" 
               class="card"
               :class="collection.state"
          >
            <p class="card-title">
              <BaseStateTag state="COLLECT_STATE" 
                            :data="collection.state"
                            inherit
                            inline
              />
            </p>
            <b-row v-for="item in collection.datasets" :key="item.key"
                   class="card-item" 
                   align-v="center"
                   :class="{active: item.key === selectedItem}"
            >
              <b-col cols="8" class="item-title">
                {{ item.title }}
              </b-col>
              <b-col cols="4" class="item-count">
                {{ item.count }}
              </b-col>
            </b-row>
          </div>
        </div>
      </b-col>
      <b-col cols="6">
        <div class="chart-container">
          <div class="chart">
            <canvas ref="chart" width="450" height="350" />
          </div>
        </div>
      </b-col>
    </b-row>
  </div>
</template>

<script>
const BaseStateTag = () => import('@/components/base/tags/BATG_002_BaseStateTag');
import Chart from 'chart.js';
export default {
    name: 'CollectionState',
    components: {
        BaseStateTag
    },
    data () {
        return {
            selectedItem: 'server',
            cardData: [{
                state: 'new',
                stateName: 'New',
                icon: 'fal fa-',
                datasets: [{
                    key: 'server',
                    title: 'Server',
                    count: 12
                },
                {
                    key: 'network',
                    title: 'Network',
                    count: 12
                },
                {
                    key: 'ip_address',
                    title: 'IP Address',
                    count: 12
                }]
            },
            {
                state: 'active',
                stateName: 'Active',
                datasets: [{
                    key: 'server',
                    title: 'Server',
                    count: 12
                },
                {
                    key: 'network',
                    title: 'Network',
                    count: 12
                },
                {
                    key: 'ip_address',
                    title: 'IP Address',
                    count: 12
                }]
            },
            {
                state: 'duplicated',
                stateName: 'Duplicated',
                datasets: [{
                    key: 'server',
                    title: 'Server',
                    count: 12
                },
                {
                    key: 'network',
                    title: 'Network',
                    count: 12
                },
                {
                    key: 'ip_address',
                    title: 'IP Address',
                    count: 12
                }]
            },
            {
                state: 'disconnected',
                stateName: 'Disconnected',
                datasets: [{
                    key: 'server',
                    title: 'Server',
                    count: 12
                },
                {
                    key: 'network',
                    title: 'Network',
                    count: 12
                },
                {
                    key: 'ip_address',
                    title: 'IP Address',
                    count: 12
                }]
            }],
            chart: null,
            chartType: 'doughnut',
            chartData: {
                labels: ['Red', 'Blue', 'Yellow', 'Green'],
                datasets: [{
                    label: '# of Votes',
                    data: [12, 19, 3, 5],
                    backgroundColor: [
                        'rgba(72,86,242,1.0)',
                        'rgba(45,158,110,1.0)',
                        'rgba(255,174,8,1.0)',
                        'rgba(217,0,57,1.0)'
                    ],
                    borderWidth: 0,
                    hoverBorderColor: [
                        'rgba(72,86,242,0.5)',
                        'rgba(45,158,110,0.5)',
                        'rgba(255,174,8,0.5)',
                        'rgba(217,0,57,0.5)'
                    ],
                    hoverBorderWidth: 10
                }]
            },
            chartOptions: {
                cutoutPercentage: 70,
                layout: {
                    padding: {
                        left: 0,
                        right: 0,
                        top: 0,
                        bottom: 0
                    }
                },
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        boxWidth: 10,
                        padding: 20
                    }
                }
            },
            chartPlugins: [{
                beforeDraw: this.beforeDraw,
                beforeInit: this.beforeChartInit
            }],
            chartCenterText: {
                display: true,
                text: 'Total'
            },
            chartExternals: { moment: 'moment' }
        };
    },
    mounted () {
        this.drawChart();
    },
    methods: {
        drawChart () {
            let ctx = this.$refs.chart;
            this.chart = new Chart(ctx, {
                type: this.chartType,
                data: this.chartData,
                options: this.chartOptions,
                plugins: this.chartPlugins,
                centerText: this.chartCenterText,
                externals: this.chartExternals
            });
        },
        beforeDraw (chart) {
            if (chart.config.centerText.display) {
                this.drawCenterText(chart);
            }
        },
        beforeChartInit (chart, options) {
            chart.legend.afterFit = function() {
                this.height = this.height + 50;
            };
        },
        drawCenterText (chart) {
            let top = chart.chartArea.top;
            let bottom = chart.chartArea.bottom;
            let right = chart.chartArea.right;
            let left = chart.chartArea.left;
            let ctx = chart.ctx;
 
            ctx.restore();
            var fontSize = (bottom / 200).toFixed(2);
            ctx.font = fontSize + 'em sans-serif';
            ctx.textBaseline = 'middle';
 
            var text = chart.config.centerText.text,
                textX = Math.round((left + right - ctx.measureText(text).width) / 2),
                textY = (bottom + top) / 2;
 
            ctx.fillText(text, textX, textY);
            ctx.save();
        }
    }
};
</script>

<style lang="scss" scoped>
.dropdown-container {
    margin-top: -40px;
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
        margin: 10px 15px 10px 15px;
        width: 200px;
        height: 170px;
        border: 0;
        box-shadow: $box-shadow;
        color: $white;
        .card-title {
            padding: 5px;
            margin-bottom: 5px;
            text-align: center;
            font-size: 1.2em;
            font-weight: 500;
        }
        .card-item {
            padding: 3px 20px;
            border-radius: 3px;
            background-color: rgba($white, 0.3);
            .item-title {
                font-size: 1.1em;
                text-align: left;
            }
            .item-count {
                text-align: right;
                font-size: 1.2em;
                font-weight: 600;
            }
            &.active {
              background-color: rgba($black, 0.3);
            }
        }
        &.new {
          background-color: $info;
        }
        &.active {
          background-color: $success;
        }
        &.duplicated {
          background-color: $warning;
        }
        &.disconnected {
          background-color: $danger;
        }
    }
}

.chart-container {
    @extend %sheet;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    background-color: $white;
    .chart {
        position: absolute;
    }
}
</style>