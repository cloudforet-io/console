import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import { GRANULARITY } from '@/schema/dashboard/_constants/widget-constant';
import type { Granularity } from '@/schema/dashboard/_types/widget-type';
import type { PrivateDataTableModel } from '@/schema/dashboard/private-data-table/model';
import type { PrivateWidgetUpdateParameters } from '@/schema/dashboard/private-widget/api-verbs/update';
import type { PrivateWidgetModel } from '@/schema/dashboard/private-widget/model';
import type { DataTableAddParameters } from '@/schema/dashboard/public-data-table/api-verbs/add';
import type { DataTableDeleteParameters } from '@/schema/dashboard/public-data-table/api-verbs/delete';
import type { DataTableListParameters } from '@/schema/dashboard/public-data-table/api-verbs/list';
import type { DataTableLoadParameters } from '@/schema/dashboard/public-data-table/api-verbs/load';
import type { DataTableTransformParameters } from '@/schema/dashboard/public-data-table/api-verbs/transform';
import type { DataTableUpdateParameters } from '@/schema/dashboard/public-data-table/api-verbs/update';
import type { PublicDataTableModel } from '@/schema/dashboard/public-data-table/model';
import type { PublicWidgetUpdateParameters } from '@/schema/dashboard/public-widget/api-verbs/update';
import type { PublicWidgetModel } from '@/schema/dashboard/public-widget/model';

import { showErrorMessage } from '@/lib/helper/notice-alert-helper';
import getRandomId from '@/lib/random-id-generator';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { DATA_TABLE_TYPE } from '@/common/modules/widgets/_constants/data-table-constant';
import { getWidgetConfig } from '@/common/modules/widgets/_helpers/widget-config-helper';
import { getDuplicatedDataTableName } from '@/common/modules/widgets/_helpers/widget-data-table-helper';
import { sanitizeWidgetOptions } from '@/common/modules/widgets/_helpers/widget-helper';
import type { JoinRestrictedMap } from '@/common/modules/widgets/types/widget-data-table-type';
import type { WidgetSize, WidgetOverlayType } from '@/common/modules/widgets/types/widget-display-type';
import type { WidgetFieldValues } from '@/common/modules/widgets/types/widget-field-value-type';
import type {
    DataTableOperator,
    WidgetState,
    DataTableTransformOptions,
} from '@/common/modules/widgets/types/widget-model';

import { useDashboardDetailInfoStore } from '@/services/dashboards/stores/dashboard-detail-info-store';


