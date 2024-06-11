<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';

import {
    PButton, PPopover, PSelectCard,
} from '@spaceone/design-system';
import { POPOVER_TRIGGER } from '@spaceone/design-system/src/data-display/popover/type';

import type { DataTableAddParameters } from '@/schema/dashboard/public-data-table/api-verbs/add';
import { i18n } from '@/translations';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { CostDataSourceReferenceMap } from '@/store/reference/cost-data-source-reference-store';
import type { MetricReferenceMap } from '@/store/reference/metric-reference-store';
import type { NamespaceReferenceMap } from '@/store/reference/namespace-reference-store';

import WidgetFormAssetSecurityDataSourcePopper
    from '@/common/modules/widgets/_components/WidgetFormAssetSecurityDataSourcePopper.vue';
import WidgetFormCostDataSourcePopper from '@/common/modules/widgets/_components/WidgetFormCostDataSourcePopper.vue';
import WidgetFormDataSourceAddButton from '@/common/modules/widgets/_components/WidgetFormDataSourceAddButton.vue';
import { DATA_SOURCE_DOMAIN, DATA_TABLE_TYPE } from '@/common/modules/widgets/_constants/data-table-constant';
import { useWidgetGenerateStore } from '@/common/modules/widgets/_store/widget-generate-store';
import type { DataTableDataType, DataTableSourceType } from '@/common/modules/widgets/types/widget-model';



const widgetGenerateStore = useWidgetGenerateStore();
const allReferenceStore = useAllReferenceStore();

const storeState = reactive({
    metrics: computed<MetricReferenceMap>(() => allReferenceStore.getters.metric),
    costDataSources: computed<CostDataSourceReferenceMap>(() => allReferenceStore.getters.costDataSource),
    namespaces: computed<NamespaceReferenceMap>(() => allReferenceStore.getters.namespace),
    dataTables: computed(() => widgetGenerateStore.state.dataTables),
});

const state = reactive({
    showPopover: false,
    selectedPopperCondition: undefined as undefined|DataTableDataType,
    dataSourceDomainItems: computed(() => ([
        {
            name: DATA_SOURCE_DOMAIN.COST,
            label: i18n.t('DASHBOARDS.WIDGET.OVERLAY.STEP_1.COST'),
            icon: '_ic-ds-cost',
        },
        {
            name: DATA_SOURCE_DOMAIN.ASSET,
            label: i18n.t('DASHBOARDS.WIDGET.OVERLAY.STEP_1.ASSET'),
            icon: '_ic-ds-asset',
        },
        {
            name: DATA_SOURCE_DOMAIN.SECURITY,
            label: i18n.t('DASHBOARDS.WIDGET.OVERLAY.STEP_1.SECURITY'),
            icon: '_ic-ds-security',
        },
    ])),
    selectedDataSourceDomain: undefined as undefined|DataTableSourceType,
    disableConfirmButton: computed(() => {
        if (state.selectedDataSourceDomain === DATA_SOURCE_DOMAIN.COST) {
            return !state.selectedCostDataSourceId || !state.selectedCostDataType;
        }
        if ([DATA_SOURCE_DOMAIN.ASSET, DATA_SOURCE_DOMAIN.SECURITY].includes(state.selectedDataSourceDomain)) {
            return !state.selectedMetricId;
        }
        return true;
    }),
    // cost
    selectedCostDataSourceId: undefined as undefined|string,
    selectedCostDataType: undefined as undefined|string,
    // asset & security
    selectedMetricId: undefined as undefined|string,
    selectedNamespace: computed(() => {
        if (!state.selectedMetricId) return undefined;
        const namespaceId = storeState.metrics[state.selectedMetricId]?.data.namespace_id;
        if (!namespaceId) return undefined;
        return storeState.namespaces[namespaceId];
    }),
    selectedCostDataTypeLabel: computed(() => {
        if (!state.selectedCostDataSourceId || !state.selectedCostDataType) return '';
        const targetCostDataSource = storeState.costDataSources[state.selectedCostDataSourceId];
        const costAlias: string|undefined = targetCostDataSource?.data?.plugin_info?.metadata?.alias?.cost;
        const usageAlias: string|undefined = targetCostDataSource?.data?.plugin_info?.metadata?.alias?.usage;
        if (state.selectedCostDataType === 'cost') {
            return costAlias ? `Cost (${costAlias})` : 'Cost';
        }
        if (state.selectedCostDataType === 'usage') {
            return usageAlias ? `Usage (${usageAlias})` : 'Usage';
        }
        return targetCostDataSource.data?.cost_data_keys?.find((key) => key === state.selectedCostDataType);
    }),
});

