<template>
  <div class="board-container">
    <div v-for="c in [1, 2, 3]" :key="c" class="board">
      <div class="chart">
        <canvas ref="chart" height="100" width="100" />
      </div>
      <div class="info">
        <span class="count">6</span>
        <p class="state">
          In-Service
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import Chart from 'chart.js';
export default {
    name: 'ServerState',
    data() {
        return {
            chartType: 'doughnut',
            chartData: {
                datasets: [{
                    data: [12, 19, 3, 5],
                    backgroundColor: [
                        'rgba(152,58,195,1.0)'
                    ],
                    borderWidth: 0,
                    hoverBorderColor: [
                        'rgba(152,58,195,0.5)'
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
                    display: false
                }
            },
            chartPlugins: [{
                beforeDraw: this.beforeDraw
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
            let ctxs = this.$refs.chart;
            ctxs.map((ctx) => {
                new Chart(ctx, {
                    type: this.chartType,
                    data: this.chartData,
                    options: this.chartOptions,
                    plugins: this.chartPlugins,
                    centerText: this.chartCenterText,
                    externals: this.chartExternals
                });
            });
        },
        beforeDraw (chart) {
            if (chart.config.centerText.display) {
                this.drawCenterText(chart);
            }
        },
        drawCenterText (chart) {
            let top = chart.chartArea.top;
            let bottom = chart.chartArea.bottom;
            let right = chart.chartArea.right;
            let left = chart.chartArea.left;
            let ctx = chart.ctx;
 
            ctx.restore();
            var fontSize = (bottom / 100).toFixed(2);
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
.board-container {
    padding: 15px;
    display: flex;
    flex-wrap: wrap;
    .board {
        @extend %sheet;
        position: relative;
        height: 120px;
        width: 300px;
        margin-right: 25px;
        background-color: $white;
        .chart {
            position: absolute;
            left: 20px;
            top: 10px;
        }
        .info {
            display: inline-block;
            position: absolute;
            left: 120px;
            padding: 35px 45px;
            .count {
                font-size: 1.3em;
                font-weight: 800;
            }
            .state {
                font-weight: 500;
            }
        }
    }
}
</style>