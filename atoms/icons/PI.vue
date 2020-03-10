<template>
    <svgicon v-bind="$props" v-on="$listeners" />
</template>
<script>
import '@/components/atoms/icons/p-icons';

/**
 * Vue Plugin 'SvgIcon'
 * Reference: https://github.com/MMF-FE/vue-svgicon
 */
export default {
    name: 'PI',
    props: {
        /** @type {string} */
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
        /** @type {string} */
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
        /** @type {boolean} */
        fill: {
            type: Boolean,
            default: true,
        },
        /** @type {string} */
        width: {
            type: String,
            default: '1.5rem',
        },
        /** @type {string} */
        height: {
            type: String,
            default: '1.5rem',
        },
        /** @type {string} */
        scale: {
            type: String,
            default: undefined,
        },
        /** @type {string} */
        color: {
            type: String,
            default: undefined,
        },
        /**
         * use original or not
         * @type {boolean}
         * */
        original: {
            type: Boolean,
            default: true,
        },
        /** @type {string} */
        title: {
            type: String,
            default: undefined,
        },
    },
};
</script>

<style lang="postcss" scoped>
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
