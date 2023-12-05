<script setup lang="ts">
import { useWindowSize } from '@vueuse/core';
import type Vue from 'vue';
import {
    computed, reactive, watch, getCurrentInstance,
} from 'vue';

import {
    PHeading, PDynamicLayout, PButton, PSelectStatus, PPaneLayout, screens, PTab,
} from '@spaceone/design-system';
import type {
    DynamicLayoutEventListener,
    DynamicLayoutFieldHandler,
} from '@spaceone/design-system/types/data-display/dynamic/dynamic-layout/type';
import type {
    DynamicLayout,
    SearchSchema,
} from '@spaceone/design-system/types/data-display/dynamic/dynamic-layout/type/layout-schema';

import type { DynamicLayoutOptions } from '@cloudforet/core-lib/component-util/dynamic-layout/layout-schema';
import { QueryHelper } from '@cloudforet/core-lib/query';
import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { SpaceRouter } from '@/router';
import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { ServiceAccountListParameters } from '@/schema/identity/service-account/api-verbs/list';
import { ACCOUNT_TYPE } from '@/schema/identity/service-account/constant';
import type { ServiceAccountModel } from '@/schema/identity/service-account/model';
import type { AccountType } from '@/schema/identity/service-account/type';
import type { TrustedAccountListParameters } from '@/schema/identity/trusted-account/api-verbs/list';
import type { TrustedAccountModel } from '@/schema/identity/trusted-account/model';
import { store } from '@/store';

import { useWorkspaceStore } from '@/store/app-context/workspace/workspace-store';
import type { ProviderReferenceMap } from '@/store/modules/reference/provider/type';

import { dynamicFieldsToExcelDataFields } from '@/lib/excel-export';
import { FILE_NAME_PREFIX } from '@/lib/excel-export/constant';
import { downloadExcel } from '@/lib/helper/file-download-helper';
import { referenceFieldFormatter } from '@/lib/reference/referenceFieldFormatter';
import type { Reference } from '@/lib/reference/type';
import { replaceUrlQuery } from '@/lib/router-query-string';

import { useQuerySearchPropsWithSearchSchema } from '@/common/composables/dynamic-layout';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { useManagePermissionState } from '@/common/composables/page-manage-permission';
import CustomFieldModal from '@/common/modules/custom-table/custom-field-modal/CustomFieldModal.vue';

import ProviderList from '@/services/asset-inventory/components/ProviderList.vue';
import { ACCOUNT_TYPE_BADGE_OPTION } from '@/services/asset-inventory/constants/service-account-constant';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/route-constant';

const { width } = useWindowSize();


const vm = getCurrentInstance()?.proxy as Vue;
const { query } = SpaceRouter.router.currentRoute;
const queryHelper = new QueryHelper().setFiltersAsRawQueryString(query.filters);

const workspaceStore = useWorkspaceStore();

const state = reactive({
    providers: computed<ProviderReferenceMap>(() => store.getters['reference/providerItems']),
    providerList: computed(() => Object.values(state.providers)),
    selectedProvider: undefined,
    selectedProviderName: computed(() => state.providers[state.selectedProvider]?.label),
    timezone: computed(() => store.state.user.timezone || 'UTC'),
    domainId: computed(() => store.state.domain.domainId), // TODO: remove domain_id after backend is ready
});

/** States for Dynamic Layout(search table type) * */
const fetchOptionState = reactive({
    pageStart: 1,
    pageLimit: 15,
    sortDesc: true,
    sortBy: 'created_at',
    queryTags: queryHelper.setFiltersAsRawQueryString(query.filters).queryTags,
});

const typeOptionState = reactive({
    loading: true,
    totalCount: 0,
    timezone: computed(() => store.state.user.timezone || 'UTC'),
    selectable: false,
    colCopy: false,
    settingsVisible: true,
});

const tableState = reactive({
    hasManagePermission: useManagePermissionState(),
    items: [] as ServiceAccountModel[] | TrustedAccountModel[],
    schema: null as null|DynamicLayout,
    schemaOptions: computed<DynamicLayoutOptions>(() => {
        const option = tableState.schema?.options ?? {};
        if (tableState.selectedAccountType === ACCOUNT_TYPE.TRUSTED) {
            return {
                ...option,
                fields: option.fields?.filter((d) => d.key !== 'project_id') ?? [],
            };
        }
        return option;
    }),
    visibleCustomFieldModal: false,
    accountTypeList: computed(() => [
        { name: ACCOUNT_TYPE.GENERAL, label: ACCOUNT_TYPE_BADGE_OPTION[ACCOUNT_TYPE.GENERAL].label },
        { name: ACCOUNT_TYPE.TRUSTED, label: ACCOUNT_TYPE_BADGE_OPTION[ACCOUNT_TYPE.TRUSTED].label },
    ]),
    selectedAccountType: ACCOUNT_TYPE.GENERAL as AccountType,
    searchFilters: computed<ConsoleFilter[]>(() => queryHelper.setFiltersAsQueryTag(fetchOptionState.queryTags).filters),
    isTrustedAccount: computed(() => tableState.selectedAccountType === ACCOUNT_TYPE.TRUSTED),
});

