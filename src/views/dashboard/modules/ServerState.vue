<template>
    <div>
        <button @click="refresh">
            refresh
        </button>
        <p v-if="showTitle" class="board-title">
            Server State
        </p>
        <div class="chart">
            <p-horizontal-stack-bar-chart-d3
                ref="chart"
                :data="sampleData"
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
import PHorizontalStackBarChartD3 from '@/components/organisms/charts/horizontal-stack-bar-chart/HorizontalStackBarChartD3';
import { sampleDataGenerator } from '@/components/organisms/charts/horizontal-stack-bar-chart/HorizontalStackBarChartD3.map';

const BaseStateTag = () => import('@/components/base/tags/BaseStateTag.vue');

export default {
    name: 'ServerState',
    components: {
        PHorizontalStackBarChartD3,
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
            isLoading: true,
            sampleData: []
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
        chartData() {
            return {
                datasets: this._.map(this.serverStates, val => ({
                    data: [val],
                })),
            };
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
        refresh() {
            this.isLoading = true;
            setTimeout(() => {
                this.serverStates = {
                    INSERVICE: parseInt(Math.random() * 10),
                    MAINTENANCE: parseInt(Math.random() * 10),
                    CLOSED: parseInt(Math.random() * 10),
                };
                this.sampleData = sampleDataGenerator();
                this.isLoading = false;
            }, 1000);
        },
        async listServerStates() {
            try {
                const res = await this.$axios.post('/statistics/server-state', this.params);
                Object.keys(this.serverStates).forEach((key) => {
                    this.serverStates[key] = res.data[key] || 0;
                });

                this.isLoading = false;
            } catch (err) {
                console.error(err);
            }
        },
    },
};
</script>

<style lang="scss" scoped>
.chart {
    width: 100%;
}
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
