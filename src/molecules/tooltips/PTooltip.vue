<template>
    <component :is="tag" v-tooltip="tooltipOptions"
               v-on="$listeners"
    >
        <slot />
    </component>
</template>

<script lang="ts">
import { merge } from 'lodash';
import { VTooltip } from 'v-tooltip';

export default {
    name: 'PTooltip',
    directives: { tooltip: VTooltip },
    props: {
        tag: {
            type: String,
            default: 'span',
        },
        contents: {
            type: String,
            default: null,
        },
        position: {
            type: String,
            default: 'top',
        },
        options: {
            type: Object,
            default: () => ({}),
            validator() {
                /**
                 * TODO: ADD VALIDATOR FUNCTION TO TOOLTIPMAP AND USE THAT HERE.
                 */
                return true;
            },
        },
    },
    computed: {
        tooltipOptions() {
            return merge({
                content: this.contents,
                placement: this.position,
                classes: ['p-tooltip'],
            }, this.options);
        },
    },
};

</script>

<style lang="postcss" src="./PTooltip.pcss">
</style>
