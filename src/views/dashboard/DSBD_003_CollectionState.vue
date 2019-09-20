<template>
  <div class="">
    <b-row align-h="end" class="m-0">
      <div class="dropdown-container">
        <b-dropdown no-caret right
                    variant="outline-secondary"
                    class="no-selected"
        >
          <template #button-content>
            <span>{{ collectionStates[selectedItem].title }}</span> &nbsp;
            <i class="fal fa-angle-down" />
          </template>
          <b-dropdown-item v-for="(datasets, key) in collectionStates" 
                           :key="key" 
                           @click="onSelectDropdownItem(key)"
          >
            <div class="item sm">
              <span class="name">{{ datasets.title }}</span>
            </div>
          </b-dropdown-item>
        </b-dropdown>
      </div>
    </b-row>
    <b-row>
      <b-col cols="6">
        <div class="card-container">
          <div v-for="(datasets, state) in cardData" 
               :key="state" 
               class="card"
               :class="state"
          >
            <p class="card-title">
              <BaseStateTag state="COLLECT_STATE" 
                            :data="state"
                            inherit
                            inline
              />
            </p>
            <b-row v-for="(count, key) in datasets" :key="key"
                   class="card-item" 
                   align-v="center"
                   :class="{active: key === selectedItem}"
            >
              <b-col cols="8" class="item-title">
                {{ collectionStates[key].title }}
              </b-col>
              <b-col cols="4" class="item-count">
                {{ count }}
              </b-col>
            </b-row>
          </div>
        </div>
      </b-col>
      <b-col cols="6">
        <div class="chart-container">
          <div class="chart">
            <BaseChart ref="chart"
                       :data="chartDataConfig"
                       :options="chartOptions"
                       :width="400" :height="300"
            />
          </div>
        </div>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import BaseChart from '@/components/base/charts/BACT_009_BaseChart';
const BaseStateTag = () => import('@/components/base/tags/BATG_002_BaseStateTag');
export default {
    name: 'CollectionState',
    components: {
        BaseChart,
        BaseStateTag
    },
    data () {
        return {
            selectedItem: 'server',
            collectionStates: {
                server: {
                    title: 'Server',
                    data: {
                        new: 0,
                        active: 0,
                        duplicated: 0,
                        disconnected: 0
                    }
                },
                network: {
                    title: 'Network',
                    data: {
                        new: 0,
                        active: 0,
                        duplicated: 0,
                        disconnected: 0
                    }
                },
                ip_address: {
                    title: 'IP Address',
                    data: {
                        new: 0,
                        active: 0,
                        duplicated: 0,
                        disconnected: 0
                    }
                }
            },
            chartOptions: {
                cutoutPercentage: 70,
                centerText: {
                    display: true,
                    text: 'SERVER',
                    fontSize: 20
                },
                legendPad: {
                    bottom: 50
                }
            },
            chartDataConfig: {
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
            }
        };
    },
    computed: {
        cardData () {
            return {
                new: {
                    server: this.collectionStates.server.data.new,
                    network: this.collectionStates.network.data.new,
                    ip_address: this.collectionStates.ip_address.data.new
                },
                active: {
                    server: this.collectionStates.server.data.active,
                    network: this.collectionStates.network.data.active,
                    ip_address: this.collectionStates.ip_address.data.active
                },
                duplicated: {
                    server: this.collectionStates.server.data.duplicated,
                    network: this.collectionStates.network.data.duplicated,
                    ip_address: this.collectionStates.ip_address.data.duplicated
                },
                disconnected: {
                    server: this.collectionStates.server.data.disconnected,
                    network: this.collectionStates.network.data.disconnected,
                    ip_address: this.collectionStates.ip_address.data.disconnected
                }
            };
        }
    },
    created () {
        this.init();
    },
    methods: {
        async listCollectionStates () {
            try {
                let res = await this.$axios.post('/statistics/collection-state');
                this.setCollectionStates(res.data);
            } catch (err) {
                console.error(err);
            }
        },
        setCollectionStates (data) {
            this._.forIn(data, (val, key) => {
                this.collectionStates[key].data = data[key];
            });
        },
        async init () {
            await this.listCollectionStates();
            this.updateChart();
        },
        setChartLabels () {
            this.chartDataConfig.labels = this._.keys(this.cardData);
        },
        setChartCenterText (chart) {
            chart.options.centerText.text = this.collectionStates[this.selectedItem].title.toUpperCase();
        },
        setChartData () {
            let dataSets = this.collectionStates[this.selectedItem].data;
            this.chartDataConfig.datasets[0].data = this._.values(dataSets);
        },
        updateChartDataConfig (chart) {
            this.setChartCenterText(chart);
            this.setChartLabels();
            this.setChartData();
            chart.data = this.chartDataConfig;
        },
        updateChart () {
            let chart = this.$refs.chart.chart;
            this.updateChartDataConfig(chart);
            chart.update();
        },
        onSelectDropdownItem (key) {
            this.selectedItem = key;
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
}

.card-container {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    height: 100%;
    .card {
        padding: 10px;
        margin: 10px 10px 0 0;
        width: 47%;
        height: 170px;
        border: 0;
        padding: 10px;
        box-shadow: $box-shadow;
        color: $white;
        .card-title {
            padding: 5px;
            margin-bottom: 5px;
            text-align: center;
            font-size: 1.1em;
            font-weight: 500;
        }
        .card-item {
            margin: 0;
            padding: 3px 5px;
            border-radius: 3px;
            .item-title {
                font-size: 1.1em;
                text-align: left;
                padding: 0 3px;
            }
            .item-count {
                text-align: right;
                font-size: 1.2em;
                font-weight: 600;
                padding: 0 3px;
            }
            &.active {
                background-color: rgba($white, 0.35);
                color: black;
            }
        }
        &.new {
          background-color: $info;
          margin-top: 0;
        }
        &.active {
          background-color: $success;
          margin-top: 0;
          margin-right: 0;
        }
        &.duplicated {
          background-color: $warning;
          margin-bottom: 0;
        }
        &.disconnected {
          background-color: $danger;
          margin-bottom: 0;
          margin-right: 0;
        }
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
</style>