<script lang="ts" setup>
import {
    computed, onMounted, onUnmounted, reactive, ref,
} from 'vue';

import {
    PI, PTooltip,
} from '@spaceone/design-system';

import WidgetFormDataSourcePopover from '@/common/modules/widgets/_components/WidgetFormDataSourcePopover.vue';
import WidgetFormDataTableCard from '@/common/modules/widgets/_components/WidgetFormDataTableCard.vue';
import WidgetFormOverlayPreviewTable from '@/common/modules/widgets/_components/WidgetFormOverlayPreviewTable.vue';
import { useWidgetGenerateStore } from '@/common/modules/widgets/_store/widget-generate-store';

const widgetGenerateStore = useWidgetGenerateStore();
const widgetGenerateState = widgetGenerateStore.state;

const dataTableContentsRef = ref<HTMLElement|null>(null);

const storeState = reactive({
    dataTables: computed(() => widgetGenerateState.dataTables),
});

const displayState = reactive({
    dataTableAreaOpen: true,
    tableAreaHeight: (dataTableContentsRef.value?.clientHeight || 1000) / 4,
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

onMounted(async () => {
    // Reset Join Restricted Map at init Data Table form init
    widgetGenerateStore.setJoinRestrictedMap({});

    // Initial Load
    if (widgetGenerateState.selectedDataTableId) {
        widgetGenerateStore.setDataTableUpdating(true);
        await widgetGenerateStore.loadDataTable({
            data_table_id: widgetGenerateState.selectedDataTableId,
        });
    }
});

</script>

<template>
    <div class="sidebar-contents">
        <div ref="dataTableContentsRef"
             class="data-table-contents"
        >
            <div class="data-table-area">
                <div class="data-table-scroll-wrapper">
                    <div class="data-table-contents-wrapper">
                        <widget-form-data-table-card v-for="(dataTable) in storeState.dataTables"
                                                     :key="`data-table-${dataTable.data_table_id}`"
                                                     :item="dataTable"
                        />
                        <widget-form-data-source-popover />
                    </div>
                </div>
                <div class="gradation-bottom-area" />
                <div class="gradation-top-area" />
                <div class="gradation-left-area" />
                <div class="gradation-right-area" />
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
            <div class="preview-table-area"
                 :class="{ 'transition': displayState.transition, 'unselectable': displayState.resizing }"
                 :style="displayState.tableContainerStyle"
            >
                <widget-form-overlay-preview-table />
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
        @apply bg-gray-100 border border-gray-150 rounded-md relative w-full flex flex-col;
        .data-table-area {
            @apply relative flex-1 h-full w-full;
            //padding: 1rem 1rem 1.125rem;
            //margin-bottom: 1.125rem;
            overflow: hidden;
            .data-table-scroll-wrapper {
                height: 100%;
                width: 100%;
                overflow: auto;
                .data-table-contents-wrapper {
                    @apply flex gap-4;
                    padding: 1rem 1rem 1.125rem;
                    height: auto;
                    width: auto;
                }
            }

            .gradation-bottom-area {
                @apply absolute;
                width: 100%;
                height: 1.5rem;
                bottom: 0;
                background: linear-gradient(180deg, rgba(247, 247, 247, 0) 0%, theme('colors.gray.150') 100%);
                z-index: 1;
            }
            .gradation-top-area {
                @apply absolute;
                width: 100%;
                height: 1.25rem;
                top: 0;
                background: linear-gradient(180deg, theme('colors.gray.150') 0%, rgba(247, 247, 247, 0) 100%);
                z-index: 1;
            }
            .gradation-left-area {
                @apply absolute;
                width: 1.25rem;
                height: 100%;
                left: 0;
                top: 0;
                background: linear-gradient(90deg, theme('colors.gray.150') 0%, rgba(247, 247, 247, 0) 100%);
                z-index: 1;
            }
            .gradation-right-area {
                @apply absolute;
                width: 1.5rem;
                height: 100%;
                right: 0;
                top: 0;
                background: linear-gradient(90deg, rgba(247, 247, 247, 0) 0%, theme('colors.gray.150') 100%);
                z-index: 1;
            }
        }
        .resizer-area {
            @apply absolute flex items-center justify-center;
            width: calc(100% - 0.25rem);
            padding: 0 1rem;
            transition: top 0.2s;
            z-index: 1;
            .resizer-bar {
                @apply relative w-full bg-blue-600;
                margin: 0.5rem 0;
                height: 0.0625rem;
                opacity: 0;
                z-index: 2;
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
                top: 0.3125rem;
                z-index: 2;
                &.hide {
                    @apply bg-white justify-end;
                    top: -0.125rem;
                    height: 1.5rem;
                    margin-top: -1.375rem;
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
        .preview-table-area {
            @apply rounded-lg overflow-hidden;
            height: 20%;
            max-height: calc(100% - 2rem);
            padding: 0 0.125rem 0.125rem 0.125rem;

            &.transition {
                transition: height 0.2s;
            }
            &.unselectable {
                user-select: none;
            }

            .data-table-wrapper {
                height: 100%;
                overflow-y: scroll;

                .view-table-wrapper {
                    @apply rounded-md;

                    :deep(.p-toolbox) {
                        padding: 1rem 1rem 0;
                        .toolbox-left {
                            @apply h-full;
                        }
                    }

                    .toolbox-left-wrapper {
                        @apply flex items-center;
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
