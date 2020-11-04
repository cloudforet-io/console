<template>
    <div>
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
import PI from '@/components/atoms/icons/PI.vue';

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
            default: 200,
        },
        maxHeight: {
            type: Number,
            default: 1000,
        },
    },
    data() {
        return {
            lineStyle: {
                width: `calc(50% - ${(this as any).width}px)`,
            },
            draggerStyle: {
                'font-size': (this as any).draggerSize,
                width: `${(this as any).draggerWidth}px`,
            },
            containerHeight: (this as any).height,
            dragging: false,
            pageY: null,
        };
    },
    methods: {
        onMousedown() {
            (this as any).dragging = true;
            window.document.addEventListener('mousemove', this.onMousemove);
            window.document.addEventListener('mouseup', this.onMouseup);
        },
        onMousemove(e) {
            if ((this as any).dragging) {
                if ((this as any).pageY === null) {
                    (this as any).pageY = e.pageY;
                    return;
                }

                const newHeight = (this as any).containerHeight - ((this as any).pageY - e.pageY);
                if (newHeight < (this as any).minHeight || newHeight > (this as any).maxHeight) {
                    return;
                }
                (this as any).containerHeight = newHeight;
                (this as any).pageY = e.pageY;
            }
        },
        onMouseup() {
            if ((this as any).dragging) {
                // @ts-ignore
                this.$emit('drag:end', this.containerHeight);
                // @ts-ignore
                this.dragging = false;
                (this as any).pageY = null;
                window.document.removeEventListener('mousemove', this.onMousemove);
                window.document.removeEventListener('mouseup', this.onMouseup);
            }
        },
    },
};
</script>

<style lang="postcss" scoped>
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
</style>
