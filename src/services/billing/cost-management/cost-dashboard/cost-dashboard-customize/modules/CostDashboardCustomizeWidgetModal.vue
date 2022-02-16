<template>
    <p-button-modal :visible="proxyVisible" header-title="Add New Widget"
                    :disabled="false"
                    size="lg"
                    @confirm="handleConfirm"
                    @update:visible="handleUpdateVisible"
    >
        <template #body>
            <p-tab :tabs="tabState.tabs" :active-tab.sync="tabState.activeTab" class="tab">
                <template #default-widget>
                    <cost-dashboard-customize-default-widget-tab />
                </template>
                <template #custom />
            </p-tab>
        </template>
    </p-button-modal>
</template>

<script lang="ts">
import {
    computed,
    defineComponent,
    reactive, toRefs, watch,
} from '@vue/composition-api';
import { PButtonModal, PTab } from '@spaceone/design-system';
import { TabItem } from '@spaceone/design-system/src/navigation/tabs/tab/type';
import CostDashboardCustomizeDefaultWidgetTab
    from '@/services/billing/cost-management/cost-dashboard/cost-dashboard-customize/modules/CostDashboardCustomizeDefaultWidgetTab.vue';

interface Props {
    visible: boolean;
}
export default defineComponent<Props>({
    name: 'CostDashboardCreateCustomizeWidgetModal',
    components: {
        CostDashboardCustomizeDefaultWidgetTab,
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
    setup(props, { emit }) {
        const state = reactive({
            proxyVisible: props.visible,
        });
        const tabState = reactive({
            tabs: computed(() => ([
                { name: 'default-widget', label: 'Default', keepAlive: true },
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
        watch(() => props.visible, (visible) => {
            if (visible !== state.proxyVisible) state.proxyVisible = visible;
        });
        return {
            ...toRefs(state),
            tabState,
            handleConfirm,
            handleUpdateVisible,
        };
    },
});
</script>
