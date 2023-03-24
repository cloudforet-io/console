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

<script lang="ts">
import type { PropType } from 'vue';
import {
    computed, defineComponent, ref, toRaw,
} from 'vue';

import { useVirtualScroll, useRender } from './hooks';
import vueDiffLine from './Line.vue';
import type { Mode, Theme, VirtualScroll } from './types';

export default defineComponent({
    name: 'VueDiff',
    components: {
        vueDiffLine,
    },
    props: {
        mode: {
            type: String as PropType<Mode>,
            default: 'split',
        },
        theme: {
            type: String as PropType<Theme>,
            default: 'dark',
        },
        language: {
            type: String,
            default: 'plaintext',
        },
        prev: {
            type: String,
            default: '',
        },
        current: {
            type: String,
            default: '',
        },
        folding: {
            type: Boolean,
            default: false,
        },
        inputDelay: {
            type: Number,
            default: 0,
        },
        virtualScroll: {
            type: [Boolean, Object] as PropType<boolean | VirtualScroll>,
            default: false,
        },
    },
    setup(props) {
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

        return {
            list,
            meta,
            minHeight,
            render,
            scrollOptions,
            setLineHeight,
            viewer,
        };
    },
});
</script>

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
