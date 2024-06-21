import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import { GRANULARITY } from '@/schema/dashboard/_constants/widget-constant';
import type { Granularity } from '@/schema/dashboard/_types/widget-type';
import type { PrivateDataTableModel } from '@/schema/dashboard/private-data-table/model';
import type { PrivateWidgetModel } from '@/schema/dashboard/private-widget/model';
import type { DataTableAddParameters } from '@/schema/dashboard/public-data-table/api-verbs/add';
import type { DataTableDeleteParameters } from '@/schema/dashboard/public-data-table/api-verbs/delete';
import type { DataTableListParameters } from '@/schema/dashboard/public-data-table/api-verbs/list';
import type { DataTableLoadParameters } from '@/schema/dashboard/public-data-table/api-verbs/load';
import type { DataTableTransformParameters } from '@/schema/dashboard/public-data-table/api-verbs/transform';
import type { DataTableUpdateParameters } from '@/schema/dashboard/public-data-table/api-verbs/update';
import type { PublicDataTableModel } from '@/schema/dashboard/public-data-table/model';
import type { PublicWidgetModel } from '@/schema/dashboard/public-widget/model';

import getRandomId from '@/lib/random-id-generator';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { DATA_TABLE_TYPE } from '@/common/modules/widgets/_constants/data-table-constant';
import { getWidgetConfig } from '@/common/modules/widgets/_helpers/widget-config-helper';
import type { WidgetSize, WidgetOverlayType } from '@/common/modules/widgets/types/widget-display-type';
import type { WidgetFieldValues } from '@/common/modules/widgets/types/widget-field-value-type';
import type {
    DataTableOperator,
} from '@/common/modules/widgets/types/widget-model';


