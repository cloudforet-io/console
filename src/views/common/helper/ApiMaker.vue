<template>
    <general-page-layout class="h-screen">
        <p-page-title class="mt-4">
            <template #title>
                <i class="fas fa-database text-blue-400 " /> Choose Action
            </template>
        </p-page-title>
        <p-pane-layout>
            <div class="tab-content toolbar">
                <div class="tool-area">
                    <div class="label">
                        서비스
                    </div>
                    <div>
                        <p-select-dropdown v-model="selectService" :items="serviceList" @onSelected="onServiceSelect" />
                    </div>
                </div>
                <div class="tool-area">
                    <div class="label">
                        리소스
                    </div>
                    <div>
                        <p-select-dropdown v-model="selectResource" :disabled="!selectService" :items="resourceList"
                                           @onSelected="onResourceSelect"
                        />
                    </div>
                </div>
                <div class="tool-area">
                    <div class="label">
                        액션
                    </div>
                    <div>
                        <p-select-dropdown v-model="selectAction" :disabled="!selectResource" :items="actionList" />
                    </div>
                </div>
            </div>
        </p-pane-layout>
        <div class="flex w-full">
            <div class="w-1/2">
                <p-page-title class="mt-8">
                    <template #title>
                        <i class="fas fa-smile-wink text-yellow-400" /> Parameter
                    </template>
                </p-page-title>
                <p-pane-layout v-if="!(selectResource&&selectService&&selectAction)">
                    <div class="p-8 text-lg font-bold border-red-800 bg-red-100 text-red-500">
                        <i class="fas fa-exclamation-triangle" /> &nbsp;액션을 선택해주세요!
                    </div>
                </p-pane-layout>
                <p-pane-layout v-else class="p-4">
                    <p-json-schema-form v-bind="methodForm.state" :item.sync="methodForm.syncState.item" />
                    <p-field-group v-if="hasFilter" label="Filter">
                        <p-query-search v-model="querySearch.syncState.value"
                                        class="search-bar"
                                        v-bind="querySearch.state"
                                        @search="querySearch.onSearch"
                        />
                        <p-hr v-if="querySearch.tags.value.length !== 0" style="width: 100%;" />
                        <p-query-search-tags
                            v-if="querySearch.tags.value.length !== 0"
                            class="py-2"
                            :tags="querySearch.tags.value"
                            @delete:tag="querySearch.deleteTag"
                            @delete:all="querySearch.deleteAllTags"
                        />
                    </p-field-group>
                    <p-loading-button class="ml-4" style-type="primary"
                                      :outline="true"
                                      :loading="loading" :disabled="loading"
                                      @click="execute"
                    >
                        Execute
                    </p-loading-button>
                </p-pane-layout>
            </div>
            <div class="w-1/2">
                <p-page-title class="mt-8">
                    <template #title>
                        <i class="fas fa-smile-wink text-yellow-400" /> Request Config
                    </template>
                </p-page-title>
                <p-pane-layout>
                    <raw-data class="parameter-raw-data" :item="parameter" />
                </p-pane-layout>
            </div>
        </div>
        <p-page-title class="mt-8">
            <template #title>
                <i class="fas fa-smile-wink text-yellow-400" /> Result
            </template>
        </p-page-title>
        <p-pane-layout>
            <raw-data
                :item="typeof result === 'object'?result.data:undefined"
                :raw="typeof result === 'string'?result:undefined"
            />
        </p-pane-layout>
    </general-page-layout>
