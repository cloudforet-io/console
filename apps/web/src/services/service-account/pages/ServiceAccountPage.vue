<script setup lang="ts">
import { useWindowSize } from '@vueuse/core';
import {
    computed, onMounted, reactive, watch,
} from 'vue';
import { useRoute, useRouter } from 'vue-router/composables';

import { QueryHelper } from '@cloudforet/core-lib/query';
import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PHeading, PDynamicLayout, PButton, PSelectStatus, PPaneLayout, screens, PTab, PLazyImg, PStatus, PTooltip, PI,
    PHeadingLayout,
} from '@cloudforet/mirinae';
import type { ValueItem } from '@cloudforet/mirinae/types/controls/search/query-search/type';
import type {
    DynamicLayoutEventListener,
    DynamicLayoutFieldHandler,
} from '@cloudforet/mirinae/types/data-display/dynamic/dynamic-layout/type';
import type { DynamicLayoutOptions, SearchSchema } from '@cloudforet/mirinae/types/data-display/dynamic/dynamic-layout/type/layout-schema';
import { numberFormatter } from '@cloudforet/utils';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import { ROLE_TYPE } from '@/api-clients/identity/role/constant';
import type { ServiceAccountListParameters } from '@/api-clients/identity/service-account/schema/api-verbs/list';
import { ACCOUNT_TYPE, SERVICE_ACCOUNT_STATE } from '@/api-clients/identity/service-account/schema/constant';
import type { ServiceAccountModel } from '@/api-clients/identity/service-account/schema/model';
import type { AccountType } from '@/api-clients/identity/service-account/schema/type';
import type { TrustedAccountListParameters } from '@/api-clients/identity/trusted-account/schema/api-verbs/list';
import type { TrustedAccountModel } from '@/api-clients/identity/trusted-account/schema/model';
import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import { useAuthorizationStore } from '@/store/authorization/authorization-store';
import { CURRENCY_SYMBOL } from '@/store/display/constant';
import type { Currency } from '@/store/display/type';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { ProviderReferenceMap, ProviderItem } from '@/store/reference/provider-reference-store';
import { useUserStore } from '@/store/user/user-store';

import { dynamicFieldsToExcelDataFields } from '@/lib/excel-export';
import { FILE_NAME_PREFIX } from '@/lib/excel-export/constant';
import { downloadExcel } from '@/lib/helper/file-download-helper';
import type { Reference } from '@/lib/reference/type';
import { useReferenceFieldFormatter } from '@/lib/reference/use-reference-field-formatter';
import { replaceUrlQuery } from '@/lib/router-query-string';

import AutoSyncState from '@/common/components/badge/auto-sync-state/AutoSyncState.vue';
import { useQuerySearchPropsWithSearchSchema } from '@/common/composables/dynamic-layout';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { usePageEditableStatus } from '@/common/composables/page-editable-status';
import CustomFieldModalForDynamicLayout from '@/common/modules/custom-table/custom-field-modal/CustomFieldModalForDynamicLayout.vue';

import { gray } from '@/styles/colors';

import ProviderList from '@/services/asset-inventory/components/ProviderList.vue';
import {
    ACCOUNT_TYPE_BADGE_OPTION,
    PROVIDER_ACCOUNT_NAME,
} from '@/services/service-account/constants/service-account-constant';
import { convertAgentModeOptions } from '@/services/service-account/helpers/agent-mode-helper';
import { stateFormatter } from '@/services/service-account/helpers/dynamic-ui-schema-generator';
import type { QuerySearchTableLayout } from '@/services/service-account/helpers/dynamic-ui-schema-generator/type';
import { ADMIN_SERVICE_ACCOUNT_ROUTE } from '@/services/service-account/routes/admin/route-constant';
import { SERVICE_ACCOUNT_ROUTE } from '@/services/service-account/routes/route-constant';
import { useServiceAccountPageStore } from '@/services/service-account/stores/service-account-page-store';
import { useServiceAccountSchemaStore } from '@/services/service-account/stores/service-account-schema-store';

const { width } = useWindowSize();