type DataTableModel = PublicDataTableModel|PrivateDataTableModel;
type WidgetModel = PublicWidgetModel|PrivateWidgetModel;
export const useWidgetGenerateStore = defineStore('widget-generate', () => {
    const state = reactive({
        // display
        showOverlay: false,
        overlayStep: 1,
        overlayType: 'EDIT' as WidgetOverlayType,
        // Widget
        widget: undefined as undefined | WidgetModel,
        widgetId: '',
        selectedWidgetName: 'table',
        title: '',
        description: '',
        size: 'full' as WidgetSize,
        widgetValueMap: {} as Record<string, WidgetFieldValues|undefined>,
        widgetValidMap: {} as Record<string, boolean>,
        // Data Table
        selectedDataTableId: undefined as undefined | string,
        dataTables: [] as Partial<DataTableModel>[],
        selectedPreviewGranularity: GRANULARITY.MONTHLY as Granularity,
        previewData: { results: [], total_count: 0 } as ListResponse<any>,
        dataTableUpdating: false,
        dataTableLoadLoading: false,
    });

    const getters = reactive({
        selectedDataTable: computed<Partial<DataTableModel>|undefined>(() => state.dataTables.find((dataTable) => dataTable.data_table_id === state.selectedDataTableId)),
        isAllWidgetFormValid: computed<boolean>(() => {
            const widgetValidMapValues = Object.values(state.widgetValidMap);
            const widgetValueMapKeys = Object.keys(state.widgetValueMap);
            if (widgetValidMapValues.length !== widgetValueMapKeys.length) return false;
            return widgetValidMapValues.every((valid) => valid);
        }),
    });

    /* Mutations */
    const setWidgetId = (widgetId: string) => {
        state.widgetId = widgetId;
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
    const setDescription = (description: string) => {
        state.description = description;
    };
    const setSelectedWidgetName = (widgetName: string) => {
        state.selectedWidgetName = widgetName;
    };
    const setSize = (size: WidgetSize) => {
        state.size = size;
    };
    const setWidgetValueMap = (widgetValueMap: Record<string, WidgetFieldValues|undefined>) => {
        state.widgetValueMap = widgetValueMap;
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

    const mutations = {
        setWidgetId,
        setShowOverlay,
        setOverlayStep,
        setOverlayType,
        setSelectedDataTableId,
        setSelectedWidgetName,
        setTitle,
        setDescription,
        setSize,
        setWidgetValueMap,
        setWidgetValidMap,
        setSelectedPreviewGranularity,
        setDataTableUpdating,
    };
    const actions = {
        listDataTable: async () => {
            const listParams: DataTableListParameters = {
                widget_id: state.widgetId,
            };
            try {
                const { results } = await SpaceConnector.clientV2.dashboard.publicDataTable.list<DataTableListParameters, ListResponse<DataTableModel>>(listParams);
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
            try {
                const result = await SpaceConnector.clientV2.dashboard.publicDataTable.add<DataTableAddParameters, DataTableModel>(parameters);
                state.dataTables.push(result);
                if (!state.selectedDataTableId) {
                    state.selectedDataTableId = result.data_table_id;
                }
            } catch (e) {
                ErrorHandler.handleError(e);
            }
        },
        createTransformDataTable: async (transformParams: Partial<DataTableTransformParameters>) => {
            const parameters = {
                widget_id: state.widgetId,
                ...transformParams,
            } as DataTableTransformParameters;
            try {
                const result = await SpaceConnector.clientV2.dashboard.publicDataTable.transform<DataTableTransformParameters, DataTableModel>(parameters);
                state.dataTables.push(result);
            } catch (e) {
                ErrorHandler.handleError(e);
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
                WHERE: {
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
                name: '',
                data_type: DATA_TABLE_TYPE.TRANSFORMED,
                operator: operatorType,
                options: {
                    [operatorType]: options[operatorType],
                },
            } as Partial<DataTableModel>;
            state.dataTables.push(unsavedTransformData);
        },
        updateDataTable: async (updateParams: DataTableUpdateParameters, unsaved?: boolean) => {
            try {
                let result: DataTableModel;
                if (unsaved) {
                    const unsavedDataTable = state.dataTables.find((dataTable) => dataTable.data_table_id === updateParams.data_table_id) as DataTableModel;
                    result = {
                        ...unsavedDataTable,
                        ...updateParams,
                    };
                } else {
                    result = await SpaceConnector.clientV2.dashboard.publicDataTable.update<DataTableUpdateParameters, DataTableModel>(updateParams);
                }
                state.dataTables = state.dataTables.map((dataTable) => (dataTable.data_table_id === result.data_table_id ? result : dataTable));
            } catch (e) {
                ErrorHandler.handleError(e);
            }
        },
        deleteDataTable: async (deleteParams: DataTableDeleteParameters, unsaved?: boolean) => {
            if (unsaved) {
                state.dataTables = state.dataTables.filter((dataTable) => dataTable.data_table_id !== deleteParams.data_table_id);
                return;
            }
            try {
                await SpaceConnector.clientV2.dashboard.publicDataTable.delete<DataTableDeleteParameters, DataTableModel>(deleteParams);
                state.dataTables = state.dataTables.filter((dataTable) => dataTable.data_table_id !== deleteParams.data_table_id);
            } catch (e) {
                ErrorHandler.handleError(e);
            }
        },
        loadDataTable: async (loadParams: Omit<DataTableLoadParameters, 'granularity'>) => {
            try {
                state.dataTableLoadLoading = true;
                const { results, total_count } = await SpaceConnector.clientV2.dashboard.publicDataTable.load<DataTableLoadParameters, ListResponse<Record<string, any>[]>>({
                    granularity: state.selectedPreviewGranularity || 'MONTHLY',
                    page: {
                        start: 1,
                        limit: 15,
                    },
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
        /* Step 2 */
        reset: () => {
            state.widget = undefined;
            state.showOverlay = false;
            state.overlayStep = 1;
            state.selectedDataTableId = undefined;
            state.title = '';
            state.description = '';
            state.size = 'full';
            state.widgetValidMap = {};
            state.widgetValueMap = {};
        },
        setWidgetForm: (widgetInfo?: WidgetModel) => {
            state.selectedWidgetName = widgetInfo?.widget_type || 'table';
            const _widgetConfig = getWidgetConfig(widgetInfo?.widget_type || 'table');
            state.widget = widgetInfo;
            state.widgetId = widgetInfo?.widget_id || '';
            state.title = widgetInfo?.name || _widgetConfig.meta?.title || '';
            state.description = widgetInfo?.description || '';
            state.size = widgetInfo?.size || _widgetConfig.meta?.sizes[0];
            state.selectedDataTableId = widgetInfo?.data_table_id || undefined;
            state.widgetValueMap = widgetInfo?.options || {};
        },
    };

    return {
        state,
        getters,
        ...mutations,
        ...actions,
    };
});