</template>
<script lang="ts">
import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';
import GeneralPageLayout from '@/views/containers/page-layout/GeneralPageLayout.vue';
import PPaneLayout from '@/components/molecules/layouts/pane-layout/PPaneLayout.vue';
import PSelectDropdown from '@/components/organisms/dropdown/select-dropdown/PSelectDropdown.vue';
import {
    ActionAPI,
    fluentApi, QueryAPI, Resource, SingleItemAction,
} from '@/lib/fluent-api';
import PPageTitle from '@/components/organisms/title/page-title/PPageTitle.vue';
import RawData from '@/components/organisms/text-editor/raw-data/PRawData.vue';
import PJsonSchemaForm from '@/components/organisms/forms/json-schema-form/PJsonSchemaForm.vue';
import { JsonSchemaObjectType, JsonSchemaType } from '@/lib/type';
import { JsonSchemaFormToolSet } from '@/components/organisms/forms/json-schema-form/toolset';
import PHr from '@/components/atoms/hr/PHr.vue';
import PQuerySearchTags from '@/components/organisms/search/query-search-tags/PQuerySearchTags.vue';
import PFieldGroup from '@/components/molecules/forms/field-group/FieldGroup.vue';
import PLoadingButton from '@/components/molecules/buttons/loading-button/PLoadingButton.vue';
import { defaultACHandler, getQueryItemsToFilterItems } from '@/lib/api/query-search';
import PQuerySearch from '@/components/organisms/search/query-search/PQuerySearch.vue';
import { QuerySearchToolSet } from '@/lib/component-utils/query-search';

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


