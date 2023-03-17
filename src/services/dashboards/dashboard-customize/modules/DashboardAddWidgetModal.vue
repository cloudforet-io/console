<template>
    <p-button-modal :visible.sync="proxyVisible"
                    :header-title="$t('DASHBOARDS.CUSTOMIZE.ADD_WIDGET.TITLE')"
                    size="lg"
                    class="dashboard-add-widget-modal"
                    :disabled="!widgetFormState.isValid"
                    @confirm="handleConfirm"
    >
        <template #body>
            <p-tab :tabs="tabState.tabs"
                   :active-tab.sync="tabState.activeTab"
            >
                <template #default-widget>
                    <dashboard-default-widget-tab />
                </template>
            </p-tab>
        </template>
    </p-button-modal>
</template>
<script lang="ts">
import type { SetupContext } from 'vue';
import {
    computed, defineComponent, reactive, toRefs,
} from 'vue';

import { PButtonModal, PTab } from '@spaceone/design-system';
import type { TabItem } from '@spaceone/design-system/types/navigation/tabs/tab/type';
import { v4 as uuidv4 } from 'uuid';

import { i18n } from '@/translations';

import { useProxyValue } from '@/common/composables/proxy-state';

import DashboardDefaultWidgetTab from '@/services/dashboards/dashboard-customize/modules/DashboardDefaultWidgetTab.vue';
import { useWidgetFormStore } from '@/services/dashboards/store/widget-form';
import type { DashboardLayoutWidgetInfo } from '@/services/dashboards/widgets/_configs/config';
import { getWidgetConfig } from '@/services/dashboards/widgets/_helpers/widget-helper';


interface Props {
    visible: boolean;
}
export default defineComponent<Props>({
    name: 'DashboardAddWidgetModal',
    components: {
        DashboardDefaultWidgetTab,
        PTab,
        PButtonModal,
    },
    props: {
        visible: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, { emit }: SetupContext) {
        const widgetFormStore = useWidgetFormStore();
        const widgetFormState = widgetFormStore.state;
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
                default_schema_properties: widgetFormState.defaultSchemaProperties ?? [],
            };
            emit('add-widget', dashboardLayoutWidgetInfo);
            state.proxyVisible = false;
        };

        return {
            ...toRefs(state),
            widgetFormState,
            tabState,
            handleConfirm,
        };
    },
});
</script>
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
