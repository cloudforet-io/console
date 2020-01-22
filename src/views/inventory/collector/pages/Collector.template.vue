<template>
    <div class="collector-page">
        <router-view />
        <p-horizontal-layout>
            <template #container="{ height }">
                <p-toolbox-table :items="items"
                                 :fields="fields"
                                 :selectable="true"
                                 :sortable="true"
                                 :dragable="true"
                                 :hover="true"
                                 :responsive="true"
                                 :sort-by.sync="sortBy"
                                 :sort-desc.sync="sortDesc"
                                 :all-page="allPage"
                                 :this-page.sync="thisPage"
                                 :select-index.sync="selectIndex"
                                 :page-size.sync="pageSize"
                                 :responsive-style="{'height': height+'px', 'overflow-y':'auto', 'overflow-x':'auto'}"
                                 :setting-visible="false"
                                 :loading="loading"
                                 :use-spinner-loading="true"
                                 :use-cursor-loading="true"
                                 @changePageSize="getCollectors"
                                 @changePageNumber="getCollectors"
                                 @clickRefresh="getCollectors"
                                 @changeSort="getCollectors"
                >
                    <template slot="toolbox-left">
                        <p-button style-type="primary" @click="$router.push('/inventory/collector/create/plugins')">
                            Create
                        </p-button>
                        <PDropdownMenuBtn class="left-toolbox-item"
                                          :menu="dropdown"
                                          @click-update="onClickUpdate"
                                          @click-enable="onClickEnable"
                                          @click-disable="onClickDisable"
                                          @click-delete="onClickDelete"
                                          @click-collectData="onClickCollectData"
                        >
                            Action
                        </PDropdownMenuBtn>
                        <div class="left-toolbox-item">
                            <p-search :search-text.sync="searchText" @onSearch="getCollectors" />
                        </div>
                    </template>
                    <template #col-name-format="data">
                        <span class="name">
                            <img class="icon" :src="data.item.tags.icon || defaultImg">
                            {{ data.value }}
                        </span>
                    </template>
                    <template #col-state-format="{value}">
                        <p-status v-bind="collectorStateFormatter(value)" />
                    </template>
                    <template #col-last_collected_at-format="{value}">
                        {{ value ? timestampFormatter(value) : '' }}
                    </template>
                    <template #col-created_at-format="{value}">
                        {{ timestampFormatter(value) }}
                    </template>
                    <template #col-plugin_info-format="{value}">
                        <template v-if="value.options && value.options.supported_resource_type">
                            <div v-for="(d, i) in value.options.supported_resource_type" :key="i">
                                {{ d }}
                            </div>
                        </template>
                        <span v-else />
                    </template>
                </p-toolbox-table>
            </template>
        </p-horizontal-layout>

        <p-tab v-if="selectIndex.length === 1" :tabs="tabs" :active-tab.sync="activeTab">
            <template #detail>
                <collector-detail :item="items[selectIndex[0]]" />
            </template>
            <template #credentials>
                <collector-credentials :item="items[selectIndex[0]]" />
            </template>
        </p-tab>
        <p-tab v-else-if="selectIndex.length > 1" :tabs="multiTabs" :active-tab.sync="multiActiveTab">
            <template #selected>
                <p-data-table
                    :fields="multiFields"
                    :sortable="false"
                    :selectable="false"
                    :items="multiItems"
                    col-copy
                >
                    <template #col-name-format="data">
                        <span class="name">
                            <img class="icon" :src="data.item.tags.icon || defaultImg">
                            {{ data.value }}
                        </span>
                    </template>
                    <template #col-state-format="{value}">
                        <p-status v-bind="collectorStateFormatter(value)" />
                    </template>
                </p-data-table>
            </template>
        </p-tab>

        <collect-data-modal ref="collectDataModal" />
    </div>
</template>

<script>
import {
    reactive, toRefs, computed,
} from '@vue/composition-api';
import { timestampFormatter, collectorStateFormatter } from '@/lib/util';
import { makeTrItems } from '@/lib/view-helper';
import collectorEventBus from '@/views/inventory/collector/CollectorEventBus';

import PI from '@/components/atoms/icons/PI.vue';
import PStatus from '@/components/molecules/status/Status.vue';
import PButton from '@/components/atoms/buttons/Button.vue';
import config from '@/lib/config';

const PTab = () => import('@/components/organisms/tabs/tab/Tab');
const PHorizontalLayout = () => import('@/components/organisms/layouts/horizontal-layout/HorizontalLayout');
const PToolboxTable = () => import('@/components/organisms/tables/toolbox-table/ToolboxTable');
const PDataTable = () => import('@/components/organisms/tables/data-table/DataTable.vue');
const PDropdownMenuBtn = () => import('@/components/organisms/dropdown/dropdown-menu-btn/DropdownMenuBtn');
const PSearch = () => import('@/components/molecules/search/Search');


