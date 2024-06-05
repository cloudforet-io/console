<script setup lang="ts">

import {
    computed, onMounted, reactive, watch,
} from 'vue';


import {
    PFieldGroup, PDivider, PIconButton, PI, PButton, PSelectDropdown, PTextInput, PToggleButton, PFieldTitle,
} from '@spaceone/design-system';
import type { SelectDropdownMenuItem } from '@spaceone/design-system/src/inputs/dropdown/select-dropdown/type';
import { range } from 'lodash';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { CostDataSourceReferenceMap } from '@/store/reference/cost-data-source-reference-store';
import type { MetricReferenceMap } from '@/store/reference/metric-reference-store';
import type { NamespaceReferenceMap } from '@/store/reference/namespace-reference-store';

import getRandomId from '@/lib/random-id-generator';

import WidgetFormDataTableCardFilters from '@/common/modules/widgets/_components/WidgetFormDataTableCardFilters.vue';
import { DATA_SOURCE_DOMAIN } from '@/common/modules/widgets/_constants/data-table-constant';
import { useWidgetGenerateStore } from '@/common/modules/widgets/_store/widget-generate-store';
import type { DataTableModel } from '@/common/modules/widgets/types/widget-model';

import { gray, violet } from '@/styles/colors';

interface AdditionalLabel {
    key: string;
    name: string;
    value: string;
}

interface Props {
    item: DataTableModel;
}

const props = defineProps<Props>();
const widgetGenerateStore = useWidgetGenerateStore();
const widgetGenerateState = widgetGenerateStore.state;
const allReferenceStore = useAllReferenceStore();

const storeState = reactive({
    dataSources: computed<CostDataSourceReferenceMap>(() => allReferenceStore.getters.costDataSource),
    metrics: computed<MetricReferenceMap>(() => allReferenceStore.getters.metric),
    namespaces: computed<NamespaceReferenceMap>(() => allReferenceStore.getters.namespace),
});

const state = reactive({
    selected: computed(() => widgetGenerateState.selectedDataTableId === props.item.data_table_id),
    sourceType: computed(() => props.item.source_type),
    options: computed(() => props.item.options),
    dataSourceId: computed(() => state.options[state.sourceType].data_source_id), // COST only
    metricId: computed(() => state.options[state.sourceType].metric_id), // ASSET only
    namespaceId: computed(() => storeState.metrics[state.metricId]?.data.namespace_id || ''), // ASSET only
    selectedParentSourceName: computed(() => {
        if (state.sourceType === DATA_SOURCE_DOMAIN.COST) {
            return storeState.dataSources[state.dataSourceId]?.label;
        }
        if (state.sourceType === DATA_SOURCE_DOMAIN.ASSET) {
            return storeState.namespaces[state.namespaceId]?.label;
        }
        return '';
    }),
    selectedSourceEndItem: props.item.source_type === DATA_SOURCE_DOMAIN.COST
        ? props.item.options[DATA_SOURCE_DOMAIN.COST]?.data_key
        : props.item.options[DATA_SOURCE_DOMAIN.ASSET]?.metric_id,
    selectedGroupByItems: [] as string[],
    filters: {} as Record<string, string[]>,
    dataFieldName: '',
    selectableSourceItems: computed<SelectDropdownMenuItem[]>(() => {
        if (state.sourceType === DATA_SOURCE_DOMAIN.COST) {
            return props.item.data_info.map((dataKey) => ({
                label: `${dataKey.name} (${dataKey.unit})`,
                name: dataKey.key,
            }));
        }
        if (state.sourceType === DATA_SOURCE_DOMAIN.ASSET) {
            return Object.values(storeState.metrics)
                .filter((metric) => metric.data.namespace_id === state.namespaceId)
                .map((metric) => ({
                    label: metric.label,
                    name: metric.key,
                }));
        }
        return [];
    }),
    labelInfoItems: computed<SelectDropdownMenuItem[]>(() => props.item.labels_info.map((labelKey) => ({
        label: labelKey.name,
        name: labelKey.key,
    }))),
});

