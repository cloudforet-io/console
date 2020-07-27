<template>
    <general-page-layout class="h-screen">
        <PPageTitle class="mt-4">
            <template #title>
                <i class="fas fa-database text-blue-400 " /> Choice Data Mode
            </template>
        </PPageTitle>
        <p-tab class="w-full" :tabs="modeTab.state.tabs"
               :active-tab.sync="modeTab.syncState.activeTab"
        >
            <template #api>
                <div class="tab-content toolbar">
                    <div class="tool-area">
                        <div class="label">
                            서비스
                        </div>
                        <div>
                            <PSelectDropdown v-model="selectService" :items="serviceList" @onSelected="selectResource=''" />
                        </div>
                    </div>
                    <div class="tool-area">
                        <div class="label">
                            리소스
                        </div>
                        <div>
                            <PSelectDropdown v-model="selectResource" :disabled="!selectService" :items="resourceList" />
                        </div>
                    </div>
                </div>
            </template>
            <template #raw>
                <div class="tab-content">
                    table 모드에서 단일 아이템을 넣으면 해당 아이템으로 리스트를 생성합니다.
                </div>
            </template>
        </p-tab>
        <HorizontalLayout>
            <template #container="{height}">
                <PPageTitle class="mt-8 mb-4">
                    <template #title>
                        <i class="fas fa-edit text-green-400" /> Edit Schema
                    </template>
                </PPageTitle>
                <p-tab class="w-full" :tabs="typeTab.state.tabs"
                       :active-tab.sync="typeTab.syncState.activeTab"
                >
                    <template #subData>
                        <div class="tab-content">
                            <div v-if="subDataDefaultSchema">
                                <PCheckBox v-model="subDataDefault" />   use Default
                            </div>
                            <transition name="fade">
                                <PMonacoEditor v-if="!(subDataDefault&&subDataDefaultSchema)" :style="{height:height+'px'}"
                                               :code.sync="subDataSchema"
                                />
                                <RawData v-else :item="subDataDefaultSchema" :style="{height:height+'px'}" />
                            </transition>
                        </div>
                    </template>
                    <template #table>
                        <div class="tab-content">
                            <div v-if="tableDefaultSchema">
                                <PCheckBox v-model="tableDefault" />  use Default
                            </div>
                            <transition name="fade">
                                <PMonacoEditor v-if="!(tableDefault&&tableDefaultSchema)" :style="{height:height+'px'}" :code.sync="tableSchema" />
                                <RawData v-else :item="tableDefaultSchema" :style="{height:height+'px'}" />
                            </transition>
                        </div>
                    </template>
                </p-tab>
            </template>
        </HorizontalLayout>

        <PPageTitle class="mt-8">
            <template #title>
                <i class="fas fa-smile-wink text-yellow-400" />  Result
            </template>
            <template #extra-area>
                <p-button class="ml-4" style-type="primary" outline
                          @click="forceRefresh"
                >
                    Force Refresh
                </p-button>
            </template>
        </PPageTitle>
        <PPaneLayout v-if="modeTab.syncState.activeTab==='api'&&!(selectResource&&selectService)">
            <div class="p-8 text-lg font-bold border-red-800 bg-red-100 text-red-500">
                <i class="fas fa-exclamation-triangle" /> &nbsp;서비스와 리소스를 선택해주세요!
            </div>
        </PPaneLayout>
        <PPaneLayout v-else>
            <div class="p-4 font-bold border-blue-800 bg-blue-100 text-blue-500">
                <i class="fas fa-info-circle" /> &nbsp; 스키마 혹은 데이터가 제대로 반영 안될 경우 Force Refresh를 눌러주세요
            </div>
            <div v-if="modeTab.syncState.activeTab==='api'&&noData" class="p-4 font-bold border-red-800 bg-red-100 text-red-500">
                <i class="fas fa-exclamation-triangle" /> &nbsp;서버에 해당 리소스의 데이터가 없습니다!
            </div>
            <transition name="fade">
                <div v-if="refresh" class="tab-content">
                    <transition name="fade">
                        <s-dynamic-sub-data
                            v-if="typeTab.syncState.activeTab==='subData'"
                            :layouts="layouts"
                            :resource-api="resourceApi"
                            :select-id="selectedId"
                            :is-show="typeTab.syncState.activeTab==='subData'"
                        />
                        <s-dynamic-layout
                            v-else
                            v-bind="layout"
                            :api="{resource:resourceApi}"
                            :is-show="typeTab.syncState.activeTab==='table'"
                        />
                    </transition>
                </div>
            </transition>
        </PPaneLayout>
    </general-page-layout>