const router = useRouter();
const route = useRoute();
const { query } = router.currentRoute;
const queryHelper = new QueryHelper().setFiltersAsRawQueryString(query.filters);

const serviceAccountPageStore = useServiceAccountPageStore();
const serviceAccountPageGetters = serviceAccountPageStore.getters;
const serviceAccountSchemaStore = useServiceAccountSchemaStore();
const serviceAccountSchemaState = serviceAccountSchemaStore.state;
const userWorkspaceStore = useUserWorkspaceStore();
const appContextStore = useAppContextStore();
const allReferenceStore = useAllReferenceStore();
const userStore = useUserStore();
const authorizationStore = useAuthorizationStore();


const { hasReadWriteAccess } = usePageEditableStatus();
const { referenceFieldFormatter } = useReferenceFieldFormatter();


const storeState = reactive({
    currency: computed<Currency|undefined>(() => serviceAccountPageGetters.currency),
});
const state = reactive({
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
    trustedAccounts: computed(() => allReferenceStore.getters.trustedAccount),
    providers: computed<ProviderReferenceMap>(() => allReferenceStore.getters.provider),
    providerList: computed<ProviderItem[]>(() => {
        const _providerList = Object.values(state.providers) as ProviderItem[];
        if (!state.isAdminMode) return _providerList;
        const ADMIN_MODE_PROVIDER_KEYS = ['aws', 'google_cloud', 'azure'];
        return _providerList.filter((provider) => ADMIN_MODE_PROVIDER_KEYS.includes(provider.key));
    }),
    selectedProvider: undefined,
    selectedProviderName: computed(() => state.providers[state.selectedProvider]?.label),
    timezone: computed<string>(() => userStore.state.timezone || 'UTC'),
    grantLoading: computed(() => appContextStore.getters.globalGrantLoading),
    currentGrantInfo: computed(() => authorizationStore.state.currentGrantInfo),
    isAgentModeAccount: computed(() => state.selectedProvider === 'kubernetes'),
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
    timezone: computed<string>(() => userStore.state.timezone || 'UTC'),
    selectable: false,
    colCopy: false,
    settingsVisible: true,
});

const tableState = reactive({
    isWorkspaceMember: computed(() => authorizationStore.state.currentRoleInfo?.roleType === ROLE_TYPE.WORKSPACE_MEMBER),
    items: [] as ServiceAccountModel[] | TrustedAccountModel[],
    schema: computed<QuerySearchTableLayout|undefined>(() => (tableState.isTrustedAccount
        ? serviceAccountSchemaState.trustedAccountTableSchema : serviceAccountSchemaState.generalAccountTableSchema)),
    schemaOptions: computed<DynamicLayoutOptions>(() => {
        // NOTE: Temporary hard coding for agent mode, before separating or adding more agent.
        const _schemaOptions = tableState.schema?.options ?? {};
        return state.isAgentModeAccount ? convertAgentModeOptions(_schemaOptions) : _schemaOptions;
    }),
    visibleCustomFieldModal: false,
    accountTypeList: computed(() => {
        if (state.isAdminMode) {
            return [
                { name: ACCOUNT_TYPE.TRUSTED, label: ACCOUNT_TYPE_BADGE_OPTION[ACCOUNT_TYPE.TRUSTED].label },
            ];
        }
        if (state.selectedProvider === 'kubernetes') return [{ name: ACCOUNT_TYPE.GENERAL, label: ACCOUNT_TYPE_BADGE_OPTION[ACCOUNT_TYPE.GENERAL].label }];
        return [
            { name: ACCOUNT_TYPE.GENERAL, label: ACCOUNT_TYPE_BADGE_OPTION[ACCOUNT_TYPE.GENERAL].label },
            { name: ACCOUNT_TYPE.TRUSTED, label: ACCOUNT_TYPE_BADGE_OPTION[ACCOUNT_TYPE.TRUSTED].label },
        ];
    }),
    tableTitle: computed(() => {
        let baseTitle:string;
        if (tableState.isTrustedAccount) baseTitle = 'Trusted Account';
        else if (Object.keys(PROVIDER_ACCOUNT_NAME).includes(state.selectedProvider)) {
            baseTitle = PROVIDER_ACCOUNT_NAME[state.selectedProvider];
        } else baseTitle = 'General Account';
        return `${state.selectedProviderName} ${baseTitle}`;
    }),
    searchFilters: computed<ConsoleFilter[]>(() => queryHelper.setFiltersAsQueryTag(fetchOptionState.queryTags).filters),
    isTrustedAccount: computed(() => serviceAccountSchemaState.selectedAccountType === ACCOUNT_TYPE.TRUSTED),
    adminModeFilter: computed(() => (state.isAdminMode ? [{ k: 'resource_group', v: 'DOMAIN', o: '=' }] : [])),
    typeField: computed<ValueItem[]>(() => ([
        { label: i18n.t('IDENTITY.SERVICE_ACCOUNT.MAIN.ALL') as string, name: 'ALL' },
        { label: i18n.t('INVENTORY.SERVICE_ACCOUNT.AGENT.ACTIVE') as string, name: SERVICE_ACCOUNT_STATE.ACTIVE },
        // { label: i18n.t('INVENTORY.SERVICE_ACCOUNT.AGENT.INACTIVE') as string, name: SERVICE_ACCOUNT_STATE.INACTIVE },
        { label: i18n.t('IDENTITY.SERVICE_ACCOUNT.MAIN.PENDING') as string, name: SERVICE_ACCOUNT_STATE.PENDING },
        { label: i18n.t('IDENTITY.SERVICE_ACCOUNT.MAIN.DELETE') as string, name: SERVICE_ACCOUNT_STATE.DELETED },
    ])),
    selectedType: 'ALL',
});

