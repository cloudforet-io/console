<template>
    <div class="box-container" :style="{height: height}"
         @keyup="setMinimizeAndRevertByKey"
         tabindex="0"  >
        <div :class="{'content-container':true, left: transitionEffect }">
            <slot name="leftContainer" :width="`${leftContainerWidth}px`" />
        </div>

        <div class="dragger-container" :class="{ line: line }" :style="{
                 height: height,
                 width: `${draggerWidth}px`,
             }"
             @mousedown="onMousedown"
        >
            <span class="dragger">
                <span @mouseenter="mouseOnOver(true)"
                      @mouseleave="mouseOnOver(false)"
                >
                    <slot name="dragger">
                        <p-i v-if="!isMinimized"
                             class="btn-vertical-dragger"
                             :color="shiftColorWhenMouseOver"
                             :width="'1rem'"
                             :height="'1rem'"
                             :name="'btn_ic_tree_hidden'"
                             @click="setMinimizeAndRevert(true)"
                        />
                        <p-i v-else
                             class="btn-vertical-dragger"
                             :color="shiftColorWhenMouseOver"
                             :width="'1rem'"
                             :height="'1rem'"
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
                <slot name="rightContainer" />
            </div>
            <FNB v-if="!hideFNB" class="fnb" />
        </div>
    </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import styles from '@/styles/_variables.scss';
import FNB from '@/views/containers/fnb/FNB';
import PI from '@/components/atoms/icons/PI';

export default {
    name: 'VerticalLayout',
    components: { PI, FNB },
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
        hideFNB: {
            type: Boolean,
            default: false,
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
            transitionEffect: true,
            leftContainerWidth: parseFloat(this.leftWidth),
            isMinimized: false,
            draggerWidth: 10,
            previousWidth: null,
            dragging: false,
            mouseOver: false,
            pageX: null,
        };
    },
    computed: {
        ...mapGetters('layout', [
            'defaultFNB',
            'verticalLeftWidth',
        ]),
        rightContainerWidth() {
            return `calc(100vw - ${styles.gnbWidth} - ${this.leftContainerWidth + this.draggerWidth}px)`;
        },
        shiftColorWhenMouseOver() {
            return this.mouseOver ? `white ${styles.secondary}` : 'white primary3';
        },
    },
    created() {
        this.initFNB();
        this.initDefaultLeftWidth();
    },
    beforeDestroy() {
        this.finalizeFNB();
        this.finalizeDefaultLeftWidth();
    },
    methods: {
        ...mapActions('layout', [
            'showDefaultFNB',
            'hideDefaultFNB',
            'setVerticalLeftWidth',
        ]),
        initFNB() {
            if (!this.hideFNB) {
                this.hideDefaultFNB();
            }
        },
        mouseOnOver(flag) {
            this.mouseOver = flag;
        },
        initDefaultLeftWidth() {
            if (this.autoSaveLeftWidth) {
                this.leftContainerWidth = parseFloat(this.verticalLeftWidth) || parseFloat(this.leftWidth);
            }
        },
        finalizeFNB() {
            if (!this.hideFNB) {
                this.showDefaultFNB();
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
};
</script>

<style lang="scss" scoped>
    .box-container {
        display: flex;
        flex-grow: 1;
    }
    .content-container {
        overflow: auto;
        overflow-y: auto;
        overflow-x: hidden;
        &.right {
            display: inline-flex;
            flex-direction: column;
            justify-content: space-between;
            .fnb {
                min-height: $fnb-height;
                max-height: $fnb-height;
            }
        }
    }
    .left{
      > div {
          transition:  width 0.5s;
         > div {
             transition:  inherit;
         }
      }
    }
    .dragger-container {
        display: flex;
        align-items: flex-start;
        justify-content: center;
        &.line {
            border-left: 1px solid $lightgray;
            &:hover {
                border-left: 1px solid $secondary;
                cursor: ew-resize;
            }
        }
        .dragger {
            display: inline-block;
            cursor: pointer;
            height: 30px;
            font-size: 1.5rem;
            font-weight: 600;
            text-align: center;
            z-index: 99999;
            cursor: col-resize;
            color: $darkgray;
            > span {
                margin-right: 26px;
                cursor: pointer;
            }
        }
        .btn-vertical-dragger{
            margin-top: 1rem;
            margin-left: 1rem;
            justify-content: center;
            color: $darkgray;
        }
    }
</style>
