<template>
    <div class="dashboard-customize-sidebar">
        <portal to="widget-title">
            <span class="sidebar-title">{{ $t('DASHBOARDS.CUSTOMIZE.ADD_WIDGET.SIDEBAR_TITLE') }}</span> <br>
        </portal>
        <portal to="widget-contents">
            <div class="sidebar-contents">
                <div class="selector-wrapper">
                    <p-toggle-button :value="state.enableDateRange"
                                     :state-text="$t('DASHBOARDS.CUSTOMIZE.ADD_WIDGET.LABEL_DATE')"
                                     show-state-text
                                     spacing="md"
                                     @change-toggle="handleChangeDateRangeToggle"
                    />
                </div>
                <div class="selector-wrapper">
                    <p-toggle-button :value="state.enableCurrency"
                                     :state-text="$t('DASHBOARDS.CUSTOMIZE.ADD_WIDGET.LABEL_CURRENCY')"
                                     show-state-text
                                     spacing="md"
                                     @change-toggle="handleChangeCurrencyToggle"
                    />
                </div>
                <p-divider class="divider" />
                <p-button style-type="tertiary"
                          size="lg"
                          icon-left="ic_plus_bold"
                          block
                          class="add-button"
                          @click="handleClickAddWidget"
                >
                    {{ $t('DASHBOARDS.CUSTOMIZE.ADD_WIDGET.ADD') }}
                </p-button>
                <draggable class="draggable-wrapper"
                           ghost-class="ghost"
                           :list="state.widgetInfoList"
                >
                    <div v-for="(widget, idx) in state.widgetInfoList"
                         :key="`drag-item-${widget.widget_name}-${idx}`"
                         class="draggable-item"
                    >
                        <span>
                            <p-i name="ic_drag-handle"
                                 width="1rem"
                                 height="1rem"
                            /></span>
                        <span class="text">{{ widget.title }}</span>
                        <span v-if="dashboardDetailState.widgetValidMap[widget.widget_key] === false"
                              class="error-icon-wrapper"
                        >
                            <p-i name="ic_error-filled"
                                 height="1rem"
                                 width="1rem"
                                 color="inherit"
                            />
                        </span>
                    </div>
                </draggable>
            </div>
        </portal>
        <portal to="widget-footer">
            <div class="footer-wrapper">
                <p-button style-type="transparent"
                          :disabled="props.loading"
                          @click="handleClickCancelButton"
                >
                    {{ $t('DASHBOARDS.CUSTOMIZE.CANCEL') }}
                </p-button>
                <p-button style-type="primary"
                          :disabled="!dashboardDetailStore.isWidgetLayoutValid || !dashboardDetailState.isNameValid"
                          :loading="props.loading"
                          @click="handleClickSaveButton"
                >
                    {{ $t('DASHBOARDS.CUSTOMIZE.SAVE') }}
                </p-button>
            </div>
        </portal>
        <dashboard-add-widget-modal :visible.sync="state.addWidgetModalVisible"
                                    @add-widget="handleAddWidget"
        />
    </div>
</template>

<script setup lang="ts">
import {
    computed,
    defineEmits,
    onMounted, onUnmounted, reactive,
} from 'vue';
import draggable from 'vuedraggable';

import {
    PButton, PDivider, PI, PToggleButton,
} from '@spaceone/design-system';

import { SpaceRouter } from '@/router';
import { store } from '@/store';

import DashboardAddWidgetModal from '@/services/dashboards/dashboard-customize/modules/DashboardAddWidgetModal.vue';
import { useDashboardDetailInfoStore } from '@/services/dashboards/store/dashboard-detail-info';
import type { DashboardLayoutWidgetInfo } from '@/services/dashboards/widgets/_configs/config';

interface Props {
    loading?: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{(e: string, value: string): void,
    (e: 'save'): void,
}>();

const dashboardDetailStore = useDashboardDetailInfoStore();
const dashboardDetailState = dashboardDetailStore.$state;
const state = reactive({
    widgetInfoList: computed(() => dashboardDetailState.dashboardWidgetInfoList),
    enableDateRange: computed(() => dashboardDetailState.settings.date_range?.enabled ?? false),
    enableCurrency: computed(() => dashboardDetailState.settings.currency?.enabled ?? false),
    addWidgetModalVisible: false,
});

/* Event */
const handleChangeDateRangeToggle = () => {
    dashboardDetailStore.$patch((_state) => {
        _state.settings.date_range.enabled = !_state.settings.date_range.enabled;
    });
};
const handleChangeCurrencyToggle = () => {
    dashboardDetailStore.$patch((_state) => {
        _state.settings.currency.enabled = !_state.settings.currency.enabled;
    });
};
const handleClickAddWidget = () => {
    state.addWidgetModalVisible = true;
};
const handleClickCancelButton = () => {
    SpaceRouter.router.back();
    // TODO: revert dashboardState here
};
const handleClickSaveButton = () => {
    emit('save');
};
const handleAddWidget = (newWidget: DashboardLayoutWidgetInfo) => {
    dashboardDetailStore.$patch((_state) => {
        _state.dashboardWidgetInfoList = _state.dashboardWidgetInfoList.concat([newWidget]);
    });
};

onMounted(() => {
    store.dispatch('display/showWidget');
});
onUnmounted(() => {
    store.dispatch('display/hideSidebar');
});
</script>

<style lang="postcss" scoped>
.sidebar-title {
    margin-bottom: 0.75rem;
    font-size: 1.125rem;
    line-height: 125%;
}

.sidebar-contents {
    position: relative;
    gap: 1.5625rem;
    font-size: 0.875rem;
    line-height: 125%;

    .selector-wrapper {
        &:first-child {
            padding-bottom: 0.5rem;
        }

        /* custom design-system component -p-toggle-button */
        :deep(.p-toggle-button) {
            .state-text {
                @apply font-normal;
            }
        }
    }
    .divider {
        margin: 1.5rem 0;
    }
    .add-button {
        margin-bottom: 1rem;
    }
    .draggable-wrapper {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        padding-bottom: 1rem;
        .draggable-item {
            @apply border border-gray-200 rounded bg-white;
            display: flex;
            gap: 0.5rem;
            cursor: grab;
            padding: 0.5rem;
            &:active {
                cursor: grabbing;
            }
            .text {
                @apply truncate;
            }
            .error-icon-wrapper {
                @apply text-red-400;
            }
        }
        .ghost {
            @apply bg-blue-200;
        }
    }
}
.footer-wrapper {
    @apply grid grid-cols-12 border-t border-gray-200;
    width: 100%;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    button {
        @apply col-span-6;
    }
}
</style>
<!--style for p-sidebar outside of this module.-->
<style lang="postcss">
$footer-height: 57px;
.p-sidebar .sidebar-wrapper {
    padding-bottom: $footer-height;
}
</style>
