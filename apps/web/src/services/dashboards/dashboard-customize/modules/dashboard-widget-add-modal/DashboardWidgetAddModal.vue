<script lang="ts" setup>
import { PButtonModal, PTab } from '@spaceone/design-system';
import type { TabItem } from '@spaceone/design-system/types/navigation/tabs/tab/type';
import { v4 as uuidv4 } from 'uuid';
import {
    computed, reactive,
} from 'vue';
import { useI18n } from 'vue-i18n';

import { useProxyValue } from '@/common/composables/proxy-state';

import DashboardDefaultWidgetTab from '@/services/dashboards/dashboard-customize/modules/dashboard-widget-add-modal/DashboardDefaultWidgetTab.vue';
import { useWidgetFormStore } from '@/services/dashboards/store/widget-form';
import type { DashboardLayoutWidgetInfo } from '@/services/dashboards/widgets/_configs/config';
import { getWidgetConfig } from '@/services/dashboards/widgets/_helpers/widget-helper';


interface Props {
    visible: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    visible: false,
});
const emit = defineEmits<{(e: 'update:visible', value: boolean): void;
    (e: 'add-widget', value: DashboardLayoutWidgetInfo): void;
}>();
const { t } = useI18n();

const widgetFormStore = useWidgetFormStore();
const widgetFormState = widgetFormStore.$state;
const state = reactive({
    proxyVisible: useProxyValue('visible', props, emit),
});
const tabState = reactive({
    tabs: computed<TabItem[]>(() => ([
        { name: 'default-widget', label: t('DASHBOARDS.CUSTOMIZE.ADD_WIDGET.TAB_DEFAULT') },
        // { name: 'custom-widget', label: i18n.t('DASHBOARDS.CUSTOMIZE.ADD_WIDGET.TAB_CUSTOM') },
    ])),
    activeTab: 'default-widget',
});

const handleConfirm = () => {
    if (!widgetFormState.widgetConfigId || !widgetFormState.widgetTitle) return;
    const widgetConfig = getWidgetConfig(widgetFormState.widgetConfigId);
    const dashboardLayoutWidgetInfo: DashboardLayoutWidgetInfo = {
        widget_key: uuidv4(),
        widget_name: widgetFormState.widgetConfigId,
        title: widgetFormState.widgetTitle,
        size: widgetConfig.sizes[0],
        version: '1', // TODO: auto?
        inherit_options: widgetFormState.inheritOptions ?? {},
        widget_options: widgetFormState.widgetOptions ?? {},
        schema_properties: widgetFormState.schemaProperties ?? [],
    };
    emit('add-widget', dashboardLayoutWidgetInfo);
    state.proxyVisible = false;
};

</script>

<template>
    <p-button-modal v-model:visible="state.proxyVisible"
                    :header-title="t('DASHBOARDS.CUSTOMIZE.ADD_WIDGET.TITLE')"
                    size="lg"
                    class="dashboard-add-widget-modal"
                    :disabled="!widgetFormState.isValid"
                    @confirm="handleConfirm"
    >
        <template #body>
            <p-tab v-model:active-tab="tabState.activeTab"
                   :tabs="tabState.tabs"
            >
                <template #default-widget>
                    <dashboard-default-widget-tab />
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
