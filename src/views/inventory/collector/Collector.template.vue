<template>
    <div class="collector-page">
        <p-horizontal-layout>
            <template #container="{ height }">
                <p-toolbox-table
                    ref="toolbox"
                    :items="items"
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
                        <p-button style-type="primary">
                            Collect Data
                        </p-button>
                        <PDropdownMenuBtn class="left-toolbox-item"
                                          :menu="dropdown"
                                          @clickMenuEvent="clickMenuEvent"
                        >
                            Action
                        </PDropdownMenuBtn>
                        <div class="left-toolbox-item">
                            <p-search :search-text.sync="searchText" @onSearch="getCollectors" />
                        </div>
                    </template>
                    <template #col-name-format="data">
                        <span class="name">
                            <p-i name="aws-ec2" class="icon" />
                            {{ data.value }}
                        </span>
                    </template>
                    <template #col-state-format="data">
                        <p-status v-bind="collectorStateFormatter(data.value)" />
                    </template>
                    <template #col-last_collected_at-format="data">
                        {{ data.value ? timestampFormatter(data.value) : '' }}
                    </template>
                    <template #col-created_at-format="data">
                        {{ timestampFormatter(data.value) }}
                    </template>
                    <template #col-plugin_info-format="data">
                        <ul v-if="data.value.options && data.value.options.supported_resource_type">
                            <li v-for="(d, i) in data.value.options.supported_resource_type" :key="i">
                                {{ d }}
                            </li>
                        </ul>
                        <span v-else />
                    </template>
                </p-toolbox-table>
            </template>
        </p-horizontal-layout>
        <PTab v-if="isSelectedOne" :tabs="tabs" :active-tab.sync="activeTab">
            <template #detail>
                <collector-detail :item="items[selectIndex[0]]" />
            </template>
        <!--            <template #data="{tabName}">-->
        <!--                <PServerData-->
        <!--                        :server-id="items[selectIndex[0]].server_id"-->
        <!--                        :items="subData.items"-->
        <!--                        :sort-by.sync="subData.sortBy"-->
        <!--                        :sort-desc.sync="subData.sortDesc"-->
        <!--                        :page-size.sync="subData.pageSize"-->
        <!--                        :all-page="subData.allPage"-->
        <!--                        :this-page.sync="subData.thisPage"-->
        <!--                        :search-text.sync="subData.searchText"-->
        <!--                        :loading="subData.loading"-->
        <!--                        :get-server-sub-data="getServerSubData"-->
        <!--                />-->
        <!--            </template>-->
        <!--            <template #rawData="{tabName}">-->
        <!--                <p-server-raw-data :item="items[selectIndex[0]]" />-->
        <!--            </template>-->
        <!--            <template #admin="{tabName}">-->
        <!--                <p-server-admin :select-index="selectIndex"-->
        <!--                                :items="admin.items"-->
        <!--                                :sort-by.sync="admin.sortBy"-->
        <!--                                :sort-desc.sync="admin.sortDesc"-->
        <!--                                :page-size.sync="admin.pageSize"-->
        <!--                                :all-page="admin.allPage"-->
        <!--                                :this-page.sync="admin.thisPage"-->
        <!--                                :search-text.sync="admin.searchText"-->
        <!--                                :loading="admin.loading"-->
        <!--                                :get-server-admin="getServerAdmin"-->
        <!--                />-->
        <!--            </template>-->
        </PTab>
        <!--        <PTab v-else-if="isSelectedMulti" :tabs="multiSelectTabs" :active-tab.sync="multiSelectActiveTab">-->
        <!--            <template #data="{tabName}">-->
        <!--                <p-data-table-->
        <!--                        :fields="fields"-->
        <!--                        :sortable="false"-->
        <!--                        :selectable="false"-->
        <!--                        :items="getSelectServerItems"-->
        <!--                        :col-copy="true"-->
        <!--                >-->
        <!--                    <template v-slot:col-state-format="data">-->
        <!--                        <p-status v-bind="serverStateFormatter(data.value)" />-->
        <!--                    </template>-->
        <!--                    <template />-->
        <!--                    <template v-slot:col-updated_at-format="data">-->
        <!--                        {{ timestampFormatter(data.value) }}-->
        <!--                    </template>-->
        <!--                    <template v-slot:col-core-format="data">-->
        <!--                        {{ data.item.data.base.core }}-->
        <!--                    </template>-->
        <!--                    <template v-slot:col-memory-format="data">-->
        <!--                        {{ data.item.data.base.memory }}-->
        <!--                    </template>-->
        <!--                    <template v-slot:col-pool-format="data">-->
        <!--                        {{ data.item.pool_info ? data.item.pool_info.name :'' }}-->
        <!--                    </template>-->
        <!--                    <template v-slot:col-os_distro-format="data">-->
        <!--                        {{ data.item.data.os.os_distro }}-->
        <!--                    </template>-->
        <!--                    <template v-slot:col-server_type-format="data">-->
        <!--                        <PBadge v-bind="platformBadgeFormatter(data.value)">-->
        <!--                            {{ data.value }}-->
        <!--                        </PBadge>-->
        <!--                    </template>-->
        <!--                    <template v-slot:col-platform_type-format="data">-->
        <!--                        <PBadge v-bind="platformBadgeFormatter(data.item.data.vm.platform_type)">-->
        <!--                            {{ data.item.data.vm.platform_type }}-->
        <!--                        </PBadge>-->
        <!--                    </template>-->
        <!--                </p-data-table>-->
        <!--            </template>-->
        <!--            <template #admin="{tabName}">-->
        <!--                <p-server-admin :select-index="selectIndex"-->
        <!--                                :items="admin.items"-->
        <!--                                :sort-by.sync="admin.sortBy"-->
        <!--                                :sort-desc.sync="admin.sortDesc"-->
        <!--                                :page-size.sync="admin.pageSize"-->
        <!--                                :all-page="admin.allPage"-->
        <!--                                :this-page.sync="admin.thisPage"-->
        <!--                                :search-text.sync="admin.searchText"-->
        <!--                                :loading="admin.loading"-->
        <!--                                :get-server-admin="getServerAdmin"-->
        <!--                />-->
        <!--            </template>-->
        <!--        </PTab>-->

        <!--        <div v-else id="empty-space">-->
        <!--            Select a Server above for details.-->
        <!--        </div>-->
    </div>
