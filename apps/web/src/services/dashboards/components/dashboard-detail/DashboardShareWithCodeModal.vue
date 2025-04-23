<script lang="ts" setup>
import { computed, reactive, watch } from 'vue';

import {
    PButtonModal, PCodeEditor, PButton,
} from '@cloudforet/mirinae';

import type { DashboardModel } from '@/api-clients/dashboard/_types/dashboard-type';
import type { PrivateDataTableModel } from '@/api-clients/dashboard/private-data-table/schema/model';
import type { PublicDataTableModel } from '@/api-clients/dashboard/public-data-table/schema/model';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { CostDataSourceReferenceMap } from '@/store/reference/cost-data-source-reference-store';

import { copyAnyData } from '@/lib/helper/copy-helper';

import { useProxyValue } from '@/common/composables/proxy-state';

import { getSharedDashboardLayouts } from '@/services/_shared/dashboard/core/helpers/dashboard-layout-template-helper';
import { useDashboardWidgetListQuery } from '@/services/_shared/dashboard/dashboard-detail/composables/use-dashboard-widget-list-query';
import { useDashboardQuery } from '@/services/dashboards/composables/use-dashboard-query';
import type { SharedDashboardInfo } from '@/services/dashboards/types/shared-dashboard-type';




type DataTableModel = PublicDataTableModel | PrivateDataTableModel;
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

const appContextStore = useAppContextStore();
const allReferenceStore = useAllReferenceStore();

/* Query */
const {
    publicDashboardList,
    privateDashboardList,
} = useDashboardQuery();
const {
    widgetList,
} = useDashboardWidgetListQuery({
    dashboardId: computed(() => props.dashboardId),
});

const queryState = reactive({
    publicDashboardItems: computed(() => {
        const _v2DashboardItems = publicDashboardList.value.filter((d) => d.version !== '1.0');
        if (storeState.isAdminMode) return _v2DashboardItems;
        return _v2DashboardItems.filter((d) => !(d.resource_group === 'DOMAIN' && !!d.shared && d.scope === 'PROJECT'));
    }),
    privateDashboardItems: computed(() => privateDashboardList.value.filter((d) => d.version !== '1.0')),
    allDashboardItems: computed(() => [...queryState.publicDashboardItems, ...queryState.privateDashboardItems]),
});

const storeState = reactive({
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
    costDataSource: computed<CostDataSourceReferenceMap>(() => allReferenceStore.getters.costDataSource),
});
const state = reactive({
    proxyVisible: useProxyValue('visible', props, emit),
    targetDashboard: computed<DashboardModel>(() => queryState.allDashboardItems.find((item: DashboardModel) => item.dashboard_id === props.dashboardId)),
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

        const _sharedLayouts = await getSharedDashboardLayouts(state.targetDashboard.layouts, widgetList.value, storeState.costDataSource);
        state.sharedDashboard = {
            name: state.targetDashboard.name || '',
            layouts: _sharedLayouts,
            options: state.targetDashboard.options || {},
            labels: state.targetDashboard.labels || [],
            vars: state.targetDashboard.vars,
            vars_schema: state.targetDashboard.vars_schema,
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
                <p-code-editor :code="state.sharedDashboard"
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
