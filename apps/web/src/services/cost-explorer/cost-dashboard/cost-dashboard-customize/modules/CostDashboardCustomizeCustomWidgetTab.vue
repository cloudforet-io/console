<script lang="ts" setup>
import { getPageStart } from '@cloudforet/core-lib/component-util/pagination';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PRadio, PTextPagination, PButton, PFieldTitle, PDataLoader,
} from '@spaceone/design-system';
import {
    computed, reactive, watch,
} from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';

import ErrorHandler from '@/common/composables/error/errorHandler';

import CostDashboardCustomizeCostQuery
    from '@/services/cost-explorer/cost-dashboard/cost-dashboard-customize/modules/CostDashboardCustomizeCostQuery.vue';
import CostDashboardCustomizeWidgetConfig
    from '@/services/cost-explorer/cost-dashboard/cost-dashboard-customize/modules/CostDashboardCustomizeWidgetConfig.vue';
import CustomWidgetPreview
    from '@/services/cost-explorer/cost-dashboard/cost-dashboard-customize/modules/CustomWidgetPreview.vue';
import { chartTypeItemMap } from '@/services/cost-explorer/cost-dashboard/lib/config';
import type { WidgetInfo, ChartType } from '@/services/cost-explorer/cost-dashboard/type';
import { useCostDashboardPageStore } from '@/services/cost-explorer/store/cost-dashboard-page-store';
import type { CostQuerySetModel } from '@/services/cost-explorer/type';



const PAGE_SIZE = 6;

const store = useStore();
const { t } = useI18n();

const costDashboardPageStore = useCostDashboardPageStore();
const costDashboardPageState = costDashboardPageStore.$state;

const state = reactive({
    loading: true,
    totalCount: 0,
    widgetList: [] as WidgetInfo[],
    selectedItem: {} as WidgetInfo | CostQuerySetModel,
    selectedQuery: {} as CostQuerySetModel,
    showPreview: computed<boolean>(() => !!Object.keys(state.selectedItem).length),
    allPage: computed(() => Math.ceil(state.totalCount / PAGE_SIZE) || 1),
    thisPage: 1,
    userId: computed(() => store.state.user.userId),
    widgetCardImageList: [],
});

