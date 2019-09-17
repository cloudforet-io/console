<template>
  <b-row>
    <b-col cols="6">
      <b-row>
        <b-col cols="6" class="card-container">
          <div class="card">
            <p class="card-title">
              New
            </p>
          </div>
        </b-col>
        <b-col cols="6" class="card-container">
          <div class="card">
            <p class="card-title">
              Active
            </p>
          </div>
        </b-col>
        <b-col cols="6" class="card-container">
          <div class="card">
            <p class="card-title">
              Duplicated
            </p>
          </div>
        </b-col>
        <b-col cols="6" class="card-container">
          <div class="card">
            <p class="card-title">
              Disconnected
            </p>
          </div>
        </b-col>
      </b-row>
    </b-col>
    <b-col cols="6">
      <div class="chart-container">
        <div class="chart">
          <canvas ref="chart" />
        </div>
      </div>
    </b-col>
  </b-row>
</template>

<script>
import Chart from 'chart.js';
export default {
    name: 'CollectionState',
    data () {
        return {
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
                }
                // scales: {
                //     yAxes: [{
                //         ticks: {
                //             beginAtZero: true
                //         }
                //     }]
                // }
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
                externals: this.chartExternals,
                plugins: [{
                    beforeDraw: this.beforeDraw
                }],
                centerText: {
                    display: true,
                    text: '280'
                }
            });
        },
        beforeDraw (chart) {
            if (chart.config.centerText.display !== null &&
                    typeof chart.config.centerText.display !== 'undefined' &&
                    chart.config.centerText.display) {
                this.drawTotals(chart);
            }
        },
        drawTotals (chart) {
            debugger;
            var width = chart.chart.width,
                height = chart.chart.height,
                ctx = chart.chart.ctx;
 
            ctx.restore();
            var fontSize = (height / 114).toFixed(2);
            ctx.font = fontSize + 'em sans-serif';
            ctx.textBaseline = 'middle';
 
            var text = chart.config.centerText.text,
                textX = Math.round((width - ctx.measureText(text).width) / 2),
                textY = height / 2;
 
            ctx.fillText(text, textX, textY);
            ctx.save();
        }
    }
};
</script>

<style lang="scss" scoped>
.card-container {
    padding: 10px;
    .card {
        padding: 10px;
        .card-title {
            text-align: center;
        }
    }
}

.chart-container {
    position: relative;
    height: 600px;
    .chart {
        position: absolute;
        border: 1px solid red;
        canvas {
            width: 600px;
            height: 600px;
        }
    }
}
</style>