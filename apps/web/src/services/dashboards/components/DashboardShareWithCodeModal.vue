<script lang="ts" setup>
import { reactive, watch } from 'vue';

import {
    PButtonModal, PTextEditor, PButton,
} from '@spaceone/design-system';

import type { PrivateDashboardModel } from '@/schema/dashboard/private-dashboard/model';
import type { PrivateDataTableModel } from '@/schema/dashboard/private-data-table/model';
import type { PrivateWidgetModel } from '@/schema/dashboard/private-widget/model';
import type { PublicDashboardModel } from '@/schema/dashboard/public-dashboard/model';
import type { PublicDataTableModel } from '@/schema/dashboard/public-data-table/model';
import type { PublicWidgetModel } from '@/schema/dashboard/public-widget/model';

import { copyAnyData } from '@/lib/helper/copy-helper';

import { useProxyValue } from '@/common/composables/proxy-state';

import { getSharedDashboardLayouts } from '@/services/dashboards/helpers/dashboard-share-helper';
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
        state.loading = true;
        const _sharedLayouts = await getSharedDashboardLayouts(dashboardDetailState.dashboardLayouts, dashboardDetailState.dashboardWidgets);
        state.sharedDashboard = {
            name: dashboardDetailState.name || '',
            version: dashboardDetailState.dashboardInfo?.version || '2.0',
            layouts: _sharedLayouts,
            options: dashboardDetailState.options || {},
            labels: dashboardDetailState.labels || [],
        };
        state.loading = false;
    }
});
</script>

<template>
    <p-button-modal :visible="state.proxyVisible"
                    :header-title="$t('DASHBOARDS.DETAIL.SHARE_WITH_CODE')"
                    size="md"
                    hide-footer-close-button
                    hide-footer-confirm-button
                    class="dashboard-share-with-code-modal"
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