</template>
<script lang="ts">
import {
    computed, getCurrentInstance, reactive, toRefs, watch,
} from '@vue/composition-api';
import GeneralPageLayout from '@/views/containers/page-layout/GeneralPageLayout.vue';
import PPaneLayout from '@/components/molecules/layouts/pane-layout/PPaneLayout.vue';
import PSelectDropdown from '@/components/organisms/dropdown/select-dropdown/PSelectDropdown.vue';
import PTab from '@/components/organisms/tabs/tab/PTab.vue';
import { TabBarState } from '@/components/molecules/tabs/tab-bar/PTabBar.toolset';
import { fluentApi, Resource } from '@/lib/fluent-api';
import SDynamicLayout from '@/components/organisms/dynamic-view/dynamic-layout/SDynamicLayout.vue';
import SDynamicSubData from '@/components/organisms/dynamic-view/dynamic-subdata/SDynamicSubData.vue';
import PPageTitle from '@/components/organisms/title/page-title/PPageTitle.vue';
import PMonacoEditor from '@/components/molecules/text-editor/monaco/PMonacoEditor.vue';
import PCheckBox from '@/components/molecules/forms/checkbox/PCheckBox.vue';
import RawData from '@/components/organisms/text-editor/raw-data/PRawData.vue';
import ServerSD from '@/data-schema/inventory/server/sub_data/layouts/base_info.json';
import ServerTable from '@/data-schema/inventory/server/table/layout/base_table.json';
import CloudServiceSD from '@/data-schema/inventory/cloud_service/sub_data/layouts/base_info.json';
import CloudServiceTable from '@/data-schema/inventory/cloud_service/table/layout/base_table.json';
import HorizontalLayout from '@/components/organisms/layouts/horizontal-layout/PHorizontalLayout.vue';
import PButton from '@/components/atoms/buttons/PButton.vue';
import { parser } from '@/lib/api/code-generater';

const checkApi = (api: any, target: string, matches: string[]): boolean => {
    // eslint-disable-next-line no-proto
    const names = new Set(Object.getOwnPropertyNames(api[target]().__proto__));
    // eslint-disable-next-line no-restricted-syntax
    for (const match of matches) {
        if (!names.has(match)) {
            return false;
        }
    }
    return true;
};
const getServerList = () => {
    const list: string[] = [];
    Object.keys(fluentApi).forEach((sevc) => {
        if (sevc !== 'api') {
            const api = fluentApi[sevc]();
            // eslint-disable-next-line no-proto
            const resources = Object.getOwnPropertyNames(api.__proto__);
            // eslint-disable-next-line no-restricted-syntax
            for (const res of resources) {
                if (res !== 'constructor' && res !== 'api' && checkApi(api, res, ['get', 'list'])) {
                    list.push(sevc);
                    break;
                }
            }
        }
    });
    return list;
};
const defaultSchema = {
    inventory: {
        server: {
            subData: ServerSD,
            table: ServerTable,
        },
        cloudService: {
            subData: CloudServiceSD,
            table: CloudServiceTable,
        },

    },
};
const makeItem = (names: string[]) => names.map(s => ({ type: 'item', name: s, label: s }));
const serviceList = makeItem(getServerList());

const tableSchemaSample = '{\n    "type":"query-search-table",\n    "name":"test",\n    "options":{\n        "fields":[\n            {\n                "type":"text",\n                "key":"name",\n                "name":"name"\n            }\n        ]\n    }\n}';

const testSample = `
{
        "resource_type": "inventory.CloudServiceType",
        "query": {
            "aggregate": {
                "group": {
                    "keys": [
                        {
                            "key": "cloud_service_type_id",
                            "name": "cloud_service_type_id"
                        },
                        {
                            "key": "name",
                            "name": "cloud_service_type"
                        },
                        {
                            "key": "group",
                            "name": "cloud_service_group"
                        },
                        {
                            "key": "provider",
                            "name": "provider"
                        }
                    ]
                }
            },
            "sort": {
                "name": "cloud_service_count",
                "desc": true
            }
        },
        "join": [
            {
                "keys": [
                    "cloud_service_type",
                    "cloud_service_group",
                    "provider"
                ],
                "resource_type": "inventory.CloudService",
                "query": {
                    "aggregate": {
                        "group": {
                            "keys": [
                                {
                                    "key": "cloud_service_type",
                                    "name": "cloud_service_type"
                                },
                                {
                                    "key": "cloud_service_group",
                                    "name": "cloud_service_group"
                                },
                                {
                                    "key": "provider",
                                    "name": "provider"
                                }
                            ],
                            "fields": [
                                {
                                    "operator": "count",
                                    "name": "cloud_service_count"
                                }
                            ]
                        }
                    }
                }
            },
            {
                "keys": [
                    "cloud_service_type",
                    "cloud_service_group",
                    "provider"
                ],
                "resource_type": "inventory.CloudService",
                "query": {
                    "filter": [
                        {
                            "key": "created_at",
                            "value": "now/d",
                            "operator": "timediff_gte"
                        }
                    ],
                    "aggregate": {
                        "group": {
                            "keys": [
                                {
                                    "key": "cloud_service_type",
                                    "name": "cloud_service_type"
                                },
                                {
                                    "key": "cloud_service_group",
                                    "name": "cloud_service_group"
                                },
                                {
                                    "key": "provider",
                                    "name": "provider"
                                }
                            ],
                            "fields": [
                                {
                                    "operator": "count",
                                    "name": "yesterday_cloud_service_count"
                                }
                            ]
                        }
                    }
                }
            }
        ]
    }`;
