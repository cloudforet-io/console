<script setup lang="ts">

import { computed, reactive } from 'vue';

import {
    PFieldGroup, PDivider, PIconButton, PI, PButton, PSelectDropdown,
} from '@spaceone/design-system';
import type { SelectDropdownMenuItem } from '@spaceone/design-system/src/inputs/dropdown/select-dropdown/type';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { CostDataSourceReferenceMap } from '@/store/reference/cost-data-source-reference-store';
import type { MetricReferenceMap } from '@/store/reference/metric-reference-store';
import type { NamespaceReferenceMap } from '@/store/reference/namespace-reference-store';

import { DATA_SOURCE_DOMAIN } from '@/common/modules/widgets/_constants/widget-constant';
import { useWidgetGenerateStore } from '@/common/modules/widgets/_store/widget-generate-store';
import type { DataTableModel } from '@/common/modules/widgets/types/widget-model';

import { gray, violet } from '@/styles/colors';

interface Props {
    item: DataTableModel;
}

const props = defineProps<Props>();
const widgetGenerateStore = useWidgetGenerateStore();
const widgetGenerateGetters = widgetGenerateStore.getters;
const allReferenceStore = useAllReferenceStore();

const storeState = reactive({
    dataSources: computed<CostDataSourceReferenceMap>(() => allReferenceStore.getters.costDataSource),
    metrics: computed<MetricReferenceMap>(() => allReferenceStore.getters.metric),
    namespaces: computed<NamespaceReferenceMap>(() => allReferenceStore.getters.namespace),
});

const state = reactive({
    selected: computed(() => widgetGenerateGetters.selectedDataTableId === props.item.data_table_id),
    sourceType: computed(() => props.item.source_type),
    options: computed(() => props.item.options),
    dataSourceId: computed(() => state.options[state.sourceType].data_source_id), // COST only
    metricId: computed(() => state.options[state.sourceType].metric_id), // ASSET only
    namespaceId: computed(() => storeState.metrics[state.metricId]?.data.namespace_id || ''), // ASSET only
    selectedSourceName: computed(() => {
        if (state.sourceType === DATA_SOURCE_DOMAIN.COST) {
            return storeState.dataSources[state.dataSourceId]?.label;
        }
        if (state.sourceType === DATA_SOURCE_DOMAIN.ASSET) {
            return storeState.namespaces[state.namespaceId]?.label;
        }
        return '';
    }),
    selectedSourceEndItem: props.item.source_type === DATA_SOURCE_DOMAIN.COST
        ? props.item.options[DATA_SOURCE_DOMAIN.COST].dataKey
        : props.item.options[DATA_SOURCE_DOMAIN.ASSET].metric_id,
    selectedGroupByItems: [...(props.item.options?.group_by || [])],
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

/* Events */
const handleSelectDataTable = async (dataTableId: string) => {
    widgetGenerateStore.setSelectedDataTable(dataTableId);
    await widgetGenerateStore.loadDataTable(dataTableId);
};

</script>

<template>
    <div class="widget-form-data-source-card">
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
                        <span>{{ state.selectedSourceName }}</span>
                    </div>
                    <p-select-dropdown class="selectable-source-dropdown"
                                       :menu="state.selectableSourceItems"
                                       :selected.sync="state.selectableSourceItems"
                    />
                </div>
            </div>
            <div class="options-form">
                <p-field-group label="Group by">
                    <p-select-dropdown class="group-by-select-dropdown"
                                       :menu="state.labelInfoItems"
                                       :selected="state.selectedGroupByItems"
                                       multi-selectable
                                       appearance-type="badge"
                    />
                </p-field-group>
                <p-divider class="filter-divider" />
                <p-button style-type="tertiary"
                          icon-left="ic_plus_bold"
                          block
                >
                    Add Filter
                </p-button>
                <p-button class="save-changes-button"
                          style-type="secondary"
                >
                    Save Changes
                </p-button>
            </div>
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.widget-form-data-source-card {
    @apply relative flex;

    .card-wrapper {
        @apply relative border border-gray-300 rounded-lg w-full;
        width: 24rem;
        overflow: hidden;
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
            @apply bg-white;
            padding: 0.75rem;

            .filter-divider {
                margin: 0.75rem 0;
            }

            .group-by-select-dropdown {
                @apply w-full;
            }
        }
        .save-changes-button {
            @apply relative;
            margin-top: 0.75rem;
        }
    }

    .add-data-source-floating-button {
        @apply flex items-center justify-center;
        width: 4rem;
        height: 4rem;

        .add-button {
            @apply relative flex items-center justify-center border border-violet-400 bg-violet-300 rounded-full;
            width: 2.5rem;
            height: 2.5rem;

            &::before {
                @apply bg-violet-400;
                content: '';
                position: absolute;
                left: -0.8125rem;
                top: 50%;
                transform: translateY(-50%);
                width: 0.75rem;
                height: 0.0625rem;
            }
        }
    }
}
</style>
