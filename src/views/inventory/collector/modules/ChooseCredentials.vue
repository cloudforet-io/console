<template>
    <div>
        <p-toolbox-table :items="items"
                         :fields="fields[crdType]"
                         selectable
                         :multi-select="false"
                         sortable
                         hover
                         :border="false"
                         :shadow="false"
                         :sort-by.sync="sortBy"
                         :sort-desc.sync="sortDesc"
                         :all-page="allPage"
                         :this-page.sync="thisPage"
                         :select-index.sync="proxySelectIndex"
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
                <p-row class="left-toolbox" align-items="center">
                    <p-col :flex-grow="0">
                        <span v-for="type in crdTypes" :key="type"
                              class="radios"
                        >
                            <p-radio v-model="proxyCrdType" :value="type" @change="listCredentials" />
                            {{ type }}
                        </span>
                    </p-col>
                    <p-col>
                        <p-search :search-text.sync="searchText"
                                  search-placeholder="Credential / Credential Group"
                                  @onSearch="listCredentials"
                        />
                    </p-col>
                </p-row>
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
            <template #col-go_credentials-format>
                <router-link :to="{
                                 path: '/secret/credentials',
                                 query: {'plugin_id': pluginId}
                             }"
                             target="_blank"
                >
                    <p-button outline style-type="dark">
                        {{ tr('INVENTORY.CRT_CRD') }}
                    </p-button>
                </router-link><p-button />
            </template>
        </p-toolbox-table>
    </div>
</template>

<script>
import {
    reactive, toRefs, computed, watch,
} from '@vue/composition-api';
import { defaultQuery } from '@/lib/api';
import CollectorEventBus from '@/views/inventory/collector/CollectorEventBus';
import { makeTrItems } from '@/lib/view-helper';
import { timestampFormatter, getValue } from '@/lib/util';

import PBadge from '@/components/atoms/badges/Badge.vue';
import PRow from '@/components/atoms/grid/row/Row.vue';
import PCol from '@/components/atoms/grid/col/Col.vue';
import PRadio from '@/components/molecules/forms/radio/Radio.vue';
import PSearch from '@/components/molecules/search/Search.vue';
import PToolboxTable from '@/components/organisms/tables/toolbox-table/ToolboxTable.vue';
import PButton from '@/components/atoms/buttons/Button.vue';
import { makeProxy } from '@/lib/compostion-util';

export default {
    name: 'ChooseCredentials',
    components: {
        PBadge,
        PRow,
        PCol,
        PRadio,
        PSearch,
        PToolboxTable,
        PButton,
    },
    props: {
        items: Array,
        totalCount: Number,
        loading: Boolean,
        pluginId: String,
        /**
         * sync prop
         */
        crdType: String,
        /**
         * sync prop
         */
        selectIndex: Array,
    },
    setup(props, { emit, root, parent }) {
        const state = reactive({
            sortBy: '',
            sortDesc: '',
            pageSize: 10,
            thisPage: 1,
            searchText: '',
            crdTypes: ['Credentials Group', 'Credentials'],
            proxyCrdType: makeProxy('crdType', props, emit),
            fields: {
                'Credentials Group': makeTrItems([
                    ['credential_group_id', 'COMMON.ID'],
                    ['name', 'COMMON.NAME'],
                    ['created_at', 'COMMON.CREATE'],
                    ['go_credentials', ' '],
                ], parent),
                Credentials: makeTrItems([
                    ['credential_id', 'COMMON.ID', { size: '400px' }],
                    ['name', 'COMMON.NAME', { size: '400px' }],
                    ['issue_type', 'COMMON.ISSUE_TYPE', { size: '400px' }],
                    ['credential_groups', 'COMMON.GROUP', { size: '800px', sortable: false }],
                    ['created_at', 'COMMON.CREATED', { size: '300px' }],
                ], parent),
            },
            proxySelectIndex: makeProxy('selectIndex', props, emit),
        });

        const validate = () => props.selectIndex.length !== 0;


        const allPage = computed(() => Math.ceil(props.totalCount / state.pageSize) || 1);

        const query = computed(() => (defaultQuery(
            state.thisPage, state.pageSize,
            state.sortBy, state.sortDesc,
            state.searchText,
        )));

        watch(() => props.selectIndex, () => {
            emit('changeValidState', validate());
        });

        const listCredentials = () => {
            state.proxySelectIndex.selectIndex = [];
            CollectorEventBus.$emit('listCredentials', { query: query.value });
        };

        listCredentials();

        return {
            ...toRefs(state),
            validate,
            allPage,
            listCredentials,
            timestampFormatter,
        };
    },
};
</script>

<style lang="scss" scoped>
    .left-toolbox {
        width: 100%;
        .radios {
            margin-right: 1.125rem;
        }
    }
</style>
