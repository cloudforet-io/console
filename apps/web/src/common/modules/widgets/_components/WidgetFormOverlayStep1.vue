<script lang="ts" setup>
import {
    computed, onMounted, onUnmounted, reactive, ref,
} from 'vue';

import { orderBy } from 'lodash';

import {
    PI, PTooltip, PButton,
} from '@cloudforet/mirinae';

import type { PrivateDataTableModel } from '@/api-clients/dashboard/private-data-table/schema/model';
import type { PublicDataTableModel } from '@/api-clients/dashboard/public-data-table/schema/model';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import WidgetFormDataSourcePopover from '@/common/modules/widgets/_components/WidgetFormDataSourcePopover.vue';
import WidgetFormDataTableCard from '@/common/modules/widgets/_components/WidgetFormDataTableCard.vue';
import WidgetFormOverlayPreviewTable from '@/common/modules/widgets/_components/WidgetFormOverlayPreviewTable.vue';
import { useWidgetDataTableListQuery } from '@/common/modules/widgets/_composables/use-widget-data-table-list-query';
import {
    createDataTableReferenceMap,
    getDataTableReferenceMapExecutionOrder,
} from '@/common/modules/widgets/_helpers/widget-data-table-helper';
import { useWidgetGenerateStore } from '@/common/modules/widgets/_store/widget-generate-store';

import { violet } from '@/styles/colors';


const widgetGenerateStore = useWidgetGenerateStore();
const widgetGenerateState = widgetGenerateStore.state;
const widgetGenerateGetters = widgetGenerateStore.getters;

const dataTableContentsRef = ref<HTMLElement|null>(null);
const dataTableCardRef = ref<typeof WidgetFormDataTableCard[]>([]);
const scrollContainerRef = ref<HTMLElement|null>(null);

/* Query */
const {
    dataTableList,
} = useWidgetDataTableListQuery({
    widgetId: computed(() => widgetGenerateState.widgetId),
});

const storeState = reactive({
    allDataTableInvalid: computed(() => widgetGenerateGetters.allDataTableInvalid),
});

const displayState = reactive({
    dataTablesSortedByCreatedAt: computed<Partial<PublicDataTableModel|PrivateDataTableModel>[]>(() => orderBy(dataTableList.value, ['created_at'], ['asc'])),
    dataTableAreaOpen: true,
    tableAreaHeight: (dataTableContentsRef.value?.clientHeight || 1000) / 4.5,
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
    loading: false,
});

/* Event */
const handleClickAllApply = async () => {
    displayState.loading = true;
    try {
        const dataTableReferenceMap = createDataTableReferenceMap(dataTableList.value);
        const executionOrderList = getDataTableReferenceMapExecutionOrder(dataTableReferenceMap);

        const dataTableRefs = Object.fromEntries(
            dataTableCardRef.value
                .filter((_ref) => _ref)
                .map((_ref) => [_ref.item?.data_table_id, _ref]),
        );

        await Promise.allSettled(
            executionOrderList.map(async (dataTableId) => {
                const dataTableRef = dataTableRefs[dataTableId];
                if (dataTableRef) await dataTableRef.updateDataTable();
            }),
        );

        showSuccessMessage(i18n.t('COMMON.WIDGETS.DATA_TABLE.APPLY_ALL_SUCCESS'), '');
    } catch (e) {
        ErrorHandler.handleError(e);
    } finally {
        displayState.loading = false;
    }
};
const handleScrollDataTableContainer = () => {
    if (!scrollContainerRef.value) return;
    const { scrollWidth } = scrollContainerRef.value;
    scrollContainerRef.value.scrollTo({ left: scrollWidth, behavior: 'smooth' });
};

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
});

</script>

