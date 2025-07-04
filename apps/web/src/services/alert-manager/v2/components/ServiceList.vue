<script setup lang="ts">
import {
    onMounted, reactive, watch, computed,
} from 'vue';
import {
    useRoute, useRouter,
} from 'vue-router/composables';

import { debounce } from 'lodash';

import { makeDistinctValueHandler } from '@cloudforet/core-lib/component-util/query-search';
import { QueryHelper } from '@cloudforet/core-lib/query';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PToolbox, PDataLoader, PEmpty, PButton, PPagination,
} from '@cloudforet/mirinae';
import type { ToolboxOptions } from '@cloudforet/mirinae/types/controls/toolbox/type';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { ServiceListParameters } from '@/schema/alert-manager/service/api-verbs/list';
import { SERVICE_HEALTHY_TYPE } from '@/schema/alert-manager/service/constants';
import type { ServiceModel } from '@/schema/alert-manager/service/model';

import { replaceUrlQuery } from '@/lib/router-query-string';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { usePageEditableStatus } from '@/common/composables/page-editable-status';

import ServiceListContent from '@/services/alert-manager/v2/components/ServiceListContent.vue';
import { ALERT_MANAGER_ROUTE } from '@/services/alert-manager/v2/routes/route-constant';
import { useServiceListPageStore } from '@/services/alert-manager/v2/stores/service-list-page-store';

const { hasReadWriteAccess } = usePageEditableStatus();

const router = useRouter();
const route = useRoute();

const SERVICE_SEARCH_HANDLER = {
    keyItemSets: [{
        title: 'Properties',
        items: [
            { name: 'name', label: 'Name' },
        ],
    }],
    valueHandlerMap: {
        name: makeDistinctValueHandler('alert_manager.Service', 'name'),
    },
};

const state = reactive({
    loading: true,
    healthyLoading: true,
    totalCount: 0,
    healthyTotalCount: 0,
    alertServiceList: [] as ServiceModel[],
    healthyServiceList: [] as ServiceModel[],
});

const serviceListPageStore = useServiceListPageStore();

const serviceListApiQueryHelper = new ApiQueryHelper().setSort('created_at', true);
const healthyServiceListApiQueryHelper = new ApiQueryHelper().setSort('created_at', true);
const searchQueryHelper = new QueryHelper();

const queryTags = computed(() => searchQueryHelper.setFilters(serviceListPageStore.searchFilters).queryTags);

const handleToolbox = async (options: ToolboxOptions = {}) => {
    if (options.queryTags !== undefined) {
        searchQueryHelper.setFiltersAsQueryTag(options.queryTags);

        serviceListPageStore.$patch((_state) => {
            _state.searchFilters = searchQueryHelper.filters;
        });

        const nameTags = options.queryTags.filter((tag) => tag.key?.name === 'name');
        const nameValues = nameTags.map((tag) => tag.value.name).filter(Boolean);

        const newQuery: Record<string, any> = {
            unhealthyPage: '1',
            healthyPage: '1',
        };

        if (nameValues.length > 0) {
            newQuery.serviceName = nameValues.join(',');
        } else {
            newQuery.serviceName = undefined;
        }

        serviceListPageStore.setUnhealthyPage(1);
        serviceListPageStore.setHealthyPage(1);

        replaceUrlQuery(newQuery);
    }

    await fetchBothLists();
};

const fetchBothLists = async () => {
    await Promise.all([
        fetchServiceList(),
        fetchHealthyServiceList(),
    ]);
};

const handleUnhealthyPageChange = async () => {
    await fetchServiceList();
};

const handleHealthyPageChange = async () => {
    await fetchHealthyServiceList();
};

const fetchServiceList = async () => {
    state.loading = true;
    try {
        const isFullNameOnly = searchQueryHelper.filters.length === 1
            && searchQueryHelper.filters[0].k === 'name'
            && Array.isArray(searchQueryHelper.filters[0].v)
            && searchQueryHelper.filters[0].v.length === 1
            && typeof searchQueryHelper.filters[0].v[0] === 'string'
            && searchQueryHelper.filters[0].v[0].length > 2;

        const pageSize = serviceListPageStore.unhealthyPageSize;
        const pageStart = isFullNameOnly ? 1 : ((Math.max(1, serviceListPageStore.unhealthyThisPage) - 1) * pageSize + 1);

        serviceListApiQueryHelper.setPage(pageStart, pageSize).setFilters([
            ...searchQueryHelper.filters,
            { k: 'service_healthy', v: SERVICE_HEALTHY_TYPE.UNHEALTHY, o: '=' },
        ]);
        const { results, total_count } = await SpaceConnector.clientV2.alertManager.service.list<ServiceListParameters, ListResponse<ServiceModel>>({
            query: serviceListApiQueryHelper.data,
            details: true,
        });
        state.alertServiceList = results || [];
        state.totalCount = total_count || 0;
    } catch (e) {
        ErrorHandler.handleError(e);
        state.alertServiceList = [];
        state.totalCount = 0;
    } finally {
        state.loading = false;
    }
};

