<script setup lang="ts">
import { computed, reactive } from 'vue';

import {
    PPaneLayout, PHeading, PDataTable, PLink, PToolbox, PButton,
} from '@spaceone/design-system';
import { ACTION_ICON } from '@spaceone/design-system/src/inputs/link/type';
import type { ToolboxOptions } from '@spaceone/design-system/types/navigation/toolbox/type';

import { getApiQueryWithToolboxOptions } from '@cloudforet/core-lib/component-util/toolbox';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { ServiceAccountListParameters } from '@/schema/identity/service-account/api-verbs/list';
import type { ServiceAccountModel } from '@/schema/identity/service-account/model';
import { store } from '@/store';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProperRouteLocation } from '@/common/composables/proper-route-location';

import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/route-constant';
import { useServiceAccountPageStore } from '@/services/asset-inventory/stores/service-account-page-store';

const props = withDefaults(defineProps<{
    serviceAccountId: string;
    attachedGeneralAccounts: ServiceAccountModel[];
}>(), {
    serviceAccountId: undefined,
    attachedGeneralAccounts: () => ([]),
});

const serviceAccountPageStore = useServiceAccountPageStore();

const emit = defineEmits<{(e: 'update:attached-general-accounts', attachedGeneralAccounts: ServiceAccountModel[]): void;
}>();
const { getProperRouteLocation } = useProperRouteLocation();
const state = reactive({
    loading: true,
    items: [] as any,
    sortBy: 'name',
    sortDesc: true,
    domainId: computed(() => store.state.domain.domainId), // TODO: remove this after backend is ready
    totalCount: 0,
    pageLimit: 15,
});
const fields = [
    { name: 'name', label: 'Name', sortable: true },
    { name: 'service_account_id', label: 'Account ID', sortable: false },
];

const apiQueryHelper = new ApiQueryHelper().setSort(state.sortBy, state.sortDesc).setPageLimit(state.pageLimit).setFilters([
    { k: 'trusted_account_id', v: props.serviceAccountId, o: '=' }]);
let apiQuery = apiQueryHelper.data;
const getAttachedGeneralAccountList = async () => {
    state.loading = true;
    try {
        const { results, total_count } = await SpaceConnector.clientV2.identity.serviceAccount.list<ServiceAccountListParameters, ListResponse<ServiceAccountModel>>({
            query: apiQuery,
        });
        state.items = results;
        state.totalCount = total_count ?? 0;
        if (results) emit('update:attached-general-accounts', results);
    } catch (e) {
        ErrorHandler.handleError(e);
        state.items = [];
        state.totalCount = 0;
    } finally {
        state.loading = false;
    }
};

const handleChange = async (options?: ToolboxOptions) => {
    try {
        const convertOptions = {
            ...options,
            sortBy: state.sortBy,
            sortDesc: state.sortDesc,
        };
        apiQuery = getApiQueryWithToolboxOptions(apiQueryHelper, convertOptions) ?? apiQuery;
        await getAttachedGeneralAccountList();
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};

const handleSort = async (sortBy, sortDesc) => {
    state.sortBy = sortBy;
    state.sortDesc = sortDesc;
    try {
        apiQuery = getApiQueryWithToolboxOptions(apiQueryHelper, { sortBy, sortDesc }) ?? apiQuery;
        await getAttachedGeneralAccountList();
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};

const handleSync = async () => {
    try {
        await SpaceConnector.clientV2.identity.trustedAccount.sync({
            trusted_account_id: serviceAccountPageStore.state.serviceAccountItem.trusted_secret_id,
        });
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};

const init = async () => {
    await getAttachedGeneralAccountList();
};

(async () => {
    await init();
})();
</script>

<template>
    <p-pane-layout class="service-account-attached-general-accounts">
        <p-heading heading-type="sub"
                   :title="$t('INVENTORY.SERVICE_ACCOUNT.DETAIL.ATTACHED_GENERAL_ACCOUNTS_TITLE')"
                   use-total-count
                   :total-count="state.totalCount"
        >
            <template #extra>
                <p-button style-type="secondary"
                          @click="handleSync"
                >
                    {{ $t('INVENTORY.SERVICE_ACCOUNT.DETAIL.SYNC_NOW') }}
                </p-button>
            </template>
        </p-heading>
        <div class="content-wrapper mb-16">
            <div class="px-4">
                <p-toolbox :searchable="false"
                           :total-count="state.totalCount"
                           :page-size.sync="state.pageLimit"
                           :page-size-options="[15,30,45]"
                           @change="handleChange"
                           @refresh="handleChange()"
                />
            </div>
            <p-data-table :fields="fields"
                          :items="state.items"
                          sortable
                          :loading="state.loading"
                          :sort-by="state.sortBy"
                          :sort-desc="state.sortDesc"
                          @changeSort="handleSort"
            >
                <template #col-name-format="{value, item}">
                    <p-link :action-icon="ACTION_ICON.INTERNAL_LINK"
                            new-tab
                            :to="getProperRouteLocation({
                                name: ASSET_INVENTORY_ROUTE.SERVICE_ACCOUNT.DETAIL._NAME,
                                params: { serviceAccountId: item.service_account_id },
                            })"
                    >
                        {{ value }}
                    </p-link>
                </template>
            </p-data-table>
        </div>
    </p-pane-layout>
</template>
