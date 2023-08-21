<template>
    <div class="p-collapsible-panel">
        <div class="panel-contents">
            <div ref="fakeTextRef"
                 class="text fake"
                 :style="{'-webkit-line-clamp': lineClamp}"
            >
                <slot />
            </div>
            <div class="text"
                 :class="{collapsed: state.proxyIsCollapsed}"
                 :style="{'-webkit-line-clamp': lineClamp}"
            >
                <slot v-if="lineClamp !== 0 || !state.proxyIsCollapsed" />
            </div>
        </div>
        <p-collapsible-toggle v-if="lineClamp === 0 || state.isOverflow"
                              v-model:is-collapsed="state.proxyIsCollapsed"
        />
    </div>
</template>

<script setup lang="ts">
import { debounce } from 'lodash';
import {
    onMounted, onUnmounted, onUpdated, reactive,
} from 'vue';


import type { CollapsiblePanelProps } from '@/data-display/collapsible/collapsible-panel/type';
import PCollapsibleToggle from '@/data-display/collapsible/collapsible-toggle/PCollapsibleToggle.vue';
import { useProxyValue } from '@/hooks';

const props = withDefaults(defineProps<CollapsiblePanelProps>(), {
    isCollapsed: true,
    lineClamp: 2,
});

const emit = defineEmits(['update:isCollapsed']);


const state = reactive({
    proxyIsCollapsed: useProxyValue('isCollapsed', props, emit),
    fakeTextRef: null as null|HTMLElement,
    isOverflow: false,
});

/* util */
const checkTextOverflow = debounce(() => {
    if (!state.fakeTextRef) return;
    state.isOverflow = state.fakeTextRef.scrollHeight > state.fakeTextRef.clientHeight;
}, 150);

onUpdated(() => {
    checkTextOverflow();
});

onMounted(() => {
    window.addEventListener('resize', checkTextOverflow);
    checkTextOverflow();
});

onUnmounted(() => {
    window.removeEventListener('resize', checkTextOverflow);
});

</script>

<style lang="postcss">
.p-collapsible-panel {
    width: 100%;
    padding: 0.625rem;
    .panel-contents {
        position: relative;
        font-size: 0.75rem;
        line-height: 1.5;
        word-break: break-word;
        .text {
            &.collapsed, &.fake {
                display: -webkit-box;
                -webkit-box-orient: vertical;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            &.fake {
                position: absolute;
                visibility: hidden;
                top: 0;
                left: 0;
            }
        }
    }
}
</style>
