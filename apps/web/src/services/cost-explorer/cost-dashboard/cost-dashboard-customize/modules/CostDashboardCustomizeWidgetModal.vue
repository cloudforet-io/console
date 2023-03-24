<template>
    <p-button-modal :visible="proxyVisible"
                    :header-title="$t('BILLING.COST_MANAGEMENT.DASHBOARD.CUSTOMIZE.ADD_WIDGET_MODAL.TITLE')"
                    size="lg"
                    :disabled="!isSelectedWidgetExist"
                    @confirm="handleConfirm"
                    @close="handleCancel"
                    @cancel="handleCancel"
                    @update:visible="handleUpdateVisible"
    >
        <template #body>
            <p-tab :tabs="tabState.tabs"
                   :active-tab.sync="tabState.activeTab"
                   class="tab"
                   @change="handleChangeTab"
            >
                <template #default-widget>
                    <cost-dashboard-customize-default-widget-tab class="add-widget-tab" />
                </template>
                <template #custom-widget>
                    <cost-dashboard-customize-custom-widget-tab class="add-widget-tab" />
                </template>
            </p-tab>
        </template>
    </p-button-modal>
</template>

<script lang="ts">

import {
    computed, reactive, toRefs, watch,
} from 'vue';

import { PButtonModal, PTab } from '@spaceone/design-system';
import type { TabItem } from '@spaceone/design-system/types/navigation/tabs/tab/type';

import { i18n } from '@/translations';

import CostDashboardCustomizeCustomWidgetTab
    from '@/services/cost-explorer/cost-dashboard/cost-dashboard-customize/modules/CostDashboardCustomizeCustomWidgetTab.vue';
import CostDashboardCustomizeDefaultWidgetTab
    from '@/services/cost-explorer/cost-dashboard/cost-dashboard-customize/modules/CostDashboardCustomizeDefaultWidgetTab.vue';
import { useCostDashboardPageStore } from '@/services/cost-explorer/store/cost-dashboard-page-store';

interface Props {
    visible: boolean;
}
export default {
    name: 'CostDashboardCustomizeWidgetModal',
    components: {
        CostDashboardCustomizeDefaultWidgetTab,
        CostDashboardCustomizeCustomWidgetTab,
        PButtonModal,
        PTab,
    },
    model: {
        prop: 'visible',
        event: 'update:visible',
    },
    props: {
        visible: {
            type: Boolean,
        },
        defaultFilter: {
            type: Object,
            default: () => ({}),
        },
    },
    setup(props: Props, { emit }) {
        const costDashboardPageStore = useCostDashboardPageStore();
        const costDashboardPageState = costDashboardPageStore.$state;

        const state = reactive({
            proxyVisible: props.visible,
            isSelectedWidgetExist: computed(() => Object.keys(costDashboardPageState.originSelectedWidget ?? {}).length),
        });
        const tabState = reactive({
            tabs: computed(() => ([
                { name: 'default-widget', label: i18n.t('BILLING.COST_MANAGEMENT.DASHBOARD.CUSTOMIZE.ADD_WIDGET_MODAL.DEFAULT') },
                { name: 'custom-widget', label: i18n.t('BILLING.COST_MANAGEMENT.DASHBOARD.CUSTOMIZE.ADD_WIDGET_MODAL.CUSTOM') },
            ] as TabItem[])),
            activeTab: 'default-widget',
        });
        const handleConfirm = () => {
            emit('update:visible', false);
            emit('confirm');
        };
        const handleUpdateVisible = (visible) => {
            state.proxyVisible = visible;
            emit('update:visible', visible);
        };
        const handleCancel = () => {
            costDashboardPageStore.$patch({
                widgetPosition: undefined,
                layoutOfSpace: undefined,
                originSelectedWidget: undefined,
                editedSelectedWidget: undefined,
            });
        };

        const handleChangeTab = () => {
            costDashboardPageStore.$patch({
                originSelectedWidget: undefined,
                editedSelectedWidget: undefined,
            });
        };

        watch(() => props.visible, (visible) => {
            if (visible !== state.proxyVisible) state.proxyVisible = visible;
        });
        return {
            ...toRefs(state),
            tabState,
            handleConfirm,
            handleUpdateVisible,
            handleCancel,
            handleChangeTab,
        };
    },
};
</script>
<style lang="postcss" scoped>
.p-tab {
    @apply border-0;
}

.p-button-modal {
    $modal-hedaer: 3.5rem;
    $modal-padding: 8rem;
    $modal-footer: 4rem;
    $tab-bar: 3rem;

    /* custom design-system component - p-button-modal */
    :deep(.modal-body) {
        @apply overflow-hidden;
        .tab-pane {
            height: calc(100vh - $modal-hedaer - $modal-padding - $modal-footer - $tab-bar);
        }
    }
}
.add-widget-tab {
    @apply flex w-full;
    height: inherit;
}
</style>
