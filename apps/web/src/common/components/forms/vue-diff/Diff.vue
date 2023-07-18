<script lang="ts" setup>
import {
    computed, ref, toRaw,
} from 'vue';

import { useVirtualScroll, useRender } from './hooks';
import vueDiffLine from './Line.vue';
import type { Mode, Theme, VirtualScroll } from './types';

interface Props {
    mode: Mode;
    theme: Theme;
    language: string;
    prev: string;
    current: string;
    folding: boolean;
    inputDelay: number;
    virtualScroll: boolean | VirtualScroll;
}

const props = withDefaults(defineProps<Props>(), {
    mode: 'split',
    theme: 'dark',
    language: 'plaintext',
    prev: '',
    current: '',
    folding: false,
    inputDelay: 0,
    virtualScroll: false,
});

const viewer = ref<null | HTMLElement>(null);
const scrollOptions = computed(() => {
    if (!props.virtualScroll) return false;
    return {
        height: 500,
        lineMinHeight: 24,
        delay: 100,
        ...(typeof props.virtualScroll === 'object'
            ? toRaw(props.virtualScroll)
            : {}),
    };
});
const { meta, render, list } = useRender(props, viewer, scrollOptions);
const { minHeight } = useVirtualScroll(props, viewer, scrollOptions, meta);

const setLineHeight = (index: number, height: number) => {
    if (meta.value[index] && meta.value[index].height !== height) {
        meta.value[index].height = height;
    }
};

</script>

<template>
    <div
        class="vue-diff-wrapper"
        :class="`vue-diff-mode-${mode} vue-diff-theme-${theme}`"
    >
        <div
            ref="viewer"
            class="vue-diff-viewer"
            :style="{
                height: scrollOptions ? scrollOptions.height + 'px' : undefined,
            }"
        >
            <div class="vue-diff-viewer-inner"
                 :style="{ minHeight }"
            >
                <vueDiffLine
                    v-for="(data, index) in list"
                    :key="index"
                    :mode="mode"
                    :folding="folding"
                    :language="language"
                    :meta="meta[data.index]"
                    :render="render[data.index]"
                    :scroll-options="scrollOptions"
                    @setLineHeight="setLineHeight"
                />
            </div>
        </div>
    </div>
</template>

<style lang="postcss">
.vue-diff-wrapper {
    overflow: hidden;
    width: 100%;
    height: 100%;
    border-radius: 0.3em;
}

.vue-diff-viewer {
    overflow-y: auto;
    width: 100%;
    height: 100%;
    line-height: 1.5;
    font-size: 14px;

    .vue-diff-viewer-inner {
        position: relative;
        width: 100%;
    }
}
</style>
