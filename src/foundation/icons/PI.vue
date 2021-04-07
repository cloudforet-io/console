<template>
    <svgicon v-bind="$props" v-on="$listeners" />
</template>
<script lang="ts">
import '@/foundation/icons/p-icons';
import { defineComponent } from '@vue/composition-api';

interface Props {
    name: string;
    dir: string|null;
    fill: boolean;
    width: string;
    height: string;
    scale?: string;
    color?: string;
    original: boolean;
    title?: string;
}
export default defineComponent<Props>({
    name: 'PI',
    props: {
        name: {
            type: String,
            default: '',
        },
        dir: {
            type: String,
            default: null,
        },
        fill: {
            type: Boolean,
            default: true,
        },
        width: {
            type: String,
            default: '1.5rem',
        },
        height: {
            type: String,
            default: '1.5rem',
        },
        scale: {
            type: String,
            default: undefined,
        },
        color: {
            type: String,
            default: undefined,
        },
        original: {
            type: Boolean,
            default: true,
        },
        title: {
            type: String,
            default: undefined,
        },
    },
});
</script>

<style lang="postcss">
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
