<template>
    <p-vertical-page-layout2 :min-width="260" :init-width="260" :max-width="400">
        <template #sidebar="{width}">
            <div>
                <li v-for="provider in providers" @click="selectProvider=provider.name">{{provider.name}}</li>
            </div>
        </template>
        <template #default>
            <p-horizontal-layout>
                <template #container="{ height }">
                    <p-dynamic-view view_type="query-search-table"
                                    :api-handler="apiHandler"
                                    :data_source="accountDataSource"
                                    :vbind="{responsiveStyle:{'height': height+'px', 'overflow-y':'auto','overflow-x':'auto'}}"
                                    :data="null"
                    >
                        <template #toolbox-left>
                            <p-button style-type="primary-dark" :disabled="true">
                                {{ $t('BTN.ADD') }}
                            </p-button>
                        </template>
                    </p-dynamic-view>
                </template>
            </p-horizontal-layout>
            <PTab v-if="apiHandler.tableTS.selectState.isSelectOne" :tabs="singleItemTab.state.tabs" :active-tab.sync="singleItemTab.syncState.activeTab">
                <template #detail>
                    <PDynamicDetails
                            :details="accountDetails"
                            :data="apiHandler.tableTS.selectState.firstSelectItem"
                    />
                    <p-dict-panel :dict.sync="apiHandler.tableTS.selectState.firstSelectItem.tags"  />
                </template>
                <template #credentials>
                    <p-dynamic-view view_type="table"
                                    :api-handler="credsApiHandler"
                                    :data_source="credsDataSource"
                                    :data="null"
                    >
                        <template #toolbox-left>
                            <p-button style-type="primary-dark" :disabled="true">
                                {{ $t('BTN.ADD') }}
                            </p-button>
                            <p-button style-type="primary-dark" :disabled="true">
                                {{ $t('BTN.DELETE') }}
                            </p-button>
                        </template>
                    </p-dynamic-view>
                </template>
                <template #rawData>
                    <p-raw-data :item="apiHandler.tableTS.selectState.firstSelectItem" />
                </template>
            </PTab>
            <PTab v-else-if="apiHandler.tableTS.selectState.isSelectMulti"
                  :tabs="multiItemTab.state.tabs"
                  :active-tab.sync="multiItemTab.syncState.activeTab"
            >
                <template #data>
                    <p-dynamic-view
                            view_type="simple-table"
                            :data_source="supervisorDataSource"
                            :data="apiHandler.tableTS.selectState.selectItems"
                    />
                </template>
            </PTab>
            <p-empty v-else class="header">
                No Selected Item
            </p-empty>        </template>
    </p-vertical-page-layout2>
</template>

<script lang="ts">
    import {
        computed, defineComponent, reactive, ref, toRefs, watch,
    } from '@vue/composition-api';
import _ from 'lodash';
import PVerticalPageLayout2 from '@/views/containers/page-layout/VerticalPageLayout2.vue';
import PHorizontalLayout from '@/components/organisms/layouts/horizontal-layout/HorizontalLayout.vue';
import PDynamicView from '@/components/organisms/dynamic-view/dynamic-view/DynamicView.vue';
import PDynamicDetails from '@/components/organisms/dynamic-view/dynamic-details/DynamicDetails.vue';


import PTab from '@/components/organisms/tabs/tab/Tab.vue';
import PButton from '@/components/atoms/buttons/Button.vue';
import PDropdownMenuBtn from '@/components/organisms/dropdown/dropdown-menu-btn/DropdownMenuBtn.vue';
import PQuerySearchTags from '@/components/organisms/search/query-search-tags/QuerySearchTags.vue';
import { makeTrItems } from '@/lib/view-helper/index';
import PRawData from '@/components/organisms/text-editor/raw-data/RawData.vue';
import VerticalPageLayout from '@/views/containers/page-layout/VerticalPageLayout.vue';
import PHr from '@/components/atoms/hr/Hr.vue';
import PRow from '@/components/atoms/grid/row/Row.vue';
import PEmpty from '@/components/atoms/empty/Empty.vue';
import { SearchQuery } from '@/components/organisms/search/query-search-bar/autocompleteHandler';
import SProjectTreeModal from '@/components/organisms/modals/tree-api-modal/ProjectTreeModal.vue';
    import {QuerySearchTableToolSet, SearchTableToolSet} from '@/components/organisms/tables/toolbox-table/toolset';