</template>

<script>
import {
    reactive, toRefs, ref, computed, watch,
} from '@vue/composition-api';
import { timestampFormatter, collectorStateFormatter } from '@/lib/util';
import { makeTrItems } from '@/lib/helper';
import collectorEventBus from '@/views/inventory/collector/CollectorEventBus';

import PI from '@/components/atoms/icons/PI';
import PStatus from '@/components/molecules/status/Status';
import PButton from '@/components/atoms/buttons/Button';
import PBadge from '@/components/atoms/badges/Badge';

const PTab = () => import('@/components/organisms/tabs/tab/Tab');
const PDataTable = () => import('@/components/organisms/tables/data-table/DataTable');
const PHorizontalLayout = () => import('@/components/organisms/layouts/horizontal-layout/HorizontalLayout');
const PToolboxTable = () => import('@/components/organisms/tables/toolbox-table/ToolboxTable');
const PDropdownMenuBtn = () => import('@/components/organisms/buttons/dropdown/DropdownMenuBtn');
const PSearch = () => import('@/components/molecules/search/Search');
const CollectorDetail = () => import('@/views/inventory/collector/modules/CollectorDetail');

const setCollectorTable = (props, context) => {
    const state = reactive({
        fields: makeTrItems([
            ['name', 'COMMON.NAME'],
            ['state', 'COMMON.STATE'],
            ['priority', 'COMMON.PRIORITY'],
            ['plugin_info', 'COMMON.RESOURCE'],
            ['last_collected_at', 'COMMON.LAST_COL'],
            ['created_at', 'COMMON.CREATED'],
        ],
        context.parent),
        selectIndex: [],
        items: [],
        loading: false,
        toolbox: null, // template refs
    });

    const getCollectors = () => {
        collectorEventBus.$emit('getCollectorList');
    };

    getCollectors();

    return {
        ...toRefs(state),
        getCollectors,
    };
};

const setTableToolbox = (props, context, tableState) => {
    const navigationState = reactive({
        sortBy: '',
        sortDesc: true,
        pageSize: 15,
        allPage: 1,
        thisPage: 1,
    });

    const state = reactive({
        dropdown: makeTrItems([
            ['delete', 'COMMON.BTN_DELETE'],
            [null, null, { type: 'divider' }],
            ['maintenance', 'COMMON.BTN_S_MANT'],
            ['in-service', 'COMMON.BTN_S_SERV'],
            ['closed', 'COMMON.BTN_S_CLOSE'],
            [null, null, { type: 'divider' }],
            ['project', 'COMMON.CHG_PRO'],
            ['pool', 'COMMON.CHG_POOL'],
        ], context.parent,
        { type: 'item', disabled: false }),
        clickMenuEvent(menuName) {
            console.log(menuName);
        },
        searchText: '',
    });


    return {
        ...toRefs(navigationState),
        ...toRefs(state),
    };
};

const setTableData = (props, context) => {
    const state = reactive({
        timestampFormatter,
        collectorStateFormatter,
    });
    return {
        ...toRefs(state),
    };
};

const setTabs = (props, context, tableState) => {
    const state = reactive({
        isSelectedOne: computed(() => tableState.selectIndex.value.length === 1),
        activeTab: 'detail',
    });
    return {
        ...toRefs(state),
    };
};

const setTabData = (props, context) => {
    const state = reactive({
        tabs: makeTrItems([
            ['detail', 'PANEL.DETAILS', { keepAlive: true }],
            ['rawData', 'PANEL.CREDENTIAL', { keepAlive: true }],
            ['admin', 'PANEL.JOBS'],
        ], context.parent),
    });
    return {
        ...toRefs(state),
    };
};

export const collectorSetup = (props, context) => {
    const tableStates = setCollectorTable(props, context);
    const toolboxStates = setTableToolbox(props, context, tableStates);
    const tableDataStates = setTableData(props, context);
    const tabStates = setTabs(props, context, tableStates);
    const tabDataStates = setTabData(props, context);
    return {
        ...tableStates,
        ...toolboxStates,
        ...tableDataStates,
        ...tabStates,
        ...tabDataStates,
    };
};

export default {
    name: 'CollectorTemplate',
    components: {
        PI,
        PStatus,
        PHorizontalLayout,
        PToolboxTable,
        PButton,
        PBadge,
        PDropdownMenuBtn,
        PTab,
        PDataTable,
        PSearch,
        CollectorDetail,
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
                margin-right: 1rem;
            }
        }
    }

</style>
