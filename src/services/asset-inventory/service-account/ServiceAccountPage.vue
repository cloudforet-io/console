<template>
    <section class="service-account-page">
        <p-page-title :title="$t('IDENTITY.SERVICE_ACCOUNT.MAIN.TITLE', {provider: selectedProviderName})"
                      use-total-count
                      :total-count="typeOptionState.totalCount"
                      class="page-title"
        />
        <service-account-provider-list :provider-list="providerList"
                                       :selected-provider.sync="selectedProvider"
        />
        <p-dynamic-layout v-if="tableState.schema"
                          class="service-account-table"
                          type="query-search-table"
                          :options="tableState.schema.options"
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
            <template #toolbox-bottom>
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
            </template>
        </p-dynamic-layout>
        <custom-field-modal v-model="tableState.visibleCustomFieldModal"
                            resource-type="identity.ServiceAccount"
                            :options="{provider: selectedProvider}"
                            @complete="reloadTable"
        />
    </section>
</template>
<script lang="ts">
import type Vue from 'vue';
import {
    computed, reactive, watch, toRefs, getCurrentInstance,
} from 'vue';

import {
    PPageTitle, PDynamicLayout, PButton, PSelectStatus,
} from '@spaceone/design-system';
import type {
    DynamicLayoutEventListener,
    DynamicLayoutFieldHandler,
} from '@spaceone/design-system/types/data-display/dynamic/dynamic-layout/type';
import type { DynamicLayout } from '@spaceone/design-system/types/data-display/dynamic/dynamic-layout/type/layout-schema';

import { QueryHelper } from '@cloudforet/core-lib/query';
import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { SpaceRouter } from '@/router';
import { store } from '@/store';

import type { ProviderReferenceMap } from '@/store/modules/reference/provider/type';

import { dynamicFieldsToExcelDataFields } from '@/lib/component-util/dynamic-layout';
import type { ConsoleSearchSchema } from '@/lib/component-util/dynamic-layout/type';
import { FILE_NAME_PREFIX } from '@/lib/excel-export';
import { referenceFieldFormatter } from '@/lib/reference/referenceFieldFormatter';
import type { Reference } from '@/lib/reference/type';
import { replaceUrlQuery } from '@/lib/router-query-string';

import { useQuerySearchPropsWithSearchSchema } from '@/common/composables/dynamic-layout';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { useManagePermissionState } from '@/common/composables/page-manage-permission';
import CustomFieldModal from '@/common/modules/custom-table/custom-field-modal/CustomFieldModal.vue';

import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/route-config';
import { ACCOUNT_TYPE, ACCOUNT_TYPE_BADGE_OPTION } from '@/services/asset-inventory/service-account/config';
import ServiceAccountProviderList
    from '@/services/asset-inventory/service-account/modules/ServiceAccountProviderList.vue';
import type { ServiceAccountModelForBinding } from '@/services/asset-inventory/service-account/type';