/* Api */
const apiQueryHelper = new ApiQueryHelper();
const getParams = () => {
    apiQueryHelper.setPageStart(getPageStart(state.thisPage, PAGE_SIZE))
        .setPageLimit(PAGE_SIZE)
        .setSort('created_at', true);
    return {
        query: apiQueryHelper.data,
        user_id: state.userId,
    };
};
const listCustomWidget = async () => {
    try {
        state.loading = true;
        const { results, total_count } = await SpaceConnector.client.costAnalysis.customWidget.list(getParams());
        state.totalCount = total_count;
        state.widgetList = results;
    } catch (e) {
        state.totalCount = 0;
        state.widgetList = [];
        ErrorHandler.handleError(e);
    } finally {
        state.loading = false;
    }
};
const deleteCustomWidget = async () => {
    try {
        await SpaceConnector.client.costAnalysis.customWidget.delete({
            widget_id: costDashboardPageState.originSelectedWidget?.widget_id,
        });
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};

/* Event */
const handleSelectWidget = async (value: WidgetInfo) => {
    costDashboardPageStore.$patch((_state) => {
        _state.originSelectedWidget = value;
        _state.editedSelectedWidget = value;
    });
    state.selectedQuery = {};
    state.selectedItem = value;
};
const handleClickRemoveWidget = async () => {
    await deleteCustomWidget();
    costDashboardPageStore.$patch((_state) => {
        _state.originSelectedWidget = undefined;
        _state.editedSelectedWidget = undefined;
    });
    state.selectedItem = {};
    state.thisPage = 1;
    await listCustomWidget();
};
const handleCreateCustomWidget = async (createdCustomWidget: WidgetInfo) => {
    await listCustomWidget();
    costDashboardPageStore.$patch((_state) => {
        _state.originSelectedWidget = createdCustomWidget;
        _state.editedSelectedWidget = createdCustomWidget;
    });
    state.selectedQuery = {};
    state.selectedItem = createdCustomWidget;
    state.thisPage = 1;
};
const getChartTypeImageFileName = (chartType: ChartType) => chartTypeItemMap[chartType].imageFileName;

const getWidgetCardImageList = async (): Promise<void> => {
    state.widgetCardImageList = await Promise.allSettled(
        state.widgetList.map((d) => import(`../../../../../assets/images/${getChartTypeImageFileName(d.options.chart_type)}.svg`)),
    );
};

(async () => {
    await listCustomWidget();
    await getWidgetCardImageList();
})();

watch(() => state.selectedQuery, (selectedQuery) => {
    if (Object.keys(selectedQuery).length) {
        state.selectedItem = selectedQuery;
        costDashboardPageStore.$patch((_state) => {
            _state.originSelectedWidget = undefined;
            _state.editedSelectedWidget = undefined;
        });
    }
}, { immediate: false });

</script>

<template>
    <div class="cost-dashboard-customize-custom-widget-tab">
        <div class="left-area">
            <p-data-loader class="widgets-area"
                           :data="state.widgetList"
                           :loading="state.loading"
            >
                <p-field-title>{{ t('BILLING.COST_MANAGEMENT.DASHBOARD.CUSTOMIZE.ADD_WIDGET_MODAL.ALL') }} ({{ state.widgetList.length }})</p-field-title>
                <ul class="widget-list">
                    <li v-for="(widget, idx) in state.widgetList"
                        :key="`widget-${idx}-${widget.name}`"
                        class="widget-card"
                        :class="{'selected' : state.selectedItem.widget_id === widget.widget_id}"
                        @click="handleSelectWidget(widget)"
                    >
                        <div class="card-header">
                            <p-radio :selected="costDashboardPageState.originSelectedWidget?.name"
                                     :value="widget.name"
                                     @click="handleSelectWidget(widget)"
                            >
                                <span @click="handleSelectWidget(widget)">{{ widget.name }}</span>
                            </p-radio>
                        </div>
                        <div class="card-content">
                            <img class="card-image"
                                 :src="state.widgetCardImageList[idx]?.value?.default"
                            >
                        </div>
                    </li>
                </ul>
                <p-text-pagination
                    v-model:this-page="state.thisPage"
                    :all-page="state.allPage"
                    @page-change="listCustomWidget"
                />
                <template #no-data>
                    <div class="help-text-wrapper">
                        <p class="title">
                            {{ t('BILLING.COST_MANAGEMENT.DASHBOARD.CUSTOMIZE.ADD_WIDGET_MODAL.NO_CUSTOM_WIDGET') }}
                        </p>
                        <p class="text">
                            {{ t('BILLING.COST_MANAGEMENT.DASHBOARD.CUSTOMIZE.ADD_WIDGET_MODAL.NO_CUSTOM_WIDGET_HELP_TEXT') }}
                        </p>
                    </div>
                </template>
            </p-data-loader>
            <cost-dashboard-customize-cost-query v-model:selected-query="state.selectedQuery"
                                                 :widget-list="state.widgetList"
                                                 class="cost-query-area"
                                                 @create-custom-widget="handleCreateCustomWidget"
            />
        </div>
        <div class="right-area">
            <cost-dashboard-customize-widget-config v-if="Object.keys(costDashboardPageState.originSelectedWidget ?? {}).length"
                                                    :is-custom="true"
            />
            <custom-widget-preview v-if="state.showPreview"
                                   :selected-item="state.selectedItem"
            />
            <p-button v-if="Object.keys(costDashboardPageState.originSelectedWidget ?? {}).length"
                      style-type="negative-secondary"
                      class="btn-remove"
                      @click="handleClickRemoveWidget"
            >
                {{ t('BILLING.COST_MANAGEMENT.DASHBOARD.CUSTOMIZE.ADD_WIDGET_MODAL.REMOVE_WIDGET') }}
            </p-button>
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.cost-dashboard-customize-custom-widget-tab {
    .left-area {
        @apply flex flex-col flex-grow flex-shrink border-r border-gray-200;
        overflow: hidden;
        height: inherit;
        .cost-query-area {
            @apply mr-8;
            height: auto;
            overflow-y: auto;
        }
        .widgets-area {
            @apply mb-4 border-b border-gray-200;
            min-height: 23.5rem;
            .help-text-wrapper {
                font-size: 0.875rem;
                .title {
                    @apply text-primary2;
                    font-weight: bold;
                    margin-bottom: 0.5rem;
                }
                .text {
                    @apply text-gray-600;
                }
            }
            + .widgets-area {
                @apply mt-4 border-t border-gray-200;
            }
            .p-field-title {
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

                    /* custom design-system component - p-radio */
                    :deep(.p-radio) {
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
        .cost-dashboard-customize-widget-config {
            @apply mt-6;
        }
        .btn-remove {
            @apply block mt-6 ml-auto mr-auto;
        }
    }

    .card-image {
        height: 3rem;
    }
}
</style>
