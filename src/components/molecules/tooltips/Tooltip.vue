<template>
    <span v-tooltip="tooltipOptions">
        <slot name="target" />
    </span>
</template>

<script>
import { VTooltip } from 'v-tooltip';
import TooltipOptions from './Tooltip.map';

export default {
    name: 'PTooltip',
    directives: { tooltip: VTooltip },
    props: {
        contents: {
            type: String,
            default: null,
        },
        position: {
            type: String,
            default: 'auto',
        },
        options: {
            type: Object,
            default: () => ({}),
        },
    },
    data() {
        return {
            tooltipOptions: new TooltipOptions({
                content: this.contents,
                placement: this.position,
                classes: ['p-tooltip'],
                targetClasses: 'p-tooltip-target',
                ...this.options,
            }),
        };
    },
    watch: {
        contents(val) {
            this.tooltipOptions.content = val;
        },
        position(val) {
            console.log('position changed: ', val);
            this.tooltipOptions.placement = val;
        },
    },
    methods: {
        show() {
        },
        hide() {
        },
    },
};
</script>

<style lang="scss">
    .p-tooltip {
        display: block !important;
        z-index: 10000;

        .tooltip-inner {
            background: black;
            color: white;
            border-radius: 16px;
            padding: 5px 10px 4px;
        }

        .tooltip-arrow {
            width: 0;
            height: 0;
            border-style: solid;
            position: absolute;
            margin: 5px;
            border-color: black;
            z-index: 1;
        }

        &[x-placement^="top"] {
            margin-bottom: 5px;

            .tooltip-arrow {
                border-width: 5px 5px 0 5px;
                border-left-color: transparent !important;
                border-right-color: transparent !important;
                border-bottom-color: transparent !important;
                bottom: -5px;
                left: calc(50% - 5px);
                margin-top: 0;
                margin-bottom: 0;
            }
        }

        &[x-placement^="bottom"] {
            margin-top: 5px;

            .tooltip-arrow {
                border-width: 0 5px 5px 5px;
                border-left-color: transparent !important;
                border-right-color: transparent !important;
                border-top-color: transparent !important;
                top: -5px;
                left: calc(50% - 5px);
                margin-top: 0;
                margin-bottom: 0;
            }
        }

        &[x-placement^="right"] {
            margin-left: 5px;

            .tooltip-arrow {
                border-width: 5px 5px 5px 0;
                border-left-color: transparent !important;
                border-top-color: transparent !important;
                border-bottom-color: transparent !important;
                left: -5px;
                top: calc(50% - 5px);
                margin-left: 0;
                margin-right: 0;
            }
        }

        &[x-placement^="left"] {
            margin-right: 5px;

            .tooltip-arrow {
                border-width: 5px 0 5px 5px;
                border-top-color: transparent !important;
                border-right-color: transparent !important;
                border-bottom-color: transparent !important;
                right: -5px;
                top: calc(50% - 5px);
                margin-left: 0;
                margin-right: 0;
            }
        }

        &.popover {
            $color: #f9f9f9;

            .popover-inner {
                background: $color;
                color: black;
                padding: 24px;
                border-radius: 5px;
                box-shadow: 0 5px 30px rgba(black, .1);
            }

            .popover-arrow {
                border-color: $color;
            }
        }

        &[aria-hidden='true'] {
            visibility: hidden;
            opacity: 0;
            transition: opacity .15s, visibility .15s;
        }

        &[aria-hidden='false'] {
            visibility: visible;
            opacity: 1;
            transition: opacity .15s;
        }
    }
</style>
