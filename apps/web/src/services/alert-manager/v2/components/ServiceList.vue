<script setup lang="ts">
import { onMounted, reactive, watch } from 'vue';
import {
    useRoute, useRouter,
} from 'vue-router/composables';

import { makeDistinctValueHandler } from '@cloudforet/core-lib/component-util/query-search';
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
import { useQueryTags } from '@/common/composables/query-tags';

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
const queryTagHelper = useQueryTags({ keyItemSets: SERVICE_SEARCH_HANDLER.keyItemSets });
const { queryTags } = queryTagHelper;

const handleToolbox = async (options: ToolboxOptions) => {
    if (options.queryTags !== undefined) {
        queryTagHelper.setQueryTags(options.queryTags);

        const nameTags = options.queryTags.filter((tag) => tag.key?.name === 'name');
        const nameValues = nameTags.map((tag) => tag.value.name).filter(Boolean);

        const newQuery: Record<string, any> = {
            unhealthyPage: String(serviceListPageStore.unhealthyThisPage),
            healthyPage: String(serviceListPageStore.healthyThisPage),
        };

        if (nameValues.length > 0) {
            newQuery.serviceName = nameValues.join(',');
        } else {
            newQuery.serviceName = undefined;
        }

        replaceUrlQuery(newQuery);

        serviceListPageStore.setUnhealthyPage(1);
        serviceListPageStore.setHealthyPage(1);
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
        const validPage = Math.max(1, serviceListPageStore.unhealthyThisPage);
        const pageStart = (validPage - 1) * serviceListPageStore.unhealthyPageSize + 1;

        serviceListApiQueryHelper.setPage(pageStart, serviceListPageStore.unhealthyPageSize).setFilters([
            ...queryTagHelper.filters.value,
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
        const validPage = Math.max(1, serviceListPageStore.healthyThisPage);
        const pageStart = (validPage - 1) * serviceListPageStore.healthyPageSize + 1;

        healthyServiceListApiQueryHelper.setPage(pageStart, serviceListPageStore.healthyPageSize).setFilters([
            ...queryTagHelper.filters.value,
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

onMounted(async () => {
    const { unhealthyPage, healthyPage } = route.query;

    let parsedUnhealthy = parseInt(unhealthyPage as string);
    let parsedHealthy = parseInt(healthyPage as string);

    parsedUnhealthy = (!Number.isNaN(parsedUnhealthy) && parsedUnhealthy > 0) ? parsedUnhealthy : 1;
    parsedHealthy = (!Number.isNaN(parsedHealthy) && parsedHealthy > 0) ? parsedHealthy : 1;

    serviceListPageStore.setUnhealthyPage(parsedUnhealthy);
    serviceListPageStore.setHealthyPage(parsedHealthy);

    const { serviceName } = route.query;
    if (serviceName && typeof serviceName === 'string') {
        const nameValues = serviceName.split(',').map((name) => ({
            key: { name: 'name' },
            value: { label: name, name },
        }));
        queryTagHelper.setQueryTags(nameValues);
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
