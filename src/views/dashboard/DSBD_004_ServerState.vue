<template>
  <div class="board-container">
    <div class="board">
      <canvas ref="chart" />
    </div>
  </div>
</template>

<script>
import Chart from 'chart.js';
export default {
    name: 'ServerState',
    mounted () {
        this.chartjs = new Chart(this.$refs.chart, { externals: {
            moment: 'moment'
        }});
    },
    methods: {
        
    }
};
</script>

<style lang="scss" scoped>
.board-container {
    position: relative;
    height: 100px;
    .board {
        position: absolute;
        border: 1px solid red;
        canvas {
            width: 100px;
            height: 100px;
        }
    }
}
</style>