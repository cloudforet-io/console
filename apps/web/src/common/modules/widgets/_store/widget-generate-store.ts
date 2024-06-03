import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { DataTableAddParameters } from '@/schema/dashboard/public-data-table/api-verbs/add';
import type { DataTableUpdateParameters } from '@/schema/dashboard/public-data-table/api-verbs/delete';
import type { DataTableTransformParameters } from '@/schema/dashboard/public-data-table/api-verbs/transform';

import ErrorHandler from '@/common/composables/error/errorHandler';
import type { DataTableModel } from '@/common/modules/widgets/types/widget-model';

export const useWidgetGenerateStore = defineStore('widget-generate', () => {
    const state = reactive({
        // display
        showOverlay: false,
        overlayStep: 1,
        // Widget
        widgetId: '',
        selectedWidgetName: 'stackedColumnChart',
        title: '',
        description: '',
        // Data Table
        dataTables: [] as DataTableModel[],
        selectedDataTable: undefined as DataTableModel|undefined,
    });

    const getters = reactive({
        selectedDataTableId: computed(() => state.selectedDataTable?.data_table_id),
    });

    /* Mutations */
    const setShowOverlay = (showOverlay: boolean) => {
        state.showOverlay = showOverlay;
    };
    const setOverlayStep = (overlayStep: number) => {
        state.overlayStep = overlayStep;
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

    const mutations = {
        setShowOverlay,
        setOverlayStep,
        setSelectedDataTable: (dataTableId: string) => {
            state.selectedDataTable = state.dataTables.find((dataTable) => dataTable.data_table_id === dataTableId);
        },
        setSelectedWidgetName,
        setTitle,
        setDescription,
    };
    const actions = {
        listDataTable: async () => {
            try {
                const { results } = await SpaceConnector.clientV2.dashboard.publicDataTable.list<DataTableModel, ListResponse<DataTableModel>>();
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
                await SpaceConnector.clientV2.dashboard.publicDataTable.update<DataTableUpdateParameters, DataTableModel>(updateParams);
            } catch (e) {
                ErrorHandler.handleError(e);
            }
        },
        loadDataTable: async (dataTableId: string) => {
            console.debug('loadDataTable', dataTableId);
        },
    };

    return {
        state,
        getters,
        ...mutations,
        ...actions,
    };
});
