<template>
    <p-pane-layout>
        <p-heading :title="$t('INVENTORY.COLLECTOR.DETAIL.ATTACHED_SERVICE_ACCOUNTS')"
                   heading-type="sub"
        >
            <template #extra>
                <p-button v-if="!state.isEditMode"
                          size="md"
                          icon-left="ic_edit"
                          style-type="secondary"
                          @click="handleClickEdit"
                >
                    {{ $t('INVENTORY.COLLECTOR.DETAIL.EDIT') }}
                </p-button>
            </template>
        </p-heading>
        <p-toolbox-table v-if="!state.isEditMode"
                         :fields="fields"
                         :items="state.secrets"
                         :loading="state.loading"
                         :total-count="state.totalCount"
                         :query-tags="apiQueryHelper.queryTags"
                         :key-item-sets="querySearchHandlers.keyItemSets"
                         :value-handler-map="querySearchHandlers.valueHandlerMap"
                         :sort-by.sync="state.sortBy"
                         :sort-desc.sync="state.sortDesc"
                         :page-size.sync="state.pageLimit"
                         search-type="query"
                         searchable
                         use-cursor-loading
                         @change="handleToolboxTableChange"
        />
        <div v-else
             class="edit-form"
        >
            <attached-service-account-form :title="$t('INVENTORY.COLLECTOR.DETAIL.SELECT_SERVICE_ACCOUNT')"
                                           margin-on-specific
                                           reset-on-collector-id-change
                                           @update:isAttachedServiceAccountValid="handleChangeIsAttachedServiceAccountValid"
            />
            <p-button style-type="tertiary"
                      size="lg"
                      @click="handleClickCancel"
            >
                {{ $t('INVENTORY.COLLECTOR.DETAIL.CANCEL') }}
            </p-button>
            <p-button style-type="primary"
                      size="lg"
                      class="save-changes-button"
                      :disalbed="state.updateLoading"
                      @click="handleClickSave"
            >
                {{ $t('INVENTORY.COLLECTOR.DETAIL.SAVE_CHANGES') }}
            </p-button>
        </div>
    </p-pane-layout>
</template>


<script lang="ts" setup>
import {
    reactive, watch, onMounted, computed,
} from 'vue';

import {
    PHeading, PButton, PPaneLayout, PToolboxTable,
} from '@spaceone/design-system';
import type { DefinitionField } from '@spaceone/design-system/types/data-display/tables/definition-table/type';
import type { ToolboxTableOptions } from '@spaceone/design-system/types/data-display/tables/toolbox-table/type';

import { makeReferenceValueHandler } from '@cloudforet/core-lib/component-util/query-search';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { store } from '@/store';
import { i18n } from '@/translations';

import type { ServiceAccountReferenceMap } from '@/store/modules/reference/service-account/type';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useQueryTags } from '@/common/composables/query-tags';

import type { SecretModel, CollectorModel, CollectorUpdateParameter } from '@/services/asset-inventory/collector/model';
import AttachedServiceAccountForm from '@/services/asset-inventory/collector/shared/collector-forms/AttachedServiceAccountForm.vue';
import { useCollectorFormStore } from '@/services/asset-inventory/collector/shared/collector-forms/collector-form-store';


const collectorFormStore = useCollectorFormStore();
const collectorFormState = collectorFormStore.$state;

const fields: DefinitionField[] = [
    { name: 'service_account_id', label: 'Account Name' },
    { name: 'secret_id', label: 'Account ID' },
    { name: 'project_id', label: 'Project ID' },
    { name: 'provider', label: 'Provider' },
    { name: 'created_at', label: 'Created' },
];
const state = reactive({
    isEditMode: false,
    loading: true,
    secrets: null as null|SecretModel[],
    serviceAccounts: computed<ServiceAccountReferenceMap>(() => store.getters['reference/serviceAccountItems']),
    isServiceAccountValid: false,
    // query states
    pageLimit: 15,
    pageStart: 1,
    sortBy: 'name',
    sortDesc: true,
    totalCount: 0,
    // updating
    updateLoading: false,
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
const apiQueryHelper = new ApiQueryHelper();

const getQuery = (provider?: string) => {
    apiQueryHelper.setPage(state.pageStart, state.pageLimit)
        .setSort(state.sortBy, state.sortDesc)
        .setFilters(queryTagHelper.filters.value);

    if (provider) {
        apiQueryHelper.addFilter({ k: 'provider', v: provider, o: '=' });
    }

    return apiQueryHelper.data;
};

const fetchSecrets = async (provider?: string): Promise<{ results: SecretModel[]; total_count: number }> => {
    try {
        const results = await SpaceConnector.client.secret.secret.list({
            query: getQuery(provider),
        });
        return results;
    } catch (e) {
        ErrorHandler.handleError(e);
        return { results: [], total_count: 0 };
    }
};
const getSecrets = async (provider?: string) => {
    state.loading = true;

    const { results, total_count } = await fetchSecrets(provider);
    state.secrets = results;
    state.totalCount = total_count;

    state.loading = false;
};

const fetchCollectorUpdate = async (): Promise<CollectorModel> => {
    if (!collectorFormStore.collectorId) throw new Error('collector_id is required');
    const originSecretFilter = collectorFormState.originCollector?.secret_filter ?? {};
    const params: CollectorUpdateParameter = {
        collector_id: collectorFormStore.collectorId,
        secret_filter: {
            ...originSecretFilter,
            state: collectorFormState.attachedServiceAccountType === 'specific' ? 'ENABLED' : 'DISABLED',
            service_accounts: collectorFormState.attachedServiceAccountType === 'specific'
                ? collectorFormState.attachedServiceAccount
                : [],
        },
    };
    return SpaceConnector.client.inventory.collector.update(params);
};


const handleClickEdit = () => {
    state.isEditMode = true;
};

const handleChangeIsAttachedServiceAccountValid = (value: boolean) => {
    state.isServiceAccountValid = value;
};

const handleToolboxTableChange = async (options: ToolboxTableOptions) => {
    if (options.sortBy !== undefined) {
        state.sortBy = options.sortBy;
        state.sortDesc = options.sortDesc as boolean;
    }
    if (options.pageStart !== undefined) state.pageStart = options.pageStart;
    if (options.pageLimit !== undefined) state.pageLimit = options.pageLimit;
    if (options.queryTags !== undefined) queryTagHelper.setQueryTags(options.queryTags);

    await getSecrets(collectorFormStore.provider);
};

const handleClickCancel = () => {
    state.isEditMode = false;
};

const handleClickSave = async () => {
    try {
        state.updateLoading = true;
        const collector = await fetchCollectorUpdate();
        collectorFormStore.setOriginCollector(collector);
        showSuccessMessage(i18n.t('INVENTORY.COLLECTOR.ALT_S_UPDATE_SERVICE_ACCOUNTS'), '');
        state.isEditMode = false;
    } catch (error) {
        collectorFormStore.resetAttachedServiceAccount();
        ErrorHandler.handleRequestError(error, i18n.t('INVENTORY.COLLECTOR.ALT_E_UPDATE_SERVICE_ACCOUNTS'));
    } finally {
        state.updateLoading = false;
    }
};


watch(() => collectorFormStore.provider, async (provider?: string) => {
    await getSecrets(provider);
}, { immediate: true });


onMounted(async () => {
    await store.dispatch('reference/serviceAccount/load');
});

</script>

<style lang="postcss" scoped>
.p-toolbox-table {
    border-color: transparent;
}
.edit-form {
    padding: 0 1rem 2.5rem 1rem;
    .save-changes-button {
        margin-left: 1rem;
    }
}
</style>
