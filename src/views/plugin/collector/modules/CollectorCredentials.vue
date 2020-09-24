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
                    {{ $t('PANEL.CREDENTIAL') }}
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
                    {{ $t('COMMON.COL_DATA') }}
                </p-button>
            </template>
        </p-toolbox-table>

        <credential-verify-modal v-if="verifyModalVisible" :visible.sync="verifyModalVisible"
                                 :items="selectedItems"
        />

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

import { makeTrItems } from '@/lib/view-helper';
import { timestampFormatter } from '@/lib/util';
import { QueryHelper, SpaceConnector } from '@/lib/space-connector';
import { getPageStart } from '@/lib/component-utils/pagination';
import { TimeStamp } from '@/models';

const CollectDataModal = () => import('@/views/plugin/collector/modules/CollectDataModal.vue');
const CredentialVerifyModal = () => import('@/views/plugin/collector/modules/CredentialVerifyModal.vue');
interface SecretModel {
    // eslint-disable-next-line camelcase
    secret_id: string;
    name: string;
    // eslint-disable-next-line camelcase
    secret_type: 'CREDENTIALS'|'CONFIG'|string;
    'secret_groups': string[];
    'schema': string ;
    'provider': string;
    'service_account_id': string;
    'project_id': string;
    'domain_id': string;
    // eslint-disable-next-line camelcase
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
        CredentialVerifyModal,
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
            fields: computed(() => [
                ...makeTrItems([
                    ['name', 'COMMON.NAME', { size: '400px' }],
                    ['created_at', 'COMMON.CREATED', { size: '300px' }],
                ], null),
                { name: 'collect', label: ' ', sortable: false },
            ]),
            sortBy: '',
            sortDesc: '',
            pageSize: 10,
            thisPage: 1,
            allPage: computed(() => Math.ceil(state.totalCount / state.pageSize) || 1),
            verifyModalVisible: false,
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
