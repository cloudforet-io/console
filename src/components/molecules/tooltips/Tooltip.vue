<template>
    <div class="p-tooltip">
        <div
            ref="target"
            class="target"
            @mouseover="show"
            @mouseout="hide"
        >
            <slot name="target" />
        </div>
        <div
            v-if="visible"
            ref="contents"
            class="tooltip-container"
            :style="computedStyle"
        >
            <slot name="contents">
                {{ contents }}
            </slot>
        </div>
    </div>
</template>

<script>
export default {
    name: 'PTooltip',
    props: {
        contents: {
            type: String,
            default: null,
        },
        position: {
            type: String,
            default: 'right',
            validator(val) {
                return ['right', 'left', 'top', 'bottom'].includes(val);
            },
        },
    },
    data() {
        return {
            isMounted: false,
            visible: false,
        };
    },
    computed: {
        targetElement() {
            return this.isMounted ? this.$refs.target : null;
        },
        targetWidth() {
            return this.targetElement ? this.targetElement.clientWidth : 0;
        },
        targetHeight() {
            return this.targetElement ? this.targetElement.clientHeight : 0;
        },
        contentsElement() {
            return this.isMounted ? this.$refs.contents : null;
        },
        contentsWidth() {
            return this.contentsElement ? this.contentsElement.clientWidth : 0;
        },
        contentsHeight() {
            return this.contentsElement ? this.contentsElement.clientHeight : 0;
        },
        computedStyle() {
            if (this.position === 'right') {
                return { left: `${this.targetWidth}px`, top: 0 };
            }
            if (this.position === 'left') {
                console.log(this.contentsWidth);
                return { left: `${-this.contentsWidth}px`, top: 0 };
            }
            if (this.position === 'bottom') {
                return { left: 'unset', top: `${this.targetHeight}px` };
            }
            if (this.position === 'top') {
                return { left: 'unset', top: 0 };
            }
            return {};
        },
    },
    mounted() {
        this.isMounted = true;
    },
    updated() {
        console.log('upadted')
    },
    methods: {
        show() {
            if (this.targetElement) {
                this.visible = true;
            }
        },
        hide() {
            this.visible = false;
        },
    },
};
</script>

<style lang="scss" scoped>
    .p-tooltip {
        position: relative;
    }
    .target {
        position: relative;
    }
    .tooltip-container {
        position: absolute;
    }
</style>