const searchFilter = new ApiQueryHelper();
const { keyItemSets, valueHandlerMap, isAllLoaded } = useQuerySearchPropsWithSearchSchema(
    computed<SearchSchema>(() => tableState.schema?.options?.search as unknown as SearchSchema ?? []),
    'identity.ServiceAccount',
    computed(() => searchFilter.setFilters([
        { k: 'provider', v: state.selectedProvider, o: '=' },
    ]).apiQuery.filter),
);
    /** Handling API with SpaceConnector * */

const apiQuery = new ApiQueryHelper();
const getQuery = (type: AccountType) => {
    const isTrustedAccount = type === ACCOUNT_TYPE.TRUSTED;
    apiQuery.setSort(fetchOptionState.sortBy, fetchOptionState.sortDesc)
        .setPage(fetchOptionState.pageStart, fetchOptionState.pageLimit)
        .setFilters([
            { k: 'provider', v: state.selectedProvider, o: '=' },
            ...(isTrustedAccount ? [{ k: 'workspace_id', v: [workspaceStore.getters.currentWorkspaceId, null], o: '=' }] : []),
            ...tableState.searchFilters,
        ]);
    const fields = tableState.schema?.options?.fields;
    if (fields) {
        apiQuery.setOnly(
            ...fields.map((d) => d.key).filter((d) => !d.startsWith('tags.') && !(d === 'project_id')),
            type === ACCOUNT_TYPE.TRUSTED ? 'trusted_account_id' : 'service_account_id',
            'tags',
        );
    }
    return apiQuery.data;
};

const listServiceAccountData = async () => {
    typeOptionState.loading = true;
    try {
        let res: ListResponse<TrustedAccountModel> | ListResponse<ServiceAccountModel>;
        if (tableState.isTrustedAccount) {
            res = await SpaceConnector.clientV2.identity.trustedAccount.list<TrustedAccountListParameters, ListResponse<TrustedAccountModel>>({
                domain_id: state.domainId, // TODO: remove domain_id after backend is ready
                query: getQuery(tableState.selectedAccountType),
                workspace_id: undefined,
            });
        } else {
            res = await SpaceConnector.clientV2.identity.serviceAccount.list<ServiceAccountListParameters, ListResponse<ServiceAccountModel>>({
                domain_id: state.domainId, // TODO: remove domain_id after backend is ready
                query: getQuery(tableState.selectedAccountType),
            });
        }


        tableState.items = res.results || [];
        typeOptionState.totalCount = res.total_count ?? 0;
    } catch (e) {
        ErrorHandler.handleError(e);
        tableState.items = [];
        typeOptionState.totalCount = 0;
    } finally {
        typeOptionState.loading = false;
    }
};

/** Change Detection of Main Table * */
const fetchTableData: DynamicLayoutEventListener['fetch'] = (changed) => {
    if (changed.sortBy !== undefined) {
        fetchOptionState.sortBy = changed.sortBy;
        fetchOptionState.sortDesc = !!changed.sortDesc;
    }
    if (changed.pageLimit !== undefined) {
        fetchOptionState.pageLimit = changed.pageLimit;
    }
    if (changed.pageStart !== undefined) {
        fetchOptionState.pageStart = changed.pageStart;
    }
    if (changed.queryTags !== undefined) {
        fetchOptionState.queryTags = changed.queryTags;
    }
    listServiceAccountData();
};

/** API for Excel export * */
const exportServiceAccountData = async () => {
    await downloadExcel({
        url: '/identity/service-account/list',
        param: { query: getQuery(tableState.selectedAccountType) },
        fields: dynamicFieldsToExcelDataFields(tableState.schema?.options?.fields ?? []),
        file_name_prefix: FILE_NAME_PREFIX.serviceAccount,
        timezone: state.timezone,
    });
};

/** Field Handler for display formatting(project id -> project name)* */
const fieldHandler: DynamicLayoutFieldHandler<Record<'reference', Reference>> = (field) => {
    if (field.extraData?.reference && field.data !== null) {
        return referenceFieldFormatter(field.extraData.reference, field.data);
    }
    return {};
};

/** Add & Delete Service Accounts Action (Dropdown) * */
const clickAddServiceAccount = () => {
    SpaceRouter.router.push({
        name: ASSET_INVENTORY_ROUTE.SERVICE_ACCOUNT.ADD._NAME,
        params: { provider: state.selectedProvider, serviceAccountType: tableState.selectedAccountType },
        query: { nextPath: vm.$route.fullPath },
    });
};

const handleClickSettings = () => {
    tableState.visibleCustomFieldModal = true;
};

