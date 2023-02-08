<template>
    <div class="p-horizontal-layout">
        <div class="horizontal-contents"
             :style="{height: `${containerHeight}px`}"
        >
            <slot name="container"
                  :height="containerHeight"
            />
        </div>

        <div class="resizer-container">
            <span class="resizer"
                  @mousedown="handleMousedown"
            >
                <p-i color="inherit"
                     width="1.5rem"
                     height="1.5rem"
                     name="btn_height-modifier"
                />
            </span>
        </div>
    </div>
</template>

<script lang="ts">
import {
    reactive, toRefs,
} from 'vue';

import PI from '@/foundation/icons/PI.vue';

export default {
    name: 'PHorizontalLayout',
    components: { PI },
    props: {
        height: {
            type: Number,
            default: 400,
        },
        minHeight: {
            type: Number,
            default: 300,
        },
        maxHeight: {
            type: Number,
            default: 1000,
        },
    },
    setup(props, { emit }) {
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

        return {
            ...toRefs(state),
            handleMousedown,
        };
    },
};
</script>

<style lang="postcss">
.p-horizontal-layout {
    .horizontal-contents {
        overflow: hidden;
    }
    .resizer-container {
        @apply relative mt-4 pb-7;
        .resizer {
            @apply absolute text-gray-300 items-center text-display-md;
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
        .resizer-container {
            visibility: hidden;
        }
    }
}
</style>
