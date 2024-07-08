<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';

import {
    PButton, PPopover, PSelectCard, PI,
} from '@spaceone/design-system';
import { POPOVER_TRIGGER } from '@spaceone/design-system/src/data-display/popover/type';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { PrivateWidgetCreateParameters } from '@/schema/dashboard/private-widget/api-verbs/create';
import type { PrivateWidgetModel } from '@/schema/dashboard/private-widget/model';
import type { DataTableAddParameters } from '@/schema/dashboard/public-data-table/api-verbs/add';
import type { PublicWidgetCreateParameters } from '@/schema/dashboard/public-widget/api-verbs/create';
import type { PublicWidgetModel } from '@/schema/dashboard/public-widget/model';
import { store } from '@/store';
import { i18n } from '@/translations';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { CostDataSourceReferenceMap } from '@/store/reference/cost-data-source-reference-store';
import type { MetricReferenceMap } from '@/store/reference/metric-reference-store';
import type { NamespaceReferenceMap } from '@/store/reference/namespace-reference-store';

import ErrorHandler from '@/common/composables/error/errorHandler';
import WidgetFormAssetSecurityDataSourcePopper
    from '@/common/modules/widgets/_components/WidgetFormAssetSecurityDataSourcePopper.vue';
import WidgetFormCostDataSourcePopper from '@/common/modules/widgets/_components/WidgetFormCostDataSourcePopper.vue';
import {
    DATA_SOURCE_DOMAIN,
    DATA_TABLE_OPERATOR,
    DATA_TABLE_TYPE, DEFAULT_DATE_SORT,
} from '@/common/modules/widgets/_constants/data-table-constant';
import { getDuplicatedDataTableName } from '@/common/modules/widgets/_helpers/widget-data-table-helper';
import { useWidgetGenerateStore } from '@/common/modules/widgets/_store/widget-generate-store';
import type {
    DataTableDataType, DataTableSourceType, DataTableOperator, DataTableAddOptions,
} from '@/common/modules/widgets/types/widget-model';

import { useDashboardDetailInfoStore } from '@/services/dashboards/stores/dashboard-detail-info-store';


const widgetGenerateStore = useWidgetGenerateStore();
const widgetGenerateState = widgetGenerateStore.state;
const allReferenceStore = useAllReferenceStore();
const dashboardDetailStore = useDashboardDetailInfoStore();
const dashboardDetailState = dashboardDetailStore.state;

const storeState = reactive({
    metrics: computed<MetricReferenceMap>(() => allReferenceStore.getters.metric),
    costDataSources: computed<CostDataSourceReferenceMap>(() => allReferenceStore.getters.costDataSource),
    namespaces: computed<NamespaceReferenceMap>(() => allReferenceStore.getters.namespace),
    dataTables: computed(() => widgetGenerateStore.state.dataTables),
});

const state = reactive({
    loading: false,
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
        const costAlias: string|undefined = storeState.costDataSources[state.selectedCostDataSourceId]?.data?.plugin_info?.metadata?.cost_info?.name;
        if (state.selectedCostDataType === 'cost') {
            return costAlias ? `Cost (${costAlias})` : 'Cost';
        }
        if (state.selectedCostDataType === 'usage_quantity') {
            return 'Usage';
        }
        return targetCostDataSource.data?.cost_data_keys?.find((key) => key === state.selectedCostDataType.replace('data.', '')) || '';
    }),
    operatorInfoList: computed<{ key: DataTableOperator, name: string; description: string; icon: string;}[]>(() => [
        {
            key: DATA_TABLE_OPERATOR.CONCAT,
            name: 'Concatenate',
            description: 'Combines multiple tables into one by stacking them.',
            icon: 'ic_db-concat',
        },
        {
            key: DATA_TABLE_OPERATOR.JOIN,
            name: 'Join',
            description: 'Merge rows from different tables based on a common column.',
            icon: 'ic_join',
        },
        {
            key: DATA_TABLE_OPERATOR.EVAL,
            name: 'Evaluate',
            description: 'Apply functions or calculations to data fields.',
            icon: 'ic_db-evaluation',
        },
        {
            key: DATA_TABLE_OPERATOR.QUERY,
            name: 'Query',
            description: 'Filter and extract data that meet specific conditions.',
            icon: 'ic_db-where',
        },

    ]),
});