export default {
    name: 'ServiceAccountPage',
    components: {
        CustomFieldModal,
        ServiceAccountProviderList,
        PDynamicLayout,
        PPageTitle,
        PButton,
        PSelectStatus,
    },
    setup() {
        const vm = getCurrentInstance()?.proxy as Vue;
        const { query } = SpaceRouter.router.currentRoute;
        const queryHelper = new QueryHelper().setFiltersAsRawQueryString(query.filters);

        const state = reactive({
            providers: computed<ProviderReferenceMap>(() => store.getters['reference/providerItems']),
            providerList: computed(() => Object.values(state.providers)),
            selectedProvider: undefined,
            selectedProviderName: computed(() => state.providers[state.selectedProvider]?.label),
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
            items: [] as ServiceAccountModelForBinding[],
            schema: null as null|DynamicLayout,
            visibleCustomFieldModal: false,
            accountTypeList: computed(() => [
                { name: 'all', label: 'All' },
                { name: ACCOUNT_TYPE.TRUSTED, label: ACCOUNT_TYPE_BADGE_OPTION[ACCOUNT_TYPE.TRUSTED].label },
                { name: ACCOUNT_TYPE.GENERAL, label: ACCOUNT_TYPE_BADGE_OPTION[ACCOUNT_TYPE.GENERAL].label },
            ]),
            selectedAccountType: 'all',
            searchFilters: computed<ConsoleFilter[]>(() => queryHelper.setFiltersAsQueryTag(fetchOptionState.queryTags).filters),
        });

        const searchFilter = new ApiQueryHelper();
        const { keyItemSets, valueHandlerMap, isAllLoaded } = useQuerySearchPropsWithSearchSchema(
            computed(() => tableState.schema?.options?.search as unknown as ConsoleSearchSchema[] ?? []),
            'identity.ServiceAccount',
            computed(() => searchFilter.setFilters([
                { k: 'provider', v: state.selectedProvider, o: '=' },
            ]).apiQuery.filter),
        );
        /** Handling API with SpaceConnector * */

        const apiQuery = new ApiQueryHelper();
        const getQuery = () => {
            apiQuery.setSort(fetchOptionState.sortBy, fetchOptionState.sortDesc)
                .setPage(fetchOptionState.pageStart, fetchOptionState.pageLimit)
                .setFilters([
                    { k: 'provider', v: state.selectedProvider, o: '=' },
                    ...tableState.searchFilters,
                ]);
            if (tableState.selectedAccountType !== 'all') {
                apiQuery.addFilter({ k: 'service_account_type', v: tableState.selectedAccountType, o: '=' });
            }
            const fields = tableState.schema?.options?.fields;
            if (fields) {
                apiQuery.setOnly(...fields.map((d) => d.key).filter((d) => !d.startsWith('tags.')), 'service_account_id', 'tags');
            }
            return apiQuery.data;
        };

        // add TRUSTED MANAGED directly
        const serviceAccountPreprocessor = (serviceAccount: ServiceAccountModelForBinding[]): ServiceAccountModelForBinding[] => serviceAccount.map((sa) => {
            if (sa.service_account_type === ACCOUNT_TYPE.TRUSTED && sa.tags?.is_managed === 'true') {
                return {
                    ...sa,
                    service_account_type: 'TRUSTED-MANAGED',
                };
            }
            return sa;
        });

        const listServiceAccountData = async () => {
            typeOptionState.loading = true;
            try {
                const res = await SpaceConnector.client.identity.serviceAccount.list({ query: getQuery() });

                tableState.items = serviceAccountPreprocessor(res.results);
                typeOptionState.totalCount = res.total_count;
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
            await store.dispatch('file/downloadExcel', {
                url: '/identity/service-account/list',
                param: { query: getQuery() },
                fields: dynamicFieldsToExcelDataFields(tableState.schema?.options?.fields ?? []),
                file_name_prefix: FILE_NAME_PREFIX.serviceAccount,
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
                params: { provider: state.selectedProvider },
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
                params: { serviceAccountId: item.service_account_id },
            });
        };
        const handleDynamicLayoutFetch = (changed) => {
            if (tableState.schema === null || !isAllLoaded.value) return;
            fetchTableData(changed);
        };
        /** ******* Page Init ******* */
        const getTableSchema = async () => {
            try {
                const schema = await SpaceConnector.client.addOns.pageSchema.get({
                    // eslint-disable-next-line camelcase
                    resource_type: 'identity.ServiceAccount',
                    schema: 'table',
                    options: {
                        provider: state.selectedProvider,
                    },
                });
                tableState.schema = schema;
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

        return {
            ...toRefs(state),
            tableState,
            fetchOptionState,
            typeOptionState,
            keyItemSets,
            valueHandlerMap,
            exportServiceAccountData,
            listServiceAccountData,
            fieldHandler,
            reloadTable,
            handleClickSettings,
            clickAddServiceAccount,

            handleSelectServiceAccountType,
            handleClickRow,
            handleDynamicLayoutFetch,
            ACCOUNT_TYPE_BADGE_OPTION,
        };
    },
};
</script>
<style lang="postcss" scoped>
.service-account-page {
    .account-type-filter {
        @apply flex gap-4 items-center border-t border-gray-200;
        padding: 0.75rem 1rem;
        font-size: 0.875rem;
        line-height: 125%;

        .label {
            @apply text-gray-500;
            font-size: 0.875rem;
        }
    }
    .service-account-table {
        @apply overflow-hidden border border-gray-200 rounded-lg;
    }

    /* custom design-system component -  p-dynamic-layout */
    :deep(.service-account-table) {
        overflow: unset;
        .p-toolbox-table {
            @apply rounded-lg;
        }
        .p-data-table {
            .row-height-fixed {
                cursor: pointer;
            }
        }
    }
}

</style>
