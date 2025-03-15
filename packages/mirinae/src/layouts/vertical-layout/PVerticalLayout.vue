<script lang="ts" setup>
import {
    reactive, computed, onMounted, onUnmounted, onBeforeMount, ref,
} from 'vue';

import screens from 'mirinae-foundation/screens.cjs';

import PTooltip from '@/data-display/tooltips/PTooltip.vue';
import PI from '@/foundation/icons/PI.vue';


const MOBILE_WIDTH = '312';

interface Props {
    height?: string;
    initWidth?: number;
    minWidth?: number;
    maxWidth?: number;
    enableDoubleClickResize? : boolean;
}

const props = withDefaults(defineProps<Props>(), {
    height: '100%',
    initWidth: 240,
    minWidth: 100,
    maxWidth: 500,
    enableDoubleClickResize: false,
});

const documentEventMount = (eventName: string, func: any) => {
    onMounted(() => document.addEventListener(eventName, func));
    onUnmounted(() => document.removeEventListener(eventName, func));
};

const state = reactive({
    isMobileSize: false,
    width: props.initWidth,
    resizing: false,
    clientX: null,
    hide: false,
    transition: false,
    isHover: false,
    sidebarContainerStyle: computed(() => ({
        width: `${state.width}px`,
        height: '100%',
        'overflow-y': 'auto',
        'overflow-x': 'hidden',
        ...(state.isMobileSize && {
            position: 'absolute',
            zIndex: 1,
        }),
    })),
    sidebarStyle: computed(() => ({
        width: 'auto',
        minWidth: `${props.minWidth}px`,
        maxWidth: `${props.maxWidth}px`,
        opacity: state.hide && !state.transition ? 0 : 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        height: '100%',
    })),
    resizerStyle: computed(() => ({
        left: `${state.width}px`,
        width: 'fit-content',
    })),
    resizerLineStyle: computed(() => ({
    // eslint-disable-next-line no-nested-ternary
        width: state.hide ? 0 : state.isHover ? '2px' : '1px',
    })),
    mainStyle: computed(() => ({
        width: state.isMobileSize ? '100%' : `calc( 100% - ${state.width}px )`,
        height: props.height,
    })),
});

const leftLayoutContentBox = ref<null|HTMLElement>(null);

const resize = (delta: number) => {
    const minimumWidth = props.minWidth;
    const maximumWidth = props.maxWidth;

    if (Number.isNaN(delta)) {
        return;
    }

    const newWidth = Math.min(Math.max(delta, minimumWidth), maximumWidth);

    if (state.width !== newWidth) {
        state.width = newWidth;
    }
};
/* Resizing */
const isResizing = (event) => {
    if (state.resizing) {
        if (state.clientX === null) {
            state.clientX = event.clientX;
            return;
        }
        const delta = state.clientX - event.clientX;
        const width = (state.isMobileSize ? MOBILE_WIDTH : state.width) - delta;
        if (!(width <= props.minWidth || width > props.maxWidth)) {
            resize(width);
        }
        state.clientX = event.clientX;
        state.isHover = true;
    }
};
const endResizing = () => {
    state.resizing = false;
    state.clientX = null;
    state.isHover = false;
};
const startResizing = () => {
    state.resizing = true;
    state.isHover = true;
};

/* Toggle hide Sidebar */
const offTransition = () => { state.transition = false; };
const handleSidebarToggle = () => {
    if (!state.hide) {
        state.hide = true;
        state.transition = true;
        state.width = 0;
        setTimeout(offTransition, 500);
    } else {
        state.width = state.isMobileSize ? MOBILE_WIDTH : props.initWidth;
        state.transition = true;
        state.hide = false;
        setTimeout(offTransition, 500);
    }
};

const detectWindowResizing = () => {
    state.isMobileSize = window.innerWidth <= screens.mobile.max;
    if (!state.hide) {
        if (state.isMobileSize) {
            state.hide = false;
            handleSidebarToggle();
        } else {
            state.hide = true;
            handleSidebarToggle();
        }
    }
};

const handleControllerDoubleClick = () => {
    const minimumWidth = props.minWidth;
    const maximumWidth = props.maxWidth;

    if (state.width === maximumWidth) {
        resize(minimumWidth);
        return;
    }
    if (state.width === minimumWidth) {
        resize(maximumWidth);
        return;
    }


    if (state.width <= (maximumWidth + minimumWidth) / 2) {
        resize(maximumWidth);
    } else {
        resize(minimumWidth);
    }
};

documentEventMount('mousemove', isResizing);
documentEventMount('mouseup', endResizing);
documentEventMount('resize', detectWindowResizing);