/* Api */
const createWidget = async (): Promise<PublicWidgetModel|PrivateWidgetModel|null> => {
    const isPrivate = dashboardDetailState.dashboardId?.startsWith('private');
    const fetcher = isPrivate
        ? SpaceConnector.clientV2.dashboard.privateWidget.create<PrivateWidgetCreateParameters, PrivateWidgetModel>
        : SpaceConnector.clientV2.dashboard.publicWidget.create<PublicWidgetCreateParameters, PublicWidgetModel>;
    try {
        return await fetcher({
            dashboard_id: dashboardDetailState.dashboardId as string,
            tags: { created_by: store.state.user.userId },
            widget_type: 'table',
        });
    } catch (e) {
        ErrorHandler.handleError(e);
        return null;
    }
};

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
const handleClickOperator = (operator: DataTableOperator) => {
    widgetGenerateStore.createUnsavedTransformDataTable(operator);
    state.showPopover = false;
};
const handleSelectPopperCondition = (condition: DataTableDataType) => {
    state.selectedPopperCondition = condition;
};
const handleConfirmDataSource = async () => {
    state.loading = true;
    // create widget
    if (widgetGenerateState.overlayType === 'ADD' && !widgetGenerateState.widgetId) {
        const createdWidget = await createWidget();
        if (createdWidget) {
            widgetGenerateStore.setWidgetForm(createdWidget);
        }
    }

    if (state.selectedPopperCondition === DATA_TABLE_TYPE.ADDED) {
        const dataTableBaseName = state.selectedDataSourceDomain === DATA_SOURCE_DOMAIN.COST
            ? `${storeState.costDataSources[state.selectedCostDataSourceId].name} - ${state.selectedCostDataTypeLabel}`
            : `${state.selectedNamespace.name} - ${storeState.metrics[state.selectedMetricId]?.label}`;
        const addParameters = {
            source_type: state.selectedDataSourceDomain,
            name: getDuplicatedDataTableName(dataTableBaseName, widgetGenerateState.dataTables),
        } as DataTableAddParameters;
        const dataKey = state.selectedCostDataType?.replace('data.', '');
        const costUnit: string|undefined = storeState.costDataSources[state.selectedCostDataSourceId]?.data?.plugin_info?.metadata?.cost_info?.unit;
        const additionalDataInfo: Record<string, { name: string, unit: string }>|undefined = storeState.costDataSources[state.selectedCostDataSourceId]?.data?.plugin_info?.metadata?.data_info;
        const additionalDataUnit = dataKey !== 'cost' && additionalDataInfo ? additionalDataInfo[dataKey]?.unit : undefined;
        let dataUnit: string|undefined;
        if (dataKey === 'cost') {
            dataUnit = costUnit;
        } else {
            dataUnit = additionalDataUnit;
        }
        const costOptions: DataTableAddOptions = {
            data_name: state.selectedCostDataTypeLabel,
            data_unit: dataUnit,
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
        const result = await widgetGenerateStore.createAddDataTable({
            ...addParameters,
            options: {
                ...state.selectedDataSourceDomain === DATA_SOURCE_DOMAIN.COST ? costOptions : assetOptions,
            },
        });
        if (!widgetGenerateState.selectedDataTableId && result) {
            widgetGenerateStore.setSelectedDataTableId(result?.data_table_id);
            await widgetGenerateStore.loadDataTable({
                data_table_id: result?.data_table_id,
                sort: DEFAULT_DATE_SORT,
            });
        }
    }
    state.showPopover = false;
    state.loading = false;
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
        <button :class="{'add-button': true, opened: state.showPopover}"
                @click="handleClickAddDataSourceButton"
        >
            <p-i class="icon"
                 name="ic_plus"
                 width="2rem"
                 height="2rem"
                 color="inherit"
            />
        </button>
        <template #content>
            <div v-if="!state.selectedPopperCondition"
                 class="data-source-popper-condition-wrapper"
            >
                <p-select-card :label="i18n.t('COMMON.WIDGETS.DATA_TABLE.ADD')"
                               icon="ic_service_data-sources"
                               block
                               @click="handleSelectPopperCondition(DATA_TABLE_TYPE.ADDED)"
                />
                <p-select-card :label="i18n.t('COMMON.WIDGETS.DATA_TABLE.TRANSFORM')"
                               icon="ic_transform-data"
                               block
                               @click="handleSelectPopperCondition(DATA_TABLE_TYPE.TRANSFORMED)"
                />
            </div>
            <div v-else-if="state.selectedPopperCondition === DATA_TABLE_TYPE.ADDED"
                 class="data-source-popover-content"
            >
                <div class="top-part">
                    <div class="data-source-domain-col">
                        <p class="data-source-domain-title">
                            {{ i18n.t('DASHBOARDS.WIDGET.OVERLAY.STEP_1.COST_EXPLORER') }}
                        </p>
                        <p-select-card :class="{'custom-select-card': true, 'selected': state.selectedDataSourceDomain === DATA_SOURCE_DOMAIN.COST }"
                                       :value="DATA_SOURCE_DOMAIN.COST"
                                       @click="handleClickDataSourceDomain(DATA_SOURCE_DOMAIN.COST)"
                        >
                            <div class="domain-contents">
                                <p-i v-if="state.selectedDataSourceDomain === DATA_SOURCE_DOMAIN.COST"
                                     class="selected-marker"
                                     name="ic_checkbox-circle-selected"
                                     width="1.25rem"
                                     height="1.25rem"
                                />
                                <div class="icon-wrapper">
                                    <p-i name="ic_data-domain-cost"
                                         width="1.25rem"
                                         height="1.25rem"
                                    />
                                </div>
                                <p class="name">
                                    {{ i18n.t('DASHBOARDS.WIDGET.OVERLAY.STEP_1.COST') }}
                                </p>
                            </div>
                        </p-select-card>
                        <p class="data-source-domain-title mt-2">
                            {{ i18n.t('DASHBOARDS.WIDGET.OVERLAY.STEP_1.INVENTORY') }}
                        </p>
                        <p-select-card :class="{'custom-select-card': true, 'selected': state.selectedDataSourceDomain === DATA_SOURCE_DOMAIN.ASSET }"
                                       :value="DATA_SOURCE_DOMAIN.ASSET"
                                       @click="handleClickDataSourceDomain(DATA_SOURCE_DOMAIN.ASSET)"
                        >
                            <div class="domain-contents">
                                <p-i v-if="state.selectedDataSourceDomain === DATA_SOURCE_DOMAIN.ASSET"
                                     class="selected-marker"
                                     name="ic_checkbox-circle-selected"
                                     width="1.25rem"
                                     height="1.25rem"
                                />
                                <div class="icon-wrapper">
                                    <p-i name="ic_data-domain-asset"
                                         width="1.25rem"
                                         height="1.25rem"
                                    />
                                </div>
                                <p class="name">
                                    {{ i18n.t('DASHBOARDS.WIDGET.OVERLAY.STEP_1.ASSET') }}
                                </p>
                            </div>
                        </p-select-card>
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
                              :loading="state.loading"
                              @click="handleConfirmDataSource"
                    >
                        {{ i18n.t('DASHBOARDS.WIDGET.OVERLAY.STEP_1.DONE') }}
                    </p-button>
                </div>
            </div>
            <div v-else
                 class="data-source-popper-operator-wrapper"
            >
                <p-select-card v-for="(operatorInfo) in state.operatorInfoList"
                               :key="operatorInfo.key"
                               value="operatorKey"
                               label="a"
                               block
                               @click="handleClickOperator(operatorInfo.key)"
                >
                    <div class="operator-card-contents">
                        <p-i :name="operatorInfo.icon"
                             width="1rem"
                             height="1rem"
                             color="inherit"
                        />
                        <div class="contents-wrapper">
                            <p class="name">
                                {{ operatorInfo.name }}
                            </p>
                            <p class="description">
                                {{ operatorInfo.description }}
                            </p>
                        </div>
                    </div>
                </p-select-card>
            </div>
        </template>
    </p-popover>
</template>

<style lang="scss" scoped>
.data-source-popover {
    width: 4.5rem;
    padding-right: 2rem;
    display: inline-block;
    position: relative;
    :deep(&.p-popover) {
        .popper {
            padding: 0;
        }
    }
    .add-button {
        @apply flex items-center justify-center bg-violet-400 border border-violet-500 text-white rounded-md;
        width: 2.5rem;
        height: 2.5rem;
        box-shadow: 0 0.02rem 0.04rem rgba(0, 0, 0, 0.06);
        .icon {
            transition: transform 0.2s ease;
        }
        &:hover {
            @apply bg-violet-500;
        }
        &.opened {
            @apply bg-white text-violet-500;
            .icon {
                transform: rotate(45deg);
            }
            &:hover {
                @apply bg-violet-200;
            }
        }
    }
    .data-source-popper-condition-wrapper {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        width: 21.5rem;
        padding: 1rem;
    }
    .data-source-popper-operator-wrapper {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        width: 21.5rem;
        padding: 1rem;

        .operator-card-contents {
            @apply flex gap-1;
            .contents-wrapper {
                width: calc(100% - 1.25rem);
                .name {
                    @apply text-label-md font-bold text-gray-900;
                    margin-bottom: 0.25rem;
                }
                .description {
                    @apply text-label-md text-gray-500;
                }
            }
        }
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

                /* custom design-system component - p-select-card */
                :deep(.p-select-card) {
                    padding: 0.75rem 1.25rem;
                }
                .custom-select-card {
                    &.selected {
                        @apply border-blue-600;
                    }
                    .domain-contents {
                        @apply flex items-center gap-1 w-full relative;
                        .icon-wrapper {
                            @apply flex items-center justify-center rounded-md bg-violet-150;
                            width: 1.75rem;
                            height: 1.75rem;
                        }
                        .name {
                            @apply text-label-md font-bold text-gray-900;
                        }

                        .selected-marker {
                            @apply absolute;
                            left: -0.75rem;
                            top: -0.25rem;
                            z-index: 1;
                        }

                        &.selected {
                            .name {
                                @apply text-blue-600;
                            }
                        }
                    }
                }

                .data-source-domain-title {
                    @apply text-label-sm font-bold text-gray-700;
                    margin-bottom: 0.5rem;
                }
                .p-select-card {
                    margin-bottom: 0.5rem;
                }
            }
            .empty-wrapper {
                @apply flex justify-center items-center text-gray-300 text-paragraph-md;
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
    padding: 1rem;
    .select-card-contents {
        @apply flex justify-start items-center;
        flex-direction: row;
        .p-lazy-img {
            margin-right: 0.25rem;
            margin-bottom: 0;
        }
    }
}

/* custom design-system component - p-context-menu */
:deep(.p-context-menu) {
    border: none;
    .menu-container {
        height: 23.25rem;
    }
}
</style>
