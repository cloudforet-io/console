<template>
  <div class="board-container">
    <div v-for="c in [1, 2, 3]" :key="c" class="board">
      <div class="chart">
        <canvas ref="chart" height="80" width="80" />
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
                labels: ['In-Service'],
                datasets: [{
                    data: [12, 20],
                    backgroundColor: [
                        'rgba(44,104,249,1.0)'
//                         $blue: #2C68F9;
// $violet: #8a2be2;
// $blueviolet: #4856f2;
                    ],
                    borderWidth: 0
                    // hoverBorderColor: [
                    //     'rgba(44,104,249,0.5)'
                    // ],
                }]
            },
            chartOptions: {
                cutoutPercentage: 80,
                legend: {
                    display: false
                },
                tooltips: { enabled: false },
                hover: { mode: null }
            },
            chartPlugins: [{
                beforeDraw: this.beforeDraw
            }],
            chartCenterText: {
                display: true,
                text: '30%',
                fontSize: 16,
                fontWeight: 500
            },
            chartExternals: { moment: 'moment' }
        };
    },
    mounted () {
        this.drawChart();
    },
    methods: {
        drawChart () {
            let canvases = this.$refs.chart;
            canvases.map((canvas) => {
                let ctx = canvas.getContext('2d');
                if (ctx) {
                    new Chart(ctx, {
                        type: this.chartType,
                        data: this.chartData,
                        options: this.chartOptions,
                        plugins: this.chartPlugins,
                        centerText: this.chartCenterText,
                        externals: this.chartExternals
                    });
                } else {
                    throw new Error('Browser does not support canvas.');
                }
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
            var fontSize = chart.config.centerText.fontSize;
            ctx.font = fontSize + 'px sans-serif';
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
            left: 40px;
            top: 20px;
        }
        .info {
            display: inline-block;
            position: absolute;
            left: 120px;
            padding: 30px 45px;
            color: $black;
            .count {
                font-size: 1.5em;
                font-weight: 800;
                padding: 5px;
            }
            .state {
                font-size: 1.1em;
                font-weight: 500;
            }
        }
    }
}
</style>