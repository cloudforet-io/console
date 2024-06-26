<script lang="ts" setup>
import { reactive, watch } from 'vue';

import {
    PButtonModal, PTextEditor, PButton,
} from '@spaceone/design-system';
import { flattenDeep } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { PrivateDashboardModel } from '@/schema/dashboard/private-dashboard/model';
import type { PrivateDataTableModel } from '@/schema/dashboard/private-data-table/model';
import type { PrivateWidgetModel } from '@/schema/dashboard/private-widget/model';
import type { PublicDashboardModel } from '@/schema/dashboard/public-dashboard/model';
import type { DataTableListParameters } from '@/schema/dashboard/public-data-table/api-verbs/list';
import type { PublicDataTableModel } from '@/schema/dashboard/public-data-table/model';
import type { PublicWidgetModel } from '@/schema/dashboard/public-widget/model';

import { copyAnyData } from '@/lib/helper/copy-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';
import { DATA_TABLE_TYPE } from '@/common/modules/widgets/_constants/data-table-constant';

import { useDashboardDetailInfoStore } from '@/services/dashboards/stores/dashboard-detail-info-store';


type DashboardModel = PublicDashboardModel | PrivateDashboardModel;
type DataTableModel = PublicDataTableModel | PrivateDataTableModel;
type WidgetModel = PublicWidgetModel | PrivateWidgetModel;
type SharedDataTableInfo = Pick<DataTableModel, 'name' | 'data_type' | 'source_type' | 'operator' | 'options' | 'labels_info' | 'data_info'>;
type SharedWidgetInfo =
    Pick<WidgetModel, 'name' | 'description' | 'size' | 'widget_type' | 'options'> & {
    data_tables: SharedDataTableInfo[];
    data_table_id: number;
};
type SharedDashboardInfo =
    Pick<DashboardModel, 'name' | 'version' | 'options' | 'labels'> & {
    layouts: Array<{
        name?: string;
        widgets: SharedWidgetInfo[];
    }>;
};
interface Props {
    visible: boolean;
    dashboardId: string;
}
const props = withDefaults(defineProps<Props>(), {
    visible: false,
    dashboardId: '',
});
const emit = defineEmits<{(e: 'update:visible', value: boolean): void;
    (e: 'confirm', value: string): void;
}>();

const dashboardDetailStore = useDashboardDetailInfoStore();
const dashboardDetailState = dashboardDetailStore.state;
const state = reactive({
    proxyVisible: useProxyValue('visible', props, emit),
    loading: false,
    isCopied: false,
    sharedDashboard: {} as SharedDashboardInfo,
    widgetDataTablesMap: {} as Record<string, DataTableModel[]>,
});

