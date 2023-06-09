<template>
    <component :is="tag"
               v-tooltip="state.tooltipOptions"
               v-on="listeners"
    >
        <slot />
    </component>
</template>

<script setup lang="ts">

import { merge } from 'lodash';
import {
    computed, reactive, useAttrs,
} from 'vue';

import type { TooltipPositions } from '@/data-display/tooltips/type';

interface Props {
    tag: string;
    contents: string | null;
    position: TooltipPositions;
    options: Record<string, unknown>;
}

const props = withDefaults(defineProps<Props>(), {
    tag: 'span',
    contents: null,
    position: 'top',
    options: () => ({}),
});

const attrs = useAttrs();

const state = reactive({
    tooltipOptions: computed(() => merge({
        content: props.contents,
        placement: props.position,
        classes: ['p-tooltip'],
    }, props.options)),
});

const listeners = {
    ...attrs,
};


</script>

<style lang="postcss" src="./PTooltip.pcss">
</style>
