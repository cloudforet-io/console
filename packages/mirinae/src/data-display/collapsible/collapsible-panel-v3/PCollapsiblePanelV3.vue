<template>
    <div class="p-collapsible-panel-v3">
        <!-- 슬롯 콘텐츠 -->
        <div ref="slotContentRef"
             class="text-content"
             :class="{ collapsed: proxyIsCollapsed }"
        >
            <slot />
        </div>

        <!-- 토글 버튼 -->
        <p-collapsible-toggle v-if="isOverflow"
                              v-model="proxyIsCollapsed"
        />
    </div>
</template>

<script lang="ts">
import {
    defineComponent, nextTick, onMounted, reactive, ref, watch,
} from 'vue';

import PCollapsibleToggle from '@/data-display/collapsible/collapsible-toggle/PCollapsibleToggle.vue';
import { useProxyValue } from '@/hooks';

export default defineComponent({
    name: 'PCollapsiblePanelV3',
    components: { PCollapsibleToggle },
    props: {
        isCollapsed: { type: Boolean, default: true },
        lineClamp: { type: Number, default: 2 },
    },
    setup(props, { emit }) {
        const slotContentRef = ref<HTMLElement | null>(null);
        const proxyIsCollapsed = useProxyValue('isCollapsed', props, emit);

        const state = reactive({
            isOverflow: false,
            truncatedText: '',
        });

        const calculateLines = (text: string, width: number, lineHeight: number, font: string) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return { lines: 0, truncatedText: text };

            ctx.font = font;

            const words = text.split(' ');
            let line = '';
            const lines: string[] = [];
            let currentHeight = lineHeight;

            // eslint-disable-next-line no-restricted-syntax
            for (const word of words) {
                const testLine = `${line + word} `;
                const metrics = ctx.measureText(testLine);
                console.log(metrics.width);
                console.log(width);
                if (metrics.width > width) {
                    lines.push(line.trim());
                    line = `${word} `;
                    console.log(line);
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    currentHeight += lineHeight;

                    if (lines.length >= props.lineClamp) {
                        lines.push(`${line.trim()}...`);
                        return { lines: props.lineClamp, truncatedText: lines.join(' ') };
                    }
                } else {
                    line = testLine;
                }
            }

            lines.push(line.trim());
            return { lines: lines.length, truncatedText: text };
        };

        const updateTruncatedText = () => {
            const slotEl = slotContentRef.value;
            if (!slotEl) return;

            const text = slotEl.textContent?.trim() || '';
            const computedStyle = window.getComputedStyle(slotEl);
            const font = `${computedStyle.fontSize} ${computedStyle.fontFamily}`;
            const lineHeight = parseFloat(computedStyle.lineHeight);
            const width = slotEl.clientWidth;

            const { lines, truncatedText } = calculateLines(text, width, lineHeight, font);
            state.isOverflow = lines > props.lineClamp;
            state.truncatedText = truncatedText;
        };

        watch(proxyIsCollapsed, (collapsed) => {
            if (collapsed) {
                nextTick(updateTruncatedText);
            }
        });

        onMounted(() => {
            nextTick(updateTruncatedText);
        });

        return {
            slotContentRef,
            proxyIsCollapsed,
            ...state,
        };
    },
});
</script>

<style lang="postcss">
.p-collapsible-panel-v2 {
    width: 100%;
    .text-content {
        width: 100%;
        overflow: hidden;

        &.collapsed {
            display: -webkit-box;
            -webkit-box-orient: vertical;
        }
    }
}
</style>