type DataTableModel = PublicDataTableModel|PrivateDataTableModel;
type WidgetModel = PublicWidgetModel|PrivateWidgetModel;
type WidgetUpdateParameters = PublicWidgetUpdateParameters|PrivateWidgetUpdateParameters;
export const useWidgetGenerateStore = defineStore('widget-generate', () => {
    const dashboardDetailGetters = useDashboardDetailInfoStore().getters;
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
        selectedPreviewGranularity: GRANULARITY.MONTHLY as Granularity,
        previewData: { results: [], total_count: 0 } as ListResponse<any>,
        dataTableUpdating: false,
        dataTableLoadLoading: false,
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
    const setSelectedPreviewGranularity = (granularity: Granularity) => {
        state.selectedPreviewGranularity = granularity;
    };
    const setDataTableUpdating = (status: boolean) => {
        state.dataTableUpdating = status;
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
        setSelectedPreviewGranularity,
        setDataTableUpdating,
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
            } catch (e) {
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
                JOIN: {
                    data_tables: [],
                    how: undefined,
                },
                CONCAT: {
                    data_tables: [],
                },
                AGGREGATE: {
                    data_table_id: undefined,
                    group_by: [],
                },
                QUERY: {
                    data_table_id: undefined,
                    conditions: [],
                },
                EVAL: {
                    data_table_id: undefined,
                    formulas: [],
                },
            };
            const unsavedTransformData = {
                data_table_id: `UNSAVED-${getRandomId()}`,
                name: getDuplicatedDataTableName(`${operatorType} Data`, state.dataTables),
                data_type: DATA_TABLE_TYPE.TRANSFORMED,
                operator: operatorType,
                options: {
                    [operatorType]: options[operatorType],
                },
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
                        await actions.updateWidget({ state: 'INACTIVE' });
                    }
                }
                state.dataTables = state.dataTables.map((dataTable) => (dataTable.data_table_id === result.data_table_id ? result : dataTable));

                // Update Referenced Transformed DataTable
                if (!preventReferenceUpdating) {
                    const referencedDataTableIds = [] as string[];
                    state.dataTables.forEach((dataTable) => {
                        const transformDataTalbeOptions = dataTable.options as DataTableTransformOptions;
                        const isReferenced = dataTable.data_type === 'TRANSFORMED'
                            && !dataTable?.data_table_id?.startsWith('UNSAVED-')
                            && (
                                transformDataTalbeOptions?.JOIN?.data_tables?.includes(updateParams.data_table_id)
                                || transformDataTalbeOptions?.CONCAT?.data_tables?.includes(updateParams.data_table_id)
                                || transformDataTalbeOptions?.QUERY?.data_table_id === updateParams.data_table_id
                                || transformDataTalbeOptions?.EVAL?.data_table_id === updateParams.data_table_id
                            );
                        if (isReferenced) referencedDataTableIds.push(dataTable.data_table_id as string);
                    });
                    if (referencedDataTableIds.length) {
                        await Promise.all(referencedDataTableIds.map((dataTableId) => {
                            const dataTable = state.dataTables.find((_dataTable) => _dataTable.data_table_id === dataTableId) as PublicDataTableModel|PrivateDataTableModel;
                            actions.updateDataTable({
                                data_table_id: dataTable.data_table_id,
                                name: dataTable.name,
                                options: {
                                    ...dataTable.options,
                                },
                            });
                            return null;
                        }));
                    }
                }

                return result;
            } catch (e: any) {
                showErrorMessage(e.message, e);
                ErrorHandler.handleError(e);
                return undefined;
            }
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
        loadDataTable: async (loadParams: Partial<DataTableLoadParameters>) => {
            const isPrivate = state.widgetId.startsWith('private');
            const fetcher = isPrivate
                ? SpaceConnector.clientV2.dashboard.privateDataTable.load<DataTableLoadParameters, ListResponse<Record<string, any>[]>>
                : SpaceConnector.clientV2.dashboard.publicDataTable.load<DataTableLoadParameters, ListResponse<Record<string, any>[]>>;
            try {
                state.dataTableLoadLoading = true;
                const _granularity = state.selectedPreviewGranularity || 'MONTHLY';
                let _sort = loadParams.sort;
                const dataTable = state.dataTables.find((_dataTable) => _dataTable.data_table_id === (loadParams.data_table_id || state.selectedDataTableId as string));
                if (!_sort || (_sort && _sort.length === 0)) {
                    const labelsInfoList = Object.keys(dataTable?.labels_info ?? {});
                    if (labelsInfoList.includes('Date')) _sort = [{ key: 'Date', desc: false }];
                    else if (_granularity === 'DAILY') _sort = [{ key: 'Day', desc: false }];
                    else if (_granularity === 'MONTHLY') _sort = [{ key: 'Month', desc: false }];
                    else if (_granularity === 'YEARLY') _sort = [{ key: 'Year', desc: false }];
                }
                const { results, total_count } = await fetcher({
                    granularity: _granularity,
                    page: {
                        start: 1,
                        limit: 15,
                    },
                    ...loadParams,
                    sort: _sort,
                    data_table_id: loadParams.data_table_id || state.selectedDataTableId as string, // for fetching without data_table_id
                    vars: dashboardDetailGetters.dashboardInfo?.vars || {},
                });
                state.previewData = { results: results ?? [], total_count: total_count ?? 0 };
                setDataTableLoadFailed(false);
            } catch (e) {
                state.previewData = { results: [], total_count: 0 };
                setDataTableLoadFailed(true);
                ErrorHandler.handleError(e);
            } finally {
                state.dataTableUpdating = false;
                state.dataTableLoadLoading = false;
            }
        },
        updateWidget: async (updateParams: Partial<WidgetUpdateParameters>) => {
            const isPrivate = state.widgetId.startsWith('private');
            const fetcher = isPrivate
                ? SpaceConnector.clientV2.dashboard.privateWidget.update<PrivateWidgetUpdateParameters, PrivateWidgetModel>
                : SpaceConnector.clientV2.dashboard.publicWidget.update<PublicWidgetUpdateParameters, PublicWidgetModel>;
            const sanitizedOptions = sanitizeWidgetOptions(updateParams.options ?? {}, updateParams.widget_type ?? 'table');
            try {
                state.widget = await fetcher({
                    widget_id: state.widgetId,
                    ...updateParams,
                    options: sanitizedOptions, // Sanitize Wrong Options
                });
            } catch (e: any) {
                showErrorMessage(e.message, e);
                ErrorHandler.handleError(e);
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
        setWidgetForm: (widgetInfo?: WidgetModel) => {
            state.selectedWidgetName = widgetInfo?.widget_type || 'table';
            const _widgetConfig = getWidgetConfig(widgetInfo?.widget_type || 'table');
            state.widget = widgetInfo;
            state.widgetId = widgetInfo?.widget_id || '';
            state.size = widgetInfo?.size || _widgetConfig?.meta?.sizes[0] || 'full';
            state.selectedDataTableId = widgetInfo?.data_table_id || undefined;
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
