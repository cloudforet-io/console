<template>
    <div>
        <p-toolbox-table :items="items"
                         :fields="fields"
                         sortable
                         hover
                         :sort-by.sync="sortBy"
                         :sort-desc.sync="sortDesc"
                         :all-page="allPage"
                         :this-page.sync="thisPage"
                         :select-index.sync="selectIndex"
                         :page-size.sync="pageSize"
                         :setting-visible="false"
                         :loading="loading"
                         use-cursor-loading
                         @changePageSize="listCredentials"
                         @changePageNumber="listCredentials"
                         @clickRefresh="listCredentials"
                         @changeSort="listCredentials"
        >
            <template #toolbox-left>
                <p-panel-top use-total-count
                             :total-count="totalCount"
                >
                    {{ $t('PLUGIN.COLLECTOR.MAIN.CREDENTIALS_TITLE') }}
                </p-panel-top>
            </template>
            <template #col-created_at-format="{value}">
                {{ timestampFormatter(value) }}
            </template>
            <template #col-collect-format="{item}">
                <p-button
                    :outline="true"
                    style-type="gray900" @click.stop="openCollectDataModal(item)"
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
} from '@vue/composition-api';

import PToolboxTable from '@/components/organisms/tables/toolbox-table/PToolboxTable.vue';
import PPanelTop from '@/components/molecules/panel/panel-top/PPanelTop.vue';
import PButton from '@/components/atoms/buttons/PButton.vue';

import { timestampFormatter } from '@/lib/util';
import { QueryHelper, SpaceConnector } from '@/lib/space-connector';
import { getPageStart } from '@/lib/component-utils/pagination';
import { TimeStamp } from '@/models';
import { DataTableField } from '@/components/organisms/tables/data-table/type';

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
        PPanelTop,
        PToolboxTable,
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
        const state = reactive({
            items: [],
            totalCount: 0,
            loading: true,
            selectIndex: [],
            selectedItems: [],
            fields: [
                { name: 'name', label: 'Name', width: '400px' },
                { name: 'created_at', label: 'Created', width: '400px' },
                {
                    name: 'collect', label: ' ', width: '150px', sortable: false,
                },
            ] as DataTableField[],
            sortBy: '',
            sortDesc: '',
            pageSize: 10,
            thisPage: 1,
            allPage: computed(() => Math.ceil(state.totalCount / state.pageSize) || 1),
            collectDataVisible: false,
            targetCredentialId: null,
        });

        const listCredentials = async (): Promise<void> => {
            state.loading = true;
            try {
                const query = new QueryHelper()
                    .setFilter({ k: 'provider', v: props.provider, o: 'eq' })
                    .setPage(getPageStart(state.thisPage, state.pageSize), state.pageSize)
                    .setSort(state.sortBy, state.sortDesc);
                const res = await SpaceConnector.client.secret.secret.list({
                    query: query.data,
                });
                state.items = res.results;
                state.totalCount = res.total_count;
            } catch (e) {
                console.error(e);
            } finally {
                state.loading = false;
            }
        };

        const init = async () => {
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
            listCredentials,
            timestampFormatter,
            openCollectDataModal(item: SecretModel) {
                state.collectDataVisible = true;
                state.targetCredentialId = item.secret_id || null;
            },
        };
    },
};
</script>

<style lang="postcss" scoped>
.p-toolbox-table {
    border-width: 0;
}
.credential-btn {
    float: right;
}
.p-panel-top {
    margin: 0;
}
</style>
