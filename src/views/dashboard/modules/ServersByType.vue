<template>
  <div>
    <p v-if="showTitle" class="board-title">
      Servers by Type
    </p>
    <b-row>
      <b-col v-for="(data, type) in chartDataList" 
             :key="type" 
             cols="6"
      >
        <b-row>
          <b-col cols="12">
            <div class="chart-container">
              <div class="chart">
                <BaseChart ref="chart"
                           :key="type"
                           :data="getChartDataConfig(type)"
                           :options="getChartOptions(type)"
                           :width="200" :height="200"
                />
              </div>
            </div>
          </b-col>
          <b-col cols="12">
            <div class="legend-container">
              <div v-for="(count, label, idx) in data" 
                   :key="label"
                   cols="4"
                   class="legend"
              >
                <span class="indicator"
                      :style="{ color: colorSets[idx] }"
                >
                  <i class="fas fa-square" />
                </span>
                <span class="title">{{ label }}</span>
                <span class="count">{{ count }}</span>
              </div>
            </div>
          </b-col>
        </b-row>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import BaseChart from '@/components/base/charts/BaseChart';
export default {
    name: 'ServersByType',
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
        }
    },
    data () {
        return {
            colorSets: [
                'rgba(72,86,242,1.0)',
                'rgba(45,158,110,1.0)',
                'rgba(255,174,8,1.0)',
                'rgba(217,0,57,1.0)',
                'rgba(0,0,0,1.0)'
            ],
            vmData: {
                AWS: 0,
                AZURE: 0,
                GCP: 0,
                OPENSTACK: 0,
                VMWARE: 0
            },
            osData: {
                WINDOWS: 0,
                LINUX: 0
            },
            loadingState: {
                vm: true,
                os: true
            },
            isLoading: true,
            isMounted: false
        };
    },
    computed: {
        chartDataList () {
            console.log('data computed');
            return  {
                'vm_type': this.vmData,
                'os_type': this.osData
            };
        },
        chartTypes () {
            return this._.keys(this.chartDataList);
        },
        isReadyToDrawChart () {
            return !this.isLoading && this.isMounted;
        }
    },
    watch: {
        loadingState: {
            deep: true,
            handler () {
                if (this.loadingState.vm || this.loadingState.os) {
                    this.isLoading = true;
                } else {
                    this.isLoading = false;
                }
            }
        },
        drawBy (obj) {
            if (obj) {
                this.resetLoadingState();
                this.init();
            }
        },
        isReadyToDrawChart (val) {
            if (val) {
                if (this.drawBy) {
                    this.updateDataAndChart();
                } else {
                    this.updateChart();
                }
                
            }
        }
    },
    created () {
        this.init();
    },
    mounted() {
        this.isMounted = true;
    },
    methods: {
        init () {
            this.chartTypes.map((item) => {
                this.listData(item);
            });
        },
        async listData (itemType) {
            try {
                let res = await this.$axios.post('/statistics/server-type', this.getParams(itemType));
                this.setData(itemType, res.data);
            } catch (err) {
                console.error(err);
            }
        },
        getParams (itemType) {
            let params = {
                domain_id: sessionStorage.getItem('domainId'),
                item_type: itemType
            };
            if (this.drawBy) {
                this._.assignIn(params, this.drawBy);
            }
            return params;
        },
        setData (itemType, data) {
            if (itemType === 'vm_type') {
                this.setVMData(data);
            } else if (itemType === 'os_type') {
                this.setOSData(data);
            }
        },
        setVMData (data) {
            this._.forIn(data, (val, key) => {
                this.vmData[key] = data[key];
            });
            this.loadingState.vm = false;
        },
        setOSData (data) {
            this._.forIn(data, (val, key) => {
                this.osData[key] = data[key];
            });
            this.loadingState.os = false;
        },
        resetLoadingState () {
            this.loadingState = {
                vm: true,
                os: true
            };
            this.isLoading = true;
        },
        getCenterText (key) {
            return key.split('_')[0].toUpperCase();
        },
        getChartOptions (key) {
            return  {
                cutoutPercentage: 70,
                centerText: {
                    display: true,
                    text: this.getCenterText(key),
                    fontSize: 20
                },
                legend: {
                    display: false
                }
            };
        },
        getChartLabels (key) {
            return this._.keys(this.chartDataList[key]);
        },
        getChartData (key) {
            return this._.values(this.chartDataList[key]);
        },
        getChartDataConfig (key) {
            return {
                labels: this.getChartLabels(key),
                datasets: [{
                    data: this.getChartData(key),
                    backgroundColor: this.colorSets,
                    borderWidth: 0,
                    hoverBorderColor: this.colorSets,
                    hoverBorderWidth: 10
                }]
            };
        },
        updateChartDataConfig (chart, key) {
            chart.data.labels = this.getChartLabels(key);
            chart.data.datasets[0].data = this.getChartData(key);
        },
        updateChartOptions (chart, key) {
            chart.options.centerText.text = this.getCenterText(key);
        },
        updateChart () {
            this.$refs.chart.map((ref) => {
                this.updateChartDataConfig(ref.chart, ref.$vnode.key);
                this.updateChartOptions(ref.chart, ref.$vnode.key);
                ref.chart.update();
            });
        },
        async updateDataAndChart () {
            await this.chartTypes.map(async (item, idx) => {
                await this.listData(item);
                let ref = this.$refs.chart[idx];
                this.updateChartDataConfig(ref.chart, ref.$vnode.key);
                this.updateChartOptions(ref.chart, ref.$vnode.key);
                ref.chart.update();
            });
        }
    }
};
</script>

<style lang="scss" scoped>

.chart-container {
    @extend %sheet;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    background-color: $white;
    position: relative;
    padding: 50px;
    .chart {
        height: 100%;
    }
}

.legend-container {
    padding-top: 20px;
    display: flex;
    flex-wrap: wrap;
    flex-direction: column;
    height: 150px;
    .legend {
        margin-bottom: 10px;
        vertical-align: middle;
        .indicator {
            margin-right: 5px;
        }
        .title {
            margin-right: 5px;
        }
        .count {
            font-weight: 800;
            font-size: 1.1em;
        }
    }
}

</style>