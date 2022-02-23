<template>
    <p-button-modal :visible="proxyVisible" header-title="Update Widget"
                    :disabled="false"
                    size="sm"
                    @confirm="handleConfirm"
                    @update:visible="handleUpdateVisible"
    >
        <template #body>
            <cost-dashboard-customize-widget-config v-if="Object.keys(selectedWidget).length"
                                                    is-custom
                                                    :selected-widget="selectedWidget" :show-group-by="hasGroupBy"
            />
        </template>
    </p-button-modal>
</template>

<script lang="ts">
import {
    computed,
    defineComponent,
    reactive, toRefs, watch,
} from '@vue/composition-api';
import { PButtonModal } from '@spaceone/design-system';
import CostDashboardCustomizeWidgetConfig
    from '@/services/billing/cost-management/cost-dashboard/cost-dashboard-customize/modules/CostDashboardCustomizeWidgetConfig.vue';
import { WidgetInfo } from '@/services/billing/cost-management/cost-dashboard/type';
import { store } from '@/store';

interface Props {
    visible: boolean;
    defaultFilter: Record<string, string[]>;
}
export default defineComponent<Props>({
    name: 'CostDashboardUpdateWidgetModal',
    components: {
        PButtonModal,
        CostDashboardCustomizeWidgetConfig,
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
            selectedWidget: computed<WidgetInfo>(() => store.state.service.costDashboard?.editedSelectedWidget),
            hasGroupBy: computed(() => state.selectedWidget.options?.group_by?.length > 0),
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
            handleConfirm,
            handleUpdateVisible,
        };
    },
});
</script>
