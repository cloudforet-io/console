<template>
    <div class="cost-dashboard-customize-cost-query">
        <div class="title-wrapper">
            <span class="title">{{ $t('BILLING.COST_MANAGEMENT.DASHBOARD.ADD_WIDGET.COST_ANALYSIS_QUERY') }}</span>
            <template v-if="!loading && costQuerySetList.length">
                <p-icon-button name="ic_refresh" @click="handleRefresh" />
                <p-anchor :to="{ name: BILLING_ROUTE.COST_MANAGEMENT.COST_ANALYSIS._NAME }"
                          :show-icon="false"
                >
                    <p-icon-text-button style-type="primary1" name="ic_plus_bold">
                        <span>{{ $t('BILLING.COST_MANAGEMENT.DASHBOARD.ADD_WIDGET.CREATE_QUERY') }}</span>
                    </p-icon-text-button>
                </p-anchor>
            </template>
        </div>
        <div class="content-wrapper">
            <p-data-loader :loading="loading" :data="costQuerySetList">
                <div class="query-list-wrapper">
                    <div v-for="(query, idx) in costQuerySetList" :key="`query-${idx}-${query.cost_query_set_id}`"
                         class="query-item"
                         :class="{ selected: query.cost_query_set_id === selectedQuery.cost_query_set_id }"
                         @click="handleClickQueryItem(query)"
                    >
                        <p>{{ query.name }}</p>
                        <p-icon-text-button style-type="gray-border" name="ic_plus_bold" @click="handleAddToCustomWidget(query)">
                            <span>{{ $t('BILLING.COST_MANAGEMENT.DASHBOARD.ADD_WIDGET.ADD_TO_CUSTOM_WIDGET') }}</span>
                        </p-icon-text-button>
                    </div>
                </div>
                <template #no-data>
                    <div>
                        <span>{{ $t('BILLING.COST_MANAGEMENT.DASHBOARD.ADD_WIDGET.NO_SAVED_QUERY') }}</span>
                        <p-icon-button name="ic_refresh" @click="handleRefresh" />
                    </div>
                    <div>
                        {{ $t('BILLING.COST_MANAGEMENT.DASHBOARD.ADD_WIDGET.NO_SAVED_QUERY_HELP_TEXT') }}
                    </div>
                    <p-anchor :to="{ name: BILLING_ROUTE.COST_MANAGEMENT.COST_ANALYSIS._NAME }"
                              :show-icon="false"
                    >
                        <p-icon-text-button style-type="primary1" name="ic_plus_bold">
                            <span>{{ $t('BILLING.COST_MANAGEMENT.DASHBOARD.ADD_WIDGET.CREATE_QUERY') }}</span>
                        </p-icon-text-button>
                    </p-anchor>
                </template>
            </p-data-loader>
        </div>
    </div>
</template>

<script lang="ts">
import { reactive, toRefs } from '@vue/composition-api';

import {
    PAnchor, PDataLoader, PIconButton, PIconTextButton,
} from '@spaceone/design-system';

import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { BILLING_ROUTE } from '@/services/billing/routes';
import { CostQuerySetModel } from '@/services/billing/cost-management/type';
import { store } from '@/store';
import { WidgetInfo } from '@/services/billing/cost-management/cost-dashboard/type';
import { GRANULARITY } from '@/services/billing/cost-management/lib/config';
import { CHART_TYPE } from '@/services/billing/cost-management/cost-analysis/type';
import { getUUID } from '@/lib/component-util/getUUID';


const LAYOUT = 100;

export default {
    name: 'CostDashboardCustomizeCostQuery',
    components: {
        PIconButton,
        PIconTextButton,
        PAnchor,
        PDataLoader,
    },
    props: {
        selectedQuery: {
            type: Object as () => CostQuerySetModel,
            default: () => ({}),
        },
        widgetList: {
            type: Array,
            default: () => ([]) as WidgetInfo[],
        },
    },
    setup(props, { emit }) {
        const state = reactive({
            loading: true,
            costQuerySetList: [] as CostQuerySetModel[],
        });

        /* Api */
        const listQuerySet = async () => {
            try {
                state.loading = true;
                const { results } = await SpaceConnector.client.costAnalysis.costQuerySet.list({
                    query: {
                        filter: [{ k: 'user_id', v: store.state.user.userId, o: 'eq' }],
                    },
                });
                state.costQuerySetList = results;
            } catch (e) {
                ErrorHandler.handleError(e);
                state.costQuerySetList = [];
            } finally {
                state.loading = false;
            }
        };
        const createCustomWidget = async (query: CostQuerySetModel): Promise<WidgetInfo|undefined> => {
            try {
                return await SpaceConnector.client.costAnalysis.customWidget.create({
                    name: `${query.name}-${getUUID().slice(0, 23)}`,
                    options: {
                        ...query.options,
                        chart_type: query.options?.granularity === GRANULARITY.ACCUMULATED ? CHART_TYPE.DONUT : CHART_TYPE.STACKED_COLUMN,
                        layout: LAYOUT,
                    },
                });
            } catch (e) {
                ErrorHandler.handleError(e);
                return undefined;
            }
        };

        /* Event */
        const handleAddToCustomWidget = async (query: CostQuerySetModel) => {
            const createdCustomWidget = await createCustomWidget(query);
            emit('create-custom-widget', createdCustomWidget);
        };
        const handleRefresh = () => {
            listQuerySet();
        };
        const handleClickQueryItem = (query: CostQuerySetModel) => {
            emit('update:selected-query', query);
        };

        /* Init */
        (() => {
            listQuerySet();
        })();

        return {
            ...toRefs(state),
            BILLING_ROUTE,
            handleRefresh,
            handleClickQueryItem,
            handleAddToCustomWidget,
        };
    },
};
</script>

<style lang="postcss" scoped>
.cost-dashboard-customize-cost-query {
    @apply bg-gray-100 rounded-sm;
    height: 12.5rem;
    overflow-y: auto;
    padding: 1rem;

    .title-wrapper {
        .title {
            font-weight: bold;
            font-size: 0.875rem;
        }
    }

    .content-wrapper::v-deep {
        .p-data-loader {
            .no-data-wrapper {
                display: block;
            }
        }
        .query-list-wrapper {
            @apply grid grid-cols-12;
            .query-item {
                @apply col-span-4 bg-white;
                height: 7rem;
                padding: 0.5rem 1rem;
                margin: 0.5rem;

                &.selected {
                    @apply border border-secondary;
                }
            }
        }
    }
}
</style>
