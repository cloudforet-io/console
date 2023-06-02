<template>
    <svgicon :data="icons[name]"
             :dir="dir"
             :fill="fill"
             :width="width"
             :height="height"
             :scale="scale"
             :color="color"
             :original="original"
             :class="animation"
             v-on="$listeners"
    />
</template>
<script setup lang="ts">

import type { AnimationType } from '@/foundation/icons/config';
import icons from '@/foundation/icons/p-icons/icons';

/* https://www.npmjs.com/package/vue-svgicon */
interface Props {
    name: string;
    dir?: string;
    fill?: boolean;
    width: string;
    height: string;
    scale?: string;
    color?: string;
    original?: boolean;
    title?: string;
    animation?: AnimationType;
}

// TODO: need to add validation
// {
//     animation: {
//         type: String as PropType<AnimationType|undefined>,
//         default: undefined,
//         validator(animation: AnimationType|undefined) {
//             return animation === undefined || Object.values(ANIMATION_TYPE).includes(animation);
//         },
//     },
// },
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = withDefaults(defineProps<Props>(), {
    name: '',
    dir: undefined,
    fill: true,
    width: '1.5rem',
    height: '1.5rem',
    scale: undefined,
    color: undefined,
    original: true,
    title: undefined,
    animation: undefined,
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

    &.spin {
        animation: spin-animation 2s linear infinite;
    }

    &.reserve-spin {
        animation: reserve-spin-animation 2s linear infinite;
    }

    @keyframes spin-animation {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(359deg);
        }
    }

    @keyframes reserve-spin-animation {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(-360deg); }
    }
}
</style>