import {QuerySearchTableACHandler} from "@/lib/api/auto-complete";
import {DataSourceItem, fluentApi, Tags} from "@/lib/fluent-api";
    import {QuerySearchTableFluentAPI, SearchTableFluentAPI } from "@/lib/api/table";
import {AxiosResponse} from "axios";
import {CloudServiceListResp} from "@/lib/fluent-api/inventory/cloud-service";
import { TabBarState } from '@/components/molecules/tabs/tab-bar/toolset';
import GeneralPageLayout from "@/views/containers/page-layout/GeneralPageLayout.vue";
import PDictPanel from '@/components/organisms/panels/dict-panel/DictPanel_origin.vue';

export default {
    name:'ServiceAccount',
    components: {
        PVerticalPageLayout2,
        PHorizontalLayout,
        PDynamicView,
        PTab,
        PButton,
        PRawData,
        PDropdownMenuBtn,
        PHr,
        PQuerySearchTags,
        PDynamicDetails,
        PRow,
        PEmpty,
        SProjectTreeModal,
        GeneralPageLayout,
        PDictPanel,
    },
    setup(props) {
        const state = reactive({
            providers:[
                {name:'AWS'},
                {name:'GCP'},
                {name:'AZURE'}
            ],
            selectProvider: 'AWS',
        });


        const singleItemTab = new TabBarState({
            tabs: makeTrItems([
                ['detail', 'TAB.DETAILS'],
                ['credentials', 'TAB.CREDENTIALS'],
                ['rawData', 'TAB.RAW_DATA'],
            ])
        });
        singleItemTab.syncState.activeTab = 'detail';

        const multiItemTab = new TabBarState({
            tabs: makeTrItems([
                ['data', 'TAB.DATA'],
            ])
        });
        multiItemTab.syncState.activeTab = 'data';

        const ACHandlerMeta = {
            handlerClass: QuerySearchTableACHandler,
            args: {
                keys: ['name'],
                suggestKeys: ['name'],
            },
        };
        const ListAction = fluentApi.identity().serviceAccount().list()

        const apiHandler = new QuerySearchTableFluentAPI(
            ListAction,
            undefined,
            undefined,
            ACHandlerMeta,
        );

        watch(()=>state.selectProvider, (provider, before) => {
            if (provider && provider !== before) {
                    apiHandler.resetAll();
                    apiHandler.action = apiHandler.action.setFixFilter(
                        { key: 'provider', operator: '=', value: provider },
                    );

                    apiHandler.action.debug('')
                    apiHandler.getData();
            }
        });

        const accountDataSource: DataSourceItem[]= [
            {name:'name',key:'name'},
            {name:'account',key:'account_id'},
            {name:'project',key:'project_id'},
        ];

        const accountDetails = [
            {
                name:'Base Information',
                data_source:accountDataSource,
            }
        ];

        const credsListAction = fluentApi.secret().secret().list();
        const credsApiHandler = new SearchTableFluentAPI(
            credsListAction,
            {
                striped: true,
                border: false,
                shadow: false,
                padding: false,
            },
        );


        const credsDataSource: DataSourceItem[]= [
            {name:'credentials',key:'credentials_id'},
            {name:'group',key:'group'},
        ];
        apiHandler.getData();
        return {
            ...toRefs(state),
            apiHandler,
            accountDataSource,
            singleItemTab,
            multiItemTab,
            accountDetails,
            credsApiHandler,
            credsDataSource,
        };
    },

};

</script>

<style lang="postcss" scoped>

</style>
