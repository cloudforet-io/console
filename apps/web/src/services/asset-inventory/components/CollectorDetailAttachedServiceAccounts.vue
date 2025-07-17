<script setup lang="ts">
import {
    defineProps, defineEmits, reactive, computed, watch,
} from 'vue';

import { makeReferenceValueHandler } from '@cloudforet/core-lib/component-util/query-search';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PLink, PBadge, PButton, PRadio, PRadioGroup, PToolboxTable,
} from '@cloudforet/mirinae';
import type { DefinitionField } from '@cloudforet/mirinae/types/data-display/tables/definition-table/type';
import type { ToolboxTableOptions } from '@cloudforet/mirinae/types/data-display/tables/toolbox-table/type';
import { iso8601Formatter } from '@cloudforet/utils';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { SecretListParameters } from '@/api-clients/secret/secret/schema/api-verbs/list';
import type { SecretModel } from '@/api-clients/secret/secret/schema/model';
import { useAllReferenceDataModel } from '@/query/resource-query/reference-data-model';
import { i18n } from '@/translations';

import { useReferenceRouter } from '@/router/composables/use-reference-router';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import { useUserStore } from '@/store/user/user-store';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useQueryTags } from '@/common/composables/query-tags';

import { useCollectorGetQuery } from '@/services/asset-inventory/composables/use-collector-get-query';
import { COLLECT_DATA_TYPE } from '@/services/asset-inventory/constants/collector-constant';
import {
    useCollectorDataModalStore,
} from '@/services/asset-inventory/stores/collector-data-modal-store';
import { useCollectorFormStore } from '@/services/asset-inventory/stores/collector-form-store';

const props = defineProps<{
    manageDisabled?: boolean;
    hasReadWriteAccess?: boolean
}>();
const emit = defineEmits<{(e: 'update:totalCount', totalCount: number): void;
}>();

const userWorkspaceStore = useUserWorkspaceStore();
const collectorFormStore = useCollectorFormStore();
const collectorFormState = collectorFormStore.state;
const collectorDataModalStore = useCollectorDataModalStore();
const userStore = useUserStore();

const { getReferenceLocation } = useReferenceRouter();

const fields: DefinitionField[] = [
    { name: 'service_account_id', label: 'Account Name' },
    { name: 'project_id', label: 'Project' },
    { name: 'provider', label: 'Provider' },
    { name: 'created_at', label: 'Created' },
    { name: 'collect', label: ' ' },
];

const attachedServiceAccountList = computed(() => [
    {
        label: i18n.t('INVENTORY.COLLECTOR.CREATE.ALL'),
        name: 'all',
    },
    {
        label: i18n.t('INVENTORY.COLLECTOR.CREATE.SPECIFIC_SERVICE_ACCOUNT'),
        name: 'specific',
    },
]);

const referenceMap = useAllReferenceDataModel();

const state = reactive({
    timezone: computed<string|undefined>(() => userStore.state.timezone),
    loading: true,
    secrets: null as null|SecretModel[],
    // query states
    pageLimit: 15,
    pageStart: 1,
    sortBy: 'name',
    sortDesc: true,
    totalCount: 0,
    secretFilter: computed(() => originCollectorData.value?.secret_filter),
    isExcludeFilter: computed(() => !!(state.secretFilter.exclude_service_accounts ?? []).length),
    serviceAccountsFilter: computed<string[]>(() => {
        if (!state.secretFilter) return [];
        if (state.secretFilter.state === 'DISABLED') return [];
        return (state.isExcludeFilter) ? (state.secretFilter.exclude_service_accounts ?? []) : (state.secretFilter.service_accounts ?? []);
    }),
});

const querySearchHandlers = {
    keyItemSets: [{
        title: 'Properties',
        items: [
            {
                name: 'service_account_id',
                label: 'Service Account',
            },
            {
                name: 'project_id',
                label: 'Project',
            },
        ],
    }],
    valueHandlerMap: {
        service_account_id: makeReferenceValueHandler('identity.ServiceAccount'),
        project_id: makeReferenceValueHandler('identity.Project'),
    },
};

/* Query */
const { data: originCollectorData } = useCollectorGetQuery({
    collectorId: computed(() => collectorFormState.collectorId),
});

const queryTagHelper = useQueryTags({ keyItemSets: querySearchHandlers.keyItemSets });
const { queryTags } = queryTagHelper;

