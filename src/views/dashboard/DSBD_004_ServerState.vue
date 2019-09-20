<template>
  <div class="board-container">
    <div v-for="(count, state) in serverStates" 
         :key="state"
         class="card"
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
    <!-- <BaseChart type="horizontalBar"
               :data="getChartDataConfig(count)"
               :options="getChartOptions(count)"
               :width="300" :height="subtype.data.length * 25"
    /> -->
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
            serverStates: {
                INSERVICE: 0,
                MAINTENANCE: 0,
                CLOSED: 0
            }
        };
    },
    computed: {
        totalServerStateCount () {
            return this._.sum(this._.values(this.serverStates));
        }
    },
    created () {
        this.init();
    },
    methods: {
        async init () {
            await this.listServerStates();
            // this.updateCharts();
        },
        async listServerStates () {
            try {
                let res = await this.$axios.post('/statistics/server-state');
                this.serverStates = res.data;
            } catch (err) {
                console.error(err);
            }
        },
        updateCharts () {
            this.$refs.chart.map((chart) => {
                chart.update();
            });
        },
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
    .card {
        background-color: $white;
        width: 150px;
        margin-right: 25px;
        @extend %sheet;
        border-radius: 3px;
        border: 0;
        .chart {
            padding: 20px;
        }
        .info {
            display: inline-block;
            width: 100%;
            padding: 10px;
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