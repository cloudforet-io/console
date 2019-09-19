<template>
  <div class="board-container">
    <div v-for="(count, state) in serverStateCards" 
         :key="state"
         class="board"
         :class="state.toLowerCase()"
    >
      <div class="chart">
        <BaseChart ref="chart"
                   :data="getChartDataConfig(count)"
                   :options="getChartOptions(count)"
                   :width="80" :height="80"
        />
      </div>
      <div class="info">
        <span class="count">{{ count }}</span>
        <p class="state">
          <BaseStateTag state="SERVER_STATE" 
                        :data="state"
                        inline
          />
        </p>
      </div>
    </div>
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
    data() {
        return {
            serverStateCards: {
                INSERVICE: 17,
                MAINTENANCE: 6,
                CLOSED: 2
            }
        };
    },
    computed: {
        totalServerStateCount () {
            return this._.sum(Object.values(this.serverStateCards));
        }
    },
    methods: {
        getChartDataConfig (count) {
            return {
                datasets: [{
                    data: [count, 22],
                    backgroundColor: [
                        'rgba(44,104,249,1.0)'
                    ],
                    borderWidth: 0
                }]
            };
        },
        getChartOptions (count) {
            return {
                cutoutPercentage: 80,
                legend: { display: false },
                tooltips: { enabled: false },
                hover: { mode: null },
                centerText: {
                    display: true,
                    text: `${count / this.totalServerStateCount * 100}%`,
                    fontSize: 16
                }
            };
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
        background-color: $white;
        position: relative;
        height: 120px;
        width: 300px;
        margin-right: 25px;
        @extend %sheet;
        border-radius: 3px;
        .chart {
            position: absolute;
            left: 40px;
            top: 20px;
        }
        .info {
            display: inline-block;
            position: absolute;
            left: 120px;
            padding-top: 30px;
            padding-left: 45px;
            color: $black;
            text-align: center;
            .count {
                font-size: 1.5em;
                font-weight: 800;
            }
            .state {
                font-size: 1em;
                font-weight: 500;
            }
        }
        &.inservice {
            .count {
                color: $success;
            }
        }
        &.maintenance {
            .count {
                color: $warning;
            }
        }
        &.closed {
            .count{
                color: $dark;
            }
        }
    }
}
</style>