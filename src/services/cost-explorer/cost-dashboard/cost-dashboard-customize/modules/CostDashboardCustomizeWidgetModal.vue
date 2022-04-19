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
            <p-tab :tabs="tabState.tabs" :active-tab.sync="tabState.activeTab" class="tab"
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
} from '@vue/composition-api';
import { PButtonModal, PTab } from '@spaceone/design-system';
import { TabItem } from '@spaceone/design-system/src/navigation/tabs/tab/type';

import CostDashboardCustomizeDefaultWidgetTab
    from '@/services/cost-explorer/cost-dashboard/cost-dashboard-customize/modules/CostDashboardCustomizeDefaultWidgetTab.vue';
import CostDashboardCustomizeCustomWidgetTab
    from '@/services/cost-explorer/cost-dashboard/cost-dashboard-customize/modules/CostDashboardCustomizeCustomWidgetTab.vue';
import { i18n } from '@/translations';
import { costExplorerStore } from '@/services/cost-explorer/store';

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
            widgetPosition: computed(() => costExplorerStore.state.dashboard.widgetPosition),
            isSelectedWidgetExist: computed(() => Object.keys(costExplorerStore.state.dashboard.originSelectedWidget).length),
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
            costExplorerStore.commit('dashboard/setWidgetPosition', undefined);
            costExplorerStore.commit('dashboard/setLayoutOfSpace', undefined);
            costExplorerStore.commit('dashboard/setOriginSelectedWidget', {});
            costExplorerStore.commit('dashboard/setEditedSelectedWidget', {});
        };

        const handleChangeTab = () => {
            costExplorerStore.commit('dashboard/setOriginSelectedWidget', {});
            costExplorerStore.commit('dashboard/setEditedSelectedWidget', {});
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
.p-button-modal::v-deep {
    $modal-hedaer: 3.5rem;
    $modal-padding: 8rem;
    $modal-footer: 4rem;
    $tab-bar: 3rem;

    .modal-body {
        @apply overflow-hidden;
        .tab-pane {
            height: calc(100vh - $modal-hedaer - $modal-padding - $modal-footer - $tab-bar);
        }
    }
}
.add-widget-tab::v-deep {
    @apply flex w-full;
    height: inherit;

    .left-area {
        @apply overflow-auto flex flex-col flex-grow flex-shrink border-r border-gray-200;
        height: inherit;
        .widgets-area {
            + .widgets-area {
                @apply mt-4 border-t border-gray-200;
            }
            .p-label {
                @apply mt-6 mb-2;
            }
        }
        .widget-list {
            @apply grid grid-cols-3 gap-2 pr-8;
            .widget-card {
                @apply flex flex-col overflow-hidden border border-gray-300 rounded-md cursor-pointer;
                max-width: 20rem;
                min-height: 7.1875rem;

                &.selected {
                    @apply border border-blue-600;
                }
                .card-header {
                    @apply flex items-center pl-4 pr-4 flex-grow;
                    min-height: 3.125rem;
                    .p-radio {
                        @apply flex items-center;
                        .radio-icon {
                            @apply flex-shrink-0 mr-2;
                        }
                    }
                }
                .card-content {
                    @apply flex justify-center items-center bg-gray-100;
                    min-height: 4rem;
                }
            }
        }
        .text-pagination {
            @apply flex justify-center w-full mt-6 mb-6;
        }
    }
    .right-area {
        @apply overflow-auto flex-shrink-0 ml-8;
        width: 16.5rem;
        height: inherit;
        .widget-config {
            @apply mt-6;
        }
    }
}
</style>
