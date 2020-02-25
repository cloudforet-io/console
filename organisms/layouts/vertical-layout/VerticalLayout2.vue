<template>
    <div class="container" :style="{height:height}">
        <div class="sidebar-container" :style="{width:`${width}px`}"
             :class="{transition:transitionFlag}"
        >
            <div v-show="width >= minWidth && !transitionFlag">
                <slot name="sidebar" :width="width" />
            </div>
        </div>
        <div class="dragger-container line"
             @mousedown="startResizing"
             @mousemove="isResizing"
             @mouseup="endResizing"
        >
            <span class="dragger">
                <span @click="hideSidebar">
                    <slot name="dragger">
                        <p-i v-if="!hideFlag"
                             class="btn-vertical-dragger"
                             :width="'1rem'"
                             :height="'1rem'"
                             :name="'btn_ic_tree_hidden'"
                        />
                        <p-i v-else
                             class="btn-vertical-dragger"
                             :width="'1rem'"
                             :height="'1rem'"
                             :name="'btn_ic_tree_hidden—folded'"
                        />
                    </slot>
                </span>
            </span>
        </div>
        <div class="main">
            <slot />
        </div>
    </div>
</template>

<script>
import {
    toRefs, reactive, ref, computed,
} from '@vue/composition-api';
import PI from '@/components/atoms/icons/PI.vue';
import { documentEventMount } from '@/lib/compostion-util';
import styles from '@/styles/_variables.scss';

export default {
    name: 'VerticalLayout2',
    components: {
        PI,
    },
    props: {
        height: {
            type: String,
            default: '620px',
        },
        initWidth: {
            type: Number,
            default: 300,
        },
        minWidth: {
            type: Number,
            default: 100,
        },
        maxWidth: {
            type: Number,
            default: 500,
        },
    },
    setup(props, context) {
        const state = reactive({
            width: props.initWidth,
            resizeFlag: false,
            hideFlag: false,
            before: props.initWidth,
            transitionFlag: false,
        });

        const isResizing = (event) => {
            if (state.resizeFlag) {
                const delta = event.screenX - state.before;
                const width = state.width + delta;
                state.before = event.screenX;
                if (!(width <= props.minWidth || width > props.maxWidth)) {
                    state.width = width;
                }
            }
        };
        const endResizing = (event) => {
            state.resizeFlag = false;
        };
        const startResizing = (event) => {
            state.resizeFlag = true;
        };
        const hideSidebar = () => {
            if (!state.hideFlag) {
                state.hideFlag = true;
                state.transitionFlag = true;
                state.width = 0;
                setTimeout(() => {
                    state.transitionFlag = false;
                }, 300);
            } else {
                state.width = props.initWidth;
                state.transitionFlag = true;
                state.hideFlag = false;
                setTimeout(() => {
                    state.transitionFlag = false;
                }, 300);
            }
        };
        documentEventMount('mousemove', isResizing);
        documentEventMount('mouseup', endResizing);
        return {
            ...toRefs(state),
            hideSidebar,
            startResizing,
            isResizing,
            endResizing,
        };
    },
};
</script>

<style lang="scss" scoped>
    .container {
        display: flex;
        height: 100%;
        width: 100%;
        flex-direction: row;
        z-index: 1;
    }
    .sidebar-container {
        /*flex: 1; prevents resize!*/
        &.transition {
            transition:  width 0.3s;
        }
    }

    .resizer {
        cursor: col-resize;
        border-left: 10px solid $gray;
        z-index: 2;
    }
    .main {
        flex-grow: 1;
        width: 100%;
    }

    .dragger-container {
        display: flex;
        align-items: flex-start;
        justify-content: center;
        width: 0.1rem;
        &.line {
            border-left: 1px solid $lightgray;
            background-color: transparent;
            &:hover {
                border-left: 1px solid $secondary;
                cursor: ew-resize;
            }
        }
        &.prohibit-line {
            border-left: 1px solid $lightgray;
            background-color: transparent;
            &:hover {
                border-left: 1px solid $secondary;
            }
        }

        .dragger {
            display: inline-block;
            height: 30px;
            font-size: 1.5rem;
            font-weight: 600;
            text-align: center;
            z-index: 99;
            cursor: col-resize;
            color: $darkgray;
            > span {
                margin-right: 26px;
                cursor: pointer;
            }
        }
        .btn-vertical-dragger{
            margin-top: 1rem;
            margin-left: 1.5rem;
            justify-content: center;
            color: $darkgray;
            &:hover {
                color: $secondary;
            }
        }
    }
</style>