const searchFilter = new ApiQueryHelper();
const { keyItemSets, valueHandlerMap } = useQuerySearchPropsWithSearchSchema(
    computed<SearchSchema>(() => tableState.schema?.options?.search as unknown as SearchSchema ?? []),
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
            tableState.selectedType !== 'ALL' && { k: 'state', v: tableState.selectedType, o: '=' },
            ...tableState.adminModeFilter,
            ...tableState.searchFilters,
        ]);
    const fields = tableState.schema?.options?.fields;
    if (fields) {
        apiQuery.setOnly(
            ...fields.map((d) => d.key),
            ...(tableState.isTrustedAccount ? ['trusted_account_id'] : ['service_account_id', 'trusted_account_id']),
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
                query: getQuery(),
            });
        } else {
            res = await SpaceConnector.clientV2.identity.serviceAccount.list<ServiceAccountListParameters, ListResponse<ServiceAccountModel>>({
                query: getQuery(),
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
        url: `/identity/${tableState.isTrustedAccount ? 'trusted-account' : 'service-account'}/list`,
        param: { query: getQuery() },
        fields: dynamicFieldsToExcelDataFields(tableState.schema?.options?.fields ?? []),
        file_name_prefix: FILE_NAME_PREFIX.serviceAccount,
        timezone: state.timezone,
    });
};

/** Field Handler for display formatting(project id -> project name)* */
const fieldHandler: DynamicLayoutFieldHandler<Record<'reference', Reference>> = (field) => {
    if (field.extraData?.reference && field.data !== null) {
        return referenceFieldFormatter({ ...field.extraData.reference, workspace_id: userWorkspaceStore.getters.currentWorkspaceId }, field.data);
    }
    return {};
};

/** Add & Delete Service Accounts Action (Dropdown) * */
const clickAddServiceAccount = () => {
    router.push({
        name: state.isAdminMode ? ADMIN_SERVICE_ACCOUNT_ROUTE.ADD._NAME : SERVICE_ACCOUNT_ROUTE.ADD._NAME,
        params: { provider: state.selectedProvider, serviceAccountType: state.isAdminMode ? ACCOUNT_TYPE.TRUSTED : serviceAccountSchemaState.selectedAccountType },
        query: { nextPath: route.fullPath },
    }).catch(() => {});
};

const handleClickSettings = () => {
    tableState.visibleCustomFieldModal = true;
};

