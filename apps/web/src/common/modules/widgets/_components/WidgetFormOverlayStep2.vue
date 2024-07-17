<script lang="ts" setup>
import {
    computed, onBeforeMount, onMounted, onUnmounted, reactive, ref, watch,
} from 'vue';

import { cloneDeep, isEqual } from 'lodash';

import {
    PDivider, PSelectButton, PButton,
} from '@cloudforet/mirinae';

import type {
    DashboardOptions, DashboardVars,
} from '@/schema/dashboard/_types/dashboard-type';
import { i18n } from '@/translations';

import { useDashboardStore } from '@/store/dashboard/dashboard-store';

import WidgetFormOverlayStep2WidgetForm
    from '@/common/modules/widgets/_components/WidgetFormOverlayStep2WidgetForm.vue';
import { useWidgetOptionValidation } from '@/common/modules/widgets/_composables/use-widget-option-validation';
import { WIDGET_WIDTH_RANGE_LIST } from '@/common/modules/widgets/_constants/widget-display-constant';
import { getWidgetComponent } from '@/common/modules/widgets/_helpers/widget-component-helper';
import { getWidgetConfig } from '@/common/modules/widgets/_helpers/widget-config-helper';
import { useWidgetGenerateStore } from '@/common/modules/widgets/_store/widget-generate-store';
import type { WidgetFieldValues } from '@/common/modules/widgets/types/widget-field-value-type';
import type { WidgetType } from '@/common/modules/widgets/types/widget-model';

import DashboardToolsetDateDropdown from '@/services/dashboards/components/DashboardToolsetDateDropdown.vue';
import DashboardVariablesV2 from '@/services/dashboards/components/DashboardVariablesV2.vue';
import type { AllReferenceTypeInfo } from '@/services/dashboards/stores/all-reference-type-info-store';
import {
    useAllReferenceTypeInfoStore,
} from '@/services/dashboards/stores/all-reference-type-info-store';
import { useDashboardDetailInfoStore } from '@/services/dashboards/stores/dashboard-detail-info-store';


const overlayWidgetRef = ref<HTMLElement|null>(null);
const dashboardStore = useDashboardStore();
const dashboardDetailStore = useDashboardDetailInfoStore();
const dashboardDetailState = dashboardDetailStore.state;
const dashboardDetailGetters = dashboardDetailStore.getters;
const widgetGenerateStore = useWidgetGenerateStore();
const widgetGenerateGetters = widgetGenerateStore.getters;
const widgetGenerateState = widgetGenerateStore.state;
const allReferenceTypeInfoStore = useAllReferenceTypeInfoStore();

const emit = defineEmits<{(event: 'watch-options-changed', value: boolean): void;}>();

