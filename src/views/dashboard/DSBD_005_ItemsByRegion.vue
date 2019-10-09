<template>
  <div>
    <p v-if="showTitle" class="board-title">
      {{ title }}
    </p>
    <b-row align-h="end" class="m-0">
      <div class="dropdown-container">
        <b-button variant="outline-light" 
                  class="refresh-btn" 
                  @click="updateChart"
        >
          <i class="fa fa-redo-alt" />
        </b-button>
        <b-dropdown no-caret right
                    variant="outline-secondary"
                    class="no-selected"
        >
          <template #button-content>
            <span>{{ dropdownItems[selectedDropdownItem] }}</span> &nbsp;
            <i class="fal fa-angle-down" />
          </template>
          <b-dropdown-item v-for="(label, key) in dropdownItems" 
                           :key="key" 
                           @click="onSelectDropdownItem(key)"
          >
            <div class="item sm">
              <span class="name">{{ label }}</span>
            </div>
          </b-dropdown-item>
        </b-dropdown>
      </div>
    </b-row>
    <b-row>
      <b-col cols="12">
        <div class="chart-container">
          <div class="chart">
            <BaseChart ref="chart"
                       type="bubble"
                       :data="chartDataConfig"
                       :options="chartOptions"
                       :width="450" :height="300"
            />
          </div>
        </div>
      </b-col>
      <b-col cols="12">
        <b-row class="label-card-container">
          <b-col v-for="(region, idx) in regionData"
                 :key="idx" 
                 cols="4"
          >
            <div class="label-card"
                 :style="{ borderColor: colorSets[idx].hoverBackgroundColor }"
            >
              <p class="title">
                {{ region.name }}
              </p>
              <span class="count">{{ region.count }}</span>
            </div>
          </b-col>
        </b-row>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import BaseChart from '@/components/base/charts/BACT_009_BaseChart';
