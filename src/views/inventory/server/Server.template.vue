<template>
    <div class="animated fadeIn server">
        <BaseDragHorizontal>
            <template #container="{ height }">
                <p-toolbox-table
                    ref="toolbox"
                    :items="items"
                    :fields="fields"
                    :selectable="true"
                    :sortable="true"
                    :hover="true"
                    :sort-by.sync="sortBy"
                    :sort-desc.sync="sortDesc"
                    :all-page="allPage"
                    :this-page.sync="thisPage"
                    :select-index.sync="selectIndex"
                    :page-size.sync="pageSize"
                    :responsive-style="{'height': height+'px', 'overflow-y':'auto'}"
                    :setting-visible="false"
                    @changePageSize="changePageSize"
                    @changePageNumber="getServers"
                    @clickRefresh="getServers"
                >
                    <template slot="toolbox-left">
                        <p-button style-type="primary" @click="clickCollectData">
                            Collect Data
                        </p-button>
                        <PDropdownMenuBtn
                            id="server-dropdown-btn"
                            :menu="dropdown"
                            @clickMenuEvent="clickMenuEvent"
                        >
                            Action
                        </PDropdownMenuBtn>
                    </template>
                    <template v-slot:col-state-format="data">
                        <p-status
                            icon="fa-circle"
                            icon-style="solid"
                            size="xs"
                            v-bind="serverStateFormatter(data.value)"
                        />
                    </template>
                    <template />
                    <template v-slot:col-updated_at-format="data">
                        {{ timestampFormatter(data.value) }}
                    </template>
                    <template v-slot:col-core-format="data">
                        {{ data.item.data.base.core }}
                    </template>
                    <template v-slot:col-memory-format="data">
                        {{ data.item.data.base.memory }}
                    </template>
                    <template v-slot:col-project-format="data">
                        {{ data.item.project_id }}
                    </template>
                    <template v-slot:col-pool-format="data">
                        {{ data.item.pool_info ? data.item.pool_info.name :'' }}
                    </template>
                    <template v-slot:col-os_distro-format="data">
                        {{ data.item.data.os.os_distro }}
                    </template>
                    <template v-slot:col-server_type-format="data">
                        <PBadge>{{ data.value }}</PBadge>
                    </template>
                    <template v-slot:col-platform_type-format="data">
                        <PBadge>{{ data.item.data.vm.platform_type }}</PBadge>
                    </template>
                </p-toolbox-table>
            </template>
        </BaseDragHorizontal>
        <PTab v-if="isSelectedOne" :tabs="tabs" :active-tab.sync="activeTab">
            <template #detail="{tabName}">
                <p-server-detail ref="serverDetail"
                                 :item="items[selectIndex[0]]"
                                 :tag-confirm-event="tagConfirmEvent"
                                 :tag-reset-event="tagResetEvent"
                />
            </template>
            <template #data="{tabName}">
                <p> this tab is {{ tabName }}</p>
            </template>
            <template #rawData="{tabName}">
                <p> this tab is {{ tabName }}</p>
            </template>
            <template #admin="{tabName}">
                <p> this tab is {{ tabName }}</p>
            </template>
        </PTab>

        <div v-else id="empty-space">
            Select a user above for details.
        </div>
    </div>
</template>

<script>
import {
    reactive, toRefs, ref, computed,
} from '@vue/composition-api';
import PStatus from '@/components/molecules/status/Status';
import BaseDragHorizontal from '@/components/base/drag/BaseDragHorizontal';
import PToolboxTable from '@/components/organisms/tables/toolbox-table/ToolboxTable';
import PButton from '@/components/atoms/buttons/Button';
import PDropdownMenuBtn from '@/components/organisms/buttons/dropdown/DropdownMenuBtn';
import PBadge from '@/components/atoms/badges/Badge';
import PServerDetail from '@/views/inventory/server/modules/ServerDetail';
import PTab from '@/components/organisms/tabs/tab/Tab';
import { makeTrFields } from '@/components/organisms/tables/data-table/DataTabel.util';
import { requestMetaReactive } from '@/components/organisms/tables/toolbox-table/ToolboxTable.util';
import { timestampFormatter } from '@/lib/formatter';
import { serverStateFormatter } from '@/views/inventory/server/Server.util';
import serverEventBus from '@/views/inventory/server/ServerEventBus';

