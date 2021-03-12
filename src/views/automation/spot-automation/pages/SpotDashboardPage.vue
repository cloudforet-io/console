<template>
    <section class="dashboard-page-wrapper">
        <nav class="page-info">
            <p-breadcrumbs :routes="routeState.route" />
            <p-page-title :title="'대시보드'" />
        </nav>
        <section class="dashboard-wrapper">
            <div class="spot-group-info widget-layout">
                <div class="summary-wrapper">
                    <div class="summary-row">
                        <span class="title">사용중인 스팟그룹</span>
                        <span class="count">13</span>
                    </div>
                    <div class="summary-row">
                        <span class="title">전체 인스턴스</span>
                        <span class="sub-title">(온디맨드+스팟)</span>
                        <span class="count">159</span>
                    </div>
                    <div class="summary-row">
                        <span class="title">스팟 인스턴스</span>
                        <span class="count">128</span>
                    </div>
                </div>
                <div class="chart-section">
                    <spot-group-composition-chart />
                </div>
            </div>
            <instance-billing-chart class="widget-layout" />
            <div class="cost-info widget-layout">
                <div class="cost-wrapper">
                    <p class="title">
                        <span>지난 달</span>
                        <strong> 절감 비용</strong>
                        <span class="percentage">
                            <p-i name="ic_table_sort_fromA" />
                            52%
                        </span>
                    </p>
                    <p class="cost">
                        ${{ commaFormatter(numberFormatter(lastMonthSavingCost)) }}
                    </p>
                </div>
                <div class="cost-wrapper">
                    <p class="title">
                        <strong>누적 절감 비용</strong>
                    </p>
                    <p class="cost">
                        ${{ commaFormatter(numberFormatter(cumulativeSavingCost)) }}
                    </p>
                </div>
            </div>
        </section>
        <p-divider class="dashboard-divider" />
        <section class="project-wrapper">
            <p-toolbox filters-visible
                       search-type="query"
                       :page-size.sync="pageSize"
                       :total-count="totalCount"
                       :query-tags="tags"
                       :key-item-sets="keyItemSets"
                       :value-handler-map="valueHandlerMap"
                       @change="onChange"
                       @refresh="onChange"
            />
            <p-data-loader class="flex-grow" :data="items" :loading="loading">
                <div class="project-card-list">
                    <div v-for="(item, i) in items" :key="i" />
                </div>
                <template #no-data>
                    test
                </template>
            </p-data-loader>
        </section>
    </section>
</template>

<script lang="ts">
import {
    PDivider, PBreadcrumbs, PPageTitle, PToolbox, PDataLoader, PI,
} from '@spaceone/design-system';
import InstanceBillingChart from '@/views/automation/spot-automation/components/InstanceBillingChart.vue';
import SpotGroupCompositionChart from '@/views/automation/spot-automation/components/SpotGroupCompositionChart.vue';

import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';

import { makeQuerySearchPropsWithSearchSchema } from '@/lib/component-utils/dynamic-layout';
import { QueryHelper } from '@/lib/query';
import { replaceUrlQuery } from '@/lib/router-query-string';
import { getThisPage } from '@/lib/component-utils/pagination';

// TODO: change handlers with spot automation spec
const handlers = makeQuerySearchPropsWithSearchSchema(
    [{
        title: 'Filters',
        items: [
            { key: 'cloud_service_type', name: 'Cloud Service Type' },
            { key: 'cloud_service_group', name: 'Cloud Service Group' },
            { key: 'project_id', name: 'Project', reference: 'identity.Project' },
            { key: 'collection_info.service_accounts', name: 'Service Account', reference: 'identity.ServiceAccount' },
            { key: 'collection_info.secrets', name: 'Secret', reference: 'secret.Secret' },
        ],
    }],
    'inventory.CloudService',
);

