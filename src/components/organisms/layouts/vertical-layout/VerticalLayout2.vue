<template>
    <div class="container" :style="{height:height, width: '100%'}">
        <div class="sidebar" :style="{width:`${width}px`}">
            <slot name="sidebar" :width="width"></slot>
        </div>
        <div class="dragger-container line"
             @mousedown="startResizing"
             @mousemove="isResizing"
             @mouseup="endResizing"
        >
            <span class="dragger">
                <span @mouseenter="mouseOnOver(true)" @mouseleave="mouseOnOver(false)">
                    <slot name="dragger">
                        <p-i v-if="true"
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
        <div class="main" style="width: 100%;">
            <slot></slot>
        </div>
    </div>
</template>

<script>
import {
    toRefs, reactive, ref, computed,
} from '@vue/composition-api';
import PI from '@/components/atoms/icons/PI.vue';
import { documentEventMount } from '@/lib/compostion-util';

export default {
    name: 'VerticalLayout2',
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
    components: {
        PI,
    },
    setup(props, context) {
        const state = reactive({
            width: props.initWidth,
            resizeFlag: false,
            before: props.initWidth,
        });

        const isResizing = (event) => {
            if (props.resizeFlag) {
                const delta = event.clientX - state.before;
                const width = state.width + delta;
                state.before = event.clientX;

                if (!(width <= props.minWidth || width > props.maxWidth)) {
                    state.width = width;
                }

                console.debug('isResizing', event);
            }
        };
        const endResizing = (event) => {
            props.resizeFlag = false;
            console.debug('endResizing', event);
        };

        const startResizing = (event) => {
            props.resizeFlag = true;
            console.debug('startResizing', event.clientX);
        };
        documentEventMount('mousemove', isResizing);
        documentEventMount('mouseup', endResizing);
        return {
            ...toRefs(state),
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
        flex-direction: row;
        z-index: 1;
    }
    .sidebar {
        /*flex: 1; prevents resize!*/
    }
    .resizer {
        cursor: col-resize;
        border-left: 10px solid $gray;
        z-index: 2;
    }
    .main {
        /*flex-grow: 1;*/
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
        }
    }
</style>
