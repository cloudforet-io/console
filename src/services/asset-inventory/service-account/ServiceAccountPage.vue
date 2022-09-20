<template>
    <section class="service-account-page">
        <p-page-title :title="$t('IDENTITY.SERVICE_ACCOUNT.MAIN.TITLE', {provider: selectedProviderName})"
                      use-total-count
                      :total-count="typeOptionState.totalCount"
                      class="page-title"
        />
        <service-account-provider-list :provider-list="providerList" :selected-provider.sync="selectedProvider" />
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
                <p-button style-type="primary-dark"
                          icon="ic_plus_bold"
                          :disabled="!tableState.hasManagePermission"
                          @click="clickAddServiceAccount"
                >
                    {{ $t('IDENTITY.SERVICE_ACCOUNT.MAIN.ADD') }}
                </p-button>
            </template>
            <template #toolbox-bottom>
                <div class="account-type-filter">
                    <span class="label">{{ 'Account Type' }}</span>
                    <p-select-status v-for="(status, idx) in tableState.accountTypeList" :key="`${status.name}-${idx}`"
                                     :selected="tableState.selectedAccountType"
                                     :value="status.name"
                                     :multi-selectable="false"
                                     @change="handleSelectServiceAccountType"
                    >
                        {{ status.label }}
                    </p-select-status>
                </div>
            </template>
            <!--            <template #col-service_account_type-format="{data}">-->
            <!--                <p-badge v-if="data" :outline="true" :style-type="ACCOUNT_TYPE_BADGE_OPTION[data].styleType">-->
            <!--                    {{ ACCOUNT_TYPE_BADGE_OPTION[data] ? ACCOUNT_TYPE_BADGE_OPTION[data].label : '' }}-->
            <!--                </p-badge>-->
            <!--            </template>-->
        </p-dynamic-layout>
        <custom-field-modal v-model="tableState.visibleCustomFieldModal"
                            resource-type="identity.ServiceAccount"
                            :options="{provider: selectedProvider}"
                            @complete="reloadTable"
        />
    </section>
</template>
<script lang="ts">
/* external library */

import { QueryHelper } from '@spaceone/console-core-lib/query';
import type { QueryStoreFilter } from '@spaceone/console-core-lib/query/type';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { ApiQueryHelper } from '@spaceone/console-core-lib/space-connector/helper';
import {
    PPageTitle, PDynamicLayout, PButton, PSelectStatus,
} from '@spaceone/design-system';
import type {
    DynamicLayoutEventListener,
    DynamicLayoutFieldHandler,
} from '@spaceone/design-system/dist/src/data-display/dynamic/dynamic-layout/type';
import type { DynamicLayout } from '@spaceone/design-system/dist/src/data-display/dynamic/dynamic-layout/type/layout-schema';
import {
    computed, reactive, watch, toRefs,
} from 'vue';

/* components */
import { SpaceRouter } from '@/router';
import { store } from '@/store';

import { dynamicFieldsToExcelDataFields } from '@/lib/component-util/dynamic-layout';
import { FILE_NAME_PREFIX } from '@/lib/excel-export';
import { assetUrlConverter } from '@/lib/helper/asset-helper';
import { referenceFieldFormatter } from '@/lib/reference/referenceFieldFormatter';
import type { Reference } from '@/lib/reference/type';
import { replaceUrlQuery } from '@/lib/router-query-string';

import { useQuerySearchPropsWithSearchSchema } from '@/common/composables/dynamic-layout';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { useManagePermissionState } from '@/common/composables/page-manage-permission';
import CustomFieldModal from '@/common/modules/custom-table/custom-field-modal/CustomFieldModal.vue';

import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/route-config';
import ServiceAccountProviderList
    from '@/services/asset-inventory/service-account/modules/ServiceAccountProviderList.vue';

const ACCOUNT_TYPE = Object.freeze({
    GENERAL_ACCOUNT: 'general_account',
    TRUST_ACCOUNT: 'trust_account',
});

