<template>
    <p-vertical-page-layout2 :min-width="260" :init-width="260" :max-width="400">
        <template #sidebar="{width}">
            <PSelectableList
                    class="w-full"
                    v-bind="listToolset.state"
                    :selectedIndexes.sync="listToolset.syncState.selectedIndexes"
            ></PSelectableList>
        </template>
        <template #default>
            <template v-if="!listToolset.selectState.isNotSelected">
                <div class="w-full h-full">
                <p-horizontal-layout>
                    <template #container="{ height }">
                        <p-dynamic-view view_type="table"
                                        :api-handler="apiHandler"
                                        :data_source="accountDataSource"
                                        :vbind="{
                                          responsiveStyle:{'height': height+'px', 'overflow-y':'auto','overflow-x':'auto'}
                                        }"
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
                                        :api-handler="secretApiHandler"
                                        :data_source="secretDataSource"
                                        :data="null"
                        >
                            <template #toolbox-left>
                                <p-button style-type="primary-dark" :disabled="true">
                                    {{ $t('BTN.ADD') }}
                                </p-button>
                                <p-button style-type="primary-dark" :disabled="secretApiHandler.tableTS.selectState.isNotSelected">
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
                <p-empty v-else style="height: auto;margin-top:4rem ">
                    No Selected Item
                </p-empty>
                </div>
            </template>
                <p-empty v-else class="header">
                    No Selected Provider
                </p-empty>
              </template>
    </p-vertical-page-layout2>
</template>

<script lang="ts">
    import {
        computed, defineComponent, watch,
    } from '@vue/composition-api';
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
import PHr from '@/components/atoms/hr/Hr.vue';
import PRow from '@/components/atoms/grid/row/Row.vue';
import PEmpty from '@/components/atoms/empty/Empty.vue';
import { SearchQuery } from '@/components/organisms/search/query-search-bar/autocompleteHandler';
import SProjectTreeModal from '@/components/organisms/modals/tree-api-modal/ProjectTreeModal.vue';
import {QuerySearchTableToolSet, SearchTableToolSet} from '@/components/organisms/tables/toolbox-table/toolset';
import {QuerySearchTableACHandler} from "@/lib/api/auto-complete";
import {DataSourceItem, fluentApi, Tags} from "@/lib/fluent-api";
    import {QuerySearchTableFluentAPI, SearchTableFluentAPI, TabSearchTableFluentAPI} from "@/lib/api/table";
import {AxiosResponse} from "axios";
import {CloudServiceListResp} from "@/lib/fluent-api/inventory/cloud-service";
import { TabBarState } from '@/components/molecules/tabs/tab-bar/toolset';
import GeneralPageLayout from "@/views/containers/page-layout/GeneralPageLayout.vue";
import PDictPanel from '@/components/organisms/panels/dict-panel/DictPanel_origin.vue';
import PSelectableList from '@/components/organisms/lists/selectable-list/SelectableList.vue';
import {SelectableListToolset} from "@/components/organisms/lists/selectable-list/SelectableList.toolset";
import {ProviderModel} from "@/lib/fluent-api/identity/provider";

export default defineComponent( {
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
        PSelectableList,
    },
    props:{
      query:{
          type:Object,
          default:()=>({})
      },
    },
    setup() {
        const listToolset = new SelectableListToolset<unknown,unknown,ProviderModel>();
        listToolset.state.mapper.iconUrl = 'tags.icon';
        listToolset.state.mapper.key = 'proivder';
        listToolset.state.mapper.title = 'name';

        const providerListAPI = fluentApi.identity().provider().list().setOnly(
            'name',
            'provider',
            'tags.icon',
            'template.service_account.data',
        );

        providerListAPI.execute().then((resp)=>{
            listToolset.state.items = resp.data.results;
            listToolset.syncState.selectedIndexes = [0];
        });

        const accountDataSource = computed<DataSourceItem[]>(()=>{
            if (listToolset.selectState.isSelectOne){
                return[
                    {name:'name',key:'name'},
                    ...listToolset.selectState.firstSelectItem.template.service_account.data.map((item)=>{
                        return {
                            name: item.name,
                            key:item.key ,
                            view_type: 'text',
                        }
                    })
                ]
            }
            return []
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


        const ListAction = fluentApi.identity().serviceAccount().list();

        const apiHandler = new SearchTableFluentAPI(ListAction,{
            shadow:true,
            border:true,
            padding:true,
            selectable:true,
            dragable:true,
        });

        watch(()=>listToolset.selectState.firstSelectItem, (item, before) => {
            if (item&&item.provider && item.provider !== before.provider) {
                    apiHandler.resetAll();
                    apiHandler.action = ListAction.setFixFilter(
                        { key: 'provider', operator: '=', value: item.provider },
                    );
                    apiHandler.getData();
            }
        });


        const accountDetails = computed(()=>{
            return [
                {
                    name:'Base Information',
                    data_source:accountDataSource.value,
                }
            ];
        });

        const secretIsShow = computed(()=>{
            return apiHandler.tableTS.selectState.isSelectOne && singleItemTab.syncState.activeTab === 'credentials'
        });

        const secretListAction = fluentApi.secret().secret().list();
        const secretApiHandler = new TabSearchTableFluentAPI(
            secretListAction,
            secretIsShow,
            {
                striped: true,
                border: false,
                shadow: false,
                padding: false,
                multiSelect:false,
            },
        );

        watch(()=>apiHandler.tableTS.selectState.firstSelectItem, (item, before) => {
            if (item&&item.service_account_id && item.service_account_id !== before.service_account_id) {
                secretApiHandler.resetAll();
                secretApiHandler.action = secretListAction.setFixFilter(
                    { key: 'service_account_id', operator: '=', value: item.service_account_id },
                );
                if (secretIsShow.value){
                    secretApiHandler.getData();
                }
            }
        });


        const secretDataSource: DataSourceItem[]= [
            {name:'Secret',key:'secret_id'},
            {name:'Name',key:'name'},
            {
                name: 'Created at',
                key: 'created_at.seconds',
                view_type: 'datetime',
                view_option: {
                    source_type: 'timestamp',
                    source_format: 'seconds',
                },
            },
        ];
        apiHandler.getData();
        return {
            apiHandler,
            accountDataSource,
            singleItemTab,
            multiItemTab,
            accountDetails,
             secretApiHandler,
             secretDataSource,
            listToolset,
        };
    },

});

</script>

<style lang="postcss" scoped>

</style>
