import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { PrivateWidgetModel } from '@/api-clients/dashboard/private-widget/schema/model';
import type { PublicWidgetModel } from '@/api-clients/dashboard/public-widget/schema/model';

import { getWidgetConfig } from '@/common/modules/widgets/_helpers/widget-config-helper';
import type { JoinRestrictedMap } from '@/common/modules/widgets/types/widget-data-table-type';
import type { WidgetSize, WidgetOverlayType } from '@/common/modules/widgets/types/widget-display-type';

type WidgetModel = PublicWidgetModel|PrivateWidgetModel;
export const useWidgetGenerateStore = defineStore('widget-generate', () => {
    const state = reactive({
        // display
        showOverlay: false,
        overlayStep: 1,
        overlayType: 'EDIT' as WidgetOverlayType,
        // Widget
        widgetId: '' as string|undefined,
        latestWidgetId: '',
        selectedWidgetName: 'table',
        size: 'full' as WidgetSize,
        widgetValidMap: {} as Record<string, boolean>,
        // Data Table
        selectedDataTableId: undefined as undefined | string,
        previewData: { results: [], total_count: 0 } as ListResponse<any>,
        dataTableCreateLoading: false,
        joinRestrictedMap: {} as JoinRestrictedMap, // Flag for handling Join type EXCEPTION RESTRICTION cases. (duplicated data field). Example - { '{dataTalbeId}': true, }
        allDataTableInvalidMap: {} as Record<string, boolean>, // Flag for handling all data table invalid cases. Example - { '{dataTalbeId}': true, }
        dataTableLoadFailed: false,
        dataTableCasCadeUpdateLoadingMap: {} as Record<string, boolean>,
    });

    const getters = reactive({
        isAllWidgetFormValid: computed<boolean>(() => {
            const widgetValidMapValues = Object.values(state.widgetValidMap);
            return widgetValidMapValues.every((valid) => valid);
        }),
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
    const setDataTableCasCadeUpdateLoadingMap = (value: Record<string, boolean>) => {
        state.dataTableCasCadeUpdateLoadingMap = value;
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
        setWidgetValidMap,
        setJoinRestrictedMap,
        setAllDataTableInvalidMap,
        setDataTableCreateLoading,
        setDataTableLoadFailed,
        setDataTableCasCadeUpdateLoadingMap,
    };
    const actions = {
        /* Step 2 */
        reset: () => {
            state.widgetId = undefined;
            state.showOverlay = false;
            state.overlayStep = 1;
            state.selectedDataTableId = undefined;
            state.size = 'full';
            state.widgetValidMap = {};
            state.allDataTableInvalidMap = {};
        },
        setWidgetFormInfo: (widgetInfo: WidgetModel) => {
            const _widgetConfig = getWidgetConfig(widgetInfo.widget_type || 'table');

            state.widgetId = widgetInfo.widget_id;
            state.selectedDataTableId = widgetInfo.data_table_id;
            state.selectedWidgetName = widgetInfo?.widget_type || 'table';
            state.size = widgetInfo?.size || _widgetConfig?.meta?.sizes[0] || 'full';
        },
    };

    return {
        state,
        getters,
        ...mutations,
        ...actions,
    };
});
