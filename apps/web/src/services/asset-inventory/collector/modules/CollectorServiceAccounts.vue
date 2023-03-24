<template>
    <div class="collector-credentials">
        <p-heading heading-type="sub"
                   use-total-count
                   :total-count="totalCount"
                   :title="$t('PLUGIN.COLLECTOR.MAIN.SERVICE_ACCOUNT')"
        />
        <p-toolbox-table search-type="query"
                         :items="items"
                         :fields="fields"
                         :loading="loading"
                         :total-count="totalCount"
                         :query-tags="queryTags"
                         :key-item-sets="querySearchHandlers.keyItemSets"
                         :value-handler-map="querySearchHandlers.valueHandlerMap"
                         :sort-by.sync="sortBy"
                         :sort-desc.sync="sortDesc"
                         :page-size.sync="pageLimit"
                         searchable
                         use-cursor-loading
                         @change="onChange"
        >
            <template #col-service_account_id-format="{ value }">
                <p-anchor :to="referenceRouter(
                    value,
                    { resource_type: 'identity.ServiceAccount' })"
                >
                    {{ serviceAccounts[value] ? serviceAccounts[value].label : value }}
                </p-anchor>
            </template>
            <template #col-project_id-format="{ value }">
                <p-anchor :to="referenceRouter(
                    value,
                    { resource_type: 'identity.Project' })"
                >
                    {{ projects[value] ? projects[value].label : value }}
                </p-anchor>
            </template>
            <template #col-created_at-format="{value}">
                <span>{{ iso8601Formatter(value, timezone) }}</span>
            </template>
            <template #col-collect-format="{item}">
                <p-button style-type="tertiary"
                          :disabled="!hasManagePermission"
                          @click.stop="openCollectDataModal(item)"
                >
                    {{ $t('PLUGIN.COLLECTOR.MAIN.CREDENTIALS_COLLECT_DATA') }}
                </p-button>
            </template>
        </p-toolbox-table>
        <collect-data-modal v-if="collectDataVisible"
                            :visible.sync="collectDataVisible"
                            :collector-id="collectorId"
                            :credential-id="targetCredentialId"
        />
    </div>
</template>

<script lang="ts">
import {
    reactive, toRefs, computed, watch,
} from 'vue';

import {
    PHeading, PButton, PAnchor, PToolboxTable,
} from '@spaceone/design-system';
import type { DataTableField } from '@spaceone/design-system/types/data-display/tables/data-table/type';

import { iso8601Formatter } from '@cloudforet/core-lib';
import { makeReferenceValueHandler } from '@cloudforet/core-lib/component-util/query-search';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import type { TimeStamp } from '@/models';
import { store } from '@/store';

import type { ProjectReferenceMap } from '@/store/modules/reference/project/type';
import type { ServiceAccountReferenceMap } from '@/store/modules/reference/service-account/type';

import { referenceRouter } from '@/lib/reference/referenceRouter';

import ErrorHandler from '@/common/composables/error/errorHandler';

const CollectDataModal = () => import('@/services/asset-inventory/collector/modules/CollectDataModal.vue');

interface SecretModel {
    secret_id: string;
    name: string;
    secret_type: 'CREDENTIALS'|'CONFIG'|string;
    'secret_groups': string[];
    'schema': string ;
    'provider': string;
    'service_account_id': string;
    'project_id': string;
    'domain_id': string;
    created_at: TimeStamp;
    tags: any;
}

export default {
    name: 'CollectorServiceAccounts',
    components: {
        PToolboxTable,
        PHeading,
        PButton,
        PAnchor,
        CollectDataModal,
    },
    props: {
        collectorId: {
            type: String,
            required: true,
        },
        provider: {
            type: String,
            required: true,
        },
        hasManagePermission: {
            type: Boolean,
            default: undefined,
        },
    },
    setup(props) {
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

        const state = reactive({
            timezone: computed(() => store.state.user.timezone),
            items: [] as any,
            totalCount: 0,
            loading: true,
            fields: [
                { name: 'service_account_id', label: 'Service Account' },
                { name: 'project_id', label: 'Project' },
                { name: 'created_at', label: 'Created' },
                {
                    name: 'collect', label: ' ', sortable: false,
                },
            ] as DataTableField[],
            pageLimit: 15,
            pageStart: 1,
            sortBy: 'name',
            sortDesc: true,
            collectDataVisible: false,
            targetCredentialId: null as string | null,
            queryTags: [],
            serviceAccounts: computed<ServiceAccountReferenceMap>(() => store.getters['reference/serviceAccountItems']),
            projects: computed<ProjectReferenceMap>(() => store.getters['reference/projectItems']),
        });

        const apiQuery = new ApiQueryHelper().setKeyItemSets(querySearchHandlers.keyItemSets);
        const getQuery = () => {
            apiQuery.setPage(state.pageStart, state.pageLimit)
                .setSort(state.sortBy, state.sortDesc)
                .setFiltersAsQueryTag(state.queryTags)
                .addFilter({ k: 'provider', v: props.provider, o: '=' });

            return apiQuery.data;
        };

        const listCredentials = async (): Promise<void> => {
            state.loading = true;
            try {
                const res = await SpaceConnector.client.secret.secret.list({
                    query: getQuery(),
                });
                state.items = res.results;
                state.totalCount = res.total_count;
            } catch (e) {
                ErrorHandler.handleError(e);
                state.items = [];
                state.totalCount = 0;
            } finally {
                state.loading = false;
            }
        };

        const onChange = async (options) => {
            if (options.sortBy !== undefined) {
                state.sortBy = options.sortBy;
                state.sortDesc = options.sortDesc;
            }
            if (options.pageStart !== undefined) state.pageStart = options.pageStart;
            if (options.pageLimit !== undefined) state.pageLimit = options.pageLimit;
            if (options.queryTags !== undefined) state.queryTags = options.queryTags;

            await listCredentials();
        };

        (async () => {
            await Promise.allSettled([
                // LOAD REFERENCE STORE
                store.dispatch('reference/serviceAccount/load'),
                store.dispatch('reference/project/load'),
                listCredentials(),
            ]);
        })();

        watch(() => props.collectorId, () => {
            listCredentials();
        }, {
            immediate: false,
        });

        return {
            ...toRefs(state),
            querySearchHandlers,
            listCredentials,
            iso8601Formatter,
            referenceRouter,
            openCollectDataModal(item: SecretModel) {
                state.collectDataVisible = true;
                state.targetCredentialId = item.secret_id || null as unknown as string;
            },
            onChange,
        };
    },
};
</script>

<style lang="postcss" scoped>
.collector-credentials {
    .p-heading {
        margin-bottom: 0;
    }
}
.p-toolbox-table {
    border-width: 0;
}
</style>