/* Api */
const listDataTables = async (widgetId?: string) => {
    if (!widgetId) return;
    const _isPrivate = widgetId.startsWith('private');
    const _fetcher = _isPrivate
        ? SpaceConnector.clientV2.dashboard.privateDataTable.list<DataTableListParameters, ListResponse<DataTableModel>>
        : SpaceConnector.clientV2.dashboard.publicDataTable.list<DataTableListParameters, ListResponse<DataTableModel>>;
    try {
        const { results } = await _fetcher({
            widget_id: widgetId,
        });
        if (results) {
            state.widgetDataTablesMap[widgetId] = results;
        }
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};

/* Util */
const initWidgetDataTablesMap = async () => {
    const _dashboardWidgetIdList = flattenDeep(dashboardDetailState.dashboardLayouts?.map((layout) => layout.widgets?.map((w) => w)) || []);
    await Promise.allSettled(_dashboardWidgetIdList.map((widgetId) => listDataTables(widgetId)));
};
const getSharedDataTableInfoList = (widgetId: string, dataTableId?: string): [SharedDataTableInfo[], number] => {
    const _dataTables = state.widgetDataTablesMap[widgetId] || [];
    const _dataTableIndex = _dataTables.findIndex((d) => d.data_table_id === dataTableId);
    const _sharedDataTables: SharedDataTableInfo[] = [];
    _dataTables.forEach((dt) => {
        const _sharedDataTable = {
            name: dt.name,
            data_type: dt.data_type,
            source_type: dt.source_type,
            operator: dt.operator,
            labels_info: dt.labels_info,
            data_info: dt.data_info,
            options: dt.options,
        };
        if (dt.data_type === DATA_TABLE_TYPE.TRANSFORMED) {
            if (dt.operator === 'JOIN' || dt.operator === 'CONCAT') {
                const _dataTableIds = dt.options[dt.operator].data_tables;
                const _dataTableIndices = _dataTableIds.map((dtId) => _dataTables.findIndex((d) => d.data_table_id === dtId));
                _sharedDataTable.options = {
                    [dt.operator]: {
                        ...dt.options[dt.operator],
                        data_tables: _dataTableIndices,
                    },
                };
            } else if (dt.operator === 'EVAL' || dt.operator === 'QUERY') {
                console.log(dt.options);
                const _dataTableId = dt.options[dt.operator].data_table_id;
                const _dataTableIdx = _dataTables.findIndex((d) => d.data_table_id === _dataTableId);
                _sharedDataTable.options = {
                    [dt.operator]: {
                        ...dt.options[dt.operator],
                        data_table_id: _dataTableIdx,
                    },
                };
            }
        }
        _sharedDataTables.push(_sharedDataTable);
    });
    return [_sharedDataTables, _dataTableIndex];
};
const getSharedDashboard = () => {
    state.loading = true;
    const _sharedLayouts: SharedDashboardInfo['layouts'] = [];
    dashboardDetailState.dashboardLayouts.forEach((layout) => {
        const _sharedWidgets: SharedWidgetInfo[] = [];
        layout.widgets?.forEach((widgetId) => {
            const _widget = dashboardDetailState.dashboardWidgets.find((w) => w.widget_id === widgetId);
            if (_widget) {
                const _dataTableId = _widget.data_table_id;
                const [_dataTables, _dataTableIndex] = getSharedDataTableInfoList(_widget.widget_id, _dataTableId);
                const _sharedWidgetInfo: SharedWidgetInfo = {
                    name: _widget.name,
                    widget_type: _widget.widget_type,
                    size: _widget.size,
                    options: _widget.options,
                    description: _widget.description,
                    data_tables: _dataTables,
                    data_table_id: _dataTableIndex > -1 ? _dataTableIndex : 0,
                };
                _sharedWidgets.push(_sharedWidgetInfo);
            }
        });
        _sharedLayouts.push({
            widgets: _sharedWidgets,
        });
    });
    state.sharedDashboard = {
        name: dashboardDetailState.name || '',
        version: dashboardDetailState.dashboardInfo?.version || '2.0',
        layouts: _sharedLayouts,
        options: dashboardDetailState.options || {},
        labels: dashboardDetailState.labels || [],
    };
    state.loading = false;
};

/* Event */
const handleUpdateVisible = (visible: boolean) => {
    state.proxyVisible = visible;
};
const handleClickCopyButton = () => {
    if (state.isCopied) return;
    const _code = JSON.stringify(state.sharedDashboard, null, 2);
    copyAnyData(_code);
    setTimeout(() => {
        state.isCopied = true;
        setTimeout(() => {
            state.isCopied = false;
        }, 1500);
    }, 800);
};

watch(() => props.visible, async (visible) => {
    if (visible) {
        await initWidgetDataTablesMap();
        getSharedDashboard();
    }
});
</script>

<template>
    <p-button-modal :visible="state.proxyVisible"
                    :header-title="$t('DASHBOARDS.DETAIL.SHARE_WITH_CODE')"
                    size="md"
                    hide-footer-close-button
                    hide-footer-confirm-button
                    class="dashboard-share-modal"
                    @update:visible="handleUpdateVisible"
    >
        <template #body>
            <div class="code-wrapper">
                <p-text-editor :code="state.sharedDashboard"
                               readonly
                               folded
                               :loading="state.loading"
                />
                <p-button :class="{'copy-button': true, 'copied': state.isCopied}"
                          style-type="tertiary"
                          size="sm"
                          :icon-left="state.isCopied ? 'ic_check' :'ic_copy'"
                          @click="handleClickCopyButton"
                >
                    {{ state.isCopied ? $t('DASHBOARDS.DETAIL.COPIED') : $t('DASHBOARDS.DETAIL.COPY') }}
                </p-button>
            </div>
        </template>
    </p-button-modal>
</template>

<style lang="postcss" scoped>
.code-wrapper {
    position: relative;
    .copy-button {
        position: absolute;
        right: 0.5rem;
        top: 0.5rem;
        text-align: right;
        &.copied {
            @apply bg-gray-200;
        }
    }
}
</style>