const handleSelectServiceAccountType = (accountType: AccountType) => { serviceAccountSchemaState.selectedAccountType = accountType; };
const handleClickRow = (index) => {
    const item = tableState.items[index];
    router.push({
        name: state.isAdminMode ? ADMIN_SERVICE_ACCOUNT_ROUTE.DETAIL._NAME : SERVICE_ACCOUNT_ROUTE.DETAIL._NAME,
        params: { serviceAccountId: tableState.isTrustedAccount ? item.trusted_account_id : item.service_account_id },
    }).catch(() => {});
};
const handleDynamicLayoutFetch = (changed) => {
    if (tableState.schema === null) return;
    fetchTableData(changed);
};
const handleVisibleCustomFieldModal = (visible) => {
    tableState.visibleCustomFieldModal = visible;
};
const handleSelectType = async (value: string) => {
    tableState.selectedType = value;
    await listServiceAccountData();
};

/** ******* Page Init ******* */

const reloadTable = async () => {
    if (tableState.isTrustedAccount) {
        await serviceAccountSchemaStore.setTrustedAccountTableSchema();
    } else {
        await serviceAccountSchemaStore.setGeneralAccountTableSchema();
    }
    await listServiceAccountData();
};

const replaceQueryHelper = new QueryHelper();
watch(() => state.providers, (providers) => {
    if (providers) {
        const providerFilter = Array.isArray(query.provider) ? query.provider[0] : query.provider;
        state.selectedProvider = providerFilter || Object.keys(providers)?.[0];
    }
}, { immediate: true });
watch([() => state.selectedProvider, () => state.grantLoading], async ([after], [before]) => {
    if (state.currentGrantInfo.scope === 'USER') return;
    if (after && after !== before) {
        await serviceAccountSchemaStore.setProviderSchema(after);
        await replaceUrlQuery('provider', after);
        if (tableState.accountTypeList.length === 1) serviceAccountSchemaState.selectedAccountType = tableState.accountTypeList[0].name;
        await reloadTable();
    }
}, { immediate: true });
watch(() => tableState.searchFilters, (searchFilters) => {
    replaceQueryHelper.setFilters(searchFilters);
    const filterQueryString = query.filters ?? '';
    if (replaceQueryHelper.rawQueryString !== JSON.stringify(filterQueryString)) {
        replaceUrlQuery('filters', replaceQueryHelper.rawQueryStrings);
    }
});
watch([() => serviceAccountSchemaState.selectedAccountType, () => state.grantLoading], () => {
    if (state.currentGrantInfo.scope === 'USER') return;
    listServiceAccountData();
}, { immediate: true });

onMounted(async () => {
    if (tableState.isWorkspaceMember) return;
    await serviceAccountPageStore.fetchCostReportConfig();
});

(async () => {
    serviceAccountSchemaState.selectedAccountType = tableState.accountTypeList[0].name;
    if (state.selectedProvider) await serviceAccountSchemaStore.setProviderSchema(state.selectedProvider);
})();

</script>

