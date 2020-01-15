<template>
    <div>
        <p-toolbox-table :items="items"
                         :fields="fields"
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
                            <p-radio v-model="crdType" :value="type" />
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
                <p-tag v-for="crdg in value" :key="crdg.credential_group_id" :deletable="false">
                    {{ crdg.name }}
                </p-tag>
            </template>
        </p-toolbox-table>
    </div>
</template>

<script>
import {
    reactive, toRefs, computed,
} from '@vue/composition-api';
import { defaultQuery } from '@/lib/api';
import CollectorEventBus from '@/views/inventory/collector/CollectorEventBus';

import PRow from '@/components/atoms/grid/row/Row.vue';
import PCol from '@/components/atoms/grid/col/Col.vue';
import PRadio from '@/components/molecules/forms/radio/Radio.vue';
import PSearch from '@/components/molecules/search/Search.vue';
import PToolboxTable from '@/components/organisms/tables/toolbox-table/ToolboxTable.vue';
import PTag from '@/components/molecules/tags/Tag.vue';


export default {
    name: 'ChooseCredentials',
    components: {
        PRow,
        PCol,
        PRadio,
        PSearch,
        PToolboxTable,
        PTag,
    },
    props: {
        items: Array,
        fields: Array,
        totalCount: Number,
        loading: Boolean,
    },
    setup(props) {
        const state = reactive({
            sortBy: '',
            sortDesc: '',
            pageSize: 10,
            thisPage: 1,
            searchText: '',
            selectIndex: null,
            crdTypes: ['Credentials Group', 'Credentials'],
            crdType: 'Credentials',
        });

        const allPage = computed(() => Math.ceil(props.totalCount / state.pageSize) || 1);

        const query = computed(() => (defaultQuery(
            state.thisPage, state.pageSize,
            state.sortBy, state.sortDesc,
            state.searchText,
        )));

        const listCredentials = () => {
            if (state.crdType === 'Credentials') CollectorEventBus.$emit('listCredentials', query.value);
            else CollectorEventBus.$emit('listCredentialsGroup', query.value);
        };

        listCredentials();

        return {
            ...toRefs(state),
            allPage,
            listCredentials,
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
