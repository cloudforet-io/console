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
                <p-row class="left-toolbox" align-items="center">
                    <p-col :flex-grow="0">
                        <span v-for="type in crdTypes" :key="type"
                              class="radios"
                        >
                            <p-radio v-model="crdType" :value="type" @change="listCredentials" />
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
                    <p-tag v-for="crdg in value" :key="crdg.credential_group_id" :deletable="false">
                        {{ crdg }}
                    </p-tag>
                </span>
            </template>
            <template #col-created_at-format="data">
                {{ timestampFormatter(data.value) }}
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

import PRow from '@/components/atoms/grid/row/Row.vue';
import PCol from '@/components/atoms/grid/col/Col.vue';
import PRadio from '@/components/molecules/forms/radio/Radio.vue';
import PSearch from '@/components/molecules/search/Search.vue';
import PToolboxTable from '@/components/organisms/tables/toolbox-table/ToolboxTable.vue';

export const crdState = reactive({
    items: [],
    totalCount: 0,
    loading: true,
    query: undefined,
    selectIndex: [],
    crdType: 'Credentials'
});

export default {
    name: 'ChooseCredentials',
    components: {
        PRow,
        PCol,
        PRadio,
        PSearch,
        PToolboxTable,
    },
    setup(props, { emit, root }) {
        const state = reactive({
            sortBy: '',
            sortDesc: '',
            pageSize: 10,
            thisPage: 1,
            searchText: '',
            crdTypes: ['Credentials Group', 'Credentials'],
            fields: {
                'Credentials Group': makeTrItems([
                    ['credential_group_id', 'COMMON.ID'],
                    ['name', 'COMMON.NAME'],
                    ['created_at', 'COMMON.CREATE'],
                ], root),
                Credentials: makeTrItems([
                    ['credential_id', 'COMMON.ID', { size: '400px' }],
                    ['name', 'COMMON.NAME', { size: '400px' }],
                    ['issue_type', 'COMMON.ISSUE_TYPE', { size: '400px' }],
                    ['credential_groups', 'COMMON.GROUP', { size: '800px', sortable: false }],
                    ['created_at', 'COMMON.CREATED', { size: '300px' }],
                ], root),
            },
        });

        const validate = () => crdState.selectIndex.length !== 0;

        watch(() => crdState.selectIndex, () => {
            emit('changeValidState', validate());
        });

        const allPage = computed(() => Math.ceil(crdState.totalCount / state.pageSize) || 1);

        crdState.query = computed(() => (defaultQuery(
            state.thisPage, state.pageSize,
            state.sortBy, state.sortDesc,
            state.searchText,
        )));

        const listCredentials = () => {
            if (crdState.crdType === 'Credentials') CollectorEventBus.$emit('listCredentials');
            else CollectorEventBus.$emit('listCredentialsGroup');
        };

        listCredentials();

        return {
            ...toRefs(crdState),
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
