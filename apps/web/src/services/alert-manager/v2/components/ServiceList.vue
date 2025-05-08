<script setup lang="ts">
import { computed, onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router/composables';

import isEmpty from 'lodash/isEmpty';

import { makeDistinctValueHandler } from '@cloudforet/core-lib/component-util/query-search';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PToolbox, PDataLoader, PEmpty, PButton,
} from '@cloudforet/mirinae';
import type { ToolboxOptions } from '@cloudforet/mirinae/types/controls/toolbox/type';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { ServiceListParameters } from '@/schema/alert-manager/service/api-verbs/list';
import type { ServiceModel } from '@/schema/alert-manager/service/model';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { usePageEditableStatus } from '@/common/composables/page-editable-status';
import { useQueryTags } from '@/common/composables/query-tags';

import ServiceListContent from '@/services/alert-manager/v2/components/ServiceListContent.vue';
import { ALERT_MANAGER_ROUTE } from '@/services/alert-manager/v2/routes/route-constant';
import type { AlertManagementTableHandlerType } from '@/services/alert-manager/v2/types/alert-manager-type';

const pageSizeOptions = [15, 30, 45];

const { hasReadWriteAccess } = usePageEditableStatus();

const router = useRouter();

const SERVICE_SEARCH_HANDLER: AlertManagementTableHandlerType = {
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
    totalCount: 0,
    serviceList: [] as ServiceModel[],
    alertServiceList: computed<ServiceModel[]>(() => state.serviceList.filter((item) => !isEmpty(item?.alerts.TRIGGERED) || !isEmpty(item?.alerts.ACKNOWLEDGED))),
    healthyServiceList: computed<ServiceModel[]>(() => state.serviceList.filter((item) => isEmpty(item?.alerts.TRIGGERED) && isEmpty(item?.alerts.ACKNOWLEDGED))),
});

const serviceListApiQueryHelper = new ApiQueryHelper().setSort('created_at', true)
    .setPage(1, 15);
const queryTagHelper = useQueryTags({ keyItemSets: SERVICE_SEARCH_HANDLER.keyItemSets });
const { queryTags } = queryTagHelper;

const handleChangeToolbox = async (options: ToolboxOptions) => {
    if (options.queryTags !== undefined) queryTagHelper.setQueryTags(options.queryTags);
    if (options.pageStart !== undefined) serviceListApiQueryHelper.setPageStart(options.pageStart);
    if (options.pageLimit !== undefined) serviceListApiQueryHelper.setPageLimit(options.pageLimit);
    await fetchServiceList();
};
const handleClickCreateButton = () => {
    router.push({
        name: ALERT_MANAGER_ROUTE.SERVICE.CREATE._NAME,
    }).catch(() => {});
};

const fetchServiceList = async () => {
    state.loading = true;
    try {
        serviceListApiQueryHelper.setFilters([
            ...queryTagHelper.filters.value,
        ]);
        const { results, total_count } = await SpaceConnector.clientV2.alertManager.service.list<ServiceListParameters, ListResponse<ServiceModel>>({
            query: serviceListApiQueryHelper.data,
            details: true,
        });
        state.serviceList = results || [];
        state.totalCount = total_count || 0;
    } catch (e) {
        ErrorHandler.handleError(e);
        state.serviceList = [];
        state.totalCount = 0;
    } finally {
        state.loading = false;
    }
};

onMounted(async () => {
    await fetchServiceList();
});
</script>

<template>
    <div class="service-list flex flex-col gap-2">
        <p-toolbox search-type="query"
                   searchable
                   filters-visible
                   :page-size-options="pageSizeOptions"
                   :page-size="15"
                   :query-tags="queryTags"
                   :key-item-sets="SERVICE_SEARCH_HANDLER.keyItemSets"
                   :value-handler-map="SERVICE_SEARCH_HANDLER.valueHandlerMap"
                   :total-count="state.totalCount"
                   @change="handleChangeToolbox"
                   @refresh="fetchServiceList"
        />
        <p-data-loader :loading="state.loading"
                       :data="state.serviceList"
                       loader-backdrop-color="transparent"
                       class="loader-wrapper"
        >
            <div class="flex flex-col gap-4">
                <service-list-content v-if="state.alertServiceList.length > 0"
                                      :list="state.alertServiceList"
                                      type="alert"
                />
                <service-list-content v-if="state.healthyServiceList.length > 0"
                                      :list="state.healthyServiceList"
                                      type="healthy"
                />
            </div>
            <template #no-data>
                <div class="pt-12">
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
            </template>
        </p-data-loader>
    </div>
</template>

<style scoped lang="postcss">
.service-list {
    .loader-wrapper {
        min-height: 13.75rem;
    }
}
</style>
