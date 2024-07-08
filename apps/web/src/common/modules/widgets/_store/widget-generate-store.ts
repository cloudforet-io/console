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
import { DATA_TABLE_TYPE, DEFAULT_SORT } from '@/common/modules/widgets/_constants/data-table-constant';
import { getWidgetConfig } from '@/common/modules/widgets/_helpers/widget-config-helper';
import { getDuplicatedDataTableName } from '@/common/modules/widgets/_helpers/widget-data-table-helper';
import type { JoinRestrictedMap } from '@/common/modules/widgets/types/widget-data-table-type';
import type { WidgetSize, WidgetOverlayType } from '@/common/modules/widgets/types/widget-display-type';
import type { WidgetFieldValues } from '@/common/modules/widgets/types/widget-field-value-type';
import type {
    DataTableOperator,
    WidgetState,
} from '@/common/modules/widgets/types/widget-model';


type DataTableModel = PublicDataTableModel|PrivateDataTableModel;
type WidgetModel = PublicWidgetModel|PrivateWidgetModel;
type WidgetUpdateParameters = PublicWidgetUpdateParameters|PrivateWidgetUpdateParameters;
export const useWidgetGenerateStore = defineStore('widget-generate', () => {
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
        title: '',
        description: undefined as undefined | string,
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
        joinRestrictedMap: {} as JoinRestrictedMap, // Flag for handling Join type EXCEPTION RESTRICTION cases. (duplicated data field). Example - { '{dataTalbeId}': true, }
    });

    const getters = reactive({
        selectedDataTable: computed<Partial<DataTableModel>|undefined>(() => state.dataTables.find((dataTable) => dataTable.data_table_id === state.selectedDataTableId)),
        isAllWidgetFormValid: computed<boolean>(() => {
            const widgetValidMapValues = Object.values(state.widgetValidMap);
            const widgetValueMapKeys = Object.keys(state.widgetFormValueMap);
            if (widgetValidMapValues.length !== widgetValueMapKeys.length) return false;
            return widgetValidMapValues.every((valid) => valid);
        }),
        widgetState: computed<WidgetState|undefined>(() => state.widget?.state),
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
    const setTitle = (title: string) => {
        state.title = title;
    };
    const setDescription = (description?: string) => {
        state.description = description;
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
    const setJoinRestrictedMap = (value: JoinRestrictedMap) => {
        state.joinRestrictedMap = value;
    };

    const mutations = {
        setWidgetId,
        setLatestWidgetId,
        setShowOverlay,
        setOverlayStep,
        setOverlayType,
        setSelectedDataTableId,
        setSelectedWidgetName,
        setTitle,
        setDescription,
        setSize,
        setWidgetFormValueMap,
        setWidgetValidMap,
        setSelectedPreviewGranularity,
        setDataTableUpdating,
        setJoinRestrictedMap,
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
        createAddDataTable: async (addParams: Partial<DataTableAddParameters>) => {
            const parameters = {
                widget_id: state.widgetId,
                ...addParams,
            } as DataTableAddParameters;
            const isPrivate = state.widgetId.startsWith('private');
            const fetcher = isPrivate
                ? SpaceConnector.clientV2.dashboard.privateDataTable.add<DataTableAddParameters, DataTableModel>
                : SpaceConnector.clientV2.dashboard.publicDataTable.add<DataTableAddParameters, DataTableModel>;
            try {
                const result = await fetcher(parameters);
                state.dataTables.push(result);
                if (!state.selectedDataTableId) {
                    state.selectedDataTableId = result.data_table_id;
                }
            } catch (e) {
                ErrorHandler.handleError(e);
            }
        },
        createTransformDataTable: async (transformParams: Partial<DataTableTransformParameters>, unsavedId: string): Promise<DataTableModel|undefined> => {
            const parameters = {
                widget_id: state.widgetId,
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
            } as Partial<DataTableModel>;
            state.dataTables.push(unsavedTransformData);
        },
        updateDataTable: async (updateParams: DataTableUpdateParameters, unsaved?: boolean) => {
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
                    result = await fetcher(updateParams);
                    if (state.widget?.state === 'ACTIVE') {
                        await actions.updateWidget({ state: 'INACTIVE' });
                    }
                }
                state.dataTables = state.dataTables.map((dataTable) => (dataTable.data_table_id === result.data_table_id ? result : dataTable));
            } catch (e: any) {
                showErrorMessage(e.message, e);
                ErrorHandler.handleError(e);
            }
        },
        deleteDataTable: async (deleteParams: DataTableDeleteParameters, unsaved?: boolean) => {
            if (unsaved) {
                state.dataTables = state.dataTables.filter((dataTable) => dataTable.data_table_id !== deleteParams.data_table_id);
                return;
            }
            const isPrivate = state.widgetId.startsWith('private');
            const fetcher = isPrivate
                ? SpaceConnector.clientV2.dashboard.privateDataTable.delete<DataTableDeleteParameters, DataTableModel>
                : SpaceConnector.clientV2.dashboard.publicDataTable.delete<DataTableDeleteParameters, DataTableModel>;
            try {
                await fetcher(deleteParams);
                state.dataTables = state.dataTables.filter((dataTable) => dataTable.data_table_id !== deleteParams.data_table_id);
            } catch (e) {
                ErrorHandler.handleError(e);
            }
        },
        loadDataTable: async (loadParams: Omit<DataTableLoadParameters, 'granularity'>) => {
            const isPrivate = state.widgetId.startsWith('private');
            const fetcher = isPrivate
                ? SpaceConnector.clientV2.dashboard.privateDataTable.load<DataTableLoadParameters, ListResponse<Record<string, any>[]>>
                : SpaceConnector.clientV2.dashboard.publicDataTable.load<DataTableLoadParameters, ListResponse<Record<string, any>[]>>;
            try {
                state.dataTableLoadLoading = true;
                const { results, total_count } = await fetcher({
                    granularity: state.selectedPreviewGranularity || 'MONTHLY',
                    page: {
                        start: 1,
                        limit: 15,
                    },
                    sort: DEFAULT_SORT,
                    ...loadParams,
                });
                state.previewData = { results: results ?? [], total_count: total_count ?? 0 };
            } catch (e) {
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
            try {
                state.widget = await fetcher({
                    widget_id: state.widgetId,
                    ...updateParams,
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
            state.title = '';
            state.description = undefined;
            state.size = 'full';
            state.widgetValidMap = {};
            state.widgetFormValueMap = {};
        },
        setWidgetForm: (widgetInfo?: WidgetModel) => {
            state.selectedWidgetName = widgetInfo?.widget_type || 'table';
            const _widgetConfig = getWidgetConfig(widgetInfo?.widget_type || 'table');
            state.widget = widgetInfo;
            state.widgetId = widgetInfo?.widget_id || '';
            state.title = widgetInfo?.name || _widgetConfig.meta?.title || '';
            state.description = widgetInfo?.description;
            state.size = widgetInfo?.size || _widgetConfig.meta?.sizes[0];
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
