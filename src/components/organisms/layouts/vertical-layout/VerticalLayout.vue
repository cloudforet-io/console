<template>
    <div class="box-container" :style="{height: `calc(${height} - 1rem`}"
         tabindex="0"
         @keyup="setMinimizeAndRevertByKey"
    >
        <div :style="{height: height}"
             :class="{'content-container':true, left: transitionEffect, 'overflow-effect': true}"
        >
            <slot name="leftContainer" :width="`${leftContainerWidth}px`" :widthRaw="leftContainerWidth" />
        </div>

        <div class="dragger-container" :class="{ line: lineCass, 'prohibit-line': blockHover }" :style="{
                 height: height,
                 width: `${draggerWidth}px`,
             }"
             @mousedown="onMousedown"
        >
            <span class="dragger">
                <span @mouseenter="mouseOnOver(true)" @mouseleave="mouseOnOver(false)">
                    <slot name="dragger">
                        <p-i v-if="!isMinimized"
                             class="btn-vertical-dragger"
                             :width="'1rem'"
                             :height="'1rem'"
                             color="white inherit"
                             :name="'btn_ic_tree_hidden'"
                             @click="setMinimizeAndRevert(true)"
                        />
                        <p-i v-else
                             class="btn-vertical-dragger"
                             :width="'1rem'"
                             :height="'1rem'"
                             color="white inherit"
                             :name="'btn_ic_tree_hidden—folded'"
                             @click="setMinimizeAndRevert(false)"
                        />
                    </slot>
                </span>
            </span>
        </div>

        <div class="content-container right"
             :style="{
                 height: height,
                 width: rightContainerWidth
             }"
        >
            <div>
                <slot name="rightContainer" :height="height" />
            </div>
        </div>
    </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import { defineComponent } from '@vue/composition-api';
import styles from '@/styles/variables';
import PI from '@/components/atoms/icons/PI.vue';

export default defineComponent({
    name: 'VerticalLayout',
    components: { PI },
    events: ['start', 'move', 'stop'],
    props: {
        height: {
            type: String,
            default: `calc(100vh - ${styles['lnb-height']})`,
        },
        line: {
            type: Boolean,
            default: true,
        },
        leftWidth: {
            type: Number,
            default: 300,
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
            default: `calc(100vw -${styles['gnb-width']})`,
        },
        autoSaveLeftWidth: {
            type: Boolean,
            default: true,
        },
        minLeftSize: {
            type: Number,
            default: 16,
        },
    },
    data() {
        return {
            lineCass: this.line,
            transitionEffect: true,
            leftContainerWidth: parseFloat(this.leftWidth),
            isMinimized: false,
            draggerWidth: 10,
            blockHover: false,
            previousWidth: null,
            dragging: false,
            mouseOver: false,
            pageX: null,
        };
    },
    computed: {
        rightContainerWidth() {
            console.debug(`calc(100vw - ${styles['gnb-width']} - ${this.leftContainerWidth + this.draggerWidth}px)`);
            return `calc(100vw - ${styles['gnb-width']} - ${this.leftContainerWidth + this.draggerWidth}px)`;
        },
    },
    created() {
        this.initDefaultLeftWidth();
    },
    beforeDestroy() {
        this.finalizeDefaultLeftWidth();
    },
    methods: {
        ...mapActions('layout', [
            'setVerticalLeftWidth',
        ]),
        mouseOnOver(flag) {
            if (this.isMinimized) {
                this.lineCass = false;
                this.blockHover = !this.lineCass;
            } else {
                this.lineCass = true;
                this.blockHover = !this.lineCass;
                this.mouseOver = flag;
            }
        },
        initDefaultLeftWidth() {
            if (this.autoSaveLeftWidth) {
                const width = parseFloat(this.leftWidth);
                this.leftContainerWidth = width > this.minLeftWidth ? width : this.minLeftWidth;
            }
        },
        finalizeDefaultLeftWidth() {
            if (this.autoSaveLeftWidth) {
                if (this.isMinimized) this.setVerticalLeftWidth(`${this.previousWidth}px`);
                else this.setVerticalLeftWidth(`${this.leftContainerWidth}px`);
            }
        },
        onMousedown() {
            this.dragging = true;
            this.transitionEffect = false;
            this.$emit('start', this.leftContainerWidth);
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
            }
        },
        onMouseup() {
            if (this.dragging) {
                this.dragging = false;
                this.transitionEffect = true;
                this.pageX = null;
                window.document.removeEventListener('mousemove', this.onMousemove);
                window.document.removeEventListener('mouseup', this.onMouseup);
                this.$emit('stop', this.leftContainerWidth);
            }
        },
        setMinimizeAndRevertByKey(e) {
            if (e.key === '[' || e.key === '{') {
                this.setMinimizeAndRevert(!this.isMinimized);
            }
        },
        setMinimizeAndRevert(flag) {
            if (flag) {
                this.previousWidth = this.leftContainerWidth;
                this.leftContainerWidth = this.minLeftSize;
                this.setVerticalLeftWidth(`${this.previousWidth}px`);
                this.mouseOver = false;
            } else {
                this.leftContainerWidth = this.previousWidth;
                this.mouseOver = false;
                this.previousWidth = null;
            }
            this.isMinimized = flag;
            this.$emit('minimize', flag);
        },
    },
});
</script>

<style lang="postcss" scoped>
    .box-container {
        display: flex;
        flex-grow: 1;
    }
    .content-container {
        overflow: auto;
        &.right {
            display: inline-flex;
            flex-direction: column;
            justify-content: space-between;
            .fnb {
                min-height: $(fnb-height);
                max-height: $(fnb-height);
            }
        }
        &.left{
            overflow:auto;
            > div {
                transition:  width 0.5s;
                > div {
                    transition:  inherit;
                }
            }
        }
    }
    .overflow-effect{
        > div {
            > div {
                overflow-y: auto;
                overflow-x: hidden;
            }
        }
    }
    .dragger-container {
        display: flex;
        align-items: flex-start;
        justify-content: center;
        &.line {
            @apply border-l border-gray-400;
            background-color: transparent;
            &:hover {
                @apply border-l border-secondary;
                cursor: ew-resize;
            }
        }
        &.prohibit-line {
            @apply border-l border-gray;
            background-color: transparent;
            &:hover {
                @apply border-l border-secondary;
            }
        }

        .dragger {
            @apply text-gray-900;
            display: inline-block;
            cursor: pointer;
            height: 30px;
            font-size: 1.5rem;
            font-weight: 600;
            text-align: center;
            z-index: 99;
            cursor: col-resize;
            > span {
                margin-right: 26px;
                cursor: pointer;
            }
        }
        .btn-vertical-dragger{
            margin-top: 1rem;
            margin-left: 1rem;
            justify-content: center;
            @apply text-gray-400;
            &:hover {
                @apply text-secondary;
            }
        }
    }
</style>