export default {
    name: 'SpotDashboardPage',
    components: {
        SpotGroupCompositionChart,
        InstanceBillingChart,
        PI,
        PDivider,
        PBreadcrumbs,
        PPageTitle,
        PToolbox,
        PDataLoader,
    },
    setup() {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const queryHelper = new QueryHelper().setFiltersAsRawQueryString(vm.$route.query.filters);

        const state = reactive({
            items: undefined,
            loading: true,
            keyItemSets: handlers.keyItemSets,
            valueHandlerMap: handlers.valueHandlerMap,
            tags: queryHelper.setKeyItemSets(handlers.keyItemSets).queryTags,
            thisPage: 1,
            pageSize: 24,
            totalCount: 0,
            lastMonthSavingCost: 1207.36234234,
            cumulativeSavingCost: 5690.23343,
        });

        const routeState = reactive({
            route: computed(() => [
                { name: vm.$t('MENU.AUTOMATION.AUTOMATION'), path: '/automation' },
                { name: vm.$t('MENU.AUTOMATION.SPOT_AUTOMATION') },
            ]),
        });

        /* util */
        const numberFormatter = (num) => {
            if (Math.abs(num) < 10000) {
                return Math.round(num * 100) / 100;
            }
            const options = { notation: 'compact', signDisplay: 'auto', maximumFractionDigits: 1 };
            return Intl.NumberFormat('en', options).format(num);
        };
        const commaFormatter = (num) => {
            if (num) return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            return num;
        };

        /* api */
        const listSpotGroup = () => {
            // TODO: add list spot group api
        };

        /* event */
        const changeQueryString = async (options) => {
            queryHelper.setFiltersAsQueryTag(options.queryTags);
            await replaceUrlQuery('filters', queryHelper.rawQueryStrings);
        };
        const onChange = async (options: any) => {
            if (options.queryTags !== undefined) {
                state.tags = options.queryTags;
                await changeQueryString(options);
            }
            if (options.limit !== undefined) {
                state.pageSize = options.limit;
            }
            if (options.start !== undefined) {
                state.thisPage = getThisPage(options.start, state.pageSize);
            }
            await listSpotGroup();
        };

        return {
            ...toRefs(state),
            routeState,
            onChange,
            numberFormatter,
            commaFormatter,
        };
    },
};
</script>

<style lang="postcss" scoped>
.dashboard-page-wrapper {
    @apply bg-secondary2;
    padding-top: 2rem;
}
.page-info {
    padding-left: 1.5rem;
}
.dashboard-wrapper {
    @apply grid grid-cols-12 gap-4;
    padding-left: 1.5rem;
    padding-right: 1.5rem;

    @screen lg {
        grid-template-rows: auto;
        grid-template-columns: minmax(14.25rem, 3fr) minmax(auto, 6fr) minmax(14.25rem, 3fr);
        grid-template-areas: "spot-group chart cost";
    }

    .widget-layout {
        @apply bg-white border border-gray-200;
        padding: 1rem;
    }

    .spot-group-info {
        @apply col-span-12 row-start-1;

        @screen md {
            @apply col-span-6 row-start-1;
        }

        @screen lg {
            grid-area: spot-group;
        }

        .summary-wrapper {
            margin-bottom: 1rem;
            .summary-row {
                font-size: 0.875rem;
                line-height: 1.5;
                margin-bottom: 0.5rem;
                &:last-child {
                    margin-bottom: 0;
                }
                .title {
                    @apply text-gray-600;
                    font-size: 0.875rem;
                    margin: 0;
                }
                .sub-title {
                    @apply text-gray-400;
                    font-size: 0.75rem;
                    margin-left: 0.125rem;
                }
                .count {
                    font-weight: bold;
                    margin-left: 0.5rem;
                }
            }
        }
    }

    .instance-billing-chart {
        @apply col-span-12 row-start-3;

        @screen md {
            @apply col-span-12 row-start-2;
        }

        @screen lg {
            @apply row-start-1;
            grid-area: chart;
        }
    }

    .cost-info {
        @apply col-span-12 row-start-2;

        @screen md {
            @apply col-span-6 row-start-1;
        }

        @screen lg {
            @apply row-start-1;
            grid-area: cost;
        }

        .cost-wrapper {
            margin-bottom: 1.25rem;
            .title {
                @apply text-gray-500;
                font-size: 0.875rem;
                line-height: 1.5;
                margin: 0;
                strong {
                    @apply text-gray-dark;
                }
                .percentage {
                    margin-left: 0.375rem;
                    .p-i-icon {
                        margin-right: -0.25rem;
                    }
                }
            }
            .cost {
                @apply text-indigo-500;
                font-size: 1.375rem;
                line-height: 1.45;
            }
        }
    }
}

.dashboard-divider {
    @apply w-full;
    margin-top: 2rem;
}

.project-wrapper {
    @apply bg-white;
    padding: 2rem 1.5rem;
}
</style>
