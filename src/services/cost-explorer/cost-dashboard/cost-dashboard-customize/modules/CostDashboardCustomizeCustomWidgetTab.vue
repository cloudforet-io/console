<template>
    <div class="cost-dashboard-customize-custom-widget-tab">
        <div class="left-area">
            <p-data-loader class="widgets-area" :data="widgetList" :loading="loading">
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
                <template #no-data>
                    <div class="help-text-wrapper">
                        <p class="title">
                            {{ $t('BILLING.COST_MANAGEMENT.DASHBOARD.CUSTOMIZE.ADD_WIDGET_MODAL.NO_CUSTOM_WIDGET') }}
                        </p>
                        <p class="text">
                            {{ $t('BILLING.COST_MANAGEMENT.DASHBOARD.CUSTOMIZE.ADD_WIDGET_MODAL.NO_CUSTOM_WIDGET_HELP_TEXT') }}
                        </p>
                    </div>
                </template>
            </p-data-loader>
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
    PRadio, PTextPagination, PButton, PLabel, PDataLoader,
} from '@spaceone/design-system';

import CostDashboardCustomizeCostQuery
    from '@/services/cost-explorer/cost-dashboard/cost-dashboard-customize/modules/CostDashboardCustomizeCostQuery.vue';
import CostDashboardCustomizeWidgetConfig
    from '@/services/cost-explorer/cost-dashboard/cost-dashboard-customize/modules/CostDashboardCustomizeWidgetConfig.vue';
import CustomWidgetPreview
    from '@/services/cost-explorer/cost-dashboard/cost-dashboard-customize/modules/CustomWidgetPreview.vue';

import { store } from '@/store';
import { CHART_TYPE, WidgetInfo } from '@/services/cost-explorer/cost-dashboard/type';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/route-config';
import { CostQuerySetModel } from '@/services/cost-explorer/type';
import { ApiQueryHelper } from '@spaceone/console-core-lib/space-connector/helper';
import { getPageStart } from '@spaceone/console-core-lib/component-util/pagination';
import { chartTypeItemMap } from '@/services/cost-explorer/cost-dashboard/lib/config';


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
        PDataLoader,
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
            userId: computed(() => store.state.user.userId),
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
            COST_EXPLORER_ROUTE,
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
        overflow: hidden;
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
        }
        .cost-query-area {
            @apply mr-8;
            height: auto;
            overflow-y: auto;
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