const CollectDataModal = () => import('@/views/inventory/collector/modules/CollectDataModal.vue');
const CollectorDetail = () => import('@/views/inventory/collector/modules/CollectorDetail');
const CollectorCredentials = () => import('@/views/inventory/collector/modules/CollectorCredentials');

const setCollectorState = () => {
    const state = reactive({
        selectIndex: [],
        items: [],
        sortSelectIndex: undefined,
        multiItems: undefined,
        loading: false,
    });

    state.sortSelectIndex = computed(() => {
        const idxs = [...state.selectIndex];
        idxs.sort((a, b) => a - b);
        return idxs;
    });

    state.multiItems = computed(() => state.sortSelectIndex.map(idx => state.items[idx]));

    return state;
};

const setTableData = (props, context, collectorState) => {
    const state = reactive({
        sortBy: '',
        sortDesc: true,
        pageSize: 15,
        allPage: 1,
        thisPage: 1,
        searchText: '',
        fields: makeTrItems([
            ['name', 'COMMON.NAME'],
            ['state', 'COMMON.STATE'],
            ['priority', 'COMMON.PRIORITY'],
            ['plugin_info', 'COMMON.RESOURCE'],
            ['last_collected_at', 'COMMON.LAST_COL'],
            ['created_at', 'COMMON.CREATED'],
        ],
        context.parent),
        multiFields: makeTrItems([
            ['name', 'COMMON.NAME'],
            ['state', 'COMMON.STATE'],
            ['priority', 'COMMON.PRIORITY'],
        ], context.root),
        timestampFormatter,
        collectorStateFormatter,
        defaultImg: config.get('COLLECTOR_IMG'),
    });

    const nothingSelected = computed(() => collectorState.selectIndex.length === 0);
    const onlyOneSelected = computed(() => collectorState.selectIndex.length !== 1);
    const dropdown = reactive({
        ...makeTrItems([
            ['update', 'COMMON.BTN_UPT', { disabled: onlyOneSelected }],
            [null, null, { type: 'divider' }],
            ['enable', 'COMMON.BTN_ENABLE', { disabled: nothingSelected }],
            ['disable', 'COMMON.BTN_DISABLE', { disabled: nothingSelected }],
            ['delete', 'COMMON.BTN_DELETE', { disabled: nothingSelected }],
            [null, null, { type: 'divider' }],
            ['collectData', 'COMMON.COLLECT', { disabled: onlyOneSelected }],
        ],
        context.parent,
        { type: 'item' }),
    });

    return {
        ...toRefs(state),
        dropdown,
    };
};

const setTabData = (props, context) => {
    const state = reactive({
        activeTab: 'detail',
        tabs: makeTrItems([
            ['detail', 'PANEL.DETAILS', { keepAlive: true }],
            ['credentials', 'PANEL.CREDENTIAL', { keepAlive: true }],
            ['jobs', 'PANEL.JOBS'],
        ], context.root),
        multiActiveTab: 'selected',
        multiTabs: makeTrItems([
            ['selected', 'PANEL.SELECTED', { keepAlive: true }],
        ], context.root),
    });


    return {
        ...toRefs(state),
    };
};

const setActions = (props, context) => {
    const getCollectors = () => {
        collectorEventBus.$emit('getCollectorList');
    };
    const onClickUpdate = () => {};
    const onClickEnable = () => {};
    const onClickDisable = () => {};
    const onClickDelete = () => {};
    const onClickCollectData = () => {};

    return {
        getCollectors,
        onClickUpdate,
        onClickEnable,
        onClickDisable,
        onClickDelete,
        onClickCollectData,
    };
};

export const collectorSetup = (props, context) => {
    const collectorState = setCollectorState(props, context);
    const tableRefs = setTableData(props, context, collectorState);
    const tabRefs = setTabData(props, context);
    const actions = setActions();

    actions.getCollectors();

    return {
        ...toRefs(collectorState),
        ...tableRefs,
        ...tabRefs,
        ...actions,
    };
};

export default {
    name: 'CollectorTemplate',
    components: {
        PI,
        PStatus,
        PHorizontalLayout,
        PToolboxTable,
        PDataTable,
        PButton,
        PDropdownMenuBtn,
        PTab,
        PSearch,
        CollectDataModal,
        CollectorDetail,
        CollectorCredentials,
    },
    setup(props, context) {
        return collectorSetup(props, context);
    },
};
</script>

<style lang="scss" scoped>
.collector-page {
    margin-top: 1.5625rem;
    margin-left: 2rem;
    margin-right: 2rem;

    .left-toolbox-item{
        margin-left: 1rem;
        &:last-child {
            flex-grow: 1;
        }
    }

    .name {
        .icon {
            width: 1.5rem;
            height: 1.5rem;
            margin-right: .5rem;
        }
    }

    ul {
        list-style-type: disc;
    }
    li {
        display: list-item;
    }

    .reset-btn {
        margin-right: auto;
    }
}
</style>
