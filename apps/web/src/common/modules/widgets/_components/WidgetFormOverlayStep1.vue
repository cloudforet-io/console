<script lang="ts" setup>
import {
    computed, onMounted, onUnmounted, reactive, ref,
} from 'vue';

import {
    PToolboxTable, PI, PTooltip,
} from '@spaceone/design-system';

import { i18n } from '@/translations';

import WidgetFormDataSourcePopover from '@/common/modules/widgets/_components/WidgetFormDataSourcePopover.vue';

const dataTableContentsRef = ref<HTMLElement|null>(null);

const state = reactive({
    // data table
    fields: computed(() => [
        { name: 'key', label: 'something', type: 'item' },
        { name: 'value', label: 'table', type: 'item' },
    ]),
    selectedData: undefined as string|undefined,
});

const displayState = reactive({
    dataTableAreaOpen: true,
    tableAreaHeight: (dataTableContentsRef.value?.clientHeight || 1000) / 5,
    minHeight: 32,
    resizerStyle: computed(() => ({
        bottom: `${displayState.tableAreaHeight}px`,
        cursor: displayState.dataTableAreaOpen ? 'ns-resize' : 'auto',
    })),
    tableContainerStyle: computed(() => ({
        height: `${displayState.tableAreaHeight}px`,
        minHeight: `${displayState.minHeight}px`,
        width: '100%',
    })),
    tableStyle: computed(() => ({
        height: `${displayState.tableAreaHeight}px`,
        minHeight: `${(dataTableContentsRef.value?.clientHeight || 1000) / 5}px`,
    })),
    resizing: false,
    clientY: null,
    transition: false,
});


/* Event */

/* Hide Toggle */
const offTransition = () => { displayState.transition = false; };
const handleToggleDataTableArea = () => {
    if (displayState.dataTableAreaOpen) {
        displayState.dataTableAreaOpen = false;
        displayState.transition = true;
        displayState.minHeight = 0;
        displayState.tableAreaHeight = 0;
        setTimeout(offTransition, 500);
    } else {
        displayState.dataTableAreaOpen = true;
        displayState.transition = true;
        displayState.tableAreaHeight = (dataTableContentsRef.value?.clientHeight || 1000) / 5;
        setTimeout(offTransition, 500);
    }
};

/* Resizing */
const startResizing = () => {
    if (!displayState.dataTableAreaOpen) return;
    displayState.resizing = true;
};
const isResizing = (event) => {
    if (displayState.resizing) {
        if (displayState.clientY === null) {
            displayState.clientY = event.clientY;
            return;
        }
        const delta = -event.movementY;
        const height = displayState.tableAreaHeight + delta;
        if (!(height <= displayState.minHeight || height > (dataTableContentsRef.value?.clientHeight || 1000) - 32)) {
            displayState.tableAreaHeight = height;
        }
        displayState.clientY = event.clientY;
    }
};
const endResizing = () => {
    displayState.resizing = false;
    displayState.clientY = null;
};
const documentEventMount = (eventName: string, func: any) => {
    onMounted(() => document.addEventListener(eventName, func));
    onUnmounted(() => document.removeEventListener(eventName, func));
};

documentEventMount('mousemove', isResizing);
documentEventMount('mouseup', endResizing);
</script>

<template>
    <div class="sidebar-contents">
        <div ref="dataTableContentsRef"
             class="data-table-contents"
        >
            <div class="data-source-wrapper">
                <widget-form-data-source-popover />
                <!--                <widget-form-data-source-card />-->
            </div>
            <div class="resizer-area"
                 :style="displayState.resizerStyle"
                 @mousedown="startResizing"
            >
                <hr v-if="displayState.dataTableAreaOpen"
                    class="resizer-bar"
                >
                <p-tooltip :contents="displayState.dataTableAreaOpen ? $t('COMPONENT.VERTICAL_LAYOUT.COLLAPSE') : $t('COMPONENT.VERTICAL_LAYOUT.EXPAND')"
                           position="top"
                           :class="{ 'data-table-hide-button': true, 'hide': !displayState.dataTableAreaOpen }"
                           @click="handleToggleDataTableArea"
                >
                    <p-i class="hide-icon"
                         :name="displayState.dataTableAreaOpen ? 'ic_chevron-down': 'ic_chevron-up'"
                         size="sm"
                         color="inherit"
                    />
                </p-tooltip>
            </div>
            <div class="data-table-area"
                 :class="{ 'transition': displayState.transition }"
                 :style="displayState.tableContainerStyle"
            >
                <div class="data-table-wrapper">
                    <p-toolbox-table :fields="state.fields"
                                     :style="displayState.tableStyle"
                                     :items="[]"
                                     :searchable="false"
                                     :page-size-changeable="false"
                                     :refreshable="false"
                                     class="view-table-wrapper"
                    >
                        <template #toolbox-left>
                            <div class="toolbox-left-wrapper">
                                <span class="view-table-title">
                                    {{ i18n.t('DASHBOARDS.WIDGET.OVERLAY.STEP_1.DATA_TABLE') }}
                                </span>
                            </div>
                        </template>
                    </p-toolbox-table>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.sidebar-contents {
    width: 100%;
    display: flex;
    gap: 1rem;
    padding: 0 1.5rem 1rem 1.5rem;
    .data-table-contents {
        @apply bg-gray-150 rounded-md relative;
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        padding: 0.125rem;
        .data-source-wrapper {
            flex: 1;
            overflow: auto;
            padding: 1rem;
        }
        .resizer-area {
            @apply absolute w-full flex items-center justify-center;
            padding: 0.5rem 1rem;
            transition: top 0.2s;
            z-index: 1;

            .resizer-bar {
                @apply w-full bg-blue-600;
                height: 0.0625rem;
                opacity: 0;
            }

            &:hover {
                cursor: ns-resize;
                .resizer-bar {
                    opacity: 1;
                }
            }

            .data-table-hide-button {
                @apply absolute flex items-center justify-center bg-white border border-gray-300 rounded-full text-gray-600 cursor-pointer;
                width: 1.5rem;
                height: 1.5rem;
                left: 0.75rem;
                top: 0.375rem;
                z-index: 2;
                &.hide {
                    @apply bg-white justify-end;
                    top: -0.125rem;
                    height: 1.5rem;
                    margin-top: -0.375rem;
                    border-bottom-left-radius: 50%;
                    border-bottom-right-radius: 50%;
                    border-bottom: 0;
                    &:hover {
                        @apply text-secondary;
                        top: -1.125rem;
                        height: 2.5rem;
                        .hide-icon {
                            margin-top: -1rem;
                        }
                    }
                }
                &:hover {
                    @apply bg-blue-200 cursor-pointer;
                }
            }
        }
        .data-table-area {
            @apply relative;
            height: 20%;
            max-height: calc(100% - 2rem);

            &.transition {
                transition: height 0.2s;
            }

            .data-table-wrapper {
                height: 100%;
                overflow-y: scroll;

                .view-table-wrapper {
                    @apply rounded-md;

                    .toolbox-left-wrapper {
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;
                        .view-table-title {
                            @apply text-label-lg font-bold;
                        }
                    }
                }
            }
        }
    }
}
</style>