export default {
    name: 'DynamicLayoutHelper',
    components: {
        PPaneLayout,
        GeneralPageLayout,
        PSelectDropdown,
        PTab,
        SDynamicSubData,
        SDynamicLayout,
        PPageTitle,
        PMonacoEditor,
        PCheckBox,
        RawData,
        HorizontalLayout,
        PButton,
    },
    setup() {
        const vm = getCurrentInstance();
        const modeTab = new TabBarState({
            tabs: ['api', 'raw'],
        },
        {
            activeTab: 'api',
        });
        const typeTab = new TabBarState({
            tabs: ['subData', 'table'],
        },
        {
            activeTab: 'subData',
        });
        const state = reactive({
            selectService: '',
            selectResource: '',
            selectedId: '',
            noData: false,
            refresh: true,
            resourceList: computed(() => {
                if (state.selectService) {
                    const list: string[] = [];
                    const api = fluentApi[state.selectService]();
                    // eslint-disable-next-line no-proto
                    const resources = Object.getOwnPropertyNames(api.__proto__);
                    // eslint-disable-next-line no-restricted-syntax
                    for (const res of resources) {
                        if (res !== 'constructor' && checkApi(api, res, ['get', 'list'])) {
                            list.push(res);
                        }
                    }
                    return makeItem(list);
                }
                return [];
            }),
            resourceApi: computed<null|Resource>(() => {
                if (state.selectService && state.selectResource) {
                    return fluentApi[state.selectService]()[state.selectResource]();
                }
                return undefined;
            }),
            data: {},


        });
        const forceRefresh = () => {
            state.refresh = false;
            // console.debug('foreRefresh');
            setTimeout(() => { state.refresh = true; }, 300);
        };
        const subDataState = reactive({
            // eslint-disable-next-line no-useless-escape
            subDataSchema: '[\n    {\"type\":\"raw\",\"name\":\"test\"}\n]',
            subDataDefault: true,
            subDataDefaultSchema: computed(() => {
                if (state.selectService && state.selectResource) {
                    try {
                        // console.debug(state.selectService, state.selectResource);
                        const schemas = [defaultSchema[state.selectService][state.selectResource].subData, { type: 'raw', name: 'raw' }];
                        return schemas;
                    } catch (e) {
                        console.debug(e);
                    }
                }
                return undefined;
            }),
            layouts: computed(() => {
                if (subDataState.subDataDefault && subDataState.subDataDefaultSchema) {
                    return subDataState.subDataDefaultSchema;
                }
                return JSON.parse(subDataState.subDataSchema || '[]');
            }),
        });

        const tableState = reactive({
            // eslint-disable-next-line max-len
            tableSchema: tableSchemaSample,
            tableDefault: true,
            tableDefaultSchema: computed(() => {
                if (state.selectService && state.selectResource) {
                    try {
                        return defaultSchema[state.selectService][state.selectResource].table;
                    } catch (e) {

                    }
                }
                return undefined;
            }),
            layout: computed(() => {
                if (tableState.tableDefault && tableState.tableDefaultSchema) {
                    return tableState.tableDefaultSchema;
                }
                return JSON.parse(tableState.tableSchema || '{}');
            }),
        });
        watch(() => state.resourceApi, async (after, before) => {
            if (after && after !== before) {
                const resp = await state.resourceApi.list().setPageSize(1).execute();
                const idField: string = state.resourceApi.get().idField;
                state.selectedId = resp.data.results && resp.data.results.length ? resp.data.results[0][idField] : '';
                state.data = resp.data.results;
                if (resp.data.results.length === 0) {
                    state.noData = true;
                } else {
                    state.noData = false;
                }
            }
        });

        console.debug(parser(testSample));
        return {
            modeTab,
            typeTab,
            ...toRefs(state),
            ...toRefs(subDataState),
            ...toRefs(tableState),
            serviceList,
            forceRefresh,
        };
    },
};
</script>

<style lang="postcss" scoped>
    .tab-content{
        @apply  p-4 ;

    }
    .toolbar{
        @apply flex ;
        .tool-area{
            @apply flex flex-col min-w-6 mr-4;

            .label{
                @apply align-middle py-2 font-bold;

            }
            .content{

            }
        }
    }
    .fade-enter,
    .fade-leave-to {
        opacity: 0;
    }

    .fade-enter-active,
    .fade-leave-active {
        transition: 0.2s;
    }
</style>
