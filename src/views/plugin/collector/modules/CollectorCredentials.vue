<template>
    <div>
        <p-query-search-table :items="items"
                              :fields="fields"
                              :loading="loading"
                              :total-count="totalCount"
                              :query-tags="queryTags"
                              :key-item-sets="querySearchHandlers.keyItemSets"
                              :value-handler-map="querySearchHandlers.valueHandlerMap"
                              :sort-by.sync="sortBy"
                              :sort-desc.sync="sortDesc"
                              :this-page.sync="thisPage"
                              :page-size.sync="pageSize"
                              :selectable="false"
                              :excel-visible="false"
                              use-cursor-loading
                              @change="onChange"
        >
            <template #toolbox-left>
                <p-panel-top use-total-count
                             :total-count="totalCount"
                >
                    {{ $t('PLUGIN.COLLECTOR.MAIN.CREDENTIALS_TITLE') }}
                </p-panel-top>
            </template>
            <template #col-service_account-format="{ item }">
                <router-link :to="referenceRouter(
                    item.service_account_id,
                    { resource_type: 'identity.ServiceAccount' })"
                >
                    <span class="reference-link">
                        <span class="text">{{ item.name }}</span>
                        <p-i name="ic_external-link" height="1em" width="1em" />
                    </span>
                </router-link>
            </template>
            <template #col-project_id-format="{ item }">
                <router-link :to="referenceRouter(
                    item.project_id,
                    { resource_type: 'identity.Project' })"
                >
                    <span class="reference-link">
                        <span class="text">{{ item.project_name }}</span>
                        <p-i name="ic_external-link" height="1em" width="1em" />
                    </span>
                </router-link>
            </template>
            <template #col-created_at-format="{value}">
                <span>{{ timestampFormatter(value) }}</span>
            </template>
            <template #col-collect-format="{item}">
                <p-button
                    :outline="true"
                    style-type="gray900" @click.stop="openCollectDataModal(item)"
                >
                    {{ $t('PLUGIN.COLLECTOR.MAIN.CREDENTIALS_COLLECT_DATA') }}
                </p-button>
            </template>
        </p-query-search-table>
        <collect-data-modal v-if="collectDataVisible"
                            :visible.sync="collectDataVisible"
                            :collector-id="collectorId"
                            :credential-id="targetCredentialId"
        />
    </div>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import {
    reactive, toRefs, computed, watch, getCurrentInstance, ComponentRenderProxy,
} from '@vue/composition-api';

import PQuerySearchTable from '@/components/organisms/tables/query-search-table/PQuerySearchTable.vue';
import PPanelTop from '@/components/molecules/panel/panel-top/PPanelTop.vue';
import PButton from '@/components/atoms/buttons/PButton.vue';
import PI from '@/components/atoms/icons/PI.vue';

import { timestampFormatter } from '@/lib/util';
import { QueryHelper, SpaceConnector } from '@/lib/space-connector';
import { getPageStart } from '@/lib/component-utils/pagination';
import { makeReferenceValueHandler } from '@/lib/component-utils/query-search';
import { referenceRouter } from '@/lib/reference/referenceRouter';
import { DataTableField } from '@/components/organisms/tables/data-table/type';
import { TimeStamp } from '@/models';
import { store } from '@/store';
import { QueryStore } from '@/lib/query';

const CollectDataModal = () => import('@/views/plugin/collector/modules/CollectDataModal.vue');


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
    tags: object;
}

export default {
    name: 'CollectorCredentials',
    components: {
        PI,
        PQuerySearchTable,
        PPanelTop,
        PButton,
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
    },
    setup(props) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const querySearchHandlers = {
            keyItemSets: [{
                title: 'Filters',
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
        const queryStore = new QueryStore().setKeyItemSets(querySearchHandlers.keyItemSets);

        const state = reactive({
            items: [] as any,
            totalCount: 0,
            loading: true,
            fields: [
                { name: 'name', label: 'Name' },
                { name: 'service_account', label: 'Service Account' },
                { name: 'project_id', label: 'Project' },
                { name: 'created_at', label: 'Created' },
                {
                    name: 'collect', label: ' ', sortable: false,
                },
            ] as DataTableField[],
            pageSize: 15,
            thisPage: 1,
            sortBy: '',
            sortDesc: true,
            collectDataVisible: false,
            targetCredentialId: null,
            queryTags: [],
        });

        const query = new QueryHelper();
        const getQuery = () => {
            const { filter, keyword } = queryStore.setFiltersAsQueryTag(state.queryTags)
                .addFilter({ k: 'provider', v: props.provider, o: '=' })
                .apiQuery;

            query.setFilter(...filter)
                .setPage(getPageStart(state.thisPage, state.pageSize), state.pageSize)
                .setSort(state.sortBy, state.sortDesc)
                .setKeyword(keyword);

            return query.data;
        };

        const listCredentials = async (): Promise<void> => {
            state.loading = true;
            try {
                const res = await SpaceConnector.client.secret.secret.list({
                    query: getQuery(),
                });
                state.items = res.results.map(d => ({
                    service_account_name: computed(() => store.state.resource.serviceAccount.items[d.service_account_id]?.label || d.service_account_id).value,
                    project_name: computed(() => store.state.resource.project.items[d.project_id]?.label || d.project_id).value,
                    ...d,
                }));
                state.totalCount = res.total_count;
            } catch (e) {
                console.error(e);
            } finally {
                state.loading = false;
            }
        };

        const onChange = async (item) => {
            state.queryTags = item.queryTags;
            await listCredentials();
        };

        const init = async () => {
            await Promise.all([
                store.dispatch('resource/serviceAccount/load'),
                store.dispatch('resource/project/load'),
            ]);
            await listCredentials();
        };
        init();

        watch(() => props.collectorId, () => {
            listCredentials();
        }, {
            immediate: false,
        });

        return {
            ...toRefs(state),
            querySearchHandlers,
            listCredentials,
            timestampFormatter,
            referenceRouter,
            openCollectDataModal(item: SecretModel) {
                state.collectDataVisible = true;
                // @ts-ignore
                state.targetCredentialId = item.secret_id || null as unknown as string;
            },
            onChange,
        };
    },
};
</script>

<style lang="postcss" scoped>
.p-toolbox-table {
    border-width: 0;
}
.p-data-table {
    .reference-link {
        &:hover {
            text-decoration: underline;
        }
        .text {
            margin-right: 0.125rem;
        }
    }
}
.credential-btn {
    float: right;
}
.p-panel-top {
    margin: 0;
}
</style>