const state = reactive({
    mounted: false,
    widgetConfig: computed(() => getWidgetConfig(widgetGenerateState.selectedWidgetName)),
    selectedWidgetType: widgetGenerateState.widget?.widget_type as WidgetType,
    allReferenceTypeInfo: computed<AllReferenceTypeInfo>(() => allReferenceTypeInfoStore.getters.allReferenceTypeInfo),
    widgetSizeOptions: [
        { label: i18n.t('COMMON.WIDGETS.FULL'), name: 'FULL' },
        { label: i18n.t('COMMON.WIDGETS.ACTUAL'), name: 'ACTUAL' },
    ],
    selectedWidgetSize: 'ACTUAL',
    widgetSize: computed(() => {
        if (widgetGenerateState.overlayType === 'EXPAND') return 'full';
        if (state.selectedWidgetSize === 'FULL') return 'full';
        return widgetGenerateState.widget?.size;
    }),
    widgetWidth: computed(() => {
        if (state.widgetSize === 'full' || state.selectedWidgetSize === 'FULL' || widgetGenerateState.overlayType === 'EXPAND') {
            return undefined;
        }
        return WIDGET_WIDTH_RANGE_LIST[state.widgetSize]?.[0] || 0;
    }),
    isWidgetFieldChanged: computed<boolean>(() => {
        const _isOptionsChanged = isWidgetOptionsChanged(false, widgetGenerateState.widgetFormValueMap, widgetGenerateState.widget?.options || {});
        const _isTypeChanged = widgetGenerateState.selectedWidgetName !== widgetGenerateState.widget?.widget_type;
        const _isNameChanged = widgetGenerateState.title !== widgetGenerateState.widget?.name;
        const _isDescriptionChanged = widgetGenerateState.description !== widgetGenerateState.widget?.description;
        emit('watch-options-changed', _isOptionsChanged || _isTypeChanged || _isNameChanged || _isDescriptionChanged);
        return _isOptionsChanged || _isTypeChanged || _isNameChanged || _isDescriptionChanged;
    }),
    disableApplyButton: computed<boolean>(() => {
        if (!widgetGenerateGetters.isAllWidgetFormValid) return true;
        const _isWidgetInactive = widgetGenerateState.widget?.state === 'INACTIVE';
        return (!_isWidgetInactive && !state.isWidgetFieldChanged) || optionsInvalid.value;
    }),
    //
    varsSnapshot: {} as DashboardVars,
    dashboardOptionsSnapshot: {} as DashboardOptions,
});
const displayState = reactive({
    rightPartWidth: (window.innerWidth || 1000) / 4,
    resizing: false,
    clientX: null,
    transition: false,
    resizerStyle: computed(() => ({
        left: `${displayState.rightPartWidth}px`,
        'border-left-width': '1px',
    })),
    leftPartStyle: computed(() => ({
        width: `calc(100% - ${displayState.rightPartWidth}px)`,
    })),
    rightPartStyle: computed(() => ({
        width: `${displayState.rightPartWidth}px`,
        minWidth: `${displayState.minWidth}px`,
        maxWidth: `${displayState.maxWidth}px`,
    })),
    minWidth: 224,
    maxWidth: ((window.innerWidth || 1000) / 2) - 32,
});

const {
    optionsInvalid,
    optionsInvalidText,
} = useWidgetOptionValidation({
    optionValueMap: computed(() => widgetGenerateState.widgetFormValueMap),
    widgetConfig: computed(() => state.widgetConfig),
});

/* Api */
const updateWidget = async () => {
    const _isCreating = widgetGenerateState.widget?.state === 'CREATING';
    await widgetGenerateStore.updateWidget({
        widget_id: widgetGenerateState.widgetId,
        name: widgetGenerateState.title,
        description: widgetGenerateState.description,
        size: widgetGenerateState.size,
        widget_type: widgetGenerateState.selectedWidgetName,
        data_table_id: widgetGenerateState.selectedDataTableId,
        options: widgetGenerateState.widgetFormValueMap,
        state: 'ACTIVE',
    });
    if (_isCreating) {
        dashboardDetailStore.addWidgetToDashboardLayouts(widgetGenerateState.widgetId);
        await dashboardStore.updateDashboard(dashboardDetailState.dashboardId as string, {
            dashboard_id: dashboardDetailState.dashboardId,
            layouts: dashboardDetailState.dashboardLayouts,
        });
    }
};


/* Util */
const isWidgetOptionsChanged = (
    isChanged: boolean,
    widgetForm: Record<string, WidgetFieldValues|undefined>,
    widgetOptions: Record<string, WidgetFieldValues|undefined>,
): boolean => {
    if (isChanged) return true;
    let _isChanged = false;
    Object.entries(widgetForm).forEach(([k, v]) => {
        if (_isChanged) return;
        if (typeof v === 'object' && !Array.isArray(v)) {
            _isChanged = isWidgetOptionsChanged(_isChanged, v, widgetOptions?.[k]);
            return;
        }
        _isChanged = !isEqual(widgetOptions?.[k], v);
    });
    return _isChanged;
};
const initSnapshot = () => {
    state.varsSnapshot = cloneDeep(dashboardDetailState.vars);
    state.dashboardOptionsSnapshot = cloneDeep(dashboardDetailState.options);
};
const reset = () => {
    dashboardDetailStore.setVars(state.varsSnapshot);
    dashboardDetailStore.setOptions(state.dashboardOptionsSnapshot);
};
const loadOverlayWidget = async () => {
    const res = await overlayWidgetRef?.value?.loadWidget();
    if (typeof res === 'function') {
        res('Please check the widget options.');
    }
};

