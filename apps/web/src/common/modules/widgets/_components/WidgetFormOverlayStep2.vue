<script lang="ts" setup>
import { onBeforeMount, reactive } from 'vue';

import {
    PDivider, PFieldGroup, PSelectButton, PSelectDropdown, PTextButton, PI, PTextInput, PTextarea,
} from '@spaceone/design-system';
import { cloneDeep } from 'lodash';

import type {
    DashboardVariables as IDashboardVariables,
    DashboardVariablesSchema, DateRange,
} from '@/schema/dashboard/_types/dashboard-type';

import { useWidgetGenerateStore } from '@/common/modules/widgets/_store/widget-generate-store';

import DashboardToolsetDateDropdown from '@/services/dashboards/components/DashboardToolsetDateDropdown.vue';
import DashboardVariables from '@/services/dashboards/components/DashboardVariables.vue';
import { useDashboardDetailInfoStore } from '@/services/dashboards/stores/dashboard-detail-info-store';


const FORM_TITLE_MAP = {
    WIDGET_INFO: 'WIDGET_INFO',
    DATA_MAPPING: 'DATA_MAPPING',
    CHART_OPTIONS: 'CHART_OPTIONS',
};
const dashboardDetailStore = useDashboardDetailInfoStore();
const dashboardDetailGetters = dashboardDetailStore.getters;
const dashboardDetailState = dashboardDetailStore.state;
const widgetGenerateStore = useWidgetGenerateStore();
const state = reactive({
    widgetSizeOptions: [
        { label: 'Full', name: 'FULL' },
        { label: 'Actual', name: 'ACTUAL' },
    ],
    selectedWidgetSize: 'FULL',
    //
    variablesSnapshot: {} as IDashboardVariables,
    variableSchemaSnapshot: {} as DashboardVariablesSchema,
    basedOnDateSnapshot: {} as DateRange,
    // display
    collapsedTitleMap: {
        [FORM_TITLE_MAP.WIDGET_INFO]: false,
        [FORM_TITLE_MAP.DATA_MAPPING]: false,
        [FORM_TITLE_MAP.CHART_OPTIONS]: false,
    },
});

/* Util */
const initSnapshot = () => {
    state.variablesSnapshot = cloneDeep(dashboardDetailState.variables);
    state.variableSchemaSnapshot = cloneDeep(dashboardDetailGetters.refinedVariablesSchema);
    state.basedOnDateSnapshot = cloneDeep(dashboardDetailState.settings.date_range);
};

/* Event */
const handleChangeWidgetSize = (widgetSize: string) => {
    state.selectedWidgetSize = widgetSize;
};
const handleClickEditDataTable = () => {
    widgetGenerateStore.setOverlayStep(1);
};
const handleClickCollapsibleTitle = (collapsedTitle: string) => {
    state.collapsedTitleMap[collapsedTitle] = !state.collapsedTitleMap[collapsedTitle];
};

onBeforeMount(() => {
    initSnapshot();
});
</script>

<template>
    <div class="sidebar-contents">
        <div class="left-part">
            <div class="dashboard-settings-wrapper">
                <div class="toolbox-wrapper">
                    <dashboard-toolset-date-dropdown :date-range="dashboardDetailState.settings.date_range" />
                    <p-divider vertical
                               class="divider"
                    />
                    <dashboard-variables disable-more-button
                                         disable-save-button
                                         :origin-variables="state.variablesSnapshot"
                                         :origin-variables-schema="state.variableSchemaSnapshot"
                    />
                </div>
                <div class="widget-size-wrapper">
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
        </div>
        <div class="right-part">
            <div class="data-table-wrapper">
                <p-field-group :label="$t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.DATA_TABLE')"
                               required
                >
                    <template #label-extra>
                        <p-text-button icon-left="ic_edit"
                                       @click="handleClickEditDataTable"
                        >
                            {{ $t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.EDIT') }}
                        </p-text-button>
                    </template>
                    <p-select-dropdown :options="[]" />
                </p-field-group>
                <p-field-group :label="$t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.CHART_TYPE')"
                               required
                >
                    <p-select-dropdown :options="[]" />
                </p-field-group>
            </div>
            <!-- widget info -->
            <div class="form-group-wrapper"
                 :class="{ 'collapsed': state.collapsedTitleMap[FORM_TITLE_MAP.WIDGET_INFO] }"
            >
                <div class="title-wrapper"
                     @click="handleClickCollapsibleTitle(FORM_TITLE_MAP.WIDGET_INFO)"
                >
                    <p-i name="ic_chevron-down"
                         width="1.25rem"
                         height="1.25rem"
                         color="inherit transparent"
                         class="arrow-button"
                    />
                    <span>{{ $t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.WIDGET_INFO') }}</span>
                </div>
                <div class="form-wrapper">
                    <p-field-group :label="$t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.TITLE')"
                                   required
                    >
                        <p-text-input />
                    </p-field-group>
                    <p-field-group :label="$t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.DESCRIPTION')">
                        <p-textarea />
                    </p-field-group>
                </div>
            </div>
            <!-- data mapping -->
            <div class="form-group-wrapper"
                 :class="{ 'collapsed': state.collapsedTitleMap[FORM_TITLE_MAP.DATA_MAPPING] }"
            >
                <div class="title-wrapper"
                     @click="handleClickCollapsibleTitle(FORM_TITLE_MAP.DATA_MAPPING)"
                >
                    <p-i name="ic_chevron-down"
                         width="1.25rem"
                         height="1.25rem"
                         color="inherit transparent"
                         class="arrow-button"
                    />
                    <span>{{ $t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.DATA_MAPPING') }}</span>
                </div>
            </div>
            <!-- chart options -->
            <div class="form-group-wrapper"
                 :class="{ 'collapsed': state.collapsedTitleMap[FORM_TITLE_MAP.CHART_OPTIONS] }"
            >
                <div class="title-wrapper"
                     @click="handleClickCollapsibleTitle(FORM_TITLE_MAP.CHART_OPTIONS)"
                >
                    <p-i name="ic_chevron-down"
                         width="1.25rem"
                         height="1.25rem"
                         color="inherit transparent"
                         class="arrow-button"
                    />
                    <span>{{ $t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.CHART_OPTIONS') }}</span>
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
    .left-part {
        @apply bg-gray-150 rounded-md;
        flex-grow: 1;
        display: flex;
        flex-direction: column;
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
            }
            .widget-size-wrapper {
                display: flex;
                gap: 0.5rem;
            }
        }
    }
    .right-part {
        display: flex;
        flex-direction: column;
        width: 25%;
        min-width: 2rem;
        .data-table-wrapper {
            @apply bg-gray-150 rounded-md;
            padding: 1rem 1rem 0 1rem;
            .p-select-dropdown {
                width: 100%;
            }
        }
    }

    .form-group-wrapper {
        @apply border-b border-gray-200;
        .arrow-button {
            transition: opacity 0.3s ease, visibility 0.3s ease;
        }
        &.collapsed {
            .form-wrapper {
                display: none;
            }
            .arrow-button {
                transform: rotate(-90deg);
            }
        }
        .title-wrapper {
            @apply text-label-lg;
            font-weight: 700;
            padding: 1rem 0;
        }
        .form-wrapper {
            padding: 0 1.25rem 1.25rem 1.25rem;
        }
    }
}

/* custom design-system component - p-field-group */
:deep(.p-field-group) {
    .title {
        width: 100%;
        display: flex;
        justify-content: space-between;
    }
}
</style>
