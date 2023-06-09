<template>
    <div class="p-vertical-layout"
         :style="{height: height}"
    >
        <div class="sidebar-container"
             :style="state.sidebarContainerStyle"
             :class="{transition:state.transition}"
        >
            <div :style="state.sidebarStyle">
                <slot name="sidebar"
                      v-bind="{ width: state.width, hide: state.hide, transition: state.transition, height}"
                />
            </div>
        </div>
        <div class="resizer-container line"
             :class="{transition:state.transition}"
             :style="state.resizerStyle"
             @mousedown="startResizing"
             @mousemove="isResizing"
             @mouseup="endResizing"
        >
            <span class="resizer"
                  :class="{ 'hide': state.hide}"
            >
                <span @click="hideSidebar">
                    <slot name="resizer-button">
                        <p-i class="resizer-button"
                             width="1.25rem"
                             height="1.25rem"
                             :name="state.hide ? 'ic_chevron-right-circle-filled' : 'ic_chevron-right-circle'"
                             :color="state.hide ? 'primary2 white' : 'white inherit'"
                        />
                    </slot>
                </span>
            </span>
        </div>
        <div class="main"
             :style="state.mainStyle"
        >
            <slot />
        </div>
    </div>
</template>

<script setup lang="ts">
import {
    reactive, computed, onMounted, onUnmounted,
} from 'vue';

import PI from '@/foundation/icons/PI.vue';

interface Props {
    height: string;
    initWidth: number;
    minWidth: number;
    maxWidth: number;
}
const SCREEN_WIDTH_SM = 767;

const documentEventMount = (eventName: string, func: any) => {
    onMounted(() => document.addEventListener(eventName, func));
    onUnmounted(() => document.removeEventListener(eventName, func));
};


const props = withDefaults(defineProps<Props>(), {
    height: '100%',
    initWidth: 300,
    minWidth: 100,
    maxWidth: 500,
});

const state = reactive({
    width: props.initWidth,
    resizing: false,
    clientX: null,
    hide: false,
    transition: false,
    sidebarContainerStyle: computed(() => ({
        width: `${state.width}px`,
        height: '100%',
        'overflow-y': 'auto',
        'overflow-x': 'hidden',
    })),
    sidebarStyle: computed(() => ({
        width: 'auto',
        // height: '100%',
        minWidth: `${props.minWidth}px`,
        maxWidth: `${props.maxWidth}px`,
        opacity: state.hide && !state.transition ? 0 : 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        height: '100%',
    })),
    resizerStyle: computed(() => ({
        left: `${state.width}px`,
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
    // event.preventDefault();
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

const detectWindowResizing = () => {
    if (!state.hide) {
        if (window.innerWidth <= SCREEN_WIDTH_SM) {
            state.hide = false;
            hideSidebar();
        } else {
            state.hide = true;
            hideSidebar();
        }
    }
};

detectWindowResizing();
window.addEventListener('resize', detectWindowResizing);

</script>

<style lang="postcss">
.p-vertical-layout {
    display: flex;
    width: 100%;
    flex-direction: row;
    padding: 0;
    margin: unset;

    > .sidebar-container {
        @apply bg-white;
        box-shadow: 1px 0 0.25rem rgba(0, 0, 0, 0.12);
        &.transition {
            transition: width 0.2s;
        }
    }
    > .main {
        display: flex;
        flex-direction: column;
        justify-content: stretch;

        /* flex-grow: 1; */
        overflow-x: hidden;
        overflow-y: auto;
    }
    > .resizer-container {
        display: flex;
        align-items: flex-start;
        justify-content: center;
        position: sticky;
        top: 0;
        height: 100%;
        width: 0;
        &.transition {
            transition: left 0.2s;
        }
        &.line {
            @apply border-l border-transparent;
            background-color: transparent;
            &:hover {
                @apply border-l border-secondary;
                cursor: ew-resize;
            }
        }
        .resizer {
            @apply text-gray-400;
            display: inline-block;
            position: absolute;
            font-size: 1.5rem;
            font-weight: 600;
            text-align: center;
            z-index: 1;
            cursor: col-resize;
            > span {
                margin-right: 0.65rem;
                cursor: pointer;
            }
            &.hide {
                @apply text-primary-2;
            }
        }
        .resizer-button {
            margin-top: 1rem;
            margin-left: 0.55rem;
            justify-content: center;
            &:hover {
                @apply text-secondary;
            }
        }
    }
}
</style>