/* Event */
const handleChangeWidgetSize = (widgetSize: string) => {
    state.selectedWidgetSize = widgetSize;
};
const handleUpdateWidgetOptions = async () => {
    await updateWidget();
    if (state.selectedWidgetType === widgetGenerateState.selectedWidgetName) {
        await loadOverlayWidget();
    } else {
        state.selectedWidgetType = widgetGenerateState.selectedWidgetName;
        state.mounted = false;
    }
};
const handleMountWidgetComponent = () => {
    state.mounted = true;
};
const handleEditWidget = () => {
    widgetGenerateStore.setOverlayType('EDIT');
};
const isResizing = (event) => {
    if (displayState.resizing) {
        if (displayState.clientX === null) {
            displayState.clientX = event.clientX;
            return;
        }
        const delta = displayState.clientX - event.clientX;
        const width = displayState.rightPartWidth + delta;
        if (!(width <= displayState.minWidth || width > displayState.maxWidth)) {
            displayState.rightPartWidth = width;
        }
        displayState.clientX = event.clientX;
    }
};
const endResizing = () => {
    displayState.resizing = false;
    displayState.clientX = null;
};
const startResizing = () => {
    displayState.resizing = true;
};
const documentEventMount = (eventName: string, func: any) => {
    onMounted(() => document.addEventListener(eventName, func));
    onUnmounted(() => document.removeEventListener(eventName, func));
};
documentEventMount('mousemove', isResizing);
documentEventMount('mouseup', endResizing);

/* Watcher */
watch(() => widgetGenerateState.widget?.size, (widgetSize) => {
    if (widgetSize === 'sm') {
        state.selectedWidgetSize = 'ACTUAL';
    } else {
        state.selectedWidgetSize = 'FULL';
    }
}, { immediate: true });
watch(() => state.mounted, async (mounted) => {
    if (mounted) {
        if (widgetGenerateState.widget?.state === 'CREATING') {
            await updateWidget();
        }
        await loadOverlayWidget();
        state.mounted = false;
    }
});

onBeforeMount(() => {
    initSnapshot();
});
onUnmounted(() => {
    reset();
});
</script>

