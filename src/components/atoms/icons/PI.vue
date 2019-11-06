<template>
    <svgicon v-bind="$props" />
</template>
<script>
import '@/components/atoms/icons/p-icons';

/**
 * Reference: https://github.com/MMF-FE/vue-svgicon
 */
export default {
    name: 'PI',
    props: {
        name: {
            type: String,
            default: '',
            validator() {
                /**
                 * TODO: CREATE PI.map.js FILE FOR VALIDATION.
                 *       NEED DEFAULT ICON.
                 */
                return true;
            },
        },
        dir: {
            type: String,
            default: null,
            validator() {
                /**
                 * TODO
                 */
                return true;
            },
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
};
</script>

<style lang="scss" scoped>
    /**
        Class Prefix is defined in main.js
     */
    .p-i-icon {
        display: inline-block;
        /*width: 16px;*/
        /*height: 16px;*/
        color: inherit;
        vertical-align: middle;
        fill: none;
        stroke: currentColor;
        border: 0px;
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
