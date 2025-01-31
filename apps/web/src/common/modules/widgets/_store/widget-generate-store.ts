import { computed, reactive } from 'vue';

import { cloneDeep } from 'lodash';
import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { PrivateDataTableModel } from '@/api-clients/dashboard/private-data-table/schema/model';
import type { PrivateWidgetUpdateParameters } from '@/api-clients/dashboard/private-widget/schema/api-verbs/update';
import type { PrivateWidgetModel } from '@/api-clients/dashboard/private-widget/schema/model';
import type { DataTableAddParameters } from '@/api-clients/dashboard/public-data-table/schema/api-verbs/add';
import type { DataTableDeleteParameters } from '@/api-clients/dashboard/public-data-table/schema/api-verbs/delete';
import type { DataTableListParameters } from '@/api-clients/dashboard/public-data-table/schema/api-verbs/list';
import type { DataTableTransformParameters } from '@/api-clients/dashboard/public-data-table/schema/api-verbs/transform';
import type { DataTableUpdateParameters } from '@/api-clients/dashboard/public-data-table/schema/api-verbs/update';
import type { PublicDataTableModel } from '@/api-clients/dashboard/public-data-table/schema/model';
import type { PublicWidgetUpdateParameters } from '@/api-clients/dashboard/public-widget/schema/api-verbs/update';
import type { PublicWidgetModel } from '@/api-clients/dashboard/public-widget/schema/model';

import { showErrorMessage } from '@/lib/helper/notice-alert-helper';
import getRandomId from '@/lib/random-id-generator';

import ErrorHandler from '@/common/composables/error/errorHandler';
import {
    DATA_TABLE_OPERATOR,
    DATA_TABLE_TYPE,
    DEFAULT_TRANSFORM_DATA_TABLE_VALUE_MAP,
} from '@/common/modules/widgets/_constants/data-table-constant';
import { getWidgetConfig } from '@/common/modules/widgets/_helpers/widget-config-helper';
import { getDuplicatedDataTableName } from '@/common/modules/widgets/_helpers/widget-data-table-helper';
import { sanitizeWidgetOptions } from '@/common/modules/widgets/_helpers/widget-helper';
import type { JoinRestrictedMap } from '@/common/modules/widgets/types/widget-data-table-type';
import type { WidgetSize, WidgetOverlayType } from '@/common/modules/widgets/types/widget-display-type';
import type { WidgetFieldValues } from '@/common/modules/widgets/types/widget-field-value-type';
import type {
    DataTableOperator,
    WidgetState,
    DataTableTransformOptions, ConcatOptions, JoinOptions,
} from '@/common/modules/widgets/types/widget-model';

import { useDashboardDetailInfoStore } from '@/services/dashboards/stores/dashboard-detail-info-store';