/* api fetchers */
const apiQueryHelper = new ApiQueryHelper();
const fetchSecrets = async (provider: string, serviceAccounts?: string[]): Promise<ListResponse<SecretModel>> => {
    try {
        apiQueryHelper.setPage(state.pageStart, state.pageLimit)
            .setSort(state.sortBy, state.sortDesc)
            .setFilters(queryTagHelper.filters.value)
            .addFilter({ k: 'provider', v: provider, o: '=' });

        if (serviceAccounts?.length) {
            if (state.isExcludeFilter) apiQueryHelper.addFilter({ k: 'service_account_id', v: serviceAccounts, o: '!=' });
            else apiQueryHelper.addFilter({ k: 'service_account_id', v: serviceAccounts, o: '=' });
        }

        const results = await SpaceConnector.clientV2.secret.secret.list<SecretListParameters, ListResponse<SecretModel>>({
            query: apiQueryHelper.data,
        });
        return results ?? { results: [], total_count: 0 };
    } catch (e) {
        ErrorHandler.handleError(e);
        return { results: [], total_count: 0 };
    }
};

/* reused functions */
const getSecrets = async (provider: string, serviceAccounts?: string[]) => {
    state.loading = true;

    const { results, total_count } = await fetchSecrets(provider, serviceAccounts);
    state.secrets = results;
    state.totalCount = total_count;
    emit('update:totalCount', total_count ?? 0);

    state.loading = false;
};

/* event handlers */
const handleToolboxTableChange = async (options: ToolboxTableOptions) => {
    if (options.sortBy !== undefined) {
        state.sortBy = options.sortBy;
        state.sortDesc = options.sortDesc as boolean;
    }
    if (options.pageStart !== undefined) state.pageStart = options.pageStart;
    if (options.pageLimit !== undefined) state.pageLimit = options.pageLimit;
    if (options.queryTags !== undefined) queryTagHelper.setQueryTags(options.queryTags);

    if (originCollectorData.value?.provider) await getSecrets(originCollectorData.value.provider, state.serviceAccountsFilter);
};
const handleToolboxTableRefresh = async () => {
    if (originCollectorData.value?.provider) await getSecrets(originCollectorData.value.provider, state.serviceAccountsFilter);
};
const handleClickCollect = async (secret: SecretModel) => {
    collectorDataModalStore.setVisible(true);
    collectorDataModalStore.setSelectedCollectorId(collectorFormState.collectorId);
    collectorDataModalStore.setCollectDataType(COLLECT_DATA_TYPE.SINGLE);
    collectorDataModalStore.setSelectedSecret(secret);
};

watch([() => originCollectorData.value?.provider, () => state.serviceAccountsFilter], async ([provider, serviceAccounts]) => {
    if (!provider) return;
    await getSecrets(provider, serviceAccounts);
}, { immediate: true });
</script>

<template>
    <div>
        <p-radio-group class="attached-service-account-radio-group">
            <p-radio v-for="(item) in attachedServiceAccountList"
                     :key="`${item.name}`"
                     :value="item.name"
                     :selected="collectorFormState.attachedServiceAccountType"
                     readonly
            >
                {{ item.label }}
            </p-radio>
        </p-radio-group>
        <p-toolbox-table :fields="fields"
                         :items="state.secrets"
                         :loading="state.loading"
                         :total-count="state.totalCount"
                         :query-tags="queryTags"
                         :key-item-sets="querySearchHandlers.keyItemSets"
                         :value-handler-map="querySearchHandlers.valueHandlerMap"
                         :sort-by.sync="state.sortBy"
                         :sort-desc.sync="state.sortDesc"
                         :page-size.sync="state.pageLimit"
                         search-type="query"
                         searchable
                         use-cursor-loading
                         @change="handleToolboxTableChange"
                         @refresh="handleToolboxTableRefresh"
        >
            <template #col-service_account_id-format="{value}">
                {{ referenceMap.serviceAccount[value]?.label || value }}
            </template>
            <template #col-project_id-format="{value}">
                <p-link v-if="referenceMap.project[value]"
                        action-icon="internal-link"
                        new-tab
                        :to="getReferenceLocation(value,{
                            resource_type: 'identity.Project',
                            workspace_id: userWorkspaceStore.getters.currentWorkspaceId
                        })"
                >
                    {{ referenceMap.project[value]?.label || value }}
                </p-link>
            </template>
            <template #col-provider-format="{value}">
                <p-badge v-if="referenceMap.provider[value]"
                         :background-color="referenceMap.provider[value]?.color"
                         text-color="white"
                >
                    {{ referenceMap.provider[value]?.label || value }}
                </p-badge>
            </template>
            <template #col-collect-format="{item}">
                <p-button v-if="props.hasReadWriteAccess"
                          size="sm"
                          style-type="tertiary"
                          :disabled="props.manageDisabled"
                          class="service-account-collect-data-button"
                          @click.stop="handleClickCollect(item)"
                >
                    {{ $t('INVENTORY.COLLECTOR.DETAIL.COLLECT_DATA') }}
                </p-button>
            </template>
            <template #col-created_at-format="{value}">
                {{ iso8601Formatter(value, state.timezone) }}
            </template>
        </p-toolbox-table>
    </div>
</template>

<style scoped lang="postcss">
.p-toolbox-table {
    border-color: transparent;
}
.attached-service-account-radio-group {
    padding: 0 1rem;
}
</style>
