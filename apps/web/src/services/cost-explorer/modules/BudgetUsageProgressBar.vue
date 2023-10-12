<template>
    <p-progress-bar
        :percentage="percentage"
        :gradient="gradient"
        :color="color"
        :diasble-animation="disableAnimation"
    />
</template>

<script lang="ts">
import { computed, reactive, toRefs } from 'vue';

import { PProgressBar } from '@spaceone/design-system';

import { indigo, red, yellow } from '@/styles/colors';

const getColor = (rate) => {
    if (rate >= 100) return red[400];
    if (rate < 90) return indigo[500];
    return undefined;
};

const budgetGradient = {
    startColor: yellow[500], endColor: red[400], gradientPoint: 90,
};

export default {
    name: 'BudgetUsageProgressBar',
    components: {
        PProgressBar,
    },
    props: {
        usageRate: {
            type: Number,
            default: 200,
        },
        disableAnimation: {
            type: Boolean,
            default: false,
        },
    },
    setup(props) {
        const state = reactive({
            percentage: props.usageRate,
            gradient: computed(() => ((props.usageRate >= 90 && props.usageRate < 100)
                ? budgetGradient : undefined)),
            color: computed(() => getColor(props.usageRate)),
        });

        return {
            ...toRefs(state),
        };
    },
};
</script>