<template>
    <section class="service-account-page">
        <p-heading class="mb-6"
                   :title="$t('PAGE_SCHEMA.SERVICE_ACCOUNT')"
        />
        <provider-list :provider-list="state.providerList"
                       :selected-provider.sync="state.selectedProvider"
                       class="service-account-provider-list"
        />
        <component :is="width > screens.tablet.max ? PTab : PPaneLayout"
                   :tabs="tableState.accountTypeList"
                   :active-tab="serviceAccountSchemaState.selectedAccountType"
                   @update:active-tab="handleSelectServiceAccountType"
        >
            <div class="account-type-filter">
                <span class="label">{{ $t('PAGE_SCHEMA.SERVICE_ACCOUNT_TYPE') }}</span>
                <p-select-status v-for="(status, idx) in tableState.accountTypeList"
                                 :key="`${status.name}-${idx}`"
                                 :selected="serviceAccountSchemaState.selectedAccountType"
                                 :value="status.name"
                                 :multi-selectable="false"
                                 @change="handleSelectServiceAccountType"
                >
                    {{ status.label }}
                </p-select-status>
            </div>
            <p-heading-layout class="pt-8 px-4 pb-4">
                <template #heading>
                    <p-heading use-total-count
                               class="service-account-table-heading"
                               :title="tableState.tableTitle"
                               :total-count="typeOptionState.totalCount"
                               heading-type="sub"
                    >
                        <template #title-left-extra>
                            <p-lazy-img class="provider"
                                        :src="state.providers[state.selectedProvider]?.icon || ''"
                            />
                        </template>
                    </p-heading>
                </template>
                <template #extra>
                    <p-button v-if="hasReadWriteAccess"
                              style-type="primary"
                              icon-left="ic_plus_bold"
                              :disabled="tableState.isTrustedAccount && tableState.isWorkspaceMember"
                              @click="clickAddServiceAccount"
                    >
                        {{ $t('IDENTITY.SERVICE_ACCOUNT.MAIN.CREATE') }}
                    </p-button>
                </template>
            </p-heading-layout>
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
                <template v-if="!tableState.isTrustedAccount"
                          #toolbox-bottom
                >
                    <div class="select-type-wrapper">
                        <span class="mr-2">{{ $t('IDENTITY.SERVICE_ACCOUNT.MAIN.STATE') }}</span>
                        <p-select-status v-for="(item, idx) in tableState.typeField"
                                         :key="idx"
                                         :selected="tableState.selectedType"
                                         class="mr-2"
                                         :value="item.name"
                                         @change="handleSelectType"
                        >
                            {{ item.label }}
                        </p-select-status>
                    </div>
                </template>
                <template v-if="!tableState.isTrustedAccount"
                          #th-cost_info-format="{ field }"
                >
                    <div class="th-tooltip">
                        <span>{{ field.label }}</span>
                        <p-tooltip
                            :contents="$t('IDENTITY.SERVICE_ACCOUNT.TOOLTIP_COST')"
                            position="bottom"
                            class="tooltip-wrapper"
                        >
                            <p-i name="ic_info-circle"
                                 class="title-tooltip"
                                 height="1rem"
                                 width="1rem"
                                 :color="gray[500]"
                            />
                        </p-tooltip>
                    </div>
                </template>
                <template #col-schedule.state-format="{value}">
                    <auto-sync-state v-if="value"
                                     :state="value"
                    />
                </template>
                <template v-if="!tableState.isTrustedAccount"
                          #col-cost_info-format="{value}"
                >
                    <p>
                        <span>{{ CURRENCY_SYMBOL[storeState.currency] }}</span>
                        {{ numberFormatter(value?.month) || 0 }}
                    </p>
                </template>
                <template v-if="!tableState.isTrustedAccount"
                          #col-state-format="{value}"
                >
                    <p-status v-bind="stateFormatter(value)"
                              class="capitalize"
                    />
                </template>
                <template #col-is_managed-format="{item}">
                    <auto-sync-state v-if="item.trusted_account_id && item.is_managed"
                                     :state="state.trustedAccounts[item.trusted_account_id]?.data?.schedule?.state"
                                     size="xs"
                    />
                </template>
            </p-dynamic-layout>
        </component>
        <custom-field-modal-for-dynamic-layout :visible="tableState.visibleCustomFieldModal"
                                               :resource-type="tableState.isTrustedAccount ? 'identity.TrustedAccount' : 'identity.ServiceAccount'"
                                               :options="{provider: state.selectedProvider}"
                                               @update:visible="handleVisibleCustomFieldModal"
                                               @complete="reloadTable"
        />
    </section>
</template>

<style lang="postcss" scoped>

.service-account-table-heading {
    .provider {
        margin-left: 0.5rem;
    }
}

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

/* custom design-system component -  p-dynamic-layout */
:deep(.service-account-table) {
    overflow: unset;
    .p-data-table {
        .row-height-fixed {
            cursor: pointer;
        }
    }
    .select-type-wrapper {
        @apply flex items-center text-label-md text-gray-600;
        gap: 0.5rem;
        margin-top: -0.5rem;
        margin-left: 1rem;
        margin-bottom: 1rem;
    }

    .th-tooltip {
        @apply flex items-center;
        gap: 0.25rem;
        .tooltip-wrapper {
            margin-top: -0.125rem;
        }
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