type DataTableModel = PublicDataTableModel|PrivateDataTableModel;
type WidgetModel = PublicWidgetModel|PrivateWidgetModel;
type WidgetUpdateParameters = PublicWidgetUpdateParameters|PrivateWidgetUpdateParameters;
interface DataTableReference {
    data_table_id: string;
    parents: string[];
    children: string[];
}
export const useWidgetGenerateStore = defineStore('widget-generate', () => {
    const dashboardDetailStore = useDashboardDetailInfoStore();
    const dashboardDetailGetters = dashboardDetailStore.getters;
    const state = reactive({
        // display
        showOverlay: false,
        overlayStep: 1,
        overlayType: 'EDIT' as WidgetOverlayType,
        // Widget
        widget: undefined as undefined | WidgetModel,
        widgetId: '',
        latestWidgetId: '',
        selectedWidgetName: 'table',
        size: 'full' as WidgetSize,
        widgetFormValueMap: {} as Record<string, WidgetFieldValues|undefined>,
        widgetValidMap: {} as Record<string, boolean>,
        // Data Table
        selectedDataTableId: undefined as undefined | string,
        dataTables: [] as Partial<DataTableModel>[],
        previewData: { results: [], total_count: 0 } as ListResponse<any>,
        dataTableCreateLoading: false,
        joinRestrictedMap: {} as JoinRestrictedMap, // Flag for handling Join type EXCEPTION RESTRICTION cases. (duplicated data field). Example - { '{dataTalbeId}': true, }
        allDataTableInvalidMap: {} as Record<string, boolean>, // Flag for handling all data table invalid cases. Example - { '{dataTalbeId}': true, }
        dataTableLoadFailed: false,
    });

    const getters = reactive({
        selectedDataTable: computed<Partial<DataTableModel>|undefined>(() => state.dataTables.find((dataTable) => dataTable.data_table_id === state.selectedDataTableId)),
        isAllWidgetFormValid: computed<boolean>(() => {
            const widgetValidMapValues = Object.values(state.widgetValidMap);
            return widgetValidMapValues.every((valid) => valid);
        }),
        widgetState: computed<WidgetState|undefined>(() => state.widget?.state),
        allDataTableInvalid: computed<boolean>(() => Object.values(state.allDataTableInvalidMap).some((invalid) => invalid)),
        dataTableReferenceMap: computed<Record<string, DataTableReference>>(() => {
            const referenceMap = {} as Record<string, DataTableReference>;
            const savedDataTables = state.dataTables.filter((dataTable) => dataTable.data_table_id && !dataTable.data_table_id.startsWith('UNSAVED-')) as DataTableModel[];
            const MULTIPE_DATA_TABLE_OPERATORS = [DATA_TABLE_OPERATOR.CONCAT, DATA_TABLE_OPERATOR.JOIN];
            savedDataTables.forEach((dataTable) => {
                if (!referenceMap[dataTable.data_table_id]) {
                    referenceMap[dataTable.data_table_id] = setIniitialDataTableReferenceProperty(dataTable.data_table_id);
                }

                if (dataTable.data_type === DATA_TABLE_TYPE.TRANSFORMED) {
                    if (MULTIPE_DATA_TABLE_OPERATORS.includes(dataTable.operator)) {
                        const [firstReferenceDataTableId, secondReferenceDataTableId] = (dataTable.options[dataTable.operator] as ConcatOptions|JoinOptions).data_tables;
                        if (!referenceMap[firstReferenceDataTableId]) {
                            referenceMap[firstReferenceDataTableId] = setIniitialDataTableReferenceProperty(firstReferenceDataTableId);
                        }
                        if (!referenceMap[secondReferenceDataTableId]) {
                            referenceMap[secondReferenceDataTableId] = setIniitialDataTableReferenceProperty(secondReferenceDataTableId);
                        }
                        referenceMap[firstReferenceDataTableId] = {
                            ...referenceMap[firstReferenceDataTableId],
                            children: [
                                ...referenceMap[firstReferenceDataTableId].children,
                                dataTable.data_table_id,
                            ],
                        };
                        referenceMap[secondReferenceDataTableId] = {
                            ...referenceMap[secondReferenceDataTableId],
                            children: [
                                ...referenceMap[secondReferenceDataTableId].children,
                                dataTable.data_table_id,
                            ],
                        };
                        referenceMap[dataTable.data_table_id] = {
                            ...referenceMap[dataTable.data_table_id],
                            parents: [
                                firstReferenceDataTableId,
                                secondReferenceDataTableId,
                            ],
                        };
                    } else {
                        const referenceDataTableId = dataTable.options[dataTable.operator].data_table_id;
                        if (!referenceMap[referenceDataTableId]) {
                            referenceMap[referenceDataTableId] = setIniitialDataTableReferenceProperty(referenceDataTableId);
                        }
                        referenceMap[referenceDataTableId] = {
                            ...referenceMap[referenceDataTableId],
                            children: [
                                ...referenceMap[referenceDataTableId].children,
                                dataTable.data_table_id,
                            ],
                        };
                        referenceMap[dataTable.data_table_id] = {
                            ...referenceMap[dataTable.data_table_id],
                            parents: [referenceDataTableId],
                        };
                    }
                }
            });
            return referenceMap;
        }),
    });

    /* Helper */
    const setIniitialDataTableReferenceProperty = (dataTableId: string): DataTableReference => ({
        data_table_id: dataTableId,
        parents: [],
        children: [],
    });

    /* Mutations */
    const setWidgetId = (widgetId: string) => {
        state.widgetId = widgetId;
    };
    const setLatestWidgetId = (widgetId: string) => {
        state.latestWidgetId = widgetId;
    };
    const setShowOverlay = (showOverlay: boolean) => {
        state.showOverlay = showOverlay;
    };
    const setOverlayStep = (overlayStep: number) => {
        state.overlayStep = overlayStep;
    };
    const setOverlayType = (overlayType: WidgetOverlayType) => {
        state.overlayType = overlayType;
    };
    const setSelectedDataTableId = (selectedDataTableId?: string) => {
        state.selectedDataTableId = selectedDataTableId;
    };
    const setSelectedWidgetName = (widgetName: string) => {
        state.selectedWidgetName = widgetName;
    };
    const setSize = (size: WidgetSize) => {
        state.size = size;
    };
    const setWidgetFormValueMap = (widgetValueMap: Record<string, WidgetFieldValues|undefined>) => {
        state.widgetFormValueMap = widgetValueMap;
    };
    const setWidgetValidMap = (widgetValidMap: Record<string, boolean>) => {
        state.widgetValidMap = widgetValidMap;
    };
    const setDataTableCreateLoading = (status: boolean) => {
        state.dataTableCreateLoading = status;
    };
    const setJoinRestrictedMap = (value: JoinRestrictedMap) => {
        state.joinRestrictedMap = value;
    };
    const setAllDataTableInvalidMap = (value: Record<string, boolean>) => {
        state.allDataTableInvalidMap = value;
    };
    const setDataTableLoadFailed = (status: boolean) => {
        state.dataTableLoadFailed = status;
    };

    const mutations = {
        setWidgetId,
        setLatestWidgetId,
        setShowOverlay,
        setOverlayStep,
        setOverlayType,
        setSelectedDataTableId,
        setSelectedWidgetName,
        setSize,
        setWidgetFormValueMap,
        setWidgetValidMap,
        setJoinRestrictedMap,
        setAllDataTableInvalidMap,
        setDataTableCreateLoading,
        setDataTableLoadFailed,
    };
    const actions = {
        listDataTable: async () => {
            const listParams: DataTableListParameters = {
                widget_id: state.widgetId,
            };
            const isPrivate = state.widgetId.startsWith('private');
            const fetcher = isPrivate
                ? SpaceConnector.clientV2.dashboard.privateDataTable.list<DataTableListParameters, ListResponse<DataTableModel>>
                : SpaceConnector.clientV2.dashboard.publicDataTable.list<DataTableListParameters, ListResponse<DataTableModel>>;
            try {
                const { results } = await fetcher(listParams);
                state.dataTables = results ?? [];
            } catch (e) {
                ErrorHandler.handleError(e);
            }
        },
        /* Step 1 */
        createAddDataTable: async (addParams: Partial<DataTableAddParameters>):Promise<DataTableModel|undefined> => {
            const parameters = {
                widget_id: state.widgetId,
                vars: dashboardDetailGetters.dashboardInfo?.vars || {},
                ...addParams,
            } as DataTableAddParameters;
            const isPrivate = state.widgetId.startsWith('private');
            const fetcher = isPrivate
                ? SpaceConnector.clientV2.dashboard.privateDataTable.add<DataTableAddParameters, DataTableModel>
                : SpaceConnector.clientV2.dashboard.publicDataTable.add<DataTableAddParameters, DataTableModel>;
            try {
                const result = await fetcher(parameters);
                state.dataTables.push(result);
                return result;
            } catch (e: any) {
                setDataTableCreateLoading(false); // DataTable Loading Failed Case
                showErrorMessage(e.message, e);
                ErrorHandler.handleError(e);
                return undefined;
            }
        },
        createTransformDataTable: async (transformParams: Partial<DataTableTransformParameters>, unsavedId: string): Promise<DataTableModel|undefined> => {
            const parameters = {
                widget_id: state.widgetId,
                vars: dashboardDetailGetters.dashboardInfo?.vars || {},
                ...transformParams,
            } as DataTableTransformParameters;
            const isPrivate = state.widgetId.startsWith('private');
            const fetcher = isPrivate
                ? SpaceConnector.clientV2.dashboard.privateDataTable.transform<DataTableTransformParameters, DataTableModel>
                : SpaceConnector.clientV2.dashboard.publicDataTable.transform<DataTableTransformParameters, DataTableModel>;
            try {
                const result = await fetcher(parameters);
                state.dataTables = state.dataTables.filter((dataTable) => dataTable.data_table_id !== unsavedId);
                state.dataTables.push(result);
                return result;
            } catch (e: any) {
                showErrorMessage(e.message, e);
                ErrorHandler.handleError(e);
                return undefined;
            }
        },
        createUnsavedTransformDataTable: (operatorType: DataTableOperator) => {
            const options = {
                JOIN: cloneDeep(DEFAULT_TRANSFORM_DATA_TABLE_VALUE_MAP.JOIN),
                CONCAT: cloneDeep(DEFAULT_TRANSFORM_DATA_TABLE_VALUE_MAP.CONCAT),
                QUERY: cloneDeep(DEFAULT_TRANSFORM_DATA_TABLE_VALUE_MAP.QUERY),
                EVAL: cloneDeep(DEFAULT_TRANSFORM_DATA_TABLE_VALUE_MAP.EVAL),
                AGGREGATE: cloneDeep(DEFAULT_TRANSFORM_DATA_TABLE_VALUE_MAP.AGGREGATE),
                PIVOT: cloneDeep(DEFAULT_TRANSFORM_DATA_TABLE_VALUE_MAP.PIVOT),
                ADD_LABELS: cloneDeep(DEFAULT_TRANSFORM_DATA_TABLE_VALUE_MAP.ADD_LABELS),
                VALUE_MAPPING: cloneDeep(DEFAULT_TRANSFORM_DATA_TABLE_VALUE_MAP.VALUE_MAPPING),
            };
            const unsavedTransformData = {
                data_table_id: `UNSAVED-${getRandomId()}`,
                name: getDuplicatedDataTableName(`${operatorType} Data`, state.dataTables),
                data_type: DATA_TABLE_TYPE.TRANSFORMED,
                operator: operatorType,
                options: {
                    [operatorType]: options[operatorType],
                } as DataTableTransformOptions,
                state: 'AVAILABLE',
            } as Partial<DataTableModel>;
            state.dataTables.push(unsavedTransformData);
        },
        updateDataTable: async (updateParams: DataTableUpdateParameters, options?: { unsaved?: boolean; preventReferenceUpdating?: boolean; }): Promise<DataTableModel|undefined> => {
            const { unsaved, preventReferenceUpdating } = options || {};
            const isPrivate = state.widgetId.startsWith('private');
            const fetcher = isPrivate
                ? SpaceConnector.clientV2.dashboard.privateDataTable.update<DataTableUpdateParameters, DataTableModel>
                : SpaceConnector.clientV2.dashboard.publicDataTable.update<DataTableUpdateParameters, DataTableModel>;
            try {
                let result: DataTableModel;
                if (unsaved) {
                    const unsavedDataTable = state.dataTables.find((dataTable) => dataTable.data_table_id === updateParams.data_table_id) as DataTableModel;
                    result = {
                        ...unsavedDataTable,
                        ...updateParams,
                    };
                } else {
                    result = await fetcher({
                        ...updateParams,
                        vars: dashboardDetailGetters.dashboardInfo?.vars || {},
                    });
                    if (state.widget?.state === 'ACTIVE') {
                        await actions.updateWidget({
                            state: 'INACTIVE',
                            options: {
                                widgetHeader: {
                                    ...state.widget?.options?.widgetHeader,
                                },
                            },
                        });
                    }
                }
                state.dataTables = state.dataTables.map((dataTable) => (dataTable.data_table_id === result.data_table_id ? result : dataTable));

                // Cascade Update Referenced Transformed DataTable
                if (!preventReferenceUpdating) await actions.cascadeUpdateDataTable(result.data_table_id);

                return result;
            } catch (e: any) {
                showErrorMessage(e.message, e);
                ErrorHandler.handleError(e);
                return undefined;
            }
        },
        cascadeUpdateDataTable: async (dataTableId: string) => {
            const isPrivate = state.widgetId.startsWith('private');
            const fetcher = isPrivate
                ? SpaceConnector.clientV2.dashboard.privateDataTable.update<DataTableUpdateParameters, DataTableModel>
                : SpaceConnector.clientV2.dashboard.publicDataTable.update<DataTableUpdateParameters, DataTableModel>;

            const children = getters.dataTableReferenceMap[dataTableId].children;
            return children.reduce((chain, childId) => chain.then(async () => {
                const currentDataTable = state.dataTables.find(
                    (_dataTable) => _dataTable.data_table_id === childId,
                ) as DataTableModel;

                const result = await fetcher({
                    data_table_id: childId,
                    name: currentDataTable?.name,
                    options: {
                        ...(currentDataTable?.options ?? {}),
                    },
                });
                state.dataTables = state.dataTables.map((dataTable) => (dataTable.data_table_id === result.data_table_id ? result : dataTable));

                return actions.cascadeUpdateDataTable(childId);
            }), Promise.resolve());
        },
        deleteDataTable: async (deleteParams: DataTableDeleteParameters, unsaved?: boolean) => {
            if (unsaved) {
                state.dataTables = state.dataTables.filter((dataTable) => dataTable.data_table_id !== deleteParams.data_table_id);
                const _allDataTableInvalidMap = {
                    ...state.allDataTableInvalidMap,
                };
                delete _allDataTableInvalidMap[deleteParams.data_table_id];
                setAllDataTableInvalidMap(_allDataTableInvalidMap);
                return;
            }
            const isPrivate = state.widgetId.startsWith('private');
            const fetcher = isPrivate
                ? SpaceConnector.clientV2.dashboard.privateDataTable.delete<DataTableDeleteParameters, DataTableModel>
                : SpaceConnector.clientV2.dashboard.publicDataTable.delete<DataTableDeleteParameters, DataTableModel>;
            try {
                await fetcher(deleteParams);
                state.dataTables = state.dataTables.filter((dataTable) => dataTable.data_table_id !== deleteParams.data_table_id);
                const _allDataTableInvalidMap = {
                    ...state.allDataTableInvalidMap,
                };
                delete _allDataTableInvalidMap[deleteParams.data_table_id];
                setAllDataTableInvalidMap(_allDataTableInvalidMap);
            } catch (e) {
                ErrorHandler.handleError(e);
            }
        },
        updateWidget: async (updateParams: Partial<WidgetUpdateParameters>): Promise<WidgetModel|undefined> => {
            const isPrivate = state.widgetId.startsWith('private');
            const fetcher = isPrivate
                ? SpaceConnector.clientV2.dashboard.privateWidget.update<PrivateWidgetUpdateParameters, PrivateWidgetModel>
                : SpaceConnector.clientV2.dashboard.publicWidget.update<PublicWidgetUpdateParameters, PublicWidgetModel>;
            const sanitizedOptions = sanitizeWidgetOptions(updateParams.options ?? {}, updateParams.widget_type ?? 'table');
            try {
                const result = await fetcher({
                    widget_id: state.widgetId,
                    ...updateParams,
                    options: sanitizedOptions, // Sanitize Wrong Options
                });
                state.widget = result;
                return result;
            } catch (e: any) {
                showErrorMessage(e.message, e);
                ErrorHandler.handleError(e);
                return undefined;
            }
        },
        /* Step 2 */
        reset: () => {
            state.widget = undefined;
            state.widgetId = '';
            state.dataTables = [];
            state.showOverlay = false;
            state.overlayStep = 1;
            state.selectedDataTableId = undefined;
            state.size = 'full';
            state.widgetValidMap = {};
            state.widgetFormValueMap = {};
            state.allDataTableInvalidMap = {};
        },
        setWidgetForm: (widgetInfo: WidgetModel) => {
            state.selectedWidgetName = widgetInfo?.widget_type || 'table';
            const _widgetConfig = getWidgetConfig(widgetInfo.widget_type || 'table');
            state.widget = widgetInfo;
            state.widgetId = widgetInfo.widget_id;
            state.size = widgetInfo?.size || _widgetConfig?.meta?.sizes[0] || 'full';
            state.selectedDataTableId = widgetInfo?.data_table_id;
            state.widgetFormValueMap = widgetInfo?.options || {};
        },
    };

    return {
        state,
        getters,
        ...mutations,
        ...actions,
    };
});
