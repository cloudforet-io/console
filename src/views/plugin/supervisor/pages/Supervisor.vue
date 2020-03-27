<template>
    <general-page-layout>
        <p-horizontal-layout>
            <template #container="{ height }">
                <p-dynamic-view view_type="query-search-table"
                                :api-handler="apiHandler"
                                :data_source="supervisorDataSource"
                                :vbind="{responsiveStyle:{'height': height+'px', 'overflow-y':'auto','overflow-x':'auto'}}"
                                :data="null"
                />
            </template>
        </p-horizontal-layout>
        <PTab v-if="apiHandler.tableTS.selectState.isSelectOne" :tabs="singleItemTab.state.tabs" :active-tab.sync="singleItemTab.syncState.activeTab">
            <template #detail>
                        <PDynamicDetails
                            :details="supervisorDetails"
                            :data="apiHandler.tableTS.selectState.firstSelectItem"
                        />
                        <p-dict-panel :dict.sync="apiHandler.tableTS.selectState.firstSelectItem.tags"  />
            </template>
            <template #plugin>
                <p-dynamic-view view_type="query-search-table"
                                :api-handler="pluginApiHandler"
                                :data_source="pluginDataSource"
                                :data="null"
                >
                    <template #toolbox-left>
                        <p-button style-type="primary-dark" :disabled="true">
                            {{ $t('PLUGIN.BTN.RECOVERY') }}
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
        </p-empty>
    </general-page-layout>
</template>

<script lang="ts">

import { defineComponent } from '@vue/composition-api';
import PHorizontalLayout from '@/components/organisms/layouts/horizontal-layout/HorizontalLayout.vue';
import PDynamicView from '@/components/organisms/dynamic-view/dynamic-view/DynamicView.vue';
import PDynamicDetails from '@/components/organisms/dynamic-view/dynamic-details/DynamicDetails.vue';


import PTab from '@/components/organisms/tabs/tab/Tab.vue';
import PButton from '@/components/atoms/buttons/Button.vue';
import PDropdownMenuBtn from '@/components/organisms/dropdown/dropdown-menu-btn/DropdownMenuBtn.vue';
import PQuerySearchTags from '@/components/organisms/search/query-search-tags/QuerySearchTags.vue';
import { makeTrItems } from '@/lib/view-helper';
import PRawData from '@/components/organisms/text-editor/raw-data/RawData.vue';
import PHr from '@/components/atoms/hr/Hr.vue';
import PRow from '@/components/atoms/grid/row/Row.vue';
import PEmpty from '@/components/atoms/empty/Empty.vue';
import { SearchQuery } from '@/components/organisms/search/query-search-bar/autocompleteHandler';
import SProjectTreeModal from '@/components/organisms/modals/tree-api-modal/ProjectTreeModal.vue';
import { QuerySearchTableToolSet } from '@/components/organisms/tables/toolbox-table/toolset';
import {QuerySearchTableACHandler} from "@/lib/api/auto-complete";
import {DataSourceItem, fluentApi, Tags} from "@/lib/fluent-api";
import {QuerySearchTableFluentAPI} from "@/lib/api/table";
import {AxiosResponse} from "axios";
import {CloudServiceListResp} from "@/lib/fluent-api/inventory/cloud-service";
import { TabBarState } from '@/components/molecules/tabs/tab-bar/toolset';
import GeneralPageLayout from "@/views/containers/page-layout/GeneralPageLayout.vue";
import PDictPanel from '@/components/organisms/panels/dict-panel/DictPanel_origin.vue';

export default {
    name: 'Supervisor',
    components: {
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
    props:{
        queryString:{
            type:String,
            default:''
        }
    },
    setup(props) {
        const keyAutoCompletes = ['name','hostname','state','is_public'];
        // const onlyFields = [...keyAutoCompletes];

        const singleItemTab = new TabBarState({
            tabs: makeTrItems([
                ['detail', 'TAB.DETAILS'],
                ['plugin', 'PLUGIN.TAB.PLUGIN'],
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

        const superviorACHandlerMeta = {
            handlerClass: QuerySearchTableACHandler,
            args: {
                keys: keyAutoCompletes,
                suggestKeys: keyAutoCompletes,
            },
        };
        const supervisorlistAction = fluentApi.plugin().supervisor().list();
            // .setOnly(...onlyFields);

        const apiHandler = new QuerySearchTableFluentAPI(
            supervisorlistAction,
            undefined,
            undefined,
            superviorACHandlerMeta,
        );

        const supervisorDataSource: DataSourceItem[]= [
            {name:'name',key:'name'},
            {name:'hostname',key:'hostname'},
            {name:'state',key:'state'},
            {name:'is_public',key:'is_public',view_type:'enum',view_option:{
                true:{ view_type:'badge'},
                false:{view_type:'badge'},
            }},
        ];

        const supervisorDetails = [
            {
                name:'Base Information',
                data_source:supervisorDataSource,
            }
        ];

        const pluginListAction = fluentApi.plugin().supervisorPlugin().list()

        const pluginKeyAutoCompletes = ['plugin_id','version','endpoint'];
        const pluginOnlyFields = [...keyAutoCompletes];
        const pluginACHandlerMeta = {
            handlerClass: QuerySearchTableACHandler,
            args: {
                keys: pluginKeyAutoCompletes,
                suggestKeys: pluginOnlyFields,
            },
        };

        const pluginApiHandler = new QuerySearchTableFluentAPI(
            pluginListAction,
            {
                striped: true,
                border: false,
                shadow: false,
                padding: false,
            },
            undefined,
            pluginACHandlerMeta
        );

        const pluginDataSource: DataSourceItem[]= [
            {name:'plugin_id',key:'plugin_id'},
            {name:'version',key:'version'},
            {name:'endpoint',key:'endpoint'},

        ];
        apiHandler.getData();
        return {
            apiHandler,
            supervisorDataSource,
            singleItemTab,
            pluginApiHandler,
            pluginDataSource,
            supervisorDetails,
            multiItemTab,
        };
    },
};
</script>

<style scoped>

</style>