const advancedOptionsState = reactive({
    advancedOptionsCollapsed: false,
    additionalLabels: [] as AdditionalLabel[],
    separateDate: false,
    timeDiffList: computed<SelectDropdownMenuItem[]>(() => [
        { label: 'None', name: 'none' },
        { label: 'Year', name: 'year' },
        { label: 'Month', name: 'month' },
        { label: 'Day', name: 'day' },
    ]),
    selectedTimeDiff: 'none',
    timeDiffDateMap: computed<Record<string, SelectDropdownMenuItem[]>>(() => ({
        year: range(3).map((i) => ({
            label: i === 0 ? 'Last 1 Year' : `Last ${i + 1} Years`,
            name: String(i + 1),
        })),
        month: range(12).map((i) => ({
            label: i === 0 ? 'Last 1 Month' : `Last ${i + 1} Months`,
            name: String(i + 1),
        })),
        day: range(31).map((i) => ({
            label: i === 0 ? 'Last 1 Day' : `Last ${i + 1} Days`,
            name: String(i + 1),
        })),
    })),
    selectedTimeDiffDate: undefined as string|undefined,
});

/* Events */
const handleSelectDataTable = async (dataTableId: string) => {
    widgetGenerateStore.setSelectedDataTableId(dataTableId);
    await widgetGenerateStore.loadDataTable(dataTableId);
};

const handleSelectSourceItem = (selectedItem: string) => {
    state.selectedSourceEndItem = selectedItem;
};

const handleClickToggleAdvancedOptionsForm = () => {
    advancedOptionsState.advancedOptionsCollapsed = !advancedOptionsState.advancedOptionsCollapsed;
};

const handleClickTimeDiff = (timeDiff: string) => {
    advancedOptionsState.selectedTimeDiff = timeDiff;
    advancedOptionsState.selectedTimeDiffDate = undefined;
};
const handleClickTimeDiffDate = (timeDiffDate: string) => {
    advancedOptionsState.selectedTimeDiffDate = timeDiffDate;
};

const handleClickAddLabel = () => {
    advancedOptionsState.additionalLabels.push({
        key: getRandomId(),
        name: '',
        value: '',
    });
};

const handleChangeLabel = (key: string, value: string, type: 'name' | 'value') => {
    const targetIndex = advancedOptionsState.additionalLabels.findIndex((label) => label.key === key);
    if (targetIndex !== -1) {
        advancedOptionsState.additionalLabels[targetIndex][type] = value;
    }
};

const handleRemoveLabel = (key: string) => {
    const targetIndex = advancedOptionsState.additionalLabels.findIndex((label) => label.key === key);
    if (targetIndex !== -1) {
        advancedOptionsState.additionalLabels.splice(targetIndex, 1);
    }
};

onMounted(() => {
    state.selectedGroupByItems = [...(props.item.options?.group_by || [])];
    state.dataFieldName = props.item.source_type === DATA_SOURCE_DOMAIN.COST
        ? state.selectableSourceItems[0]?.label
        : storeState.metrics[state.selectedSourceEndItem]?.data?.unit;
});

watch(() => state.selectedSourceEndItem, (_selectedSourceItem) => {
    // Base Options
    state.selectedGroupByItems = [];
    state.dataFieldName = props.item.source_type === DATA_SOURCE_DOMAIN.COST
        ? state.selectableSourceItems.find((source) => source.name === _selectedSourceItem)?.label
        : storeState.metrics[_selectedSourceItem]?.data?.unit;
    // TODO: reset filters
    // Advanced Options
    advancedOptionsState.additionalLabels = [];
    advancedOptionsState.separateDate = false;
    advancedOptionsState.selectedTimeDiff = 'none';
});

</script>

