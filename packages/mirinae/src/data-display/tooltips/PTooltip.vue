<template>
    <component :is="tag"
               v-tooltip="tooltipOptions"
               v-on="$listeners"
    >
        <slot />
    </component>
</template>

<script lang="ts">
import type { PropType } from 'vue';
import {
    computed, defineComponent, reactive, toRefs,
} from 'vue';

import { merge } from 'lodash';
import { VTooltip } from 'v-tooltip';
import type { TranslateResult } from 'vue-i18n';

import type { TooltipPosition } from '@/data-display/tooltips/type';

/*
Tooltip Options are as follows:
content - HTML text to be displayed in the tooltip. Can also be a function that returns the content or a Promise.
classes
targetClasses - CSS classes added to the target element of the tooltip.
html - Boolean: allow HTML tooltip content.
delay - Show/Hide delay, or object: { show: 500, hide: 100 } (ms).
placement
trigger - Events triggering the tooltip separated with spaces: 'hover', 'click', 'focus' or 'manual' ('manual' can't be combined with any other event).
show - Boolean to manually open or hide the tooltip.
offset - Offset of the position (px).
container - Selector: Container where the tooltip will be appended (e.g. 'body'). Set it to false to append popover on target parent node.
boundariesElement - DOM element for the tooltip boundaries.
template - HTML template of the tooltip.
arrowSelector - CSS selector to get the arrow element in the tooltip template.
innerSelector - CSS selector to get the inner content element in the tooltip template.
autoHide - Boolean: automatically close the tooltip on mouseover.
hideOnTargetClick - Boolean: automatically close the tooltip on target click.
loadingClass - CSS classes added to the tooltip when content is loading.
loadingContent - Same as content, used when the actual tooltip content is loading.
popperOptions - Other Popper.js options.
*/

export default defineComponent({
    name: 'PTooltip',
    directives: { tooltip: VTooltip },
    props: {
        tag: {
            type: String,
            default: 'span',
        },
        contents: {
            type: String as PropType<TranslateResult>,
            default: null,
        },
        position: {
            type: String as PropType<TooltipPosition>,
            default: 'top',
        },
        options: {
            type: Object,
            default: () => ({}),
        },
    },
    setup(props) {
        const state = reactive({
            tooltipOptions: computed(() => merge({
                content: props.contents,
                placement: props.position,
                classes: ['p-tooltip'],
            }, props.options)),
        });
        return {
            ...toRefs(state),
        };
    },
});

</script>

<style lang="postcss" src="./PTooltip.pcss">
</style>