<template>
    <div class="sidebar-contents">
        <div ref="dataTableContentsRef"
             class="data-table-contents"
        >
            <div class="data-table-area">
                <div ref="scrollContainerRef"
                     class="data-table-scroll-wrapper"
                >
                    <div class="data-table-contents-wrapper">
                        <widget-form-data-table-card v-for="(dataTable, index) in displayState.dataTablesSortedByCreatedAt"
                                                     :ref="el => dataTableCardRef[index] = el"
                                                     :key="`data-table-${dataTable.data_table_id}`"
                                                     :item="dataTable"
                                                     :loading="displayState.loading"
                        />
                        <widget-form-data-table-card v-if="widgetGenerateState.dataTableCreateLoading"
                                                     loading-card
                        />
                        <widget-form-data-source-popover @scroll="handleScrollDataTableContainer" />
                        <div v-if="!dataTableList.length"
                             class="empty-data-table-guide"
                        >
                            <p class="title">
                                {{ $t('COMMON.WIDGETS.DATA_TABLE.EMPTY_TITLE') }}
                            </p>
                            <p class="description">
                                {{ $t('COMMON.WIDGETS.DATA_TABLE.EMPTY_DESC') }}
                            </p>
                        </div>
                    </div>
                </div>
                <div class="all-apply-wrapper">
                    <p-i name="ic_roket"
                         :color="violet[600]"
                         width="1.25rem"
                         height="1.25rem"
                    />
                    <p-button icon-left="ic_refresh"
                              style-type="secondary"
                              :loading="displayState.loading"
                              :disabled="storeState.allDataTableInvalid"
                              @click="handleClickAllApply"
                    >
                        {{ $t('COMMON.WIDGETS.DATA_TABLE.APPLY_ALL') }}
                    </p-button>
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
            overflow: hidden;

            .all-apply-wrapper {
                @apply flex items-center justify-between absolute gap-2 rounded-md bg-violet-150;
                right: 1.5rem;
                bottom: 1.5rem;
                padding: 0.5rem 0.5rem 0.5rem 1rem;
            }
            .data-table-scroll-wrapper {
                @apply relative;
                height: 100%;
                width: 100%;
                overflow: auto;
                .data-table-contents-wrapper {
                    @apply flex gap-4;
                    padding: 1.25rem;
                    height: auto;
                    width: auto;

                    .empty-data-table-guide {
                        @apply flex flex-col items-center justify-center absolute;
                        left: calc(50% - 15.375rem);
                        top: calc(50% - 2.25rem);
                        width: 30.75rem;
                        height: 4.5rem;
                        gap: 0.5rem;
                        .title {
                            @apply text-display-sm text-gray-700;
                        }
                        .description {
                            @apply text-label-md text-gray-700;
                            white-space: pre;
                            text-align: center;
                        }
                    }
                }
            }

            .gradation-bottom-area {
                @apply absolute;
                width: 100%;
                height: 1.5rem;
                bottom: 0;
                background: linear-gradient(180deg, rgba(247, 247, 247, 0) 0%, theme('colors.gray.100') 100%);
                z-index: 1;
                pointer-events: none;
            }
            .gradation-top-area {
                @apply absolute;
                width: 100%;
                height: 1.25rem;
                top: 0;
                background: linear-gradient(180deg, theme('colors.gray.100') 0%, rgba(247, 247, 247, 0) 100%);
                z-index: 1;
                pointer-events: none;
            }
            .gradation-left-area {
                @apply absolute;
                width: 1.25rem;
                height: 100%;
                left: 0;
                top: 0;
                background: linear-gradient(90deg, theme('colors.gray.100') 0%, rgba(247, 247, 247, 0) 100%);
                z-index: 1;
                pointer-events: none;
            }
            .gradation-right-area {
                @apply absolute;
                width: 1.25rem;
                height: 100%;
                right: 0;
                top: 0;
                background: linear-gradient(90deg, rgba(247, 247, 247, 0) 0%, theme('colors.gray.100') 100%);
                z-index: 1;
                pointer-events: none;
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
            margin-top: 0.75rem;

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
                        .toolbox-inner {
                            padding: 0 1rem;
                        }
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