export default {
    name: 'ItemsByRegion',
    components: {
        BaseChart
    },
    props: {
        drawBy: {
            type: Object,
            default: null
            // default: () => ({ 'region_id': 'region-2a8873d89c8c' })
        },
        showTitle: {
            type: Boolean,
            default: true
        },
        title: {
            type: String,
            default: 'Items by Region'
        }
    },
    data () {
        return {
            dropdownItems: {
                server: 'Server'
            },
            selectedDropdownItem: 'server',
            chartOptions: {
                legendPad: {
                    bottom: 20
                },
                scales: {
                    yAxes: [{
                        gridLines: {
                            drawBorder: false
                        },
                        ticks: {
                            min: 1,
                            max: 300,
                            display: false
                        }
                    }],
                    xAxes: [{
                        gridLines: {
                            drawBorder: false
                        },
                        ticks: {
                            min: 1,
                            max: 500,
                            display: false
                        }
                    }]
                },
                tooltips: {
                    // Disable the on-canvas tooltip
                    callbacks: {
                        title: function(tooltipItem, data) {
                            return data.datasets[tooltipItem[0].datasetIndex].label;
                        },
                        label: function(tooltipItem, data) {
                            return `${data.datasets[tooltipItem.datasetIndex].data[0].value}`;
                        }
                    }
                }
            },
            colorSets: [{
                backgroundColor:'rgba(72,86,242,0.8)',
                hoverBackgroundColor: 'rgba(72,86,242,1.0)'
            },
            {
                backgroundColor:'rgba(121,188,51,0.8)',
                hoverBackgroundColor: 'rgba(121,188,51,1.0)'
            },
            {
                backgroundColor:'rgba(226,0,79,0.8)',
                hoverBackgroundColor: 'rgba(226,0,79,1.0)'
            },
            {
                backgroundColor:'rgba(251,78,22,0.8)',
                hoverBackgroundColor: 'rgba(251,78,22,1.0)'
            },
            {
                backgroundColor:'rgba(201,200,80,0.8)',
                hoverBackgroundColor: 'rgba(201,200,80,1.0)'
            }],
            minX: 1,
            maxX: 600,
            minY: 1,
            maxY: 400,
            radius: 3,
            minRegionCount: 0,
            maxRegionCount: 0,
            chartDataConfig: {},
            items: {},
            isLoading: true,
            isMounted: false
        };
    },
    computed: {
        regionData () {
            return this._.values(this.items);
        },
        isReadyToDrawChart () {
            return !this.isLoading && this.isMounted;
        }
    },
    watch: {
        isReadyToDrawChart (val) {
            if (val) {
                if (this.drawBy) {
                    this.updateDataAndChart();
                } else {
                    this.updateChart();
                }
            }
        },
        drawBy (obj) {
            if (obj) {
                this.isLoading = true;
            }
        }
    },
    created () {
        this.init();
    },
    mounted () {
        this.isMounted = true;
    },
    methods: {
        async init () {
            await this.listItems();
            this.initChart();
        },
        async listItems () {
            try {
                let res = await this.$axios.post('/statistics/datacenter-items', this.getParams());
                this.items = res.data;
                this.isLoading = false;
            } catch (err) {
                console.error(err);
            }
        },
        getParams () {
            let params = {
                item_type: this.selectedDropdownItem,
                domain_id: sessionStorage.getItem('domainId')
            };
            if (this.drawBy) {
                this._.assignIn(params, this.drawBy);
            }
            return params;
        },
        initChart () {
            this.setChartDataConfig();
            this.setChartOptions();  
        },
        setChartDataConfig () {
            this.chartDataConfig = {
                datasets: this.getDatasets()
            };
        },
        getDatasets () {
            return this.regionData.map((region, idx) => {
                return {
                    label: region.name,
                    data: [this.getBubbleData(region.count, idx)],
                    ...this.colorSets[idx]
                };
            });
        },
        getBubbleData (count, idx) {
            let x = this.getRandomArbitrary(this.minX, this.maxX);
            let y = this.getRandomArbitrary(this.minY, this.maxY);
            let r = count * this.radius;
            this.setMinMax(r);
            return { x, y, r, value: count };
        },
        getRandomArbitrary (min, max) {
            return Math.random() * (max - min) + min;
        },
        setMinMax (r) {
            if (r > this.maxX) {
                this.maxX;
            }
            if (r < this.maxX) {
                this.maxX;
            }
            if (r < this.minY) {
                this.minY;
            }
            if (r < this.maxX) {
                this.maxY;
            }
            this.setChartOptions();
        },
        setChartOptions () {
            let pad = 100;
            this.chartOptions.scales.yAxes[0].ticks.min = this.minY - pad;
            this.chartOptions.scales.yAxes[0].ticks.max = this.maxY + pad;
            this.chartOptions.scales.xAxes[0].ticks.min = this.minX - pad;
            this.chartOptions.scales.xAxes[0].ticks.max = this.maxX + pad;
        },
        updateChartOptions (chart) {
            let pad = 100;
            chart.options.scales.yAxes[0].ticks.min = this.minY - pad;
            chart.options.scales.yAxes[0].ticks.max = this.maxY + pad;
            chart.options.scales.xAxes[0].ticks.min = this.minX - pad;
            chart.options.scales.xAxes[0].ticks.max = this.maxX + pad;
        },
        async updateDataAndChart () {
            await this.listItems();
            this.updateChart();
        },
        updateChart () {
            let chart = this.$refs.chart.chart;
            chart.data.datasets = this.getDatasets();
            this.updateChartOptions(chart);
            chart.update();
        },
        onSelectDropdownItem (key) {
            this.selectedDropdownItem = key;
            this.updateChart();
        }
    }
};
</script>

<style lang="scss" scoped>
.dropdown-container {
    margin-top: -55px;
    button.dropdown-toggle {
        background-color: transparent;
    }
    .refresh-btn {
        margin-right: 10px;
    }
}
.chart-container {
    @extend %sheet;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    background-color: $white;
    .chart {
        height: 100%;
        padding-top: 20px;
        padding-bottom: 20px;
    }
}


.label-card-container {
    padding-top: 20px;
    .label-card {
        @extend %sheet;
        background-color: $white;
        border: 0;
        border-left: 5px solid;
        padding: 7px 15px;
        margin-bottom: 10px;
        .title {
            margin-bottom: 5px;
        }
        .count {
            font-weight: 700;
            font-size: 1.2em;
        }
    }
}
</style>