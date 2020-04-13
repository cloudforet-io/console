<template>
    <general-page-layout>
        <p>api 주세요~~</p>
        <PTab :tabs="tabs" :active-tab.sync="activeTab">
            <template #member="{height}">
                    <p-dynamic-view view_type="query-search-table"
                                    :api-handler="apiHandler"
                                    :data_source="dataSource"
                                    :vbind="{responsiveStyle:{'height': height+'px', 'overflow-y':'auto','overflow-x':'auto'}}"
                                    :data="null"
                    >
                        <template #toolbox-left>
                            <p-button style-type="primary-dark">
                                {{ $t('BTN.ADD') }}
                            </p-button>
                            <p-button
                                    class="toolbox-left-btn"
                                    outline
                                    style-type="alert"
                                    :disabled="apiHandler.tableTS.selectState.isNotSelected"
                            >
                                Delete
                            </p-button>
                        </template>
                    </p-dynamic-view>
            </template>
            <template #Tags>
                <p-dict-panel :dict.sync="tagsApi.ts.syncState.dict"
                              :edit-mode.sync="tagsApi.ts.syncState.editMode"
                              v-on="tagsApi.ts.listeners"
                />
            </template>
        </PTab>
    </general-page-layout>
</template>

<script lang="ts">
import {
    computed, reactive, ref, toRefs, watch,
} from '@vue/composition-api';
import GeneralPageLayout from '@/views/containers/page-layout/GeneralPageLayout.vue';
import PDynamicView from '@/components/organisms/dynamic-view/dynamic-view/DynamicView.vue';
import PDynamicDetails from '@/components/organisms/dynamic-view/dynamic-details/DynamicDetails.vue';

import PTab from '@/components/organisms/tabs/tab/Tab.vue';
import PButton from '@/components/atoms/buttons/Button.vue';
import { makeTrItems } from '@/lib/view-helper';

import { DataSourceItem, fluentApi } from '@/lib/fluent-api';
import {
    AdminFluentAPI,
    QuerySearchTableFluentAPI,
    SearchTableFluentAPI,
    TabSearchTableFluentAPI
} from '@/lib/api/table';
import {DictPanelAPI} from "@/components/organisms/panels/dict-panel/dict";
import PDictPanel from '@/components/organisms/panels/dict-panel/DictPanel.vue';
import PDynamicSubData from "@/components/organisms/dynamic-view/dynamic-subdata/DynamicSubData.vue";
import {QuerySearchTableACHandler} from "@/lib/api/auto-complete";

export default {
    name: 'ProjectDetail',
    components: {
        GeneralPageLayout,
        PDynamicView,

        PDictPanel,
        PTab,
        PDynamicSubData,
        PButton,
        PDynamicDetails,
    },
    setup(props, context) {
        const state = reactive({
            dataSource: [],
        })
        const tabData = reactive({
            tabs: makeTrItems([
                    ['detail', 'COMMON.SUMMARY', { keepAlive: true }],
                    ['member', 'COMMON.MEMBER'],
                    ['Tags', 'COMMON.TAG'],
                ],
                context.parent),
            activeTab: 'detail',
        });

        const projectKeyAutoCompletes = ['project_id'];
        const projectACHandlerMeta = {
            handlerClass: QuerySearchTableACHandler,
            args: {
                keys: projectKeyAutoCompletes,
                suggestKeys: projectKeyAutoCompletes,
            }
        }

        const MemberListAction = fluentApi.identity().project().list();
        const apiHandler = new QuerySearchTableFluentAPI(MemberListAction, {
            shadow: true,
            border: true,
            padding: true,
            selectable: true,
            dragable: true,
        }, undefined, projectACHandlerMeta,
        );
        const dataSource: DataSourceItem[] = [
            { name: 'member_id', key: 'member_id'},
            { name: 'name', key: 'name' },
        ]
        const isNotSelected = computed(() => apiHandler.tableTS.selectState.isNotSelected);
        const isNotSelectOne = computed(() => !apiHandler.tableTS.selectState.isSelectOne);

        const tagsApi = new DictPanelAPI(fluentApi.identity().project());
        const loadTag = async () => {
            const project_id = context.root.$route.params.id;
            tagsApi.setId(project_id);
            tagsApi.ts.toReadMode();
            await tagsApi.getData();
        }
        loadTag();

        return {
            apiHandler,
            dataSource,
            ...toRefs(tabData),
            ...state,
            tagsApi,
        };
    },
};
</script>

<style lang="postcss" scoped>
    .toolbox-left-btn {
        margin-left: 1rem;
    }
</style>
