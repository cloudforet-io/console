<template>
    <div class="vertical-container" :style="{height: height}">
        <div class="sidebar-container" :style="sbContainerStyle"
             :class="{transition:transition}"
        >
            <div :style="sbStyle">
                <slot name="sidebar" v-bind="{width, hide, transition, height}" />
            </div>
        </div>
        <div class="resizer-container line"
             @mousedown="startResizing"
             @mousemove="isResizing"
             @mouseup="endResizing"
        >
            <span class="resizer">
                <span @click="hideSidebar">
                    <slot name="hide-button">
                        <p-i class="btn-vertical-hide"
                             width="1.25rem"
                             height="1.25rem"
                             :name="hide ? 'btn_ic_tree_hidden—folded' : 'btn_ic_tree_hidden'"
                             :color="hide ? undefined : 'white primary3'"
                        />
                    </slot>
                </span>
            </span>
        </div>
        <div class="main" :style="mainStyle">
            <slot />
        </div>
    </div>
</template>

<script lang="ts">
import {
    toRefs, reactive, computed, onMounted, onUnmounted,
} from '@vue/composition-api';
import PI from '@/components/atoms/icons/PI.vue';

const documentEventMount = (eventName: string, func: any) => {
    onMounted(() => document.addEventListener(eventName, func));
    onUnmounted(() => document.removeEventListener(eventName, func));
};

export default {
    name: 'PVerticalLayout',
    components: {
        PI,
    },
    props: {
        height: {
            type: String,
            default: '100%',
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
            resizing: false,
            clientX: null,
            hide: false,
            transition: false,
            sbContainerStyle: computed(() => ({
                width: `${state.width}px`,
                height: '100%',
                'overflow-y': 'auto',
                'overflow-x': 'hidden',
            })),
            sbStyle: computed(() => ({
                width: 'auto',
                // height: '100%',
                minWidth: `${props.minWidth}px`,
                maxWidth: `${props.maxWidth}px`,
                opacity: state.hide && !state.transition ? 0 : 1,
                overflowY: 'auto',
                overflowX: 'hidden',
                height: '100%',
            })),
            mainStyle: computed(() => ({
                width: `calc( 100% - ${state.width}px )`,
                height: props.height,
            })),
        });

        /* Resizing */
        const isResizing = (event) => {
            if (state.resizing) {
                if (state.clientX === null) {
                    state.clientX = event.clientX;
                    return;
                }
                const delta = state.clientX - event.clientX;
                const width = state.width - delta;
                if (!(width <= props.minWidth || width > props.maxWidth)) {
                    state.width = width;
                }
                state.clientX = event.clientX;
            }
            event.preventDefault();
        };
        const endResizing = () => {
            state.resizing = false;
            state.clientX = null;
        };
        const startResizing = () => {
            state.resizing = true;
        };

        /* Toggle hide Sidebar */
        const offTransition = () => { state.transition = false; };
        const hideSidebar = () => {
            if (!state.hide) {
                state.hide = true;
                state.transition = true;
                state.width = 10;
                setTimeout(offTransition, 500);
            } else {
                state.width = props.initWidth;
                state.transition = true;
                state.hide = false;
                setTimeout(offTransition, 500);
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

<style lang="postcss" scoped>
    .vertical-container {
        display: flex;
        width: 100%;
        flex-direction: row;
        z-index: 1;
        padding: 0;
        margin: unset;
    }
    .sidebar-container {
        &.transition {
            transition: width 0.5s;
        }
    }
    .main {
        display: flex;
        flex-direction: column;
        justify-content: stretch;

        /* flex-grow: 1; */
        overflow-x: hidden;
        overflow-y: auto;
    }
    .resizer-container {
        display: flex;
        align-items: flex-start;
        justify-content: center;
        width: 1px;
        &.line {
            @apply border-l border-gray-200;
            background-color: transparent;
            &:hover {
                @apply border-l border-secondary;
                cursor: ew-resize;
            }
        }
        &.prohibit-line {
            @apply border-l  border-gray-200;
            background-color: transparent;
            &:hover {
                @apply border-l border-secondary;
            }
        }
        .resizer {
            @apply text-gray-400;
            display: inline-block;
            font-size: 1.5rem;
            font-weight: 600;
            text-align: center;
            z-index: 99;
            cursor: col-resize;
            > span {
                margin-right: 0.65rem;
                cursor: pointer;
            }
        }
        .btn-vertical-hide {
            margin-top: 1rem;
            margin-left: 0.5rem;
            justify-content: center;
            &:hover {
                @apply text-secondary;
            }
        }
    }
</style>
