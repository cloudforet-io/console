<template>
    <section class="service-account-page">
        <p-page-title :title="$t('IDENTITY.SERVICE_ACCOUNT.MAIN.TITLE', {provider: selectedProviderName})"
                      use-total-count
                      :total-count="typeOptionState.totalCount"
                      class="page-title"
        />
        <service-account-provider-list :provider-list="providerList" :selected-provider.sync="selectedProvider" />
        <p-horizontal-layout>
            <template #container="{ height }">
                <p-dynamic-layout v-if="tableState.schema"
                                  type="table"
                                  :options="tableState.schema.options"
                                  :data="tableState.items"
                                  :fetch-options="fetchOptionState"
                                  :type-options="typeOptionState"
                                  :style="{height: `${height}px`}"
                                  :field-handler="fieldHandler"
                                  @fetch="fetchTableData"
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
                            <!-- song-lang -->
                            <span class="label">{{ $t('Account Type') }}</span>
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
                </p-dynamic-layout>
            </template>
        </p-horizontal-layout>
        <custom-field-modal v-model="tableState.visibleCustomFieldModal"
                            resource-type="identity.ServiceAccount"
                            :options="{provider: selectedProvider}"
                            @complete="reloadTable"
        />
    </section>
</template>
<script lang="ts">
/* external library */
import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';

import { QueryHelper } from '@spaceone/console-core-lib/query';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { ApiQueryHelper } from '@spaceone/console-core-lib/space-connector/helper';
import {
    PPageTitle,
    PDynamicLayout,
    PHorizontalLayout,
    PButton,
    PSelectStatus,
} from '@spaceone/design-system';
import type {
    DynamicLayoutEventListener,
    DynamicLayoutFieldHandler,
} from '@spaceone/design-system/dist/src/data-display/dynamic/dynamic-layout/type';
import type { DynamicLayout } from '@spaceone/design-system/dist/src/data-display/dynamic/dynamic-layout/type/layout-schema';

/* components */
import { SpaceRouter } from '@/router';
import { store } from '@/store';
import { i18n } from '@/translations';

import { dynamicFieldsToExcelDataFields } from '@/lib/component-util/dynamic-layout';
import { FILE_NAME_PREFIX } from '@/lib/excel-export';
import { assetUrlConverter } from '@/lib/helper/asset-helper';
import { referenceFieldFormatter } from '@/lib/reference/referenceFieldFormatter';
import type { Reference } from '@/lib/reference/type';
import { replaceUrlQuery } from '@/lib/router-query-string';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useManagePermissionState } from '@/common/composables/page-manage-permission';
import CustomFieldModal from '@/common/modules/custom-table/custom-field-modal/CustomFieldModal.vue';

import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/route-config';
import ServiceAccountProviderList
    from '@/services/asset-inventory/service-account/modules/ServiceAccountProviderList.vue';

export default {
    name: 'ServiceAccountPage',
    components: {
        CustomFieldModal,
        ServiceAccountProviderList,
        PDynamicLayout,
        PPageTitle,
        PHorizontalLayout,
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
            searchText: queryHelper.apiQuery.keyword,
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
                // song-lang
                { name: 'all', label: i18n.t('All') },
                { name: 'trustAccount', label: i18n.t('Trust Account') },
                { name: 'generalAccount', label: i18n.t('General Account') },
            ]),
            selectedAccountType: 'all',
        });

        /** Handling API with SpaceConnector * */

        const apiQuery = new ApiQueryHelper();
        const getQuery = () => {
            apiQuery.setSort(fetchOptionState.sortBy, fetchOptionState.sortDesc)
                .setPage(fetchOptionState.pageStart, fetchOptionState.pageLimit)
                .setFilters([{ k: 'provider', v: state.selectedProvider, o: '=' }])
                .addFilter(...queryHelper.filters);

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
            if (changed.searchText !== undefined) {
                fetchOptionState.searchText = changed.searchText;
                // sync updated query tags to url query string
                queryHelper.setFilters([{ v: changed.searchText }]);
                replaceUrlQuery('filters', queryHelper.rawQueryStrings);
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
            console.log(query);
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

        return {
            ...toRefs(state),
            tableState,
            fetchOptionState,
            typeOptionState,
            exportServiceAccountData,
            listServiceAccountData,
            fetchTableData,
            fieldHandler,
            reloadTable,
            handleClickSettings,
            clickAddServiceAccount,

            handleSelectServiceAccountType,
            handleClickRow,
        };
    },
};
</script>
<style lang="postcss" scoped>
.service-account-page {
    .provider-dropdown {
        @apply font-normal;
    }

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

    >>> .p-dynamic-layout-table .p-toolbox-table {
        @apply border border-gray-200 rounded-lg;
        .p-data-table {
            min-height: unset;
        }
    }
}

</style>
