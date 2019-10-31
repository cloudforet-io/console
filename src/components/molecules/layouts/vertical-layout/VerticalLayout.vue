<template>
    <div
        class="box-container"
        :style="{'width': totalWidth,
                 'height': containerHeight}"
    >
        <div class="content-container left">
            <slot
                name="leftContainer"
                :width="containerHeight"
            />
        </div>

        <div
            ref="dragger"
            class="dragger-container"
            :class="{ line: line }"
            :style="{
                'height': containerHeight,
                'left': `${leftContainerWidth}px`
            }"
        >
            <span
                class="dragger"
                @mousedown="onMousedown"
            >
                <slot name="dragger">
                    <f-i
                        icon="fa-grip-lines-vertical"
                        icon-style="light"
                    />
                </slot>
            </span>
        </div>

        <div
            class="content-container right"
            :style="{'width': rightContainerWidth,
                     'left': `${leftContainerWidth + draggerWidth}px`,
                     'height': containerHeight}"
        >
            <slot
                name="rightContainer"
                :width="rightContainerWidth"
            />
        </div>
    </div>
</template>

<script>
import styles from '@/assets/style/_variables.scss';
import FI from '@/components/atoms/icons/FI.vue';

export default {
    name: 'VerticalLayout',
    components: { FI },
    events: ['start', 'move', 'stop'],
    props: {
        height: {
            type: String,
            default: `calc(100vh - ${styles.lnbHeight})`,
        },
        line: {
            type: Boolean,
            default: true,
        },
        leftWidth: {
            type: Number,
            default: 200,
        },
        minLeftWidth: {
            type: Number,
            default: 150,
        },
        maxLeftWidth: {
            type: Number,
            default: 600,
        },
        totalWidth: {
            type: String,
            default: `calc(100vw -${styles.gnbWidth})`,
        },
    },
    data() {
        return {
            draggerHeight: 30,
            leftContainerWidth: parseInt(this.leftWidth, 10),
            draggerWidth: 30,
            dragging: false,
            pageX: null,
        };
    },
    computed: {
        containerHeight() {
            return this.height;
        },
        rightContainerWidth() {
            return `calc(100vw - ${this.leftContainerWidth + this.draggerWidth}px)`;
        },
    },
    mounted() {
        this.draggerWidth = this.$refs.dragger.clientWidth + this.$refs.dragger.offsetWidth;
    },
    methods: {
        onMousedown() {
            this.dragging = true;
            this.$emit('stop', this.leftContainerWidth);
            window.document.addEventListener('mousemove', this.onMousemove);
            window.document.addEventListener('mouseup', this.onMouseup);
        },
        onMousemove(e) {
            if (this.dragging) {
                if (this.pageX === null) {
                    this.pageX = e.pageX;
                    return;
                }
                const diff = this.pageX - e.pageX;
                const newWidth = this.leftContainerWidth - diff;
                if (newWidth < this.minLeftWidth || newWidth > this.maxLeftWidth) {
                    return;
                }

                this.leftContainerWidth = newWidth;
                this.pageX = e.pageX;
                this.$emit('move', this.leftContainerWidth, e);
                /**
                 * TODO: Delete codes below to remove dependencies between tree component and this.
                 *       For the logic below, please use the event 'move'.
                 */
                const widthKey = `${this.$parent.$parent.$options.name}_treeWidth`;
                localStorage[widthKey] = this.leftContainerWidth;
            }
        },
        onMouseup() {
            if (this.dragging) {
                this.dragging = false;
                this.pageX = null;
                window.document.removeEventListener('mousemove', this.onMousemove);
                window.document.removeEventListener('mouseup', this.onMouseup);
                this.$emit('stop', this.leftContainerWidth);
            }
        },
    },
};
</script>

<style lang="scss" scoped>
    .box-container {
        position: relative;
    }
    .content-container {
        display: inline-block;
        position: absolute;
        top: 0;
        overflow: scroll;
        &.left {
            left: 0;
        }
    }
    .dragger-container {
        position: absolute;
        top: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        &.line {
            border-left: 1px solid $lightgray;
            border-right: 1px solid $lightgray;
        }
        .dragger {
            display: inline-block;
            height: 30px;
            font-size: 1.5rem;
            font-weight: 600;
            text-align: center;
            cursor: col-resize;
            color: $darkgray;
        }
    }
</style>
