<template>
    <div class="cost-dashboard-customize-custom-widget-tab">
        <!--left side-->
        <div class="custom-widget-wrapper">
            <p class="title">
                {{ $t('BILLING.COST_MANAGEMENT.DASHBOARD.ADD_WIDGET.ALL') }} ({{ widgetList.length }})
            </p>
            <div class="custom-widget-list">
                <div v-for="(widget, idx) in widgetList" :key="`widget-${idx}-${widget.name}`" class="widget-card"
                     @click="handleSelectWidget(widget)"
                >
                    <div class="card-header">
                        <p-radio :selected="selectedWidget.name" :value="widget.name" @click="handleSelectWidget(widget)">
                            <span @click="handleSelectWidget(widget)">{{ widget.name }}</span>
                        </p-radio>
                    </div>
                    <div class="card-content">
                        {{ widget.options.chart_type }}
                    </div>
                </div>
            </div>
            <p-text-pagination
                :this-page.sync="thisPage"
                :all-page="allPage"
                @pageChange="listCustomWidget"
            />
        </div>
        <cost-dashboard-customize-cost-query :selected-query.sync="selectedQuery"
                                             :widget-list="widgetList"
                                             @create-custom-widget="handleCreateCustomWidget"
        />

        <!--right side-->
        <cost-dashboard-customize-widget-config v-if="Object.keys(selectedWidget).length"
                                                :selected-widget="selectedWidget"
                                                :is-custom="true"
        />
        <custom-widget-preview v-if="showPreview"
                               :selected-item="selectedItem"
        />
        <p-button v-if="Object.keys(selectedWidget).length" style-type="alert" outline
                  @click="handleClickRemoveWidget"
        >
            {{ $t('BILLING.COST_MANAGEMENT.DASHBOARD.ADD_WIDGET.REMOVE_WIDGET') }}
        </p-button>
    </div>
</template>

<script lang="ts">
import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';

import { PRadio, PTextPagination, PButton } from '@spaceone/design-system';

import CostDashboardCustomizeCostQuery
    from '@/services/billing/cost-management/cost-dashboard/cost-dashboard-customize/modules/CostDashboardCustomizeCostQuery.vue';
import CostDashboardCustomizeWidgetConfig
    from '@/services/billing/cost-management/cost-dashboard/cost-dashboard-customize/modules/CostDashboardCustomizeWidgetConfig.vue';
import CustomWidgetPreview
    from '@/services/billing/cost-management/cost-dashboard/cost-dashboard-customize/modules/CustomWidgetPreview.vue';

import { store } from '@/store';
import { WidgetInfo } from '@/services/billing/cost-management/cost-dashboard/type';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { BILLING_ROUTE } from '@/services/billing/routes';
import { CostQuerySetModel } from '@/services/billing/cost-management/type';
import { ApiQueryHelper } from '@spaceone/console-core-lib/space-connector/helper';
import { getPageStart } from '@spaceone/console-core-lib/component-util/pagination';
import { cloneDeep } from 'lodash';


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
            const convertedWidgetInfo = cloneDeep(value);
            convertedWidgetInfo.widget_id = 'custom_widget';
            store.commit('service/costDashboard/setOriginSelectedWidget', convertedWidgetInfo);
            store.commit('service/costDashboard/setEditedSelectedWidget', convertedWidgetInfo);
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

            const convertedWidgetInfo = cloneDeep(createdCustomWidget);
            convertedWidgetInfo.widget_id = 'custom_widget';
            store.commit('service/costDashboard/setOriginSelectedWidget', convertedWidgetInfo);
            store.commit('service/costDashboard/setEditedSelectedWidget', convertedWidgetInfo);
            state.selectedQuery = {};
            state.selectedItem = convertedWidgetInfo;
            state.thisPage = 1;
        };

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
        };
    },
};
</script>

<style lang="postcss" scoped>
.cost-dashboard-customize-custom-widget-tab {
    .custom-widget-wrapper {
        .title {
            font-size: 0.875rem;
            font-weight: bold;
        }
        .custom-widget-list {
            @apply grid grid-cols-12;
            gap: 0.5rem;
            .widget-card {
                @apply border border-gray-300 rounded-md col-span-4;
                height: 7.1875rem;
                .card-header {
                    height: 3.125rem;
                }
                .card-content {
                    @apply bg-gray-100;
                    height: 4rem;
                }
            }
        }
    }
}
</style>