<template>
    <div class="widget-form-data-table-card">
        <div class="card-wrapper"
             :class="{ 'selected': state.selected }"
        >
            <div class="card-header">
                <div class="title-wrapper">
                    <button class="selected-radio-icon"
                            @click="handleSelectDataTable(props.item.data_table_id)"
                    >
                        <p-i :name="state.selected ? 'ic_checkbox-circle-selected' : 'ic_radio'"
                             :color="state.selected ? violet[500] : gray[400]"
                             size="md"
                        />
                    </button>
                    <p>Data Source 1</p>
                    <p-icon-button class="edit-button"
                                   style-type="transparent"
                                   name="ic_edit-text"
                                   size="sm"
                    />
                </div>
                <div class="data-source-wrapper">
                    <div class="selected-source">
                        <div class="source-img">
                            <img>
                        </div>
                        <span>{{ state.selectedParentSourceName }}</span>
                    </div>
                    <p-select-dropdown class="selectable-source-dropdown"
                                       :menu="state.selectableSourceItems"
                                       :selected="state.selectedSourceEndItem"
                                       @update:selected="handleSelectSourceItem"
                    />
                </div>
            </div>
            <div class="options-form">
                <p-field-group label="Group by"
                               required
                >
                    <p-select-dropdown class="group-by-select-dropdown"
                                       :menu="state.labelInfoItems"
                                       :selected.sync="state.selectedGroupByItems"
                                       multi-selectable
                                       appearance-type="badge"
                    />
                </p-field-group>
                <widget-form-data-table-card-filters :source-type="state.sourceType"
                                                     :source-id="state.selectedSourceEndItem"
                                                     :filters.sync="state.filters"
                />
                <p-field-group label="Data Field Name"
                               required
                >
                    <p-text-input v-model="state.dataFieldName"
                                  class="data-field-name-input"
                                  placeholder="Name"
                    />
                </p-field-group>
                <p-divider class="filter-divider" />

                <div class="form-group-wrapper"
                     :class="{ 'collapsed': advancedOptionsState.advancedOptionsCollapsed }"
                >
                    <div class="title-wrapper"
                         @click="handleClickToggleAdvancedOptionsForm"
                    >
                        <p-i name="ic_chevron-down"
                             width="1.25rem"
                             height="1.25rem"
                             color="inherit transparent"
                             class="arrow-button"
                        />
                        <span>Advanced Options</span>
                    </div>
                    <div class="form-wrapper">
                        <p-field-group label="Additional Labels"
                                       required
                        >
                            <div class="additional-labels-wrapper">
                                <div v-if="advancedOptionsState.additionalLabels.length"
                                     class="field-title-wrapper"
                                >
                                    <p-field-title class="field-title"
                                                   label="Name"
                                                   size="sm"
                                                   color="gray"
                                                   inline
                                    />
                                    <p-field-title class="field-title"
                                                   label="Value"
                                                   size="sm"
                                                   color="gray"
                                                   inline
                                    />
                                </div>
                                <div v-for="(labelInfo) in advancedOptionsState.additionalLabels"
                                     :key="labelInfo.key"
                                     class="label-wrapper"
                                >
                                    <p-text-input class="label-input"
                                                  block
                                                  :value="labelInfo.name"
                                                  @update:value="handleChangeLabel(labelInfo.key, $event, 'name')"
                                    />
                                    <p-text-input class="label-input"
                                                  block
                                                  :value="labelInfo.value"
                                                  @update:value="handleChangeLabel(labelInfo.key, $event, 'value')"
                                    />
                                    <p-icon-button name="ic_delete"
                                                   @click="handleRemoveLabel(labelInfo.key)"
                                    />
                                </div>
                                <p-button style-type="tertiary"
                                          icon-left="ic_plus_bold"
                                          @click="handleClickAddLabel"
                                >
                                    Add Label
                                </p-button>
                            </div>
                        </p-field-group>
                        <p-field-group label="Separate Date"
                                       required
                        >
                            <div class="separate-date-wrapper">
                                <p class="description">
                                    Separate date into 3 columns (Year, Month, Day)
                                </p>
                                <p-toggle-button :value.sync="advancedOptionsState.separateDate"
                                                 show-state-text
                                                 position="left"
                                />
                            </div>
                        </p-field-group>
                        <p-field-group label="Time Diff"
                                       required
                        >
                            <div class="time-diff-dropdown-wrapper">
                                <p-select-dropdown class="time-diff-dropdown"
                                                   use-fixed-menu-style
                                                   :menu="advancedOptionsState.timeDiffList"
                                                   :selected="advancedOptionsState.selectedTimeDiff"
                                                   @update:selected="handleClickTimeDiff"
                                />
                                <p-select-dropdown class="time-diff-date-dropdown"
                                                   use-fixed-menu-style
                                                   :disabled="advancedOptionsState.selectedTimeDiff === 'none'"
                                                   :menu="advancedOptionsState.timeDiffDateMap[advancedOptionsState.selectedTimeDiff] || []"
                                                   :selected="advancedOptionsState.selectedTimeDiffDate"
                                                   @update:selected="handleClickTimeDiffDate"
                                />
                            </div>
                        </p-field-group>
                    </div>
                </div>
            </div>

            <div class="button-group-wrapper">
                <p-button style-type="tertiary"
                          icon-left="ic_delete"
                >
                    Delete
                </p-button>
                <div class="form-button-wrapper">
                    <p-button style-type="transparent"
                              icon-left="ic_refresh"
                    >
                        Reset
                    </p-button>
                    <p-button style-type="secondary">
                        Apply
                    </p-button>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.widget-form-data-table-card {
    @apply relative;
    height: auto;

    .card-wrapper {
        @apply relative border border-gray-300 rounded-lg w-full bg-white;
        width: 24rem;
        overflow: hidden;
        height: auto;

        &.selected {
            @apply border-violet-600;
            box-shadow: 0 0 0 0.1875rem rgba(137, 124, 214, 0.6);
        }

        .card-header {
            @apply bg-gray-100;
            padding: 0.5rem 0.75rem;

            .title-wrapper {
                @apply flex items-center text-paragraph-sm font-bold;
                gap: 0.125rem;
                margin-bottom: 0.5rem;
                .selected-radio-icon {
                    width: 1.5rem;
                    height: 1.5rem;
                }
            }
            .data-source-wrapper {
                .selected-source {
                    @apply flex items-center gap-1 text-label-md text-gray-900;
                    margin-bottom: 0.25rem;
                    .source-img {
                        @apply rounded flex items-center justify-center bg-violet-150;
                        width: 1.5rem;
                        height: 1.5rem;
                    }
                }
                .selectable-source-dropdown {
                    @apply w-full;
                }
            }
        }
        .options-form {
            padding: 0.75rem;

            .filter-divider {
                margin-top: 1rem;
            }

            .group-by-select-dropdown {
                @apply w-full;
            }
            .data-field-name-input {
                @apply w-full;
            }

            .form-group-wrapper {
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
                    padding: 0.5rem 0 0.25rem 1.25rem;
                    .additional-labels-wrapper {
                        @apply bg-gray-100 rounded-lg;
                        padding: 0.5rem;
                        margin-top: 0.25rem;

                        .field-title-wrapper {
                            margin-bottom: 0.25rem;
                            .field-title {
                                width: calc(50% - 0.875rem);
                            }
                        }
                        .label-wrapper {
                            @apply flex gap-1;
                            margin-bottom: 0.5rem;
                        }
                    }

                    .separate-date-wrapper {
                        .description {
                            @apply text-paragraph-sm text-gray-900;
                            margin-bottom: 0.5rem;
                        }
                    }
                    .time-diff-dropdown-wrapper {
                        @apply flex gap-2;
                        margin-top: 0.25rem;
                        .time-diff-dropdown {
                            width: 25%;
                        }
                        .time-diff-date-dropdown {
                            width: 75%;
                        }
                    }
                }
            }
        }

        .button-group-wrapper {
            @apply border-t border-gray-200 flex justify-between;
            padding: 0.75rem 1rem;

            .form-button-wrapper {
                @apply flex gap-2;
            }
        }
    }
}
</style>