onBeforeMount(() => {
    detectWindowResizing();
});
</script>

<template>
    <div class="p-vertical-layout"
         :style="{height: props.height}"
    >
        <div class="sidebar-container"
             :style="state.sidebarContainerStyle"
             :class="{transition: state.transition}"
        >
            <div
                ref="leftLayoutContentBox"
                :style="state.sidebarStyle"
            >
                <slot
                    name="sidebar"
                    v-bind="{width: Number(state.width), hide: state.hide, transition: state.transition, height: props.height}"
                />
            </div>
        </div>
        <div class="resizer-container"
             :class="{transition: state.transition, hover: state.isHover}"
             :style="state.resizerStyle"
             @mousedown="startResizing"
             @mousemove="isResizing"
             @mouseup="endResizing"
             @mouseenter="state.isHover = true"
             @mouseleave="state.isHover = false"
        >
            <div class="resizer-content"
                 :class="{hover: state.isHover}"
            >
                <div class="line"
                     :class="{hover: state.isHover}"
                     :style="state.resizerLineStyle"
                >
                    <div
                        v-if="enableDoubleClickResize"
                        class="controller"
                        :class="{hover: state.isHover && !state.hide}"
                        @dblclick="handleControllerDoubleClick"
                    />
                </div>
                <p-tooltip :contents="state.hide ? String($t('COMPONENT.VERTICAL_LAYOUT.EXPAND')) : String($t('COMPONENT.VERTICAL_LAYOUT.COLLAPSE'))"
                           position="right"
                           :class="{hide: state.hide}"
                           class="resizer"
                           @click="handleSidebarToggle"
                >
                    <span class="resizer-button">
                        <slot name="resizer-button">
                            <p-i width="1.5rem"
                                 height="1.5rem"
                                 :name="state.hide ? 'ic_chevron-right' : 'ic_chevron-left'"
                                 color="inherit"
                            />
                        </slot>
                    </span>
                </p-tooltip>
            </div>
        </div>
        <div
            class="main"
            :class="{transition: state.transition}"
            :style="state.mainStyle"
        >
            <slot />
        </div>
    </div>
</template>

<style lang="postcss">
.p-vertical-layout {
    display: flex;
    position: relative;
    width: 100%;
    flex-direction: row;
    padding: 0;
    margin: unset;

    > .sidebar-container {
        @apply bg-white;
        &.transition {
            transition: width 0.2s;
        }
    }
    > .main {
        display: flex;
        flex-direction: column;
        justify-content: stretch;

        overflow-x: hidden;
        overflow-y: auto;
        &.transition {
            transition: width 0.2s;
        }
    }
    > .resizer-container {
        position: absolute;
        top: 0;
        height: 100%;
        width: 0;
        z-index: 1;
        border: none;
        .resizer-content {
            position: relative;
            height: 100%;
            width: fit-content;
            display: flex;
            justify-content: center;
            .transition {
                transition: left 0.2s;
            }
            .line {
                @apply bg-gray-200;
                position: absolute;
                height: 100%;
                &.hover {
                    @apply bg-blue-600;
                    cursor: ew-resize;
                    left: 50%;
                    transform: translateX(-50%);
                }
            }
            .resizer {
                @apply absolute flex items-center justify-center bg-white border border-gray-300 rounded-full text-gray-600 cursor-pointer;
                width: 1.5rem;
                height: 1.5rem;
                margin-top: 1.25rem;
                top: 0;
                font-size: 1.5rem;
                font-weight: 600;
                z-index: 1;
                cursor: col-resize;
                &.hide {
                    @apply bg-white justify-end;
                    left: -1px;
                    width: 1.25rem;
                    margin-right: -0.25rem;
                    border-top-left-radius: 50%;
                    border-bottom-left-radius: 50%;
                    border-left: 0;
                    .resizer-button > svg {
                        margin-right: -0.125rem;
                    }
                    &:hover {
                        @apply text-secondary;
                        width: 2.5rem;
                        .resizer-button > svg {
                            margin-right: 0;
                        }
                    }
                }
                &:hover {
                    @apply bg-blue-200 cursor-pointer;
                }
            }
            .controller {
                @apply absolute border border-gray-300 rounded-md bg-white;
                width: 0.4rem;
                height: 1.5rem;
                top: calc(50% - 1.5rem / 2);
                opacity: 0;
                left: 50%;
                transform: translateX(-50%);
                &.hover {
                    @apply border-blue-600;
                    opacity: 1;
                }
                &:hover {
                    @apply bg-blue-200;
                    opacity: 1;
                    width: 0.6rem;
                    cursor: col-resize;
                }
            }
        }
    }
}
</style>
