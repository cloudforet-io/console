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
        <!-- TODO: bind other props of PToolboxTable -->
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

import type { ServiceAccountReferenceMap } from '@/store/modules/reference/service-account/type';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useQueryTags } from '@/common/composables/query-tags';

import AttachedServiceAccountForm from '@/services/asset-inventory/collector/shared/collector-forms/AttachedServiceAccountForm.vue';
import { useCollectorFormStore } from '@/services/asset-inventory/collector/shared/collector-forms/collector-form-store';
import type { SecretModel } from '@/services/asset-inventory/collector/type';


const collectorFormStore = useCollectorFormStore();

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
    // query states
    pageLimit: 15,
    pageStart: 1,
    sortBy: 'name',
    sortDesc: true,
    totalCount: 0,
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

const handleClickEdit = () => {
    state.isEditMode = true;
};

const handleChangeIsAttachedServiceAccountValid = () => {
    // TODO: implement
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

const handleClickSave = () => {
    state.isEditMode = false;
    // TODO: Save changes
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
