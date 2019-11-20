<template>
    <span class="p-chart-legend"
          :style="{opacity}"
          v-on="chartLegendListeners"
    >
        <p-status class="p-status" v-bind="$props" />
        <span ref="count" class="count">{{ count }}</span>
    </span>
</template>

<script>
import PStatus from '@/components/molecules/status/Status';

export default {
    name: 'PChartLegend',
    components: { PStatus },
    props: {
        text: {
            type: String,
            default: null,
        },
        iconColor: {
            type: String,
            default: null,
        },
        count: {
            type: Number,
            default: null,
        },
        opacity: {
            type: Number,
            default: 1.0,
        },
    },
    computed: {
        chartLegendListeners() {
            const vm = this;
            return Object.assign({},
                this.$listeners, {
                    click(e) {
                        if (vm.$refs && e.target === vm.$refs.count) {
                            vm.$emit('click', vm.text, vm.count, e);
                        }
                    },
                });
        },
    },
    methods: {
        test() {
            console.log('testtestste');
        },
    },
};
</script>

<style lang="scss" scoped>
    .p-chart-legend {
        display: inline-flex;
        align-items: center;
        padding-top: .5rem;
        .p-status::v-deep {
            .circle {
                height: .75rem;
                width: .75rem;
            }
            .label {
                font-size: .875rem;
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
                width: calc(100% - .75em);
            }
        }
        .count {
            padding-left: .5rem;
            font-weight: bold;
            font-size: .875rem;
            cursor: pointer;
        }
    }
</style>
