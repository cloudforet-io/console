<script lang="ts" setup>
import { useResizeObserver, useThrottleFn } from '@vueuse/core';
import {
    computed, MaybeRef, ref,
} from 'vue';

import vueDiffCode from './Code.vue';
import type {
    Meta, Mode, Lines, Line, VirtualScroll,
} from './types';
import { renderWords } from './utils';

interface Props {
    mode: Mode;
    folding: boolean;
    language: string;
    meta: Meta;
    render: Lines;
    scrollOptions: false | VirtualScroll;
}

const props = defineProps<Props>();
const emit = defineEmits<{(e: 'setLineHeight', index: number, value: number): void}>();

const lineRef = ref<null | HTMLElement>(null);
const rowStyle = computed(() => {
    if (!props.scrollOptions) return undefined;
    return {
        position: 'absolute',
        left: 0,
        top: 0,
        transform: `translate3d(0, ${props.meta.top}px, 0)`,
        minHeight: `${props.scrollOptions.lineMinHeight}px`,
    } as const;
});
const isFoldLine = computed(
    () => props.folding && props.render[0].type === 'equal',
);

const setCode = (codeLine: Line, render?: Lines, index?: number) => {
    if (!codeLine.value) return '\n';

    // Compare lines when render, index properties exist and has chkWords value in line property
    if (
        typeof render === 'undefined'
|| typeof index === 'undefined'
|| !codeLine.chkWords
    ) {
        return codeLine.value;
    }

    const differ = render[index === 0 ? 1 : 0];

    if (!differ.value) return codeLine.value;

    return renderWords(differ.value, codeLine.value); // render with modified tags
};

const rendered = () => {
    if (!lineRef.value || props.meta.height === lineRef.value.offsetHeight) return;
    emit('setLineHeight', props.meta.index, lineRef.value.offsetHeight);
};

if (props.scrollOptions) {
    useResizeObserver(
        lineRef as MaybeRef,
        useThrottleFn(() => {
            if (!lineRef.value || props.meta.height === lineRef.value.offsetHeight) return;
            emit('setLineHeight', props.meta.index, lineRef.value.offsetHeight);
        }, props.scrollOptions.delay),
    );
}
</script>

<template>
    <div
        ref="lineRef"
        class="vue-diff-row"
        :class="`vue-diff-row-${mode}`"
        :style="rowStyle"
    >
        <!-- split view -->
        <template v-if="mode === 'split'">
            <template v-for="(line, index) in render" :key="`line-${index}`">
                <div class="vue-diff-line"
                     style="display: inline-flex;"
                >
                    <template v-if="isFoldLine">
                        <div class="lineNum vue-diff-cell-fold" />
                        <div class="code vue-diff-cell-fold" />
                    </template>
                    <template v-else>
                        <div class="lineNum"
                             :class="`vue-diff-cell-${line.type}`"
                        >
                            {{ line.lineNum }}
                        </div>
                        <div class="code"
                             :class="`vue-diff-cell-${line.type}`"
                        >
                            <vue-diff-code
                                :language="language"
                                :code="setCode(line, render, index)"
                                :scroll-options="scrollOptions"
                                @rendered="rendered"
                            />
                        </div>
                    </template>
                </div>
            </template>
        </template>
        <!-- split view -->
        <!-- unified view -->
        <template v-if="mode === 'unified'">
            <template v-if="isFoldLine">
                <div class="lineNum vue-diff-cell-fold" />
                <div class="code vue-diff-cell-fold" />
            </template>
            <template v-else>
                <div class="lineNum"
                     :class="`vue-diff-cell-${render[0].type}`"
                >
                    {{ render[0].lineNum }}
                </div>
                <div class="code"
                     :class="`vue-diff-cell-${render[0].type}`"
                >
                    <vue-diff-code
                        :language="language"
                        :code="setCode(render[0])"
                        :scroll-options="scrollOptions"
                        @rendered="rendered"
                    />
                </div>
            </template>
        </template>
        <!-- // unified view -->
    </div>
</template>

<style lang="postcss">
.vue-diff-row {
    display: flex;
    width: 100%;

    > div {
        box-sizing: border-box;

        width: 50%;
    }

    .lineNum {
        padding-right: 10px;
        flex: 0 0 auto;
        width: 50px;
        padding-top: 0.05em;
        text-align: right;
        color: #999;
        font-size: 0.9em;
    }

    .code {
        width: calc(100% - 50px);
    }

    .vue-diff-cell-removed {
        background-color: rgb(255 0 0 / 10%);

        span.modified {
            background-color: rgb(255 0 0 / 15%);
        }

        code::before {
            content: '-';
        }
    }

    .vue-diff-cell-added {
        background-color: rgb(0 255 128 / 10%);

        span.modified {
            background-color: rgb(0 255 128 / 15%);
        }

        code::before {
            content: '+';
        }
    }

    .vue-diff-cell-disabled {
        background-color: rgb(128 128 128 / 10%);
    }

    .vue-diff-cell-fold {
        &.lineNum {
            opacity: 0.8;
            font-size: 0.8em;

            &::before {
                content: '>';
            }
        }

        &.code {
            text-align: center;

            &::before {
                color: #999;
                content: '⋯⋯';
            }
        }
    }

    pre {
        display: block;
        position: relative;
        max-width: 100%;
        margin: 0;
        padding: 0 0 0 1.5em;
        overflow: visible;
        background: none;
        border-radius: 0;
    }

    code {
        &::before {
            display: inline-block;
            position: absolute;
            left: 0;
            top: 0;
            opacity: 0.8;
        }
    }
}

.vue-diff-line:nth-child(2) {
    @apply border-gray-200 border-l;
}
</style>
