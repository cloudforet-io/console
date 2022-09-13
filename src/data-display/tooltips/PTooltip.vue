<template>
    <component :is="tag" v-tooltip="tooltipOptions"
               v-on="$listeners"
    >
        <slot />
    </component>
</template>

<script lang="ts">
import { computed, reactive, toRefs } from 'vue';

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
};

</script>

<style lang="postcss" src="./PTooltip.pcss">
</style>