const getServiceList = () => {
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

const makeItem = (names: string[]) => names.map(s => ({ type: 'item', name: s, label: s }));
const serviceList = makeItem(getServiceList());
const SUPPORT_ACTIONS: typeof ActionAPI[] = [QueryAPI, SingleItemAction];
interface MethodFormOption {
    property: 'addArrayProperty'|'addIntegerProperty'|'addStringProperty';
    label: string;
    required?: boolean;
    itemType?: JsonSchemaType;
}
interface MethodForm {
    [name: string]: MethodFormOption;
}
const METHOD_FORM: MethodForm = {
    setOnly: {
        property: 'addArrayProperty',
        label: 'Target Field',
        itemType: 'string',
    },
    setThisPage: {
        property: 'addIntegerProperty',
        label: 'Page Number',
    },
    setPageSize: {
        property: 'addIntegerProperty',
        label: 'Page Size',
    },
    setKeyword: {
        property: 'addStringProperty',
        label: 'Keyword',
    },

};
export default {
    name: 'DynamicLayoutHelper',
    components: {
        PQuerySearch,
        PPaneLayout,
        GeneralPageLayout,
        PSelectDropdown,
        PPageTitle,
        RawData,
        PJsonSchemaForm,
        PHr,
        PQuerySearchTags,
        PFieldGroup,
        PLoadingButton,

    },
    setup() {
        const state = reactive({
            selectService: '',
            selectResource: '',
            selectAction: '',
            selectedId: '',
            noData: false,
            refresh: true,
            hasFilter: false,
            loading: false,
            resourceList: computed(() => {
                if (state.selectService) {
                    const list: string[] = [];
                    const api = fluentApi[state.selectService]();
                    // eslint-disable-next-line no-proto
                    const resources = Object.getOwnPropertyNames(api.__proto__);
                    // eslint-disable-next-line no-restricted-syntax
                    for (const res of resources) {
                        const checkResource = fluentApi[state.selectService]()[res]();
                        // console.debug(checkResource, 'resource');
                        // eslint-disable-next-line no-proto
                        const actionNames = Object.getOwnPropertyNames(checkResource.__proto__);
                        // console.debug('action names', actionNames);
                        actionNames.forEach((name: string) => {
                            // eslint-disable-next-line no-restricted-syntax
                            for (const action of SUPPORT_ACTIONS) {
                                if (list.indexOf(res) !== -1) {
                                    break;
                                }
                                try {
                                    const act = checkResource[name]();
                                    if (act instanceof action && !act.isMutationApi) {
                                        list.push(res);
                                    }
                                } catch (e) {
                                }
                            }
                        });
                    }
                    return makeItem(list);
                }
                return [];
            }),
            actionList: computed(() => {
                if (state.selectResource) {
                    const api = fluentApi[state.selectService]()[state.selectResource]();
                    // eslint-disable-next-line no-proto
                    const actionNames = Object.getOwnPropertyNames(api.__proto__);
                    const actions: string[] = [];
                    actionNames.forEach((name: string) => {
                        // eslint-disable-next-line no-restricted-syntax
                        for (const action of SUPPORT_ACTIONS) {
                            try {
                                const act = api[name]();
                                if (act instanceof action && !act.isMutationApi) {
                                    actions.push(name);
                                }
                            } catch (e) {

                            }
                        }
                    });
                    return makeItem(actions);
                }
                return [];
            }),
            apiState: {},
            resourceApi: computed<undefined|Resource>(() => {
                if (state.selectService && state.selectResource && state.selectAction) {
                    return fluentApi[state.selectService]()[state.selectResource]()[state.selectAction]();
                }
                return undefined;
            }),
            schema: computed<undefined|{schema: JsonSchemaObjectType;order: string[]}>(() => {
                if (state.resourceApi) {
                    console.debug(state.resourceApi);
                    const sch = new JsonSchemaObjectType(undefined, undefined, true);
                    const order: string[] = [];
                    const hasMethod = (name: string): boolean => {
                        try {
                            // console.debug(state.resourceApi[name]);
                            if (name !== 'constructor' && state.resourceApi[name]) {
                                return true;
                            }
                        } catch (e) {
                        }
                        return false;
                    };
                    if (hasMethod('setId')) {
                        sch.addStringProperty('setId', state.resourceApi.idField, true);
                        order.push('setId');
                    }

                    if (hasMethod('setSubIds')) {
                        sch.addArrayProperty('setSubIds', state.resourceApi.subIdsField, false, 'string');
                        order.push('setSubIds');
                    }
                    Object.entries(METHOD_FORM).forEach(([name, options]) => {
                        if (hasMethod(name)) {
                            const args = [name, options.label, options.required];
                            if (options.itemType) {
                                args.push(options.itemType);
                            }
                            // @ts-ignore
                            sch[options.property](...args);
                            order.push(name);
                        }
                    });
                    state.hasFilter = hasMethod('setFilter');
                    return {
                        schema: sch,
                        order,
                    };
                }
                return undefined;
            }),
            result: {},
        });
        const querySearch = new QuerySearchToolSet([], {});

        const methodForm = new JsonSchemaFormToolSet();
        watch(() => state.schema, (aft, bef) => {
            if (aft && aft !== bef) {
                methodForm.setProperty(aft.schema, aft.order);
            }
        });
        const parameter = computed(() => {
            if (state.resourceApi) {
                try {
                    const parm = {
                        ...methodForm.syncState.item,
                    };
                    if (state.hasFilter) {
                        parm.setFilter = querySearch.tags.value;
                    }

                    return parm;
                } catch (e) {

                }
            }

            return {};
        });

        const execute = async () => {
            let act = state.resourceApi.clone();
            Object.entries(methodForm.syncState.item).forEach(([name, value]) => {
                if (Array.isArray(value)) {
                    if (value.length > 0) {
                        act = act[name](...value);
                    }
                } else {
                    act = act[name](value);
                }
            });
            if (state.hasFilter && querySearch.tags.value.length > 0) {
                const items = getQueryItemsToFilterItems(querySearch.tags.value, querySearch.state.keyItems);
                act = act.setFilter(...items.and)
                    .setFilterOr(...items.or);
            }
            state.loading = true;
            try {
                state.result = await act.execute();
            } catch (e) {
                state.result = String(e);
            } finally {
                state.loading = false;
            }
        };
        const onResourceSelect = () => {
            state.selectAction = '';
        };
        const onServiceSelect = () => {
            state.selectResource = '';
            onResourceSelect();
            querySearch.syncState.value = '';
            querySearch.deleteAllTags();
        };

        return {
            ...toRefs(state),
            serviceList,
            execute,
            onServiceSelect,
            onResourceSelect,
            methodForm,
            querySearch,
            parameter,
        };
    },
};
</script>

<style lang="postcss" scoped>
    .tab-content {
        @apply p-4 ;
    }
    .toolbar {
        @apply flex ;
        .tool-area {
            @apply flex flex-col min-w-6 mr-4;

            .label {
                @apply align-middle py-2 font-bold;
            }
        }
    }
    .parameter-raw-data {
        height: 30rem !important;
    }
</style>
