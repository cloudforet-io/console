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
