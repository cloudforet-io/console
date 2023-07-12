<script lang="ts" setup>
import { PProgressBar } from '@spaceone/design-system';
import { computed, reactive } from 'vue';


import { indigo, red, yellow } from '@/styles/colors';

const getColor = (rate) => {
    if (rate >= 100) return red[400];
    if (rate < 90) return indigo[500];
    return undefined;
};

const budgetGradient = {
    startColor: yellow[500], endColor: red[400], gradientPoint: 90,
};

interface Props {
    usageRate: number;
    disableAnimation: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    usageRate: 200,
    disableAnimation: false,
});

const state = reactive({
    percentage: props.usageRate,
    gradient: computed(() => ((props.usageRate >= 90 && props.usageRate < 100)
        ? budgetGradient : undefined)),
    color: computed(() => getColor(props.usageRate)),
});

</script>

<template>
    <p-progress-bar
        :percentage="state.percentage"
        :gradient="state.gradient"
        :color="state.color"
        :diasble-animation="disableAnimation"
    />
</template>
