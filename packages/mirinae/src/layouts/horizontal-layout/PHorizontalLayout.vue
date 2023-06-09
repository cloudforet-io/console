<template>
    <div class="p-horizontal-layout">
        <div class="horizontal-contents"
             :style="{height: `${state.containerHeight}px`}"
        >
            <slot name="container"
                  :height="state.containerHeight"
            />
        </div>

        <div class="resizer-container">
            <span class="resizer"
                  @mousedown="handleMousedown"
            >
                <p-i color="inherit"
                     width="1.5rem"
                     height="1.5rem"
                     name="ic_double-line-drag-handle"
                />
            </span>
        </div>
    </div>
</template>

<script setup lang="ts">
import {
    reactive,
} from 'vue';

import PI from '@/foundation/icons/PI.vue';

interface Props {
    height: number;
    minHeight: number;
    maxHeight: number;
}

const props = withDefaults(defineProps<Props>(), {
    height: 400,
    minHeight: 300,
    maxHeight: 1000,
});
const emit = defineEmits(['resize-end']);

const state = reactive({
    containerHeight: props.height,
    resizing: false,
    pageY: null as null|number,
});

const handleMousemove = (e) => {
    if (state.resizing) {
        e.preventDefault();

        if (state.pageY === null) {
            state.pageY = e.pageY;
            return;
        }

        const newHeight = state.containerHeight - (state.pageY - e.pageY);
        if (newHeight < props.minHeight || newHeight > props.maxHeight) {
            return;
        }
        state.containerHeight = newHeight;
        state.pageY = e.pageY;
    }
};

const handleMouseup = () => {
    if (state.resizing) {
        emit('resize-end', state.containerHeight);
        state.resizing = false;
        state.pageY = null;
        window.document.removeEventListener('mousemove', handleMousemove);
        window.document.removeEventListener('mouseup', handleMouseup);
    }
};
const handleMousedown = () => {
    state.resizing = true;
    window.document.addEventListener('mousemove', handleMousemove);
    window.document.addEventListener('mouseup', handleMouseup);
};

</script>

<style lang="postcss">
.p-horizontal-layout {
    > .horizontal-contents {
        overflow: hidden;
    }
    > .resizer-container {
        width: 100%;
        position: relative;
        margin-top: 1rem;
        padding-bottom: 1.75rem;
        .resizer {
            @apply absolute text-gray-300 items-center text-display-md;
            display: inline-block;
            width: 1.875rem;
            top: 0;
            left: 50%;
            transform: translate(-50%, -50%);
            &:hover, &:active {
                @apply text-gray-900;
                cursor: row-resize;
            }
        }
    }

    @screen mobile {
        > .resizer-container {
            visibility: hidden;
        }
    }
}
</style>
