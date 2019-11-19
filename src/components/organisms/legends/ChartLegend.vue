<template>
    <span class="p-chart-legend">
        <p-status class="p-status" v-bind="$props" />
        <span class="count">{{ count }}</span>
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
    },
};
</script>

<style lang="scss" scoped>
    .p-chart-legend {
        display: flex;
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
        }
    }
</style>
