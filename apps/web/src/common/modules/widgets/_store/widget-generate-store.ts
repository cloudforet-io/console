import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import { GRANULARITY } from '@/schema/dashboard/_constants/widget-constant';
import type { Granularity } from '@/schema/dashboard/_types/widget-type';
import type { DataTableAddParameters } from '@/schema/dashboard/public-data-table/api-verbs/add';
import type { DataTableDeleteParameters } from '@/schema/dashboard/public-data-table/api-verbs/delete';
import type { DataTableListParameters } from '@/schema/dashboard/public-data-table/api-verbs/list';
import type { DataTableLoadParameters } from '@/schema/dashboard/public-data-table/api-verbs/load';
import type { DataTableTransformParameters } from '@/schema/dashboard/public-data-table/api-verbs/transform';
import type { DataTableUpdateParameters } from '@/schema/dashboard/public-data-table/api-verbs/update';
import type { PublicWidgetGetParameters } from '@/schema/dashboard/public-widget/api-verbs/get';
import type { PublicWidgetModel } from '@/schema/dashboard/public-widget/model';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { getWidgetConfig } from '@/common/modules/widgets/_helpers/widget-config-helper';
import type { WidgetSize } from '@/common/modules/widgets/types/widget-display-type';
import type { WidgetFieldValues } from '@/common/modules/widgets/types/widget-field-value-type';
import type { DataTableModel } from '@/common/modules/widgets/types/widget-model';

export const useWidgetGenerateStore = defineStore('widget-generate', () => {
    const state = reactive({
        // display
        showOverlay: false,
        overlayStep: 1,
        // Widget
        widget: undefined as undefined | PublicWidgetModel,
        widgetId: '',
        selectedWidgetName: 'stackedColumnChart',
        title: '',
        description: '',
        size: 'full',
        widgetValueMap: {} as Record<string, WidgetFieldValues>,
        widgetValidMap: {} as Record<string, boolean>,
        // Data Table
        selectedDataTableId: undefined as undefined | string,
        dataTables: [] as DataTableModel[],
        selectedDataTable: undefined as DataTableModel|undefined,
        selectedDataTableGranularity: GRANULARITY.MONTHLY as Granularity,
        previewData: [] as Record<string, any>[],
    });

    const getters = reactive({
        selectedDataTable: computed<DataTableModel|undefined>(() => state.dataTables.find((dataTable) => dataTable.data_table_id === state.selectedDataTableId)),
    });

    /* Mutations */
    const setShowOverlay = (showOverlay: boolean) => {
        state.showOverlay = showOverlay;
    };
    const setOverlayStep = (overlayStep: number) => {
        state.overlayStep = overlayStep;
    };
    const setSelectedDataTableId = (selectedDataTableId: string) => {
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
    const setWidgetValueMap = (widgetValueMap: Record<string, WidgetFieldValues>) => {
        state.widgetValueMap = widgetValueMap;
    };
    const setWidgetValidMap = (widgetValidMap: Record<string, boolean>) => {
        state.widgetValidMap = widgetValidMap;
    };
    const setSelectedDataTableGranularity = (granularity: Granularity) => {
        state.selectedDataTableGranularity = granularity;
    };

    const mutations = {
        setShowOverlay,
        setOverlayStep,
        setSelectedDataTableId,
        setSelectedWidgetName,
        setTitle,
        setDescription,
        setSize,
        setWidgetValueMap,
        setWidgetValidMap,
        setSelectedDataTableGranularity,
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
        /* Step - 1 */
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
        updateDataTable: async (updateParams: DataTableUpdateParameters) => {
            try {
                const result = await SpaceConnector.clientV2.dashboard.publicDataTable.update<DataTableUpdateParameters, DataTableModel>(updateParams);
                state.dataTables = state.dataTables.map((dataTable) => (dataTable.data_table_id === result.data_table_id ? result : dataTable));
            } catch (e) {
                ErrorHandler.handleError(e);
            }
        },
        deleteDataTable: async (deleteParams: DataTableDeleteParameters) => {
            try {
                await SpaceConnector.clientV2.dashboard.publicDataTable.delete<DataTableDeleteParameters, DataTableModel>(deleteParams);
                state.dataTables = state.dataTables.filter((dataTable) => dataTable.data_table_id !== deleteParams.data_table_id);
                state.selectedDataTableId = undefined;
            } catch (e) {
                ErrorHandler.handleError(e);
            }
        },
        loadDataTable: async (dataTableId: string) => {
            try {
                const { results } = await SpaceConnector.clientV2.dashboard.publicDataTable.load<DataTableLoadParameters, ListResponse<Record<string, any>[]>>({
                    data_table_id: dataTableId,
                    granularity: state.selectedDataTableGranularity || 'MONTHLY',
                });
                state.previewData = results ?? [];
            } catch (e) {
                ErrorHandler.handleError(e);
            }
        },
        reset: () => {
            state.showOverlay = false;
            state.overlayStep = 1;
            state.widgetId = '';
            state.selectedDataTableId = undefined;
            state.title = '';
            state.description = '';
            state.size = 'full';
        },
        loadWidget: async (widgetId: string) => {
            try {
                state.widget = await SpaceConnector.clientV2.dashboard.publicWidget.get<PublicWidgetGetParameters, PublicWidgetModel>({
                    widget_id: widgetId,
                });
            } catch (e) {
                ErrorHandler.handleError(e);
            }
        },
        initWidgetForm: (widgetName = 'table') => {
            // chart type 바꿀 때 trigger
            state.selectedWidgetName = widgetName;
            const _widgetConfig = getWidgetConfig(widgetName);
            state.title = _widgetConfig.meta.title || '';
            state.description = '';
            state.size = _widgetConfig.meta.sizes[0];
        },
    };

    return {
        state,
        getters,
        ...mutations,
        ...actions,
    };
});