const fetchHealthyServiceList = async () => {
    state.healthyLoading = true;
    try {
        const isFullNameOnly = searchQueryHelper.filters.length === 1
            && searchQueryHelper.filters[0].k === 'name'
            && Array.isArray(searchQueryHelper.filters[0].v)
            && searchQueryHelper.filters[0].v.length === 1
            && typeof searchQueryHelper.filters[0].v[0] === 'string'
            && searchQueryHelper.filters[0].v[0].length > 2;

        const pageSize = serviceListPageStore.healthyPageSize;
        const pageStart = isFullNameOnly ? 1 : ((Math.max(1, serviceListPageStore.healthyThisPage) - 1) * pageSize + 1);

        healthyServiceListApiQueryHelper.setPage(pageStart, pageSize).setFilters([
            ...searchQueryHelper.filters,
            { k: 'service_healthy', v: SERVICE_HEALTHY_TYPE.HEALTHY, o: '=' },
        ]);
        const { results, total_count } = await SpaceConnector.clientV2.alertManager.service.list<ServiceListParameters, ListResponse<ServiceModel>>({
            query: healthyServiceListApiQueryHelper.data,
            details: true,
        });
        state.healthyServiceList = results || [];
        state.healthyTotalCount = total_count || 0;
    } catch (e) {
        ErrorHandler.handleError(e);
        state.healthyServiceList = [];
        state.healthyTotalCount = 0;
    } finally {
        state.healthyLoading = false;
    }
};

const handleClickCreateButton = () => {
    router.push({
        name: ALERT_MANAGER_ROUTE.SERVICE.CREATE._NAME,
    }).catch(() => {});
};

const handleNavigateToDetail = (serviceId: string) => {
    const validUnhealthyPage = (!Number.isNaN(serviceListPageStore.unhealthyThisPage) && serviceListPageStore.unhealthyThisPage > 0)
        ? serviceListPageStore.unhealthyThisPage
        : 1;
    const validHealthyPage = (!Number.isNaN(serviceListPageStore.healthyThisPage) && serviceListPageStore.healthyThisPage > 0)
        ? serviceListPageStore.healthyThisPage
        : 1;

    router.push({
        name: ALERT_MANAGER_ROUTE.SERVICE.DETAIL._NAME,
        params: { serviceId },
        query: {
            unhealthyPage: validUnhealthyPage.toString(),
            healthyPage: validHealthyPage.toString(),
        },
    }).catch(() => {});
};

// ✅ event listener to change healthy page size (6 -> 8) when window width is 1920px or more
const handleResize = debounce(async () => {
    const width = window.innerWidth;
    const newPageSize = width >= 1920 ? 8 : 6;

    if (newPageSize !== serviceListPageStore.healthyPageSize) {
        const oldPageSize = serviceListPageStore.healthyPageSize;
        const oldPage = serviceListPageStore.healthyThisPage;
        const startIndex = (oldPage - 1) * oldPageSize;
        const newPage = Math.floor(startIndex / newPageSize) + 1;

        serviceListPageStore.setHealthyPageSize(newPageSize);
        serviceListPageStore.setHealthyPage(newPage);
        fetchHealthyServiceList();
    }
}, 300);

onMounted(async () => {
    await handleResize();
    const { serviceName, unhealthyPage, healthyPage } = route.query;

    if (serviceName && typeof serviceName === 'string') {
        const nameValues = serviceName.split(',').map((name) => ({
            key: { name: 'name' },
            value: { label: name, name },
        }));
        searchQueryHelper.setFiltersAsQueryTag(nameValues);

        const splitNameFilters = searchQueryHelper.filters.map((f) => {
            if (f.k === 'name' && Array.isArray(f.v)) {
                const fullNames = f.v.filter((val) => typeof val === 'string' && val.length > 2);
                const partials = f.v.filter((val) => typeof val === 'string' && val.length <= 2);
                return [
                    ...(fullNames.length > 0 ? [{ k: 'name', v: fullNames, o: '=' }] : []),
                    ...(partials.map((val) => ({ k: 'name', v: [val], o: '' }))),
                ];
            }
            return f;
        }).flat();
        searchQueryHelper.setFilters(splitNameFilters);

        serviceListPageStore.setSearchFilters(searchQueryHelper.filters);
    } else {
        const parsedUnhealthy = (!Number.isNaN(parseInt(unhealthyPage as string)) && parseInt(unhealthyPage as string) > 0)
            ? parseInt(unhealthyPage as string) : 1;
        const parsedHealthy = (!Number.isNaN(parseInt(healthyPage as string)) && parseInt(healthyPage as string) > 0)
            ? parseInt(healthyPage as string) : 1;

        serviceListPageStore.setUnhealthyPage(parsedUnhealthy);
        serviceListPageStore.setHealthyPage(parsedHealthy);
    }

    await fetchBothLists();
});

