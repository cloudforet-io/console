<template>
    <div class="p-horizontal-layout">
        <div :style="{height: `${containerHeight}px`}">
            <slot name="container" :height="containerHeight" />
        </div>

        <div class="dragger-container">
            <div class="line left"
                 :class="{'colored': line}"
                 :style="lineStyle"
            />

            <span class="dragger"
                  :style="draggerStyle"
                  @mousedown="onMousedown"
            >
                <slot name="dragger">
                    <p-i color="transparent inherit"
                         width="1.5rem"
                         height="1.5rem"
                         name="btn_height-modifier"
                    />
                </slot>
            </span>
        </div>
    </div>
</template>

<script lang="ts">
import PI from '@/atoms/icons/PI.vue';
import {
    reactive, toRefs,
} from '@vue/composition-api';
import { throttle } from 'lodash';

export default {
    name: 'PHorizontalLayout',
    components: { PI },
    props: {
        line: {
            type: Boolean,
            default: false,
        },
        draggerSize: {
            type: String,
            default: '1.5rem',
        },
        draggerWidth: {
            type: Number,
            default: 30,
        },
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
            lineStyle: {
                width: `calc(50% - ${props.width}px)`,
            },
            draggerStyle: {
                'font-size': props.draggerSize,
                width: `${props.draggerWidth}px`,
            },
            containerHeight: props.height,
            dragging: false,
            pageY: null as null|number,
        });

        const onMousemove = throttle((e) => {
            if (state.dragging) {
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
        }, 150);
        const onMouseup = () => {
            if (state.dragging) {
                // @ts-ignore
                emit('drag-end', state.containerHeight);
                // @ts-ignore
                state.dragging = false;
                state.pageY = null;
                window.document.removeEventListener('mousemove', onMousemove);
                window.document.removeEventListener('mouseup', onMouseup);
            }
        };
        const onMousedown = () => {
            state.dragging = true;
            window.document.addEventListener('mousemove', onMousemove);
            window.document.addEventListener('mouseup', onMouseup);
        };

        return {
            ...toRefs(state),
            onMousedown,
            onMousemove,
            onMouseup,
        };
    },
};
</script>

<style lang="postcss">
.p-horizontal-layout {

    .dragger-container {
        @apply relative mt-4 pb-7;
        .line {
            @apply absolute inline-block border-b;
            border-color: transparent;
            &.colored {
                @apply border-gray;
            }
            &.left {
                @apply left-0;
            }
        }
        .dragger {
            @apply absolute inline-block text-gray-300 top-0 text-2xl items-center;
            left: 50%;
            transform: translate(-50%, -50%);
            &:hover, &:active {
                @apply text-gray-900;
                cursor: row-resize;
            }
        }
    }
}
</style>