<template>
    <div class="sidebar-contents"
         :class="{ 'expand': widgetGenerateState.overlayType === 'EXPAND' }"
    >
        <div class="left-part"
             :style="displayState.leftPartStyle"
        >
            <div class="dashboard-settings-wrapper">
                <div class="toolbox-wrapper">
                    <dashboard-toolset-date-dropdown :date-range="state.dashboardOptionsSnapshot.date_range" />
                    <p-divider vertical
                               class="divider"
                    />
                    <dashboard-variables-v2 disable-save-button />
                    <p-button v-if="widgetGenerateState.overlayType === 'EXPAND'"
                              style-type="tertiary"
                              icon-left="ic_edit"
                              class="edit-button"
                              @click="handleEditWidget"
                    >
                        {{ $t('COMMON.WIDGETS.EDIT_WIDGET') }}
                    </p-button>
                </div>
                <div v-if="widgetGenerateState.overlayType !== 'EXPAND'"
                     class="widget-size-wrapper"
                >
                    <p-select-button v-for="widgetSize in state.widgetSizeOptions"
                                     :key="`widget-size-${widgetSize.name}`"
                                     :value="widgetSize.name"
                                     style-type="gray"
                                     :selected="state.selectedWidgetSize"
                                     @change="handleChangeWidgetSize"
                    >
                        {{ widgetSize.label }}
                    </p-select-button>
                </div>
            </div>
            <div class="widget-wrapper"
                 :class="{ 'full-size': state.selectedWidgetSize === 'FULL' || widgetGenerateState.overlayType === 'EXPAND' }"
            >
                <component :is="getWidgetComponent(state.selectedWidgetType)"
                           ref="overlayWidgetRef"
                           :widget-name="widgetGenerateState.widget.widget_type"
                           :widget-id="widgetGenerateState.widget.widget_id"
                           :widget-state="widgetGenerateState.widget.state"
                           :data-table-id="widgetGenerateState.selectedDataTableId"
                           :size="state.widgetSize"
                           :width="state.widgetWidth"
                           :title="widgetGenerateState.widget.name"
                           :description="widgetGenerateState.widget.description"
                           :widget-options="widgetGenerateState.widget.options"
                           :dashboard-options="dashboardDetailState.options"
                           :dashboard-vars="dashboardDetailGetters.refinedVars"
                           :all-reference-type-info="state.allReferenceTypeInfo"
                           disable-refresh-on-loading
                           mode="overlay"
                           @mounted="handleMountWidgetComponent"
                />
            </div>
        </div>
        <div v-if="widgetGenerateState.overlayType !== 'EXPAND'"
             class="resizer-container line"
             :class="{transition: displayState.transition}"
             :style="displayState.resizerStyle"
             @mousedown="startResizing"
             @mousemove="isResizing"
             @mouseup="endResizing"
        />
        <widget-form-overlay-step2-widget-form v-if="widgetGenerateState.overlayType !== 'EXPAND'"
                                               :widget-validation-invalid="optionsInvalid"
                                               :widget-validation-invalid-text="optionsInvalidText"
                                               :style="displayState.rightPartStyle"
                                               class="right-part"
                                               :class="{ 'transition': displayState.transition, 'unselectable': displayState.resizing }"
        />
        <portal to="apply-button">
            <p-button v-if="widgetGenerateState.overlayType !== 'EXPAND'"
                      style-type="substitutive"
                      icon-left="ic_refresh"
                      class="apply-button"
                      :disabled="state.disableApplyButton"
                      @click="handleUpdateWidgetOptions"
            >
                {{ $t('COMMON.WIDGETS.APPLY') }}
                <div v-if="state.isWidgetFieldChanged"
                     class="update-dot"
                />
            </p-button>
        </portal>
    </div>
</template>

<style lang="scss" scoped>
.sidebar-contents {
    width: 100%;
    display: flex;
    gap: 1rem;
    padding: 0 1.5rem 1rem 1.5rem;
    .left-part {
        @apply bg-gray-100 border border-gray-150 rounded-md;
        width: 100%;
        flex-grow: 1;
        padding: 1rem;
        .dashboard-settings-wrapper {
            display: flex;
            align-items: center;
            justify-content: space-between;
            width: 100%;
            padding-bottom: 1rem;
            .divider {
                height: 1rem;
            }
            .toolbox-wrapper {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                .dashboard-variables-select-dropdown {
                    @apply relative flex items-center flex-wrap;
                    gap: 0.5rem;
                }
                .edit-button {
                    position: absolute;
                    right: 4.5rem;
                }
            }
            .widget-size-wrapper {
                display: flex;
                gap: 0.5rem;
                align-items: center;
                .divider {
                    height: 1.5rem;
                }
            }
        }
        .widget-wrapper {
            position: relative;
            display: flex;
            height: 100%;
            justify-content: center;
            align-items: center;
            overflow: hidden;
            &.full-size {
                height: 100%;
                .widget-frame {
                    height: 100%;
                }
            }
        }
    }
    &.expand {
        .left-part {
            @apply border-none;
            padding: 1.5rem 0;
        }
    }
    .resizer-container {
        display: flex;
        align-items: flex-start;
        justify-content: center;
        position: sticky;
        top: 0;
        height: 100%;
        width: 0;
        z-index: 1;

        &.transition {
            transition: left 0.2s;
        }

        &.line {
            @apply border-gray-200;
            background-color: transparent;

            &:hover {
                @apply border-blue-500;
                cursor: ew-resize;
            }
        }
    }
    .right-part {
        display: flex;
        &.transition {
            transition: height 0.2s;
        }
        &.unselectable {
            user-select: none;
        }
    }
}
.apply-button {
    position: relative;
    .update-dot {
        @apply absolute bg-blue-500 rounded-full border-2 border-white;
        width: 0.75rem;
        height: 0.75rem;
        right: -0.375rem;
        top: -0.375rem;
    }
}
</style>
