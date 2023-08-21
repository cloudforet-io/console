<template>
    <div class="dashboard-customize-sidebar">
        <portal to="widget-title">
            <span class="sidebar-title">{{ t('DASHBOARDS.CUSTOMIZE.ADD_WIDGET.SIDEBAR_TITLE') }}</span> <br>
        </portal>
        <portal to="widget-contents">
            <div class="sidebar-contents">
                <div class="selector-wrapper">
                    <p-field-title :label="t('DASHBOARDS.CUSTOMIZE.ADD_WIDGET.LABEL_DATE')"
                                   font-weight="regular"
                    >
                        <template #left>
                            <p-toggle-button :value="state.enableDateRange"
                                             class="toggle-button"
                                             @change-toggle="handleChangeDateRangeToggle"
                            />
                        </template>
                    </p-field-title>
                </div>
                <div class="selector-wrapper">
                    <p-field-title :label="t('DASHBOARDS.CUSTOMIZE.ADD_WIDGET.LABEL_CURRENCY')"
                                   font-weight="regular"
                    >
                        <template #left>
                            <p-toggle-button :value="state.enableCurrency"
                                             class="toggle-button"
                                             @change-toggle="handleChangeCurrencyToggle"
                            />
                        </template>
                    </p-field-title>
                </div>
                <p-divider class="divider" />
                <p-button style-type="tertiary"
                          size="lg"
                          icon-left="ic_plus_bold"
                          block
                          class="add-button"
                          @click="handleClickAddWidget"
                >
                    {{ t('DASHBOARDS.CUSTOMIZE.ADD_WIDGET.ADD') }}
                </p-button>
                <draggable v-model:model-value="state.widgetInfoList"
                           item-key="widget_key"
                           class="draggable-wrapper"
                           ghost-class="ghost"
                >
                    <template #item="{element}">
                        <div class="draggable-item">
                            <span>
                                <p-i name="ic_drag-handle"
                                     width="1rem"
                                     height="1rem"
                                /></span>
                            <span class="text">{{ element.title }}</span>
                            <span v-if="dashboardDetailState.widgetValidMap[element.widget_key] === false"
                                  class="error-icon-wrapper"
                            >
                                <p-i name="ic_error-filled"
                                     height="1rem"
                                     width="1rem"
                                     :color="red[400]"
                                />
                            </span>
                        </div>
                    </template>
                </draggable>
            </div>
        </portal>
        <portal to="widget-footer">
            <div class="footer-wrapper">
                <p-button v-if="!props.hideCancelButton"
                          style-type="transparent"
                          :disabled="props.loading"
                          @click="handleClickCancelButton"
                >
                    {{ t('DASHBOARDS.CUSTOMIZE.CANCEL') }}
                </p-button>
                <p-button style-type="primary"
                          :disabled="!dashboardDetailStore.isWidgetLayoutValid || !dashboardDetailState.isNameValid"
                          :loading="props.loading"
                          @click="handleClickSaveButton"
                >
                    {{ props.saveButtonText || t('DASHBOARDS.CUSTOMIZE.SAVE') }}
                </p-button>
            </div>
        </portal>
        <dashboard-widget-add-modal v-model:visible="state.addWidgetModalVisible"
                                    @add-widget="handleAddWidget"
        />
    </div>
</template>

<script setup lang="ts">
import {
    PButton, PDivider, PI, PToggleButton, PFieldTitle,
} from '@spaceone/design-system';
import {
    computed,
    defineEmits,
    onMounted, onUnmounted, reactive,
} from 'vue';
import { useI18n } from 'vue-i18n';
import draggable from 'vuedraggable';
import { useStore } from 'vuex';

import { red } from '@/styles/colors';

import DashboardWidgetAddModal from '@/services/dashboards/dashboard-customize/modules/dashboard-widget-add-modal/DashboardWidgetAddModal.vue';
import { useDashboardDetailInfoStore } from '@/services/dashboards/store/dashboard-detail-info';
import type { DashboardLayoutWidgetInfo } from '@/services/dashboards/widgets/_configs/config';

interface Props {
  loading?: boolean;
  saveButtonText?: string;
  hideCancelButton?: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{(e: 'save'): void;
  (e: 'cancel'): void;
}>();
const { t } = useI18n();
const store = useStore();

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
    emit('cancel');
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
<!--style for p-sidebar outside of this module.-->

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
        .toggle-button {
            margin-right: 0.25rem;
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
    @apply flex border-t border-gray-200;
    width: 100%;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    .p-button {
        width: 100%;
    }
}
</style>

<style lang="postcss">
$footer-height: 57px;
.p-sidebar .sidebar-wrapper {
    padding-bottom: $footer-height;
    .title {
        @apply text-label-md;
        min-height: initial;
    }
}
</style>
