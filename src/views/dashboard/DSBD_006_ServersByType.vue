<template>
  <div class="pr-3 pl-2">
    <b-row class="pt-3">
      <b-col cols="4">
        <div class="type-chart-container">
          <div class="chart">
            <BaseChart type="pie" 
                       :data="typeChartDataConfig"
                       :options="typeChartOptions"
                       :width="450" :height="500"
            />
          </div>
        </div>
      </b-col>
      <b-col cols="8">
        <div class="subtype-chart-container">
          <div v-for="(subtype, idx) in subtypeData" :key="idx" class="chart">
            <p class="title">
              {{ subtype.name }}
            </p>
            <BaseChart type="horizontalBar"
                       :data="getSubtypeChartDataConfig(idx)"
                       :options="subtypeChartOptions"
                       :width="300" :height="subtype.data.length * 25"
            />
          </div>
        </div>
      </b-col>
    </b-row>
  </div>
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
                legendPad: {
                    bottom: 60
                },
                legend: {
                    position: 'bottom',
                    labels: {
                        usePointStyle: false,
                        fontSize: 16,
                        padding: 50,
                        generateLabels: this.generateLabels
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

.card-container {
    padding-top: 40px;
    .card {
        @extend %sheet;
        display: inline-block;
        width: 240px;
        margin: 10px;
        border: 0;
        border-left: 5px solid;
        padding: 10px 15px;
        .title {
            margin-bottom: 5px;
        }
        .count {
            font-weight: 700;
            font-size: 1.2em;
        }
    }

}

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
        padding-top: 60px;
        padding-bottom: 0px;
    }
}

.subtype-chart-container {
    position: relative;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    padding: 20px;
    .chart {
        width: 90%;
        margin-bottom: 20px;
        .title {
            font-weight: 700;
            font-size: 1.2em;
            color: $navy;
        }
    }
}
</style>