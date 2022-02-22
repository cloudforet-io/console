<template>
    <p-button-modal :visible="proxyVisible"
                    header-title="Add New Widget"
                    :disabled="false"
                    size="lg"
                    @confirm="handleConfirm"
                    @cancel="handleCancel"
                    @update:visible="handleUpdateVisible"
    >
        <template #body>
            <p-tab :tabs="tabState.tabs" :active-tab.sync="tabState.activeTab" class="tab"
                   @change="handleChangeTab"
            >
                <template #default-widget>
                    <cost-dashboard-customize-default-widget-tab />
                </template>
                <template #custom-widget>
                    <cost-dashboard-customize-custom-widget-tab />
                </template>
            </p-tab>
        </template>
    </p-button-modal>
</template>

<script lang="ts">
import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';
import { PButtonModal, PTab } from '@spaceone/design-system';
import { TabItem } from '@spaceone/design-system/src/navigation/tabs/tab/type';

import CostDashboardCustomizeDefaultWidgetTab
    from '@/services/billing/cost-management/cost-dashboard/cost-dashboard-customize/modules/CostDashboardCustomizeDefaultWidgetTab.vue';
import CostDashboardCustomizeCustomWidgetTab
    from '@/services/billing/cost-management/cost-dashboard/cost-dashboard-customize/modules/CostDashboardCustomizeCustomWidgetTab.vue';
import { store } from '@/store';

interface Props {
    visible: boolean;
}
export default {
    name: 'CostDashboardCreateCustomizeWidgetModal',
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
            required: true,
        },
        defaultFilter: {
            type: Object,
            default: () => ({}),
        },
    },
    setup(props: Props, { emit }) {
        const state = reactive({
            proxyVisible: props.visible,
            widgetPosition: computed(() => store.state.service.costDashboard.widgetPosition),
        });
        const tabState = reactive({
            tabs: computed(() => ([
                { name: 'default-widget', label: 'Default' },
                { name: 'custom-widget', label: 'Custom' },
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
            store.commit('service/costDashboard/setWidgetPosition', undefined);
            store.commit('service/costDashboard/setLayoutOfSpace', undefined);
            store.commit('service/costDashboard/setOriginSelectedWidget', {});
            store.commit('service/costDashboard/setEditedSelectedWidget', {});
        };

        const handleChangeTab = () => {
            store.commit('service/costDashboard/setOriginSelectedWidget', {});
            store.commit('service/costDashboard/setEditedSelectedWidget', {});
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
