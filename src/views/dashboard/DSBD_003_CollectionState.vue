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
          <div class="card">
            <p class="card-title">
              New
            </p>
            <b-row class="card-item" align-v="center">
              <b-col cols="8" class="item-title">
                Server
              </b-col>
              <b-col cols="4" class="item-count">
                12
              </b-col>
            </b-row>
            <b-row class="card-item" align-v="center">
              <b-col cols="8" class="item-title">
                Server
              </b-col>
              <b-col cols="4" class="item-count">
                12
              </b-col>
            </b-row>
            <b-row class="card-item" align-v="center">
              <b-col cols="8" class="item-title">
                Server
              </b-col>
              <b-col cols="4" class="item-count">
                12
              </b-col>
            </b-row>
          </div>
          <div class="card">
            <p class="card-title">
              Active
            </p>
          </div>
          <div class="card">
            <p class="card-title">
              Duplicated
            </p>
          </div>
          <div class="card">
            <p class="card-title">
              Disconnected
            </p>
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
import Chart from 'chart.js';
export default {
    name: 'CollectionState',
    data () {
        return {
            cardData: [{
                stateName: 'New',
                datasets: {
                }
            }],
            chart: null,
            chartType: 'doughnut',
            chartData: {
                labels: ['Red', 'Blue', 'Yellow', 'Green'],
                datasets: [{
                    label: '# of Votes',
                    data: [12, 19, 3, 5],
                    backgroundColor: [
                        'rgba(152,58,195,1.0)',
                        'rgba(41,161,232,1.0)',
                        'rgba(238,148,60,1.0)',
                        'rgba(144,197,79,1.0)'
                    ],
                    borderWidth: 0,
                    hoverBorderColor: [
                        'rgba(152,58,195,0.5)',
                        'rgba(41,161,232,0.5)',
                        'rgba(238,148,60,0.5)',
                        'rgba(144,197,79,0.5)'
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
        margin: 10px 10px 10px 10px;
        width: 200px;
        height: 170px;
        border: 0;
        box-shadow: $box-shadow;
        .card-title {
            padding: 5px;
            text-align: center;
            font-size: 1.1em;
            font-weight: 500;
        }
        .card-item {
            padding: 5px 20px;
            .item-title {
                text-align: left;
            }
            .item-count {
                text-align: right;
                font-size: 1.1em;
                font-weight: 600;
            }
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