const handleSelectServiceAccountType = (accountType) => { tableState.selectedAccountType = accountType; };
const handleClickRow = (index) => {
    const item = tableState.items[index];
    SpaceRouter.router.push({
        name: ASSET_INVENTORY_ROUTE.SERVICE_ACCOUNT.DETAIL._NAME,
        params: { serviceAccountId: tableState.isTrustedAccount ? item.trusted_account_id : item.service_account_id },
    });
};
const handleDynamicLayoutFetch = (changed) => {
    if (tableState.schema === null || !isAllLoaded.value) return;
    fetchTableData(changed);
};
/** ******* Page Init ******* */
const getTableSchema = async () => {
    try {
        tableState.schema = await SpaceConnector.client.addOns.pageSchema.get({
            // eslint-disable-next-line camelcase
            resource_type: 'identity.ServiceAccount',
            schema: 'table',
            options: {
                provider: state.selectedProvider,
            },
        }, { mockPath: '?resource=serviceaccount' });
    } catch (e) {
        tableState.schema = null;
    }
};

const reloadTable = async () => {
    await getTableSchema();
    await listServiceAccountData();
};

const init = async () => {
    await Promise.allSettled([
        store.dispatch('reference/project/load'),
        store.dispatch('reference/provider/load'),
    ]);
};
init();
/** ************************* */
const replaceQueryHelper = new QueryHelper();
watch(() => store.state.reference.provider.items, (providers) => {
    if (providers) {
        const providerFilter = Array.isArray(query.provider) ? query.provider[0] : query.provider;
        state.selectedProvider = providerFilter || Object.keys(providers)?.[0];
    }
}, { immediate: true });
watch(() => state.selectedProvider, async (after, before) => {
    if (after && after !== before) {
        await replaceUrlQuery('provider', after);
        await getTableSchema();
        await listServiceAccountData();
    }
}, { immediate: true });
watch(() => tableState.searchFilters, (searchFilters) => {
    replaceQueryHelper.setFilters(searchFilters);
    const filterQueryString = query.filters ?? '';
    if (replaceQueryHelper.rawQueryString !== JSON.stringify(filterQueryString)) {
        replaceUrlQuery('filters', replaceQueryHelper.rawQueryStrings);
    }
});
watch(() => tableState.selectedAccountType, () => {
    listServiceAccountData();
});
</script>

<template>
    <section class="service-account-page">
        <p-heading :title="$t('IDENTITY.SERVICE_ACCOUNT.MAIN.TITLE', {provider: state.selectedProviderName})"
                   use-total-count
                   :total-count="typeOptionState.totalCount"
        />
        <provider-list :provider-list="state.providerList"
                       :selected-provider.sync="state.selectedProvider"
                       class="service-account-provider-list"
        />
        <component :is="width > screens.tablet.max ? PTab : PPaneLayout"
                   :tabs="tableState.accountTypeList"
                   :active-tab.sync="tableState.selectedAccountType"
        >
            <div class="account-type-filter">
                <span class="label">{{ $t('PAGE_SCHEMA.SERVICE_ACCOUNT_TYPE') }}</span>
                <p-select-status v-for="(status, idx) in tableState.accountTypeList"
                                 :key="`${status.name}-${idx}`"
                                 :selected="tableState.selectedAccountType"
                                 :value="status.name"
                                 :multi-selectable="false"
                                 @change="handleSelectServiceAccountType"
                >
                    {{ status.label }}
                </p-select-status>
            </div>
            <p-dynamic-layout v-if="tableState.schema"
                              class="service-account-table"
                              type="query-search-table"
                              :options="tableState.schemaOptions"
                              :data="tableState.items"
                              :fetch-options="fetchOptionState"
                              :type-options="{
                                  ...typeOptionState,
                                  keyItemSets,
                                  valueHandlerMap,
                              }"
                              :field-handler="fieldHandler"
                              @fetch="handleDynamicLayoutFetch"
                              @export="exportServiceAccountData"
                              @click-settings="handleClickSettings"
                              @click-row="handleClickRow"
            >
                <template #toolbox-left>
                    <p-button style-type="primary"
                              icon-left="ic_plus_bold"
                              :disabled="!tableState.hasManagePermission"
                              @click="clickAddServiceAccount"
                    >
                        {{ $t('IDENTITY.SERVICE_ACCOUNT.MAIN.ADD') }}
                    </p-button>
                </template>
            </p-dynamic-layout>
        </component>
        <custom-field-modal v-model="tableState.visibleCustomFieldModal"
                            resource-type="identity.ServiceAccount"
                            :options="{provider: state.selectedProvider}"
                            @complete="reloadTable"
        />
    </section>
</template>

<style lang="postcss" scoped>

.service-account-provider-list {
    margin-bottom: 1.5rem;
}

.account-type-filter {
    @apply flex gap-4 items-center border-b border-gray-200;
    display: none;
    padding: 1.125rem 1rem;
    font-size: 0.875rem;
    line-height: 125%;

    .label {
        @apply text-gray-900;
        font-weight: bold;
        font-size: 0.875rem;
    }
}

@screen tablet {
    .account-type-filter {
        @apply flex gap-4 items-center border-b border-gray-200;
        display: flex;
        padding: 1.125rem 1rem;
        font-size: 0.875rem;
        line-height: 125%;

        .label {
            @apply text-gray-900;
            font-weight: bold;
            font-size: 0.875rem;
        }
    }
}

</style>
