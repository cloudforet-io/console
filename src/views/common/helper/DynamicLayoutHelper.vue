<template>
    <general-page-layout class="h-screen">
        <PPageTitle class="mt-4">
            <template #title>
                Data
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
                <PPageTitle class="my-4">
                    <template #title>
                        Scehma
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
                            <PMonacoEditor v-if="!(subDataDefault&&subDataDefaultSchema)" :style="{height:height+'px'}" class="editor"
                                           :code.sync="subDataSchema"
                            />
                            <RawData v-else :item="subDataDefaultSchema" :style="{height:height+'px'}" />
                        </div>
                    </template>
                    <template #table>
                        <div class="tab-content">
                            <div v-if="tableDefaultSchema">
                                <PCheckBox v-model="subDataDefault" />  use Default
                            </div>
                            <PMonacoEditor v-if="!(tableDefault&&tableDefaultSchema)" :style="{height:height+'px'}" :code.sync="tableSchema"
                                           class="editor"
                            />
                            <RawData v-else :item="tableDefaultSchema" :style="{height:height+'px'}" />
                        </div>
                    </template>
                </p-tab>
            </template>
        </HorizontalLayout>

        <PPageTitle class="mt-8">
            <template #title>
                Result
            </template>
        </PPageTitle>
        <PPaneLayout>
            <div class="tab-content">
                <s-dynamic-sub-data
                    v-if="typeTab.syncState.activeTab==='subData'"
                    :layouts="layouts"
                    :resource-api="resourceApi"
                    :select-id="selectedId"
                    :is-show="typeTab.syncState.activeTab==='subData'&&resourceApi&&selectedId"
                />
                <s-dynamic-layout
                    v-else
                    v-bind="layout"
                />
            </div>
        </PPaneLayout>
    </general-page-layout>
</template>
<script lang="ts">
import {
    computed, defineComponent, getCurrentInstance, reactive, toRefs, watch,
} from '@vue/composition-api';
import GeneralPageLayout from '@/views/containers/page-layout/GeneralPageLayout.vue';
import PPaneLayout from '@/components/molecules/layouts/pane-layout/PaneLayout.vue';
import PSelectDropdown from '@/components/organisms/dropdown/select-dropdown/SelectDropdown.vue';
import PTab from '@/components/organisms/tabs/tab/Tab.vue';
import { TabBarState } from '@/components/molecules/tabs/tab-bar/toolset';
import { fluentApi, Resource } from '@/lib/fluent-api';
import SDynamicLayout from '@/components/organisms/dynamic-view/dynamic-layout/SDynamicLayout.vue';
import SDynamicSubData from '@/components/organisms/dynamic-view/dynamic-subdata/SDynamicSubData.vue';
import PPageTitle from '@/components/organisms/title/page-title/PageTitle.vue';
import PMonacoEditor from '@/components/molecules/text-editor/monaco/MonacoEditor.vue';
import PCheckBox from '@/components/molecules/forms/checkbox/CheckBox.vue';
import RawData from '@/components/organisms/text-editor/raw-data/RawData.vue';
import ServerSD from '@/metadata-schema/view/inventory/server/sub_data/layouts/base_info.json';
import ServerTable from '@/metadata-schema/view/inventory/server/table/layout/base_table.json';
import CloudServiceSD from '@/metadata-schema/view/inventory/cloud_service/sub_data/layouts/base_info.json';
import CloudServiceTable from '@/metadata-schema/view/inventory/cloud_service/table/layout/base_table.json';
import HorizontalLayout from '@/components/organisms/layouts/horizontal-layout/HorizontalLayout.vue';

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


export default defineComponent({
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
        const subDataState = reactive({
            // eslint-disable-next-line no-useless-escape
            subDataSchema: '[\n    {\"type\":\"raw\",\"name\":\"test\"}\n]',
            subDataDefault: true,
            subDataDefaultSchema: computed(() => {
                if (state.selectService && state.selectResource) {
                    try {
                        console.debug(state.selectService, state.selectResource);
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
            tableSchema: '{}',
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
                const resp = await state.resourceApi.list().execute();
                const idField: string = state.resourceApi.get().idField;
                state.selectedId = resp.data.results && resp.data.results.length ? resp.data.results[0][idField] : '';
                state.data = resp.data.results;
            }
        });
        return {
            modeTab,
            typeTab,
            ...toRefs(state),
            ...toRefs(subDataState),
            ...toRefs(tableState),
            serviceList,
        };
    },
});
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
    .editor{
        height: 50vh;
    }

</style>