/* Util */
const resetSelectedDataSource = () => {
    state.selectedCostDataSourceId = undefined;
    state.selectedCostDataType = undefined;
    state.selectedMetricId = undefined;
};

/* Event */
const handleClickAddDataSourceButton = () => {
    state.showPopover = !state.showPopover;
};
const handleClickDataSourceDomain = (domainName: DataTableSourceType) => {
    if (state.selectedDataSourceDomain === domainName) return;
    state.selectedDataSourceDomain = domainName;
    resetSelectedDataSource();
};
const handleSelectPopperCondition = (condition: DataTableDataType) => {
    state.selectedPopperCondition = condition;
};
const handleConfirmDataSource = async () => {
    if (state.selectedPopperCondition === DATA_TABLE_TYPE.ADD) {
        const dataTableBaseName = state.selectedDataSourceDomain === DATA_SOURCE_DOMAIN.COST
            ? `${storeState.costDataSources[state.selectedCostDataSourceId].name} - ${state.selectedCostDataTypeLabel}`
            : `${state.selectedNamespace.name} - ${storeState.metrics[state.selectedMetricId]?.label}`;
        const addParameters = {
            source_type: state.selectedDataSourceDomain,
            name: getDuplicatedDataTableName(dataTableBaseName),
        } as DataTableAddParameters;
        const costOptions = {
            data_name: state.selectedCostDataTypeLabel,
            COST: {
                data_source_id: state.selectedCostDataSourceId,
                data_key: state.selectedCostDataType,
            },
        };
        const assetOptions = {
            data_name: storeState.metrics[state.selectedMetricId]?.label,
            data_unit: storeState.metrics[state.selectedMetricId]?.data.unit,
            ASSET: {
                metric_id: state.selectedMetricId,
            },
        };
        await widgetGenerateStore.createAddDataTable({
            ...addParameters,
            options: {
                ...state.selectedDataSourceDomain === DATA_SOURCE_DOMAIN.COST ? costOptions : assetOptions,
            },
        });
    } else {
        // TODO: implement transform data table
        await widgetGenerateStore.createTransformDataTable({});
    }
    state.showPopover = false;
};

/* Utils */
const getDuplicatedDataTableName = (name: string): string => {
    let _name = name;
    const _regex = /^(.*?)\s*\((\d+)\)$/i;
    const dataTableNames = widgetGenerateStore.state.dataTables.map((dataTable) => dataTable.name);

    while (dataTableNames.includes(_name)) {
        const match = _regex.exec(_name);
        if (match) {
            const baseName = match[1];
            const numberStr = match[2];
            const newNumber = numberStr ? parseInt(numberStr) + 1 : 2;
            _name = `${baseName} (${newNumber})`;
        } else {
            _name = `${_name} (2)`;
        }
    }
    return _name;
};

watch(() => state.showPopover, (val) => {
    if (!val) {
        state.selectedDataSourceDomain = undefined;
        state.selectedPopperCondition = undefined;
    }
});
</script>

