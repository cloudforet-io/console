<script setup lang="ts">

import {
    computed, onMounted, reactive, watch,
} from 'vue';


import {
    PIconButton, PI, PButton, PButtonModal, PTextInput, PTooltip,
} from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/src/inputs/context-menu/type';
import type { SelectDropdownMenuItem } from '@spaceone/design-system/src/inputs/dropdown/select-dropdown/type';

import { GRANULARITY } from '@/schema/dashboard/_constants/widget-constant';
import type { DataTableUpdateParameters } from '@/schema/dashboard/public-data-table/api-verbs/update';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { CostDataSourceReferenceMap } from '@/store/reference/cost-data-source-reference-store';
import type { MetricReferenceMap } from '@/store/reference/metric-reference-store';


import { showErrorMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';
import getRandomId from '@/lib/random-id-generator';

import WidgetFormDataTableCardAddForm from '@/common/modules/widgets/_components/WidgetFormDataTableCardAddForm.vue';
import WidgetFormDataTableCardSourceForm
    from '@/common/modules/widgets/_components/WidgetFormDataTableCardSourceForm.vue';
import { DATA_SOURCE_DOMAIN } from '@/common/modules/widgets/_constants/data-table-constant';
import { useWidgetGenerateStore } from '@/common/modules/widgets/_store/widget-generate-store';
import type { AdditionalLabel } from '@/common/modules/widgets/types/widget-data-table-type';
import type { DataTableModel, AdditionalLabels, DateFormat } from '@/common/modules/widgets/types/widget-model';

import { gray, violet } from '@/styles/colors';

interface Props {
    item: DataTableModel;
}

const props = defineProps<Props>();
const widgetGenerateStore = useWidgetGenerateStore();
const widgetGenerateState = widgetGenerateStore.state;
const allReferenceStore = useAllReferenceStore();

const storeState = reactive({
    costDataSources: computed<CostDataSourceReferenceMap>(() => allReferenceStore.getters.costDataSource),
    metrics: computed<MetricReferenceMap>(() => allReferenceStore.getters.metric),
    selectedDataTableId: computed(() => widgetGenerateState.selectedDataTableId),
    dataTables: computed(() => widgetGenerateState.dataTables),
});

const state = reactive({
    selected: computed(() => widgetGenerateState.selectedDataTableId === props.item.data_table_id),
    sourceType: computed(() => props.item.source_type),
    options: computed(() => props.item.options),
    dataSourceId: computed(() => state.options[state.sourceType].data_source_id), // COST only
    metricId: computed(() => state.options[state.sourceType].metric_id), // ASSET only
    namespaceId: computed(() => storeState.metrics[state.metricId]?.data.namespace_id || ''), // ASSET only
    selectedSourceEndItem: props.item.source_type === DATA_SOURCE_DOMAIN.COST
        ? props.item.options[DATA_SOURCE_DOMAIN.COST]?.data_key
        : props.item.options[DATA_SOURCE_DOMAIN.ASSET]?.metric_id,
    selectedGroupByItems: [] as { name: string; label: string; }[],
    filters: {} as Record<string, string[]>,
    dataFieldName: '',
    dataUnit: '',
    selectableSourceItems: computed<SelectDropdownMenuItem[]>(() => {
        if (state.sourceType === DATA_SOURCE_DOMAIN.COST) {
            return state.costDataTypeItems;
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
    costDataTypeItems: computed(() => {
        const targetCostDataSource = storeState.costDataSources[state.dataSourceId];
        const costAlias: string|undefined = targetCostDataSource?.data?.plugin_info?.metadata?.alias?.cost;
        const usageAlias: string|undefined = targetCostDataSource?.data?.plugin_info?.metadata?.alias?.usage;
        const additionalMenuItems: MenuItem[] = targetCostDataSource.data?.cost_data_keys?.map((key) => ({
            name: key, label: key,
        }));
        return [
            { name: 'cost', label: costAlias ? `Cost (${costAlias})` : 'Cost' },
            { name: 'usage', label: usageAlias ? `Usage (${usageAlias})` : 'Usage' },
            ...(additionalMenuItems || []),
        ];
    }),
});

const dataTableNameState = reactive({
    editMode: false,
    dataTableName: props.item.name,
});

const advancedOptionsState = reactive({
    additionalLabels: [] as AdditionalLabel[],
    separateDate: false,
    selectedTimeDiff: 'none',
    selectedTimeDiffDate: undefined as string|undefined,
});

const modalState = reactive({
    visible: false,
    mode: '' as 'DELETE'|'DELETE_UNABLED'|'RESET',
    headerTitle: computed(() => {
        if (modalState.mode === 'DELETE') {
            return 'Delete Data';
        } if (modalState.mode === 'DELETE_UNABLED') {
            return 'Cannot Delete the Data';
        } if (modalState.mode === 'RESET') {
            return 'Are you sure you want to reset the data options?';
        }
        return '';
    }),
    description: computed(() => {
        if (modalState.mode === 'DELETE') {
            return 'Are you sure you want to delete this data?';
        } if (modalState.mode === 'DELETE_UNABLED') {
            return 'This data is currently in use by {data_name}. \nDelete {data_name} first before deleting this data.';
        } if (modalState.mode === 'RESET') {
            return 'Resetting the data options will revert all inputss to their most recent values. This action cannot be undone.';
        }
        return '';
    }),
});



/* Events */
const handleUpdateDataTableName = (value: string) => {
    if (value.length <= 60) {
        dataTableNameState.dataTableName = value;
    }
};
const handleClickNameConfirm = async () => {
    const editedDataTableName = dataTableNameState.dataTableName.trim();
    if (props.item.name === editedDataTableName) {
        dataTableNameState.editMode = false;
        return;
    }
    const dataTableNames = storeState.dataTables.map((dataTable) => dataTable.name);
    if (dataTableNames.includes(editedDataTableName)) {
        showErrorMessage('A data with this name already exists.', '');
        return;
    }
    await widgetGenerateStore.updateDataTable({
        data_table_id: props.item.data_table_id,
        name: editedDataTableName,
    });
    showSuccessMessage('Data name successfully changed.', '');
    dataTableNameState.editMode = false;
};
const handleClickNameEdit = () => {
    dataTableNameState.editMode = true;
};
const handleSelectDataTable = async (dataTableId: string) => {
    widgetGenerateStore.setSelectedDataTableId(dataTableId);
    widgetGenerateStore.setSelectedPreviewGranularity(GRANULARITY.MONTHLY);
};

const handleSelectSourceItem = (selectedItem: string) => {
    state.selectedSourceEndItem = selectedItem;
};

const handleClickDeleteDataTable = async () => {
    // TODO: Check if the data is in use
    modalState.mode = 'DELETE';
    modalState.visible = true;
};
const handleClickResetDataTable = () => {
    modalState.mode = 'RESET';
    modalState.visible = true;
};
const handleConfirmModal = async () => {
    if (modalState.mode === 'DELETE') {
        const beforeSelectedDataTableId = storeState.selectedDataTableId;
        const deleteParams = {
            data_table_id: props.item.data_table_id,
        };
        await widgetGenerateStore.deleteDataTable(deleteParams);
        if (beforeSelectedDataTableId === props.item.data_table_id) {
            const dataTableId = storeState.dataTables.length ? storeState.dataTables[0]?.data_table_id : undefined;
            widgetGenerateStore.setSelectedDataTableId(dataTableId);
        }
    }
    if (modalState.mode === 'RESET') {
        setInitialDataTableForm();
    }
    modalState.visible = false;
};
const handleCancelModal = () => {
    modalState.visible = false;
};
const handleUpdateDataTable = async () => {
    const additionalLabelsRequest = {} as AdditionalLabels;
    advancedOptionsState.additionalLabels.forEach((label) => {
        additionalLabelsRequest[label.name] = label.value;
    });
    const domainOptions = state.sourceType === DATA_SOURCE_DOMAIN.COST
        ? { data_source_id: state.dataSourceId, data_key: state.selectedSourceEndItem }
        : { metric_id: state.selectedSourceEndItem };

    const costGroupBy = state.selectedGroupByItems.map((group) => ({
        key: group.name,
        name: group.label,
    }));
    const metricLabelsInfo = storeState.metrics[state.metricId ?? '']?.data?.labels_info;
    const assetGroupBy = (metricLabelsInfo ?? []).filter((label) => state.selectedGroupByItems.map((group) => group.name).includes(label.key));


    const updateParams: DataTableUpdateParameters = {
        data_table_id: props.item.data_table_id,
        options: {
            [state.sourceType]: domainOptions,
            group_by: state.sourceType === DATA_SOURCE_DOMAIN.COST ? costGroupBy : assetGroupBy,
            filters: [],
            filters_or: [],
            data_name: state.dataFieldName,
            data_unit: state.dataUnit,
            additional_labels: additionalLabelsRequest,
            date_format: (advancedOptionsState.separateDate ? 'SEPARATE' : 'SINGLE') as DateFormat,
            timediff: advancedOptionsState.selectedTimeDiff !== 'none' && Number(advancedOptionsState.selectedTimeDiffDate)
                ? { [advancedOptionsState.selectedTimeDiff]: -Number(advancedOptionsState.selectedTimeDiffDate) }
                : undefined,
        },
    };
    await widgetGenerateStore.updateDataTable(updateParams);
    if (storeState.selectedDataTableId === props.item.data_table_id) {
        widgetGenerateStore.setDataTableUpdating(true);
        await widgetGenerateStore.loadDataTable({
            data_table_id: props.item.data_table_id,
        });
    }
};

/* Utils */
const setInitialDataTableForm = () => {
    // Initial Form Setting
    // Basic Options
    const initialGroupBy = (props.item.options?.group_by || []).map((group) => ({
        label: group.name,
        name: group.key,
    }));
    // TODO: refactor groupBy & set filters
    state.selectedGroupByItems = [...initialGroupBy];

    state.dataFieldName = props.item.options.data_name || '';
    state.dataUnit = props.item.options.data_unit || '';

    // Advanced Options
    const initialAdditionalLabels = (props.item.options.additional_labels || {})as AdditionalLabels;
    advancedOptionsState.additionalLabels = Object.entries(initialAdditionalLabels).map(([key, value]) => ({
        key: getRandomId(),
        name: key,
        value,
    }));
    const initialSeparateDate = props.item.options?.date_format;
    advancedOptionsState.separateDate = !!(initialSeparateDate && initialSeparateDate === 'SEPARATE');
    const timeDiff = props.item.options?.timediff;
    const timeDiffKeys = Object.keys(timeDiff || {});
    const selectedKey = timeDiffKeys.length ? timeDiffKeys[0] : 'none';
    advancedOptionsState.selectedTimeDiff = selectedKey;
    advancedOptionsState.selectedTimeDiffDate = selectedKey === 'none' ? undefined : `${-timeDiff[selectedKey]}`;
};

onMounted(() => {
    // Initial Form Setting
    setInitialDataTableForm();
});

watch(() => state.selectedSourceEndItem, (_selectedSourceItem) => {
    // Base Options
    state.selectedGroupByItems = [];
    state.dataFieldName = state.selectableSourceItems.find((source) => source.name === _selectedSourceItem)?.label;
    state.dataUnit = state.sourceType === DATA_SOURCE_DOMAIN.ASSET ? storeState.metrics[_selectedSourceItem]?.data?.unit || '' : '';
    state.filters = {};


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
                    <div v-if="dataTableNameState.editMode"
                         class="data-table-name-form"
                    >
                        <p-text-input :value="dataTableNameState.dataTableName"
                                      class="name-input"
                                      size="sm"
                                      @update:value="handleUpdateDataTableName"
                                      @keydown.enter="handleClickNameConfirm"
                        />
                        <p-icon-button name="ic_check"
                                       size="sm"
                                       @click="handleClickNameConfirm"
                        />
                    </div>
                    <div v-else
                         class="data-table-name-wrapper"
                    >
                        <p-i class="data-table-icon"
                             name="ic_service_data-sources"
                             width="1.25rem"
                             height="1.25rem"
                        />
                        <p-tooltip class="data-table-name"
                                   :contents="props.item.name"
                        >
                            <p>
                                {{ props.item.name }}
                            </p>
                        </p-tooltip>
                        <p-icon-button class="edit-button"
                                       style-type="transparent"
                                       name="ic_edit-text"
                                       size="sm"
                                       @click="handleClickNameEdit"
                        />
                    </div>
                </div>
                <widget-form-data-table-card-source-form :source-type="state.sourceType"
                                                         :parent-source-id="state.sourceType === DATA_SOURCE_DOMAIN.COST ? state.dataSourceId : state.namespaceId"
                                                         :menu="state.selectableSourceItems"
                                                         :selected="state.selectedSourceEndItem"
                                                         @select="handleSelectSourceItem"
                />
            </div>
            <widget-form-data-table-card-add-form :source-id="state.sourceType === DATA_SOURCE_DOMAIN.COST ? state.dataSourceId : state.selectedSourceEndItem"
                                                  :source-key="state.selectedSourceEndItem"
                                                  :source-type="state.sourceType"
                                                  :selected-group-by-items.sync="state.selectedGroupByItems"
                                                  :filters.sync="state.filters"
                                                  :data-field-name.sync="state.dataFieldName"
                                                  :data-unit.sync="state.dataUnit"
                                                  :additional-labels.sync="advancedOptionsState.additionalLabels"
                                                  :separate-date.sync="advancedOptionsState.separateDate"
                                                  :selected-time-diff.sync="advancedOptionsState.selectedTimeDiff"
                                                  :selected-time-diff-date.sync="advancedOptionsState.selectedTimeDiffDate"
            />
            <div class="button-group-wrapper">
                <p-button style-type="tertiary"
                          icon-left="ic_delete"
                          @click="handleClickDeleteDataTable"
                >
                    Delete
                </p-button>
                <div class="form-button-wrapper">
                    <p-button style-type="transparent"
                              icon-left="ic_refresh"
                              @click="handleClickResetDataTable"
                    >
                        Reset
                    </p-button>
                    <p-button style-type="secondary"
                              @click="handleUpdateDataTable"
                    >
                        Apply
                    </p-button>
                </div>
            </div>
        </div>
        <p-button-modal :visible="modalState.visible"
                        size="sm"
                        theme-color="alert"
                        :header-title="modalState.headerTitle"
                        :hide-footer-close-button="modalState.mode === 'DELETE_UNABLED'"
                        @confirm="handleConfirmModal"
                        @cancel="handleCancelModal"
        >
            <template #body>
                <p>{{ modalState.description }}</p>
            </template>
            <template v-if="modalState.mode === 'DELETE_UNABLED'"
                      #confirm-button
            >
                OK
            </template>
        </p-button-modal>
    </div>
</template>

<style lang="postcss" scoped>
.widget-form-data-table-card {
    @apply relative;
    height: auto;

    .card-wrapper {
        @apply relative border border-gray-300 rounded-lg w-full bg-white;
        width: 24rem;
        height: auto;

        &.selected {
            @apply border-violet-600;
            box-shadow: 0 0 0 0.1875rem rgba(137, 124, 214, 0.6);
        }

        .card-header {
            @apply bg-gray-100 rounded-lg;
            padding: 0.5rem 0.75rem;

            .title-wrapper {
                @apply flex items-center text-paragraph-sm font-bold w-full;
                gap: 0.125rem;
                margin-bottom: 0.5rem;
                .selected-radio-icon {
                    width: 1.5rem;
                    height: 1.5rem;
                }
                .data-table-name-wrapper {
                    @apply inline-flex items-center gap-1;
                    overflow: hidden;
                    width: auto;
                    .data-table-name {
                        overflow: hidden;
                        p {
                            @apply truncate;
                        }
                    }
                    .data-table-icon {
                        min-width: 1.25rem;
                        margin-right: 0.125rem;
                    }
                }
                .data-table-name-form {
                    @apply flex items-center;
                    width: calc(100% - 1.625rem);
                    gap: 0.0625rem;

                    /* custom design-system component - p-text-input */
                    :deep(.p-text-input) {
                        @apply w-full font-normal;
                        height: 1.5rem;
                        .tag-container {
                            padding: 0;
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
