<script setup lang="ts">
import { useWindowSize } from '@vueuse/core';
import {
    computed, reactive, watch,
} from 'vue';
import { useRoute, useRouter } from 'vue-router/composables';

import { isEmpty } from 'lodash';

import { getThisPage } from '@cloudforet/core-lib/component-util/pagination';
import { QueryHelper } from '@cloudforet/core-lib/query';
import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
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

import { ROLE_TYPE } from '@/api-clients/identity/role/constant';
import { ACCOUNT_TYPE, SERVICE_ACCOUNT_STATE } from '@/api-clients/identity/service-account/schema/constant';
import type { ServiceAccountModel } from '@/api-clients/identity/service-account/schema/model';
import type { AccountType, ServiceAccountType } from '@/api-clients/identity/service-account/schema/type';
import type { TrustedAccountModel } from '@/api-clients/identity/trusted-account/schema/model';
import { useAllReferenceDataModel } from '@/query/resource-query/reference-data-model';
import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import { useAuthorizationStore } from '@/store/authorization/authorization-store';
import { CURRENCY_SYMBOL } from '@/store/display/constant';
import type { Currency } from '@/store/display/type';
import { useUserStore } from '@/store/user/user-store';

import { dynamicFieldsToExcelDataFields } from '@/lib/excel-export';
import { FILE_NAME_PREFIX } from '@/lib/excel-export/constant';
import { downloadExcel } from '@/lib/helper/file-download-helper';
import type { Reference } from '@/lib/reference/type';
import { useReferenceFieldFormatter } from '@/lib/reference/use-reference-field-formatter';
import { replaceUrlQuery } from '@/lib/router-query-string';

import AutoSyncState from '@/common/components/badge/auto-sync-state/AutoSyncState.vue';
import { useQuerySearchPropsWithSearchSchema } from '@/common/composables/dynamic-layout';
import { usePageEditableStatus } from '@/common/composables/page-editable-status';
import CustomFieldModalForDynamicLayout from '@/common/modules/custom-table/custom-field-modal/CustomFieldModalForDynamicLayout.vue';
import ProviderButtonList from '@/common/modules/provider-list/ProviderButtonList.vue';

import { gray } from '@/styles/colors';

import { useServiceAccountPaginationQuery } from '@/services/service-account/composables/queries/use-service-account-pagination-query';
import { useServiceAccountProviderListQuery } from '@/services/service-account/composables/queries/use-service-account-provider-list-query';
import { useTrustedAccountPaginationQuery } from '@/services/service-account/composables/queries/use-trusted-account-pagination-query';
import { useAccountTableSchema } from '@/services/service-account/composables/use-account-table-schema';
import { useServiceAccountCostReportConfig } from '@/services/service-account/composables/use-service-account-cost-report-config';
import {
    ACCOUNT_TYPE_BADGE_OPTION,
    PROVIDER_ACCOUNT_NAME,
} from '@/services/service-account/constants/service-account-constant';
import { convertAgentModeOptions } from '@/services/service-account/helpers/agent-mode-helper';
import { stateFormatter } from '@/services/service-account/helpers/dynamic-ui-schema-generator';
import { ADMIN_SERVICE_ACCOUNT_ROUTE } from '@/services/service-account/routes/admin/route-constant';
import { SERVICE_ACCOUNT_ROUTE } from '@/services/service-account/routes/route-constant';
import { useServiceAccountSchemaStore } from '@/services/service-account/stores/service-account-schema-store';

const { width } = useWindowSize();

const router = useRouter();
const route = useRoute();
const { query } = router.currentRoute;
const queryHelper = new QueryHelper().setFiltersAsRawQueryString(query.filters);

const serviceAccountSchemaStore = useServiceAccountSchemaStore();
const serviceAccountSchemaState = serviceAccountSchemaStore.state;
const userWorkspaceStore = useUserWorkspaceStore();
const appContextStore = useAppContextStore();
const userStore = useUserStore();
const authorizationStore = useAuthorizationStore();


const { hasReadWriteAccess } = usePageEditableStatus();
const { referenceFieldFormatter } = useReferenceFieldFormatter();
const referenceMap = useAllReferenceDataModel();

const {
    generalAccountTableSchema,
    trustedAccountTableSchema,
    refetch: refetchAccountTableSchema,
} = useAccountTableSchema({
    isTrustedAccount: computed(() => serviceAccountSchemaState.selectedAccountType === ACCOUNT_TYPE.TRUSTED),
});

const { data: costReportConfig } = useServiceAccountCostReportConfig();

const currency = computed<Currency|undefined>(() => costReportConfig?.value?.currency);

const state = reactive({
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
    selectedProvider: undefined,
    selectedProviderName: computed(() => referenceMap.provider[state.selectedProvider]?.label),
    timezone: computed<string>(() => userStore.state.timezone || 'UTC'),
    grantLoading: computed(() => appContextStore.getters.globalGrantLoading),
    currentGrantInfo: computed(() => authorizationStore.state.currentGrantInfo),
    isAgentModeAccount: computed(() => state.selectedProvider === 'kubernetes'),
});