export const serverTableReactive = parent => reactive({
    fields: makeTrFields([
        ['name', 'COMMON.NAME'],
        ['state', 'COMMON.STATE'],
        ['primary_ip_address', 'COMMON.IP', { sortable: false }],
        ['core', 'COMMON.CORE'],
        ['memory', 'COMMON.MEMORY'],
        ['os_type', 'COMMON.O_TYPE'],
        ['os_distro', 'COMMON.O_DIS'],
        ['server_type', 'COMMON.SE_TYPE'],
        ['platform_type', 'COMMON.PLATFORM'],
        ['project', 'COMMON.PROJ'],
        ['pool', 'COMMON.POOL'],
        ['updated_at', 'COMMON.UPDATE'],
    ],
    parent),
    selectIndex: [],
    items: [],
    toolbox: null, // template refs
});

/**
 * @typedef {Object} serverState
 * @property {string} sortBy
 * @property {boolean} sortDesc
 * @property {number} thisPage
 * @property {number} allPage
 * @property {number} pageSize
 * @property {Array} fields
 * @property {Array} selectIndex
 *
 */

/**
 * server default setup reactive object
 * @function
 * @return {serverState} reactive object
 */
export const eventNames = {
    tagResetEvent: '',
    tagConfirmEvent: '',
    getServerList: '',

};

export const serverSetup = (props, context, eventName) => {
    const eventBus = serverEventBus;
    const tableState = serverTableReactive(context.parent);
    const tabData = reactive({
        tabs: [
            { name: 'detail', label: '디테일' },
            { name: 'data', label: '데이터' },
            { name: 'rawData', label: '데이터 원본' },
            { name: 'admin', label: '관리자' },
        ],
        activeTab: 'detail',
        serverDetail: null, // template refs
    });
    const tags = ref({});
    const tabAction = reactive({
        isSelectedOne: computed(() => tableState.selectIndex.length === 1),
    });
    const state = requestMetaReactive();
    const getServers = () => {
        eventBus.$emit(eventName.getServerList);
    };
    const changePageSize = () => {
        state.thisPage = 1;
        state.allPage = 1;
        getServers();
    };

    return reactive({
        ...toRefs(state),
        ...toRefs(tableState),
        ...toRefs(tabData),
        ...toRefs(tabAction),
        tags,
        dropdown: [
            {
                type: 'item', text: 'delete', event: 'delete', disabled: false,
            },
            { type: 'divider' },
            {
                type: 'item', text: 'set Maintenance', event: 'maintenance', disabled: false,
            },
            {
                type: 'item', text: 'set In-Service', event: 'in-service', disabled: false,
            },
            {
                type: 'item', text: 'set Closed', event: 'closed', disabled: false,
            },
            { type: 'divider' },
            {
                type: 'item', text: 'change project', event: 'project', disabled: false,
            },
            {
                type: 'item', text: 'change pool', event: 'pool', disabled: false,
            },
        ],
        serverStateFormatter,
        timestampFormatter,
        clickCollectData() {
            console.log('add');
        },
        getServers,
        changePageSize,
        clickMenuEvent(menuName) {
            console.log(menuName);
        },
        // todo: need confirm that this is good way - sinsky
        // EventBus Names
        ...eventNames,
    });
};

export default {
    name: 'ServerTemplate',
    components: {
        PStatus,
        BaseDragHorizontal,
        PToolboxTable,
        PButton,
        PBadge,
        PDropdownMenuBtn,
        PServerDetail,
        PTab,
    },
    setup(props, context) {
        const dataBind = reactive({
            items: computed(() => []),
        });
        const state = serverSetup(props, context, dataBind.items);
        return {
            ...toRefs(state),
            ...toRefs(dataBind),
        };
    },
};

</script>

<style lang="scss" scoped>
    #server-dropdown-btn {
        margin-left: 1rem;
    }
    #empty-space{
        text-align: center;
        margin-bottom: 0.5rem;
        color: $primary2;
        font: 24px/32px Arial;
    }
    .server{
        margin-top: 1.5625rem;
        margin-left: 2rem;
        margin-right: 2rem;
    }
</style>
