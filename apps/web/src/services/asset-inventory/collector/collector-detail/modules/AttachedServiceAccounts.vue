<script setup lang="ts">
import {
    defineProps, defineEmits, reactive, computed, watch, onMounted,
} from 'vue';

import {
    PAnchor, PBadge, PButton, PToolboxTable,
} from '@spaceone/design-system';
import type { DefinitionField } from '@spaceone/design-system/types/data-display/tables/definition-table/type';
import type { ToolboxTableOptions } from '@spaceone/design-system/types/data-display/tables/toolbox-table/type';

import { iso8601Formatter } from '@cloudforet/core-lib';
import { makeReferenceValueHandler } from '@cloudforet/core-lib/component-util/query-search';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { store } from '@/store';
import { i18n } from '@/translations';

import type { ProjectReferenceMap } from '@/store/modules/reference/project/type';
import type { ProviderReferenceMap } from '@/store/modules/reference/provider/type';
import type { ServiceAccountReferenceMap } from '@/store/modules/reference/service-account/type';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';
import { referenceRouter } from '@/lib/reference/referenceRouter';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useQueryTags } from '@/common/composables/query-tags';

import type { SecretModel } from '@/services/asset-inventory/collector/model';
import { useCollectorFormStore } from '@/services/asset-inventory/collector/shared/collector-forms/collector-form-store';

const props = defineProps<{
    manageDisabled?: boolean;
}>();
const emit = defineEmits<{(e: 'update:totalCount', totalCount: number): void;
}>();

const collectorFormStore = useCollectorFormStore();
const collectorFormState = collectorFormStore.$state;

const fields: DefinitionField[] = [
    { name: 'service_account_id', label: 'Account Name' },
    { name: 'project_id', label: 'Project ID' },
    { name: 'provider', label: 'Provider' },
    { name: 'created_at', label: 'Created' },
    { name: 'collect', label: ' ' },
];

const state = reactive({
    timezone: computed(() => store.state.user.timezone),
    loading: true,
    secrets: null as null|SecretModel[],
    // query states
    pageLimit: 15,
    pageStart: 1,
    sortBy: 'name',
    sortDesc: true,
    totalCount: 0,
    serviceAccountsFilter: computed<string[]>(() => {
        const secretFilter = collectorFormState.originCollector?.secret_filter;
        if (!secretFilter) return [];
        if (secretFilter.state === 'DISABLED') return [];
        return secretFilter.service_accounts ?? [];
    }),
    // reference data
    projects: computed<ProjectReferenceMap>(() => store.getters['reference/projectItems']),
    providers: computed<ProviderReferenceMap>(() => store.getters['reference/providerItems']),
    serviceAccounts: computed<ServiceAccountReferenceMap>(() => store.getters['reference/serviceAccountItems']),
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

const queryTagHelper = useQueryTags({ keyItemSets: querySearchHandlers.keyItemSets });
const { queryTags } = queryTagHelper;

/* api fetchers */
const apiQueryHelper = new ApiQueryHelper();
const fetchSecrets = async (provider: string, serviceAccounts?: string[]): Promise<{ results: SecretModel[]; total_count: number }> => {
    try {
        apiQueryHelper.setPage(state.pageStart, state.pageLimit)
            .setSort(state.sortBy, state.sortDesc)
            .setFilters(queryTagHelper.filters.value)
            .addFilter({ k: 'provider', v: provider, o: '=' });

        if (serviceAccounts?.length) {
            apiQueryHelper.addFilter({ k: 'service_account_id', v: serviceAccounts, o: '=' });
        }

        const results = await SpaceConnector.client.secret.secret.list({
            query: apiQueryHelper.data,
        });
        return results;
    } catch (e) {
        ErrorHandler.handleError(e);
        return { results: [], total_count: 0 };
    }
};
const fetchCollectBySecret = async (secretId: string) => {
    try {
        if (!collectorFormStore.collectorId) throw new Error('collector_id is required');
        await SpaceConnector.client.inventory.collector.collect({
            collector_id: collectorFormStore.collectorId,
            secret_id: secretId,
        });
        showSuccessMessage(i18n.t('INVENTORY.COLLECTOR.CREATE.ALT_S_COLLECT_EXECUTION'), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('INVENTORY.COLLECTOR.CREATE.ALT_E_COLLECT_EXECUTION'));
    }
};

/* reused functions */
const getSecrets = async (provider: string, serviceAccounts?: string[]) => {
    state.loading = true;

    const { results, total_count } = await fetchSecrets(provider, serviceAccounts);
    state.secrets = results;
    state.totalCount = total_count;
    emit('update:totalCount', total_count);

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

    if (collectorFormStore.collectorProvider) await getSecrets(collectorFormStore.collectorProvider, state.serviceAccountsFilter);
};
const handleToolboxTableRefresh = async () => {
    if (collectorFormStore.collectorProvider) await getSecrets(collectorFormStore.collectorProvider, state.serviceAccountsFilter);
};
const handleClickCollect = async (secret: SecretModel) => {
    const secretId = secret.secret_id;
    await fetchCollectBySecret(secretId);
};

watch([() => collectorFormStore.collectorProvider, () => state.serviceAccountsFilter], async ([provider, serviceAccounts]) => {
    if (!provider) return;
    await getSecrets(provider, serviceAccounts);
}, { immediate: true });

onMounted(async () => {
    await Promise.allSettled([
        store.dispatch('reference/serviceAccount/load'),
        store.dispatch('reference/project/load'),
        store.dispatch('reference/provider/load'),
    ]);
});
</script>

<template>
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
            {{ state.serviceAccounts[value] ? state.serviceAccounts[value].label : value }}
        </template>
        <template #col-project_id-format="{value}">
            <p-anchor v-if="state.projects[value]"
                      :to="referenceRouter(value,{ resource_type: 'identity.Project' })"
            >
                {{ state.projects[value].label }}
            </p-anchor>
        </template>
        <template #col-provider-format="{value}">
            <p-badge v-if="state.providers[value]"
                     :background-color="state.providers[value].color"
                     text-color="white"
            >
                {{ state.providers[value].label }}
            </p-badge>
        </template>
        <template #col-collect-format="{item}">
            <p-button size="sm"
                      style-type="tertiary"
                      :disabled="props.manageDisabled"
                      @click.stop="handleClickCollect(item)"
            >
                {{ $t('INVENTORY.COLLECTOR.DETAIL.COLLECT_DATA') }}
            </p-button>
        </template>
        <template #col-created_at-format="{value}">
            {{ iso8601Formatter(value, state.timezone) }}
        </template>
    </p-toolbox-table>
</template>

<style scoped lang="postcss">
.p-toolbox-table {
    border-color: transparent;
}
</style>
