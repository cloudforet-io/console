<template>
    <svgicon v-bind="$props" v-on="$listeners" />
</template>
<script lang="ts">
import '@/components/atoms/icons/p-icons';
import { iconProps } from '@/components/atoms/icons/PI.toolset';

export default {
    name: 'PI',
    props: iconProps,
};
</script>

<style lang="postcss" scoped>
    /**
        Class Prefix is defined in main.js
     */
    .p-i-icon {
        display: inline-block;
        color: inherit;
        vertical-align: middle;
        fill: none;
        stroke: currentColor;
        border: 0;
        &.p-i-fill {
            fill: currentColor;
            stroke: none;
        }

        &.p-i-up {
            /* default */
            transform: rotate(0deg);
        }

        &.p-i-right {
            transform: rotate(90deg);
        }

        &.p-i-down {
            transform: rotate(180deg);
        }

        &.p-i-left {
            transform: rotate(-90deg);
        }
    }
</style>
