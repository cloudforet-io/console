<script lang="ts" setup>
import { computed, reactive } from 'vue';

import {
    PButton, PToolboxTable, PFieldTitle, PEmpty, PI,
} from '@spaceone/design-system';

import { i18n } from '@/translations';


import WidgetFormDataSourcePopover from '@/common/modules/widgets/_components/WidgetFormDataSourcePopover.vue';


const state = reactive({
    // data table
    fields: computed(() => [
        { name: 'key', label: 'something', type: 'item' },
        { name: 'value', label: 'table', type: 'item' },
    ]),
    selectedData: undefined as string|undefined,
    chartTypes: computed(() => [
        { name: 'table', label: 'Table', icon: '' },
        { name: 'area', label: 'Area', icon: '' },
        { name: 'verticalBar', label: 'Vertical Bar', icon: '' },
        { name: 'line', label: 'Line', icon: '' },
        { name: 'donut', label: 'Donut', icon: '' },
        { name: 'pie', label: 'Pie', icon: '' },
        { name: 'treemap', label: 'Treemap', icon: '' },
        { name: 'heatmap', label: 'Heatmap', icon: '' },
        { name: 'number', label: 'Number', icon: '' },
        { name: 'regionMap', label: 'Region Map', icon: '' },
    ]),
    selectedChartType: undefined as string|undefined,
});

/* Event */
const handleClickGenerate = () => {
    // TODO: add event
};

const handleClickChartType = (chartType: string) => {
    state.selectedChartType = chartType;
};

</script>

<template>
    <div class="sidebar-contents">
        <div class="left-part">
            <div class="data-source-wrapper">
                <widget-form-data-source-popover />
                <!--                <widget-form-data-source-card />-->
            </div>
            <p-toolbox-table :fields="state.fields"
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
                        <p-button style-type="secondary"
                                  icon-left="ic_refresh"
                                  @click="handleClickGenerate"
                        >
                            {{ $t('DASHBOARDS.WIDGET.OVERLAY.STEP_1.GENERATE') }}
                        </p-button>
                    </div>
                </template>
            </p-toolbox-table>
        </div>
        <div class="right-part">
            <div class="chart-type-wrapper">
                <p-field-title :label="$t('DASHBOARDS.WIDGET.OVERLAY.STEP_1.CHART_TYPE')" />
                <div class="chart-type-select-wrapper">
                    <div v-if="!state.selectedData"
                         class="button-wrapper"
                    >
                        <button v-for="chartType in state.chartTypes"
                                :key="chartType.name"
                                class="chart-type-button"
                                :class="{ 'disabled': false, 'selected': state.selectedChartType === chartType.name }"
                                @click="handleClickChartType(chartType.name)"
                        >
                            <p-i :name="chartType.icon" />
                            {{ chartType.label }}
                            <p-i v-if="state.selectedChartType === chartType.name"
                                 class="selected-icon"
                                 name="ic_checkbox-circle-selected"
                                 width="1.25rem"
                                 height="1.25rem"
                            />
                        </button>
                    </div>
                    <p-empty v-else
                             show-image
                             image-size="sm"
                             class="empty-box"
                             :title="$t('DASHBOARDS.WIDGET.OVERLAY.STEP_1.SELECT_A_DATA_SOURCE')"
                    >
                        {{ $t('DASHBOARDS.WIDGET.OVERLAY.STEP_1.EMPTY_DESC') }}
                    </p-empty>

                    <div v-if="state.selectedChartType"
                         class="selected-data-info-pannel"
                    >
                        <p class="info-text">
                            Create a <strong>{{ state.selectedChartType }}</strong> widget with <strong>Data Source 01</strong>
                        </p>
                    </div>
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
        padding: 0.125rem;
        .data-source-wrapper {
            flex: 1;
            overflow: auto;
            padding: 1rem;
        }
        .view-table-wrapper {
            @apply rounded-md;
            max-height: 18.75rem;
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
    .right-part {
        display: flex;
        flex-direction: column;
        width: 25%;
        min-width: 2rem;
        .chart-type-wrapper {
            flex: 1;
            display: flex;
            flex-direction: column;
            .chart-type-select-wrapper {
                @apply flex flex-col justify-between h-full;
                .button-wrapper {
                    @apply grid gap-3;
                    grid-template-columns: repeat(3, 1fr);
                    padding-top: 1rem;

                    .chart-type-button {
                        @apply relative border border-gray-200 rounded-lg flex flex-col items-center justify-center text-label-md cursor-pointer;
                        height: 6.25rem;

                        &.disabled {
                            cursor: not-allowed;
                            opacity: 0.3;
                        }

                        .selected-icon {
                            @apply absolute;
                            left: 0.5rem;
                            top: 0.5rem;
                        }
                        &.selected {
                            @apply border-blue-600 text-blue-600;
                        }
                    }
                }
                .empty-box {
                    height: 100%;
                }
                .selected-data-info-pannel {
                    @apply border border-indigo-200 bg-indigo-100 rounded-lg w-full;
                    height: 2.625rem;
                    padding: 0.75rem 1rem;
                    .info-text {
                        @apply text-label-md text-indigo-600;
                    }
                }
            }
        }
    }
}
</style>
