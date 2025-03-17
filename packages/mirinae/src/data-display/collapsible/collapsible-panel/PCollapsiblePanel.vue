<template>
    <div class="p-collapsible-panel">
        <div class="panel-contents">
            <div ref="fakeTextRef"
                 class="text fake"
                 :style="fakeTextStyle"
            >
                <slot v-if="!enableDeepClamp" />
            </div>
            <div ref="contentRef"
                 class="text"
            >
                <slot v-if="enableDeepClamp || (lineClamp !== 0 || !proxyIsCollapsed)" />
            </div>
        </div>
        <p-collapsible-toggle v-if="lineClamp === 0 || isOverflow"
                              v-model="proxyIsCollapsed"
        />
    </div>
</template>

<script lang="ts">
import {
    computed,
    defineComponent, nextTick, onMounted, onUnmounted, reactive, toRefs, watch,
} from 'vue';

import {
    useDeepTextClamper,
    useSimpleTextClamper,
} from '@/data-display/collapsible/collapsible-panel/composables/use-text-clamper';
import type { CollapsiblePanelProps } from '@/data-display/collapsible/collapsible-panel/type';
import PCollapsibleToggle from '@/data-display/collapsible/collapsible-toggle/PCollapsibleToggle.vue';
import { useProxyValue } from '@/hooks';

const PAD = 2;
export default defineComponent({
    name: 'PCollapsiblePanel',
    components: { PCollapsibleToggle },
    model: {
        prop: 'isCollapsed',
        event: 'update:isCollapsed',
    },
    props: {
    /* collapsible props */
        isCollapsed: {
            type: Boolean,
            default: true,
        },
        /* collapsible panel props */
        lineClamp: {
            type: Number,
            default: 2,
        },
        enableDeepClamp: {
            type: Boolean,
            default: false,
        },
    },
    setup(props: CollapsiblePanelProps, { emit }) {
        const state = reactive({
            proxyIsCollapsed: useProxyValue('isCollapsed', props, emit),
            fakeTextRef: null as null|HTMLElement,
            contentRef: null as null|HTMLElement,
            fakeTextStyle: computed<Record<string, any>>(() => ({ '-webkit-line-clamp': props.lineClamp })),
        });

        const simpleTextClamper = useSimpleTextClamper(PAD, props.lineClamp || 2);
        const deepTextClamper = useDeepTextClamper(props.lineClamp || 2);

        const updateClamping = () => {
            nextTick(() => {
                if (props.enableDeepClamp) {
                    deepTextClamper.runTextClamper(state.proxyIsCollapsed, state.contentRef);
                } else {
                    simpleTextClamper.runTextClamper(state.proxyIsCollapsed, state.contentRef, state.fakeTextRef);
                }
            });
        };

        onMounted(() => {
            window.addEventListener('resize', updateClamping);
            updateClamping();
        });

        onUnmounted(() => {
            window.removeEventListener('resize', updateClamping);
        });

        watch(() => state.proxyIsCollapsed, () => {
            updateClamping();
        });

        watch(() => state.contentRef, () => {
            updateClamping();
        });

        return {
            ...toRefs(state),
            isOverflow: computed(() => (props.enableDeepClamp
                ? deepTextClamper.state.isOverflow
                : simpleTextClamper.state.isOverflow)),
        };
    },
});
</script>

<style lang="postcss">
.p-collapsible-panel {
    width: 100%;
    padding: 0.625rem;
    font-size: inherit;
    line-height: 1.25;
    font-style: inherit;
    font-weight: inherit;
    .panel-contents {
        position: relative;
        word-break: break-word;
        .text {
            &.fake {
                display: -webkit-box;
                -webkit-box-orient: vertical;
                overflow: hidden;
                text-overflow: ellipsis;
                position: absolute;
                visibility: hidden;
                top: 0;
                left: 0;
            }
        }
    }
}
</style>