const tableState = reactive({
    isWorkspaceMember: computed(() => authorizationStore.state.currentRoleInfo?.roleType === ROLE_TYPE.WORKSPACE_MEMBER),
    schemaOptions: computed<DynamicLayoutOptions>(() => {
        // NOTE: Temporary hard coding for agent mode, before separating or adding more agent.
        const _schemaOptions = tableState.isTrustedAccount
            ? (trustedAccountTableSchema.value?.options as DynamicLayoutOptions ?? {}) : (generalAccountTableSchema.value?.options as DynamicLayoutOptions ?? {});
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
    adminModeFilter: computed<ConsoleFilter[]>(() => (state.isAdminMode ? [{ k: 'resource_group', v: 'DOMAIN', o: '=' }] : [])),
    typeField: computed<ValueItem[]>(() => ([
        { label: i18n.t('IDENTITY.SERVICE_ACCOUNT.MAIN.ALL') as string, name: 'ALL' },
        { label: i18n.t('INVENTORY.SERVICE_ACCOUNT.AGENT.ACTIVE') as string, name: SERVICE_ACCOUNT_STATE.ACTIVE },
        // { label: i18n.t('INVENTORY.SERVICE_ACCOUNT.AGENT.INACTIVE') as string, name: SERVICE_ACCOUNT_STATE.INACTIVE },
        { label: i18n.t('IDENTITY.SERVICE_ACCOUNT.MAIN.PENDING') as string, name: SERVICE_ACCOUNT_STATE.PENDING },
        { label: i18n.t('IDENTITY.SERVICE_ACCOUNT.MAIN.DELETE') as string, name: SERVICE_ACCOUNT_STATE.DELETED },
    ])),
    selectedType: 'ALL' as ServiceAccountType | 'ALL',
});


/** States for Dynamic Layout(search table type) * */
const fetchOptionState = reactive({
    pageStart: 1,
    pageLimit: 15,
    sortDesc: true,
    sortBy: 'created_at',
    queryTags: queryHelper.setFiltersAsRawQueryString(query.filters).queryTags,
});

const apiQuery = new ApiQueryHelper();
const getQuery = (isTrustedAccount = false) => {
    apiQuery.setSort(fetchOptionState.sortBy, fetchOptionState.sortDesc)
        .setPage(fetchOptionState.pageStart, fetchOptionState.pageLimit)
        .setFilters([
            { k: 'provider', v: state.selectedProvider, o: '=' },
            ...(tableState.selectedType !== 'ALL' ? [{ k: 'state', v: tableState.selectedType, o: '=' }] : []) as ConsoleFilter[],
            ...tableState.adminModeFilter,
            ...tableState.searchFilters,
        ]);
    const fields = isTrustedAccount
        ? trustedAccountTableSchema.value?.options?.fields : generalAccountTableSchema.value?.options?.fields;
    if (fields) {
        apiQuery.setOnly(
            ...fields.map((d) => d.key),
            ...(isTrustedAccount ? ['trusted_account_id'] : ['service_account_id', 'trusted_account_id']),
            'tags',
        );
    }
    return apiQuery.data;
};

const {
    data: trustedAccountList,
    totalCount: trustedAccountTotalCount,
    isLoading: trustedAccountLoading,
    query: trustedAccountQuery,
} = useTrustedAccountPaginationQuery({
    params: computed(() => ({
        query: getQuery(true),
    })),
    enabled: computed(() => tableState.isTrustedAccount),
    thisPage: computed(() => getThisPage(fetchOptionState.pageStart, fetchOptionState.pageLimit)),
    pageSize: computed(() => fetchOptionState.pageLimit),
});
const {
    data: serviceAccountList,
    totalCount: serviceAccountTotalCount,
    isLoading: serviceAccountLoading,
    query: serviceAccountQuery,
} = useServiceAccountPaginationQuery({
    params: computed(() => ({
        query: getQuery(),
    })),
    enabled: computed(() => !tableState.isTrustedAccount),
    thisPage: computed(() => getThisPage(fetchOptionState.pageStart, fetchOptionState.pageLimit)),
    pageSize: computed(() => fetchOptionState.pageLimit),
});

const accountList = computed(() => {
    if (tableState.isTrustedAccount) return trustedAccountList.value?.results ?? [];
    return serviceAccountList.value?.results ?? [];
});
const accountTotalCount = computed(() => {
    if (tableState.isTrustedAccount) return trustedAccountTotalCount.value;
    return serviceAccountTotalCount.value;
});
const accountLoading = computed(() => {
    if (tableState.isTrustedAccount) return trustedAccountLoading.value;
    return serviceAccountLoading.value;
});


const { data: providerList } = useServiceAccountProviderListQuery();


const typeOptionState = reactive({
    timezone: computed<string>(() => userStore.state.timezone || 'UTC'),
    selectable: false,
    colCopy: false,
    settingsVisible: true,
});



const searchFilter = new ApiQueryHelper();
const { keyItemSets, valueHandlerMap } = useQuerySearchPropsWithSearchSchema(
    computed<SearchSchema>(() => (tableState.isTrustedAccount
        ? (trustedAccountTableSchema.value?.options?.search as unknown as SearchSchema ?? [])
        : (generalAccountTableSchema.value?.options?.search as unknown as SearchSchema ?? []))),
    'identity.ServiceAccount',
    computed(() => searchFilter.setFilters([
        { k: 'provider', v: state.selectedProvider, o: '=' },
    ]).apiQuery.filter),
);

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
    // Dynamic Layout Toolbox Refresh
    if (isEmpty(changed)) {
        if (tableState.isTrustedAccount) {
            trustedAccountQuery.refetch();
        } else {
            serviceAccountQuery.refetch();
        }
    }
};

/** API for Excel export * */
const exportServiceAccountData = async () => {
    await downloadExcel({
        url: `/identity/${tableState.isTrustedAccount ? 'trusted-account' : 'service-account'}/list`,
        param: { query: getQuery() },
        fields: dynamicFieldsToExcelDataFields(tableState.isTrustedAccount
            ? trustedAccountTableSchema.value?.options?.fields ?? [] : generalAccountTableSchema.value?.options?.fields ?? []),
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

const handleSelectServiceAccountType = (accountType: AccountType) => { serviceAccountSchemaStore.setSelectedAccountType(accountType); };
const handleClickRow = (index) => {
    const item = accountList.value[index];
    router.push({
        name: state.isAdminMode ? ADMIN_SERVICE_ACCOUNT_ROUTE.DETAIL._NAME : SERVICE_ACCOUNT_ROUTE.DETAIL._NAME,
        params: {
            serviceAccountId: tableState.isTrustedAccount
                ? (item as TrustedAccountModel).trusted_account_id
                : (item as ServiceAccountModel).service_account_id,
        },
    }).catch(() => {});
};
const handleDynamicLayoutFetch = (changed) => {
    if (tableState.isTrustedAccount
        ? trustedAccountTableSchema.value === null : generalAccountTableSchema.value === null) return;
    fetchTableData(changed);
};
const handleVisibleCustomFieldModal = (visible) => {
    tableState.visibleCustomFieldModal = visible;
};
const handleSelectType = async (value: ServiceAccountType | 'ALL') => {
    tableState.selectedType = value;
};

/** ******* Page Init ******* */

const reloadTable = async () => {
    await refetchAccountTableSchema();
    if (tableState.isTrustedAccount) {
        await trustedAccountQuery.refetch();
    } else {
        await serviceAccountQuery.refetch();
    }
};

const replaceQueryHelper = new QueryHelper();
watch(providerList, (providers) => {
    if (providers && providers.length) {
        const providerFilter = Array.isArray(query.provider) ? query.provider[0] : query.provider;
        state.selectedProvider = providerFilter || providers[0].provider;
    }
}, { immediate: true });
watch([() => state.selectedProvider, () => state.grantLoading], async ([after], [before]) => {
    if (state.currentGrantInfo.scope === 'USER') return;
    if (after && after !== before) {
        serviceAccountSchemaStore.setCurrentProvider(after);
        await replaceUrlQuery('provider', after);
        if (tableState.accountTypeList.length === 1) serviceAccountSchemaStore.setSelectedAccountType(tableState.accountTypeList[0].name);
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

(async () => {
    serviceAccountSchemaStore.setSelectedAccountType(tableState.accountTypeList[0].name);
})();

</script>

<template>
    <section class="service-account-page">
        <p-heading class="mb-6"
                   :title="$t('PAGE_SCHEMA.SERVICE_ACCOUNT')"
        />
        <provider-button-list class="service-account-provider-list"
                              :provider-list="providerList"
                              :selected-provider.sync="state.selectedProvider"
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
                               :total-count="accountTotalCount"
                               heading-type="sub"
                    >
                        <template #title-left-extra>
                            <p-lazy-img class="provider"
                                        :src="referenceMap.provider[state.selectedProvider]?.icon || ''"
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
            <p-dynamic-layout v-if="tableState.isTrustedAccount ? trustedAccountTableSchema : generalAccountTableSchema"
                              class="service-account-table"
                              type="query-search-table"
                              :options="tableState.schemaOptions"
                              :data="accountList"
                              :fetch-options="fetchOptionState"
                              :type-options="{
                                  ...typeOptionState,
                                  loading: accountLoading,
                                  totalCount: accountTotalCount,
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
                        <span>{{ CURRENCY_SYMBOL[currency] }}</span>
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
                                     :state="referenceMap.trustedAccount[item.trusted_account_id]?.data?.schedule?.state"
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
