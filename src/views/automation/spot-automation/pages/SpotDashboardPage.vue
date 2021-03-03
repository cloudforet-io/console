<template>
    <section class="dashboard-page-wrapper">
        <nav class="page-info">
            <p-breadcrumbs :routes="routeState.route" />
            <p-page-title :title="'대시보드'" />
        </nav>
        <section class="dashboard-wrapper">
            <spot-group-billing />
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
    PDivider, PBreadcrumbs, PPageTitle, PToolbox, PDataLoader,
} from '@spaceone/design-system';
import SpotGroupBilling
    from '@/views/automation/spot-automation/modules/spot-group-detail-dashboard/SpotGroupBilling.vue';
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
        SpotGroupBilling,
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
        });

        const routeState = reactive({
            route: computed(() => [
                { name: vm.$t('MENU.AUTOMATION.AUTOMATION'), path: '/automation' },
                { name: vm.$t('MENU.AUTOMATION.SPOT_AUTOMATION') },
            ]),
        });

        const listSpotGroup = () => {
            // TODO: add list spot group api
        };

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
        };
    },
};
</script>

<style lang="postcss" scoped>
.dashboard-page-wrapper {
    @apply bg-blue-100;
    padding-top: 2rem;
}
.page-info {
    padding-left: 1.5rem;
}
.dashboard-wrapper {
    @apply bg-blue-100;
    padding-left: 1.5rem;
    padding-right: 1.5rem;
}
.spot-group-info {
    @apply col-span-12 row-start-1;
    min-height: 16rem;
    margin-bottom: 1rem;

    @screen md {
        @apply col-span-6 row-start-1;
        margin-right: 1rem;
    }

    @screen lg {
        @apply col-span-3 row-start-1;
        margin-bottom: 0;
    }
}

.cost-chart {
    @apply col-span-12 row-start-3;
    min-height: 16rem;

    @screen md {
        @apply col-span-12 row-start-2;
    }

    @screen lg {
        @apply col-span-6 row-start-1;
        margin-right: 1rem;
    }
}
.cost-info {
    @apply col-span-12 row-start-2;
    min-height: 16rem;
    margin-bottom: 1rem;

    @screen md {
        @apply col-span-6 row-start-1;
    }

    @screen lg {
        @apply col-span-3 row-start-1;
        margin-bottom: 0;
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