watch(() => serviceListPageStore.unhealthyThisPage, (val) => {
    if (!queryTags.value.some((tag) => tag.key?.name === 'name')) {
        replaceUrlQuery({
            unhealthyPage: String(val),
            healthyPage: String(serviceListPageStore.healthyThisPage),
        });
    }
    handleUnhealthyPageChange();
});

watch(() => serviceListPageStore.healthyThisPage, (val) => {
    if (!queryTags.value.some((tag) => tag.key?.name === 'name')) {
        replaceUrlQuery({
            unhealthyPage: String(serviceListPageStore.unhealthyThisPage),
            healthyPage: String(val),
        });
    }
    handleHealthyPageChange();
});

watch(async () => route.query.serviceName, async (newServiceName: any) => {
    if (typeof newServiceName === 'string') {
        const nameValues = newServiceName.split(',').map((name) => ({
            key: { name: 'name' },
            value: { label: name, name },
        }));
        searchQueryHelper.setFiltersAsQueryTag(nameValues);

        const splitNameFilters = searchQueryHelper.filters.map((f) => {
            if (f.k === 'name' && Array.isArray(f.v)) {
                const fullNames = f.v.filter((val) => typeof val === 'string' && val.length > 2);
                const partials = f.v.filter((val) => typeof val === 'string' && val.length <= 2);
                return [
                    ...(fullNames.length > 0 ? [{ k: 'name', v: fullNames, o: '=' }] : []),
                    ...(partials.map((val) => ({ k: 'name', v: [val], o: '' }))),
                ];
            }
            return f;
        }).flat();
        searchQueryHelper.setFilters(splitNameFilters);

        serviceListPageStore.setSearchFilters(searchQueryHelper.filters);
        await fetchBothLists();
    } else if (!newServiceName) {
        searchQueryHelper.setFiltersAsQueryTag([]);
        serviceListPageStore.$patch((_state) => {
            _state.searchFilters = [];
        });
    }
});
</script>

<template>
    <div class="service-list flex flex-col gap-6">
        <p-toolbox search-type="query"
                   searchable
                   filters-visible
                   :page-size-changeable="false"
                   :pagination-visible="false"
                   :query-tags="queryTags"
                   :key-item-sets="SERVICE_SEARCH_HANDLER.keyItemSets"
                   :value-handler-map="SERVICE_SEARCH_HANDLER.valueHandlerMap"
                   @change="handleToolbox"
                   @refresh="fetchBothLists"
        />

        <section>
            <p-data-loader
                :loading="state.loading"
                :data="state.alertServiceList"
                loader-backdrop-color="transparent"
                disable-empty-case
                class="loader-wrapper"
            >
                <div>
                    <service-list-content v-if="state.alertServiceList.length > 0"
                                          :list="state.alertServiceList"
                                          type="alert"
                                          @navigate-to-detail="handleNavigateToDetail"
                    />
                    <div class="flex justify-center mt-4">
                        <p-pagination
                            v-if="state.totalCount > 0"
                            :total-count="state.totalCount"
                            :this-page.sync="serviceListPageStore.unhealthyThisPage"
                            :page-size.sync="serviceListPageStore.unhealthyPageSize"
                            @change="handleUnhealthyPageChange"
                        />
                    </div>
                </div>
            </p-data-loader>

            <p-data-loader
                :loading="state.healthyLoading"
                :data="state.healthyServiceList"
                loader-backdrop-color="transparent"
                disable-empty-case
                class="loader-wrapper"
            >
                <div>
                    <service-list-content v-if="state.healthyServiceList.length > 0"
                                          :list="state.healthyServiceList"
                                          type="healthy"
                                          @navigate-to-detail="handleNavigateToDetail"
                    />
                    <div class="flex justify-center mt-4">
                        <p-pagination v-if="state.healthyTotalCount > 0"
                                      :total-count="state.healthyTotalCount"
                                      :this-page.sync="serviceListPageStore.healthyThisPage"
                                      :page-size.sync="serviceListPageStore.healthyPageSize"
                                      @change="handleHealthyPageChange"
                        />
                    </div>
                </div>
            </p-data-loader>

            <div v-if="!state.loading && !state.healthyLoading && state.alertServiceList.length === 0 && state.healthyServiceList.length === 0"
                 class="mt-4"
            >
                <p-empty show-image
                         :show-button="hasReadWriteAccess"
                >
                    <template #image>
                        <img src="../../../../assets/images/img_jellyocto-with-a-telescope.png"
                             alt="empty-image"
                        >
                    </template>
                    <template v-if="hasReadWriteAccess"
                              #button
                    >
                        <p-button icon-left="ic_plus_bold"
                                  @click="handleClickCreateButton"
                        >
                            {{ $t('ALERT_MANAGER.SERVICE.NO_DATA') }}
                        </p-button>
                    </template>
                    {{ $t('ALERT_MANAGER.SERVICE.NO_DATA_DESC') }}
                </p-empty>
            </div>
        </section>
    </div>
</template>
