<template>
    <div>
        <!--        <button @click="refresh">-->
        <!--            refresh-->
        <!--        </button>-->
        <p v-if="showTitle" class="board-title">
            Server State
        </p>
        <div class="chart">
            <p-chart ref="chart"
                     type="horizontalBar"
                     :data="chartDataConfig"
                     :options="chartOptions"
                     :loading="isLoading"
            />
        </div>
        <b-row align-h="between" class="legend-container">
            <b-col v-for="(count, state) in serverStates"
                   :key="state"
                   cols="4"
            >
                <div class="legend-card">
                    <p class="title">
                        <BaseStateTag
                            state="SERVER_STATE"
                            :data="state"
                            inline
                        />
                    </p>
                    <span class="count">{{ count }}</span>
                </div>
            </b-col>
        </b-row>
    </div>
</template>

<script>
import PChart from '@/components/molecules/charts/Chart';

const BaseStateTag = () => import('@/components/base/tags/BaseStateTag.vue');

export default {
    name: 'ServerState',
    components: {
        PChart,
        BaseStateTag,
    },
    props: {
        drawBy: {
            type: Object,
            default: null,
        },
        showTitle: {
            type: Boolean,
            default: true,
        },
    },
    data() {
        return {
            serverStates: {
                INSERVICE: 0,
                MAINTENANCE: 0,
                CLOSED: 0,
            },
            colorSets: {
                INSERVICE: {
                    backgroundColor: 'rgba(45,158,110,1.0)',
                    hoverBorderColor: 'rgba(45,158,110,0.5)',
                },
                MAINTENANCE: {
                    backgroundColor: 'rgba(255,174,8,1.0)',
                    hoverBorderColor: 'rgba(255,174,8,0.5)',
                },
                CLOSED: {
                    backgroundColor: 'rgba(217,0,57,1.0)',
                    hoverBorderColor: 'rgba(217,0,57,0.5)',
                },
            },
            chartOptions: {
                scales: {
                    xAxes: [{
                        display: false,
                        stacked: true,
                        scaleLabel: { display: false },
                    }],
                    yAxes: [{
                        display: false,
                        stacked: true,
                        scaleLabel: { display: false },
                    }],
                },
                legend: { display: false },
            },
            isLoading: true,
        };
    },
    computed: {
        params() {
            /**
           * TODO: CHANGE CODE BELOW TO USE STORE
           */
            const params = { domain_id: sessionStorage.getItem('domainId') };
            return this.drawBy ? this._.assignIn(params, this.drawBy) : params;
        },
        chartDataConfig() {
            return {
                labels: this._.keys(this.serverStates),
                datasets: this._.map(this.serverStates, (val, key) => ({
                    data: [val],
                    backgroundColor: this.colorSets[key].backgroundColor,
                    hoverBorderColor: this.colorSets[key].hoverBorderColor,
                    borderWidth: 0,
                    hoverBorderWidth: 10,
                })),
            };
        },
        totalServerStateCount() {
            return this._.sum(this._.values(this.serverStates));
        },
    },
    watch: {
        drawBy(obj) {
            if (obj) {
                this.isLoading = true;
            }
        },
    },
    created() {
        this.listServerStates();
    },
    methods: {
        // refresh() {
        //     this.isLoading = true;
        //     setTimeout(() => {
        //         this.serverStates = {
        //             INSERVICE: 9,
        //             MAINTENANCE: 2,
        //             CLOSED: 8,
        //         };
        //         this.isLoading = false;
        //     }, 1000);
        // },
        async listServerStates() {
            try {
                const res = await this.$http.post('/statistics/server-state', this.params);
                this.serverStates = res.data;
                this.isLoading = false;
            } catch (err) {
                console.error(err);
            }
        },
    },
};
</script>

<style lang="scss" scoped>

.legend-container {
    .legend-card {
        @extend %sheet;
        padding: 5px;
        text-align: center;
        vertical-align: middle;
        background-color: $white;
        .title {
            font-size: 1.2em;
            margin-bottom: 5px;
        }
        .count {
            padding: 5px;
            font-weight: 700;
            font-size: 1.4em;
        }
    }
}
</style>