<template>
    <p-popover class="data-source-popover"
               :is-visible.sync="state.showPopover"
               position="right-start"
               hide-close-button
               hide-padding
               :trigger="POPOVER_TRIGGER.NONE"
    >
        <widget-form-data-source-add-button @click-add="handleClickAddDataSourceButton" />
        <template #content>
            <div v-if="!state.selectedPopperCondition"
                 class="data-source-popper-condition-wrapper"
            >
                <p-select-card :label="i18n.t('Add Data Table')"
                               icon="ic_service_data-sources"
                               block
                               @click="handleSelectPopperCondition(DATA_TABLE_TYPE.ADD)"
                />
                <p-select-card :label="i18n.t('Add Transformation')"
                               icon="ic_link"
                               block
                               @click="handleSelectPopperCondition(DATA_TABLE_TYPE.ADD)"
                />
            </div>
            <div v-else
                 class="data-source-popover-content"
            >
                <div class="top-part">
                    <div class="data-source-domain-col">
                        <p class="data-source-domain-title">
                            {{ i18n.t('DASHBOARDS.WIDGET.OVERLAY.STEP_1.COST_EXPLORER') }}
                        </p>
                        <p-select-card :label="i18n.t('DASHBOARDS.WIDGET.OVERLAY.STEP_1.COST')"
                                       :value="DATA_SOURCE_DOMAIN.COST"
                                       :selected="state.selectedDataSourceDomain"
                                       @click="handleClickDataSourceDomain(DATA_SOURCE_DOMAIN.COST)"
                        />
                        <p class="data-source-domain-title mt-2">
                            {{ i18n.t('DASHBOARDS.WIDGET.OVERLAY.STEP_1.INVENTORY') }}
                        </p>
                        <p-select-card :label="i18n.t('DASHBOARDS.WIDGET.OVERLAY.STEP_1.ASSET')"
                                       :value="DATA_SOURCE_DOMAIN.ASSET"
                                       :selected="state.selectedDataSourceDomain"
                                       @click="handleClickDataSourceDomain(DATA_SOURCE_DOMAIN.ASSET)"
                        />
                        <p-select-card :label="i18n.t('DASHBOARDS.WIDGET.OVERLAY.STEP_1.SECURITY')"
                                       :value="DATA_SOURCE_DOMAIN.SECURITY"
                                       :selected="state.selectedDataSourceDomain"
                                       @click="handleClickDataSourceDomain(DATA_SOURCE_DOMAIN.SECURITY)"
                        />
                    </div>
                    <template v-if="state.selectedDataSourceDomain">
                        <widget-form-cost-data-source-popper
                            v-if="state.selectedDataSourceDomain === DATA_SOURCE_DOMAIN.COST"
                            :selected-cost-data-source-id.sync="state.selectedCostDataSourceId"
                            :selected-cost-data-type.sync="state.selectedCostDataType"
                        />
                        <widget-form-asset-security-data-source-popper
                            v-if="[DATA_SOURCE_DOMAIN.ASSET, DATA_SOURCE_DOMAIN.SECURITY].includes(state.selectedDataSourceDomain)"
                            :data-source-domain="state.selectedDataSourceDomain"
                            :selected-metric-id.sync="state.selectedMetricId"
                        />
                    </template>
                    <template v-else>
                        <div class="empty-wrapper">
                            {{ $t('DASHBOARDS.WIDGET.OVERLAY.STEP_1.SELECT_DATA_SOURCE_TYPE') }}
                        </div>
                    </template>
                </div>
                <div class="popover-footer">
                    <p-button style-type="substitutive"
                              :disabled="state.disableConfirmButton"
                              @click="handleConfirmDataSource"
                    >
                        {{ i18n.t('DASHBOARDS.WIDGET.OVERLAY.STEP_1.DONE') }}
                    </p-button>
                </div>
            </div>
        </template>
    </p-popover>
</template>

<style lang="scss" scoped>
.data-source-popover {
    display: inline-block;
    position: relative;
    :deep(&.p-popover) {
        .popper {
            padding: 0;
        }
    }
    .data-source-popper-condition-wrapper {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        width: 16.25rem;
        padding: 1rem;
    }
    .data-source-popover-content {
        display: flex;
        flex-direction: column;
        min-width: 43.5rem;
        height: 30rem;
        .top-part {
            display: flex;
            width: 100%;
            flex: 1;
            .data-source-domain-col {
                @apply border-r border-gray-200;
                display: flex;
                flex-direction: column;
                min-width: 11.5rem;
                height: 100%;
                padding: 1rem 0.75rem;
                .data-source-domain-title {
                    @apply text-label-sm font-bold text-gray-700;
                    margin-bottom: 0.5rem;
                }
                .p-select-card {
                    margin-bottom: 0.5rem;
                }
            }
            .empty-wrapper {
                @apply flex justify-center items-center text-gray-300;
                width: 100%;
                height: 100%;
            }
        }
    }
    .popover-footer {
        @apply border-t border-gray-200;
        text-align: right;
        padding: 0.75rem;
    }
}

/* custom design-system component - p-select-card */
:deep(.p-select-card) {
    padding: 0.5rem;
}

/* custom design-system component - p-context-menu */
:deep(.p-context-menu) {
    border: none;
    .menu-container {
        height: 23.25rem;
    }
}
</style>
