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

import { fluentApi } from '@/lib/fluent-api';
import { SecretModel } from '@/lib/fluent-api/secret/secret';
import { makeTrItems } from '@/lib/view-helper';
import { timestampFormatter } from '@/lib/util';

const CollectDataModal = () => import('@/views/plugin/collector/modules/CollectDataModal.vue');
const CredentialVerifyModal = () => import('@/views/plugin/collector/modules/CredentialVerifyModal.vue');

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

        const listApi = computed(() => fluentApi.secret().secret().list()
            .setPageSize(state.pageSize)
            .setThisPage(state.thisPage)
            .setSortBy(state.sortBy)
            .setSortDesc(state.sortDesc));

        const listCredentials = async (): Promise<void> => {
            state.loading = true;
            try {
                const res = await listApi.value.execute();
                state.items = res.data.results;
                state.totalCount = res.data.total_count;
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
