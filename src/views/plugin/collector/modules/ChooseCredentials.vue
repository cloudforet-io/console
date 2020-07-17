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
                              @click.stop="onClickRadioText(type)"
                        >
                            <p-radio v-model="proxyCrdType" :value="type" @change="listCredentials" />
                            <span class="radio-text">{{ crdTypeLabels[type] }}</span>
                        </span>
                    </p-col>
                    <p-col>
                        <p-search v-model="searchText"
                                  placeholder="Credential / Credential Group"
                                  @search="listCredentials"
                        />
                    </p-col>
                </p-row>
            </template>
            <template #col-credential_groups-format="{value}">
                <span>
                    <p-badge v-for="crdg in value"
                             :key="crdg.credential_group_id"
                             class="badge"
                             style-type="gray200"
                    >
                        {{ crdg.name }}
                    </p-badge>
                </span>
            </template>
            <template #col-go_credentials-format>
                <router-link :to="{
                                 path: '/secret/credentials-group',
                             }"
                             target="_blank"
                >
                    <p-button outline style-type="gray900">
                        {{ $t('INVENTORY.MANAGE_CRD') }}
                    </p-button>
                </router-link>
            </template>
            <template #col-tags-format="{value}">
                <p-dict-list :dict="value" />
            </template>
        </p-toolbox-table>
    </div>
</template>

<script>
import {
    reactive, toRefs, computed, watch,
} from '@vue/composition-api';
import CollectorEventBus from '@/views/plugin/collector/CollectorEventBus';
import { makeTrItems } from '@/lib/view-helper';
import { makeProxy } from '@/lib/compostion-util';

import PBadge from '@/components/atoms/badges/Badge.vue';
import PRow from '@/components/atoms/grid/row/Row.vue';
import PCol from '@/components/atoms/grid/col/Col.vue';
import PRadio from '@/components/molecules/forms/radio/Radio.vue';
import PSearch from '@/components/molecules/search/PSearch.vue';
import PToolboxTable from '@/components/organisms/tables/toolbox-table/ToolboxTable.vue';
import PButton from '@/components/atoms/buttons/Button.vue';
import PDictList from '@/components/molecules/lists/DictList.vue';
import { defaultQuery } from '@/lib/api/query';

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
        PDictList,
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
    setup(props, { emit, parent }) {
        const state = reactive({
            sortBy: '',
            sortDesc: '',
            pageSize: 10,
            thisPage: 1,
            searchText: '',
            crdTypes: ['Credentials Group', 'Credentials'],
            crdTypeLabels: computed(() => ({
                'Credentials Group': parent.$t('COMMON.CREDENTIAL_GRP'),
                Credentials: parent.$t('COMMON.CREDENTIALS'),
            })),
            proxyCrdType: makeProxy('crdType', props, emit),
            fields: {
                'Credentials Group': makeTrItems([
                    ['credential_group_id', 'COMMON.ID'],
                    ['name', 'COMMON.NAME'],
                    ['tags', 'COMMON.TAG'],
                    ['go_credentials', null, { label: ' ', sortable: false }],
                ], parent),
                Credentials: makeTrItems([
                    ['credential_id', 'COMMON.ID', { size: '400px' }],
                    ['name', 'COMMON.NAME', { size: '400px' }],
                    ['tags', 'COMMON.TAG'],
                    ['credential_groups', 'COMMON.GROUP', { size: '800px', sortable: false }],
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

        const onClickRadioText = (type) => {
            state.proxyCrdType = type;
            listCredentials();
        };

        listCredentials();

        return {
            ...toRefs(state),
            onClickRadioText,
            validate,
            allPage,
            listCredentials,
        };
    },
};
</script>

<style lang="postcss" scoped>
    .left-toolbox {
        width: 100%;
        .radios {
            margin-right: 1.125rem;
            cursor: pointer;
            .radio-text {
                margin-left: 0.5rem;
            }
        }
    }
    .badge {
        margin-right: .5rem;
    }
</style>