const ACCOUNT_TYPE_BADGE_OPTION = Object.freeze({
    [ACCOUNT_TYPE.TRUST_ACCOUNT]: { label: 'General Account', styleType: 'primary' },
    [ACCOUNT_TYPE.GENERAL_ACCOUNT]: { label: 'Trust Account', styleType: 'gray' },
});

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
        const { query, fullPath } = SpaceRouter.router.currentRoute;
        const queryHelper = new QueryHelper().setFiltersAsRawQueryString(query.filters);

        const state = reactive({
            selectedProvider: 'atlassian',
            provider: computed(() => store.state.reference.provider.items),
            providerList: computed(() => Object.keys(state.provider).map(k => ({
                ...state.provider[k],
                icon: assetUrlConverter(state.provider[k].icon),
            }))),
            selectedProviderName: computed(() => state.provider[state.selectedProvider]?.label),
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
            selectIndex: [] as number[],
            selectable: false,
            colCopy: false,
            settingsVisible: true,
        });

        const tableState = reactive({
            hasManagePermission: useManagePermissionState(),
            items: [],
            selectedItems: computed(() => typeOptionState.selectIndex.map(d => tableState.items[d])),
            selectedAccountIds: computed(() => tableState.selectedItems.map(d => d?.service_account_id)),
            schema: null as null|DynamicLayout,
            visibleCustomFieldModal: false,
            accountTypeList: computed(() => [
                { name: 'all', label: 'All' },
                { name: ACCOUNT_TYPE.TRUST_ACCOUNT, label: ACCOUNT_TYPE_BADGE_OPTION[ACCOUNT_TYPE.TRUST_ACCOUNT].label },
                { name: ACCOUNT_TYPE.GENERAL_ACCOUNT, label: ACCOUNT_TYPE_BADGE_OPTION[ACCOUNT_TYPE.GENERAL_ACCOUNT].label },
            ]),
            selectedAccountType: 'all',
            searchFilters: computed<QueryStoreFilter[]>(() => queryHelper.setFiltersAsQueryTag(fetchOptionState.queryTags).filters),
        });

        const { keyItemSets, valueHandlerMap, isAllLoaded } = useQuerySearchPropsWithSearchSchema(
            computed(() => tableState.schema?.options?.search ?? []),
            'identity.ServiceAccount',
            // computed(() => )
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
            const fields = tableState.schema?.options?.fields;
            if (fields) {
                apiQuery.setOnly(...fields.map(d => d.key).filter(d => !d.startsWith('tags.')), 'service_account_id', 'tags');
            }
            return apiQuery.data;
        };

        const serviceAccountListApi = SpaceConnector.client.identity.serviceAccount.list;
        const listServiceAccountData = async () => {
            typeOptionState.loading = true;
            try {
                const res = await serviceAccountListApi({ query: getQuery() });

                // filtering select index
                typeOptionState.selectIndex = typeOptionState.selectIndex.filter(d => !!res.results[d]);

                tableState.items = res.results;
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
                fields: dynamicFieldsToExcelDataFields(tableState.schema.options.fields),
                file_name_prefix: FILE_NAME_PREFIX.serviceAccount,
            });
        };

        /** Field Handler for display formatting(project id -> project name)* */
        const fieldHandler: DynamicLayoutFieldHandler<Record<'reference', Reference>> = (field) => {
            if (field.extraData?.reference) {
                return referenceFieldFormatter(field.extraData.reference, field.data);
            }
            return {};
        };

        /** Add & Delete Service Accounts Action (Dropdown) * */
        const clickAddServiceAccount = () => {
            SpaceRouter.router.push({
                name: ASSET_INVENTORY_ROUTE.SERVICE_ACCOUNT.ADD._NAME,
                params: { provider: state.selectedProvider },
                query: { nextPath: fullPath },
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
            const providerFilter = Array.isArray(query.provider) ? query.provider[0] : query.provider;
            state.selectedProvider = providerFilter || state.providerList[0].key;
            watch(() => state.selectedProvider, async (after, before) => {
                if (after !== before) {
                    replaceUrlQuery('provider', after);
                    await getTableSchema();
                    await listServiceAccountData();
                    typeOptionState.selectIndex = [];
                }
            }, { immediate: true });
        };
        init();
        /** ************************* */
        const replaceQueryHelper = new QueryHelper();
        watch(() => tableState.searchFilters, (searchFilters) => {
            replaceQueryHelper.setFilters(searchFilters);
            const filterQueryString = query.filters ?? '';
            if (replaceQueryHelper.rawQueryString !== JSON.stringify(filterQueryString)) {
                replaceUrlQuery('filters', replaceQueryHelper.rawQueryStrings);
            }
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
        @apply border border-gray-200 rounded;
    }

    /* custom design-system component - p-dynamic-layout */

    /* custom design-system component - p-dynamic-layout-table */
    :deep(.p-dynamic-layout-table) .p-toolbox-table {
        @apply border border-gray-200 rounded-lg;
        .p-data-table {
            min-height: unset;
        }
    }
}

</style>
