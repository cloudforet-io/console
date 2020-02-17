<template>
    <div>
        <p-panel-top>
            {{$t('PANEL.CREDENTIAL') }}
            <template #head>
                <router-link class="credential-btn" :to="credentialPath" target="_blank">
                    <p-button outline style-type="dark">
                        {{$t('INVENTORY.MANAGE_CRD') }}
                    </p-button>
                </router-link>
            </template>
        </p-panel-top>
        <p-toolbox-table :items="items"
                         :fields="fields"
                         sortable
                         hover
                         :border="false"
                         :shadow="false"
                         :sort-by.sync="sortBy"
                         :sort-desc.sync="sortDesc"
                         :all-page="allPage"
                         :this-page.sync="thisPage"
                         :select-index.sync="selectIndex"
                         :page-size.sync="pageSize"
                         :setting-visible="false"
                         :loading="loading"
                         use-spinner-loading
                         use-cursor-loading
                         @changePageSize="listCredentials"
                         @changePageNumber="listCredentials"
                         @clickRefresh="listCredentials"
                         @changeSort="listCredentials"
        >
            <template #toolbox-left>
                <!--                <p-button style-type="safe" :disabled="selectedItems.length === 0"-->
                <!--                          @click="onClickVerify"-->
                <!--                >-->
                <!--                    {{$t('COMMON.VERIFY') }}-->
                <!--                </p-button>-->
            </template>
            <template #col-credential_groups-format="{value}">
                <span>
                    <p-badge v-for="crdg in value"
                             :key="crdg.credential_group_id"
                             style-type="gray2"
                    >
                        {{ crdg.name }}
                    </p-badge>
                </span>
            </template>
            <template #col-created_at-format="{value}">
                {{ timestampFormatter(value) }}
            </template>
            <template #col-collect-format="{item}">
                <p-button outline style-type="dark" @click.stop="$emit('collectData', item)">
                    {{$t('COMMON.COL_DATA') }}
                </p-button>
            </template>
        </p-toolbox-table>

        <credential-verify-modal v-if="verifyModalVisible" :visible="verifyModalVisible"
                                 :items="selectedItems"
        />
    </div>
</template>

<script>
import {
    reactive, toRefs, computed, ref, watch,
} from '@vue/composition-api';
import _ from 'lodash';
import { defaultQuery } from '@/lib/api';
import { makeTrItems } from '@/lib/view-helper';
import { timestampFormatter } from '@/lib/util';
import CollectorEventBus from '@/views/inventory/collector/CollectorEventBus';

import PPanelTop from '@/components/molecules/panel/panel-top/PanelTop.vue';
import PToolboxTable from '@/components/organisms/tables/toolbox-table/ToolboxTable.vue';
import PButton from '@/components/atoms/buttons/Button.vue';
import PBadge from '@/components/atoms/badges/Badge.vue';
import { makeProxy } from '@/lib/compostion-util';

const CredentialVerifyModal = () => import('@/views/inventory/collector/modules/CredentialVerifyModal.vue');

export default {
    name: 'CollectorCredentials',
    components: {
        PPanelTop,
        PToolboxTable,
        PButton,
        PBadge,
        CredentialVerifyModal,
    },
    props: {
        collector: Object,
        totalCount: Number,
        items: Array,
        loading: Boolean,
        selectIndex: Array,
        selectedItems: Array,
        /**
         * sync prop
         */
        verifyModalVisible: Boolean,
    },
    setup(props, { parent, emit, root }) {
        const state = reactive({
            fields: [
                ...makeTrItems([
                    ['credential_id', 'COMMON.ID', { size: '400px' }],
                    ['name', 'COMMON.NAME', { size: '400px' }],
                    ['issue_type', 'COMMON.ISSUE_TYPE', { size: '400px' }],
                    ['credential_groups', 'COMMON.GROUP', { size: '800px', sortable: false }],
                    ['created_at', 'COMMON.CREATED', { size: '300px' }],
                ], parent),
                { name: 'collect', label: ' ', sortable: false }],
            sortBy: '',
            sortDesc: '',
            pageSize: 10,
            thisPage: 1,
            allPage: computed(() => Math.ceil(props.totalCount / state.pageSize) || 1),
            onClickVerify() { emit('verifyModalVisible:update', true); },
            credentialPath: computed(() => (_.get(props.collector, 'plugin_info.credential_id')
                ? '/secret/credentials' : '/secret/credentials-group')),
        });

        const query = computed(() => (defaultQuery(
            state.thisPage, state.pageSize,
            state.sortBy, state.sortDesc,
        )));

        const listCredentials = () => {
            CollectorEventBus.$emit('listCredentialsByCollector', query.value);
        };


        listCredentials();

        watch(() => props.collector, () => {
            listCredentials();
        });

        return {
            ...toRefs(state),
            listCredentials,
            timestampFormatter,
        };
    },
};
</script>

<style lang="scss" scoped>
.credential-btn {
    margin-left: auto;
}
</style>
