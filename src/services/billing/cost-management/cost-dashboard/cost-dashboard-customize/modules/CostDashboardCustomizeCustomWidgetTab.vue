<template>
    <div class="cost-dashboard-customize-custom-widget-tab">
        <div class="left-area">
            <div class="widgets-area">
                <p-label>{{ $t('BILLING.COST_MANAGEMENT.DASHBOARD.CUSTOMIZE.ADD_WIDGET_MODAL.ALL') }} ({{ widgetList.length }})</p-label>
                <ul class="widget-list">
                    <li v-for="(widget, idx) in widgetList" :key="`widget-${idx}-${widget.name}`" class="widget-card"
                        :class="{'selected' : selectedItem.widget_id === widget.widget_id}"
                        @click="handleSelectWidget(widget)"
                    >
                        <div class="card-header">
                            <p-radio :selected="selectedWidget.name" :value="widget.name" @click="handleSelectWidget(widget)">
                                <span @click="handleSelectWidget(widget)">{{ widget.name }}</span>
                            </p-radio>
                        </div>
                        <div class="card-content">
                            <img class="card-image" :src="require(`@/assets/images/${getChartTypeImageFileName(widget.options.chart_type)}.svg`)">
                        </div>
                    </li>
                </ul>
                <p-text-pagination
                    :this-page.sync="thisPage"
                    :all-page="allPage"
                    @pageChange="listCustomWidget"
                />
            </div>
            <cost-dashboard-customize-cost-query :selected-query.sync="selectedQuery"
                                                 :widget-list="widgetList"
                                                 class="cost-query-area"
                                                 @create-custom-widget="handleCreateCustomWidget"
            />
        </div>
        <div class="right-area">
            <cost-dashboard-customize-widget-config v-if="Object.keys(selectedWidget).length"
                                                    :selected-widget="selectedWidget"
                                                    :is-custom="true"
            />
            <custom-widget-preview v-if="showPreview"
                                   :selected-item="selectedItem"
            />
            <p-button v-if="Object.keys(selectedWidget).length" style-type="alert" outline="true"
                      class="btn-remove"
                      @click="handleClickRemoveWidget"
            >
                {{ $t('BILLING.COST_MANAGEMENT.DASHBOARD.CUSTOMIZE.ADD_WIDGET_MODAL.REMOVE_WIDGET') }}
            </p-button>
        </div>
    </div>
</template>

<script lang="ts">
import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';

import {
    PRadio, PTextPagination, PButton, PLabel,
} from '@spaceone/design-system';

import CostDashboardCustomizeCostQuery
    from '@/services/billing/cost-management/cost-dashboard/cost-dashboard-customize/modules/CostDashboardCustomizeCostQuery.vue';
import CostDashboardCustomizeWidgetConfig
    from '@/services/billing/cost-management/cost-dashboard/cost-dashboard-customize/modules/CostDashboardCustomizeWidgetConfig.vue';
import CustomWidgetPreview
    from '@/services/billing/cost-management/cost-dashboard/cost-dashboard-customize/modules/CustomWidgetPreview.vue';

import { store } from '@/store';
import { CHART_TYPE, WidgetInfo } from '@/services/billing/cost-management/cost-dashboard/type';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { BILLING_ROUTE } from '@/services/billing/routes';
import { CostQuerySetModel } from '@/services/billing/cost-management/type';
import { ApiQueryHelper } from '@spaceone/console-core-lib/space-connector/helper';
import { getPageStart } from '@spaceone/console-core-lib/component-util/pagination';
import { chartTypeItemMap } from '@/services/billing/cost-management/cost-dashboard/lib/config';


const PAGE_SIZE = 6;

export default {
    name: 'CostDashboardCustomizeCustomWidgetTab',
    components: {
        CostDashboardCustomizeCostQuery,
        CostDashboardCustomizeWidgetConfig,
        CustomWidgetPreview,
        PTextPagination,
        PRadio,
        PButton,
        PLabel,
    },
    setup() {
        const state = reactive({
            loading: true,
            totalCount: 0,
            widgetList: [] as WidgetInfo[],
            selectedItem: {} as WidgetInfo | CostQuerySetModel,
            selectedWidget: computed<WidgetInfo>(() => store.state.service.costDashboard.originSelectedWidget),
            selectedQuery: {} as CostQuerySetModel,
            showPreview: computed<boolean>(() => !!Object.keys(state.selectedItem).length),
            allPage: computed(() => Math.ceil(state.totalCount / PAGE_SIZE) || 1),
            thisPage: 1,
        });

        /* Api */
        const apiQueryHelper = new ApiQueryHelper();
        const getParams = () => {
            apiQueryHelper.setPageStart(getPageStart(state.thisPage, PAGE_SIZE))
                .setPageLimit(PAGE_SIZE)
                .setSort('created_at', true);
            return {
                query: apiQueryHelper.data,
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
                    widget_id: state.selectedWidget.widget_id,
                });
            } catch (e) {
                ErrorHandler.handleError(e);
            }
        };

        /* Event */
        const handleSelectWidget = async (value: WidgetInfo) => {
            store.commit('service/costDashboard/setOriginSelectedWidget', value);
            store.commit('service/costDashboard/setEditedSelectedWidget', value);
            state.selectedQuery = {};
            state.selectedItem = value;
        };
        const handleClickRemoveWidget = async () => {
            await deleteCustomWidget();
            store.commit('service/costDashboard/setOriginSelectedWidget', {});
            store.commit('service/costDashboard/setEditedSelectedWidget', {});
            state.selectedItem = {};
            state.thisPage = 1;
            await listCustomWidget();
        };
        const handleCreateCustomWidget = async (createdCustomWidget: WidgetInfo) => {
            await listCustomWidget();
            store.commit('service/costDashboard/setOriginSelectedWidget', createdCustomWidget);
            store.commit('service/costDashboard/setEditedSelectedWidget', createdCustomWidget);
            state.selectedQuery = {};
            state.selectedItem = createdCustomWidget;
            state.thisPage = 1;
        };
        const getChartTypeImageFileName = (chartType: CHART_TYPE) => chartTypeItemMap[chartType].imageFileName;

        (() => {
            listCustomWidget();
        })();

        watch(() => state.selectedQuery, (selectedQuery) => {
            if (Object.keys(selectedQuery).length) {
                state.selectedItem = selectedQuery;
                store.commit('service/costDashboard/setOriginSelectedWidget', {});
                store.commit('service/costDashboard/setEditedSelectedWidget', {});
            }
        }, { immediate: false });

        return {
            ...toRefs(state),
            BILLING_ROUTE,
            listCustomWidget,
            handleSelectWidget,
            handleClickRemoveWidget,
            handleCreateCustomWidget,
            getChartTypeImageFileName,
        };
    },
};
</script>

<style lang="postcss" scoped>
.cost-dashboard-customize-custom-widget-tab {
    .left-area {
        .widgets-area {
            @apply mb-4 border-b border-gray-200;
        }
        .cost-query-area {
            @apply mr-8;
        }
    }
    .right-area {
        .btn-remove {
            @apply block mt-6 ml-auto mr-auto;
        }
    }

    .card-image {
        height: 3rem;
    }
}
</style>
