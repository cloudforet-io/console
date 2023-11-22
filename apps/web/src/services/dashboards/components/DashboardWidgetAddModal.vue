<script setup lang="ts">
import {
    computed, reactive,
} from 'vue';

import { PButtonModal, PTab } from '@spaceone/design-system';
import type { TabItem } from '@spaceone/design-system/types/navigation/tabs/tab/type';

import type { DashboardLayoutWidgetInfo } from '@/schema/dashboard/_types/dashboard-type';
import { i18n } from '@/translations';

import getRandomId from '@/lib/random-id-generator';

import { useProxyValue } from '@/common/composables/proxy-state';

import DashboardWidgetAddModalDefaultTab from '@/services/dashboards/components/DashboardWidgetAddModalDefaultTab.vue';
import { useWidgetFormStore } from '@/services/dashboards/stores/widget-form-store';
import { getWidgetConfig } from '@/services/dashboards/widgets/_helpers/widget-helper';


interface Props {
    visible: boolean;
}
const props = defineProps<Props>();
const emit = defineEmits<{(e: 'update:visible', visible: boolean): void;
    (e: 'add-widget', dashboardLayoutWidgetInfo: DashboardLayoutWidgetInfo): void;
}>();
const widgetFormStore = useWidgetFormStore();
const widgetFormState = widgetFormStore.state;
const widgetFormGetters = widgetFormStore.getters;

const state = reactive({
    proxyVisible: useProxyValue('visible', props, emit),
});
const tabState = reactive({
    tabs: computed<TabItem[]>(() => ([
        { name: 'default-widget', label: i18n.t('DASHBOARDS.CUSTOMIZE.ADD_WIDGET.TAB_DEFAULT') },
        // { name: 'custom-widget', label: i18n.t('DASHBOARDS.CUSTOMIZE.ADD_WIDGET.TAB_CUSTOM') },
    ])),
    activeTab: 'default-widget',
});

const handleConfirm = () => {
    if (!widgetFormState.widgetConfigId || !widgetFormGetters.title) return;
    const widgetConfig = getWidgetConfig(widgetFormState.widgetConfigId);
    const dashboardLayoutWidgetInfo: DashboardLayoutWidgetInfo = {
        widget_key: getRandomId(),
        widget_name: widgetFormState.widgetConfigId,
        size: widgetConfig.sizes[0],
        version: '1', // TODO: auto?
        ...widgetFormGetters.updatedWidgetInfo,
    };
    emit('add-widget', dashboardLayoutWidgetInfo);
    state.proxyVisible = false;
};

</script>

<template>
    <p-button-modal :visible.sync="state.proxyVisible"
                    :header-title="$t('DASHBOARDS.CUSTOMIZE.ADD_WIDGET.TITLE')"
                    size="lg"
                    class="dashboard-add-widget-modal"
                    :disabled="!widgetFormGetters.isAllValid"
                    @confirm="handleConfirm"
    >
        <template #body>
            <p-tab :tabs="tabState.tabs"
                   :active-tab.sync="tabState.activeTab"
            >
                <template #default-widget>
                    <dashboard-widget-add-modal-default-tab />
                </template>
            </p-tab>
        </template>
    </p-button-modal>
</template>

<style lang="postcss" scoped>
.dashboard-add-widget-modal {
    .p-tab {
        @apply border-0;
    }
    &.p-button-modal {
        $modal-hedaer: 3.5rem;
        $modal-padding: 8rem;
        $modal-footer: 4rem;
        $tab-bar: 4rem;

        /* custom design-system component - p-button-modal */
        :deep(.modal-body) {
            @apply overflow-hidden;
            .tab-pane {
                height: calc(100vh - $modal-hedaer - $modal-padding - $modal-footer - $tab-bar);
            }
        }
    }
}
</style>
