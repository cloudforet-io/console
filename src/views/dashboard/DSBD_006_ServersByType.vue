<template>
  <b-row>
    <b-col cols="5">
      <div class="type-chart-container">
        <div class="chart">
          <BaseChart :data="typeChartDataConfig"
                     :options="typeChartOptions"
                     :width="200" :height="400"
          />
        </div>
      </div>
    </b-col>
    <b-col cols="7">
      <b-row align-v="center" class="subtype-chart-container">
        <b-col v-for="(subtype, idx) in subtypeData" :key="idx" class="chart">
          <p class="title">
            {{ subtype.name }}
          </p>
          <BaseChart type="horizontalBar"
                     :data="getSubtypeChartDataConfig(idx)"
                     :options="subtypeChartOptions"
                     :width="300" :height="subtype.data.length * 25"
          />
        </b-col>
      </b-row>
    </b-col>
  </b-row>
</template>

<script>
import BaseChart from '@/components/base/charts/BACT_009_BaseChart';
export default {
    name: 'ServersByType',
    components: {
        BaseChart
    },
    data () {
        return {
            serverTypeData: [{
                name: 'Baremetal',
                count: 0
            },
            {
                name: 'Hypervisor',
                count: 0
            },
            {
                name: 'VM',
                count: 21
            },
            {
                name: 'Unknown',
                count: 2
            }],
            subtypeData: [
                {
                    name: 'VM',
                    data: [{
                        name: 'Hyper-V',
                        count: 10
                    },
                    {
                        name: 'AWS',
                        count: 8
                    },
                    {
                        name: 'OpenStack',
                        count: 5
                    }]
                },
                {
                    name: 'OS',
                    data: [{
                        name: 'Linux',
                        count: 15
                    },
                    {
                        name: 'Windows',
                        count: 8
                    }]
                }
            ],
            typeChartOptions: {
                cutoutPercentage: 70,
                centerText: {
                    display: true,
                    text: 'SERVER TYPE',
                    fontSize: 20
                },
                legendPad: {
                    bottom: 60
                },
                legend: {
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        padding: 15
                        // generateLabels: this.generateLabels
                    }
                }
            },
            typeChartDataConfig: {
                labels: [],
                datasets: [{
                    data: [],
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
            colorSets: [
                'rgba(72,86,242,1.0)',
                'rgba(45,158,110,1.0)',
                'rgba(255,174,8,1.0)',
                'rgba(217,0,57,1.0)'
            ],
            subtypeChartOptions: {
                legend: {
                    display: false
                }
                // scales: {
                //     xAxes: [{
                //         stacked: true
                //     }],
                //     yAxes: [{
                //         stacked: true
                //     }]
                // }
            }
        };
    },
    computed: {
    },
    created () {
        this.initChart();
    },
    methods: {
        initChart () {
            this.setTypeChartLabels();
            this.setTypeChartData();
        },
        setTypeChartLabels () {
            this.typeChartDataConfig.labels = this.serverTypeData.map(type => (type.name));
        },
        setTypeChartData () {
            this.typeChartDataConfig.datasets[0].data = this.serverTypeData.map(type => (type.count));
        },
        getSubtypeChartLabels (idx) {
            return this.subtypeData[idx].data.map(subtype => (subtype.name));
        },
        getSubtypeChartData (idx) {
            return this.subtypeData[idx].data.map(subtype => (subtype.count));
        },
        getSubtypeChartDataConfig (idx) {
            return {
                labels: this.getSubtypeChartLabels(idx),
                datasets: [{
                    data: this.getSubtypeChartData(idx),
                    backgroundColor: this.colorSets[idx]
                }]
            };
        },
        generateLabels (chart) {
            return chart.data.labels.map((label, idx) => {
                return {
                    text: label,
                    fillStyle: chart.data.datasets[0].backgroundColor[idx],
                    strokeStyle: chart.data.datasets[0].backgroundColor[idx]
                };
            });
        }
    }
};
</script>

<style lang="scss" scoped>

.type-chart-container {
    @extend %sheet;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    background-color: $white;
    position: relative;
    .chart {
        height: 100%;
        padding-top: 40px;
    }
}

.subtype-chart-container {
    .chart {
        padding: 20px 0;
        .title {
            font-weight: 700;
            font-size: 1.2em;
            color: $navy;
        }
    }
}
</style>