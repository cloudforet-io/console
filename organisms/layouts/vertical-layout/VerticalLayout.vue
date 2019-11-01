<template>
    <div
        class="box-container"
        :style="{height: height}"
    >
        <div class="content-container">
            <slot
                name="leftContainer"
                :width="`${leftContainerWidth}px`"
            />
        </div>

        <div
            class="dragger-container"
            :class="{ line: line }"
            :style="{
                height: height,
                width: `${draggerWidth}px`,
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
import { mapGetters, mapActions, mapMutations } from 'vuex';
import styles from '@/styles/_variables.scss';
import FI from '@/components/atoms/icons/FI';
import FNB from '@/views/containers/fnb/FNB';

export default {
    name: 'VerticalLayout',
    components: { FI, FNB },
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
    },
    data() {
        return {
            draggerHeight: 30,
            leftContainerWidth: parseFloat(this.leftWidth),
            draggerWidth: 15,
            dragging: false,
            pageX: null,
        };
    },
    computed: {
        ...mapGetters('layout', [
            'defaultFNB',
        ]),
        rightContainerWidth() {
            return `calc(100vw - ${styles.gnbWidth} - ${this.leftContainerWidth + this.draggerWidth}px)`;
        },
    },
    created() {
        this.hideDefaultFNB();
    },
    beforeDestroy() {
        this.showDefaultFNB();
    },
    methods: {
        ...mapActions('layout', [
            'showDefaultFNB',
            'hideDefaultFNB',
        ]),
        ...mapMutations('layout', [
            'setVerticalLeftWidth',
        ]),
        onMousedown() {
            this.dragging = true;
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
                /**
                 * TODO: Delete codes below to remove dependencies between tree component and this.
                 *       For the logic below, please use the event 'move'.
                 */
                this.$store.commit('setVerticalLeftWidth', this.leftContainerWidth);
                // const widthKey = `${this.$parent.$parent.$options.name}_treeWidth`;
                // localStorage[widthKey] = this.leftContainerWidth;
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
        display: flex;
    }
    .content-container {
        overflow: scroll;
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
    .dragger-container {
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
