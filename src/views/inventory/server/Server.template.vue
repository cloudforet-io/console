<template>
    <div class="animated fadeIn">
        <BaseDragHorizontal>
            <template #container="{ height }">
                <p-toolbox-table
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
                    @changePageNumber="changePageNumber"
                    @clickRefresh="clickRefresh"
                >
                    <template slot="toolbox-left">
                        <p-button
                            style-type="primary"
                            @click="clickAdd"
                        >
                            <p-i name="ic_plus" color="transparent white"
                                 width="1.3rem" height="1.3rem" :fill="true"
                            />
                            Create
                        </p-button>
                        <p-dropdown
                            id="user-dropdown-btn"
                            :menu="dropdown"
                            @click-update="clickUpdate"
                            @click-delete="clickDelete"
                            @click-activated="clickActivated"
                            @click-deactivated="clickDeactivated"
                        >
                            Actions
                        </p-dropdown>
                    </template>
                    <template v-slot:col-state-format="data">
                        <p-status
                            icon="fa-circle"
                            icon-style="solid"
                            size="xs"
                            v-bind="serverStateBind(data.value)"
                        />
                    </template>
                    <template v-slot:col-updated_at-format="data">
                        {{ timestampFormater(data.value) }}
                    </template>
                    <template v-slot:col-core-format="data">
                        {{ data.item.data.base.core }}
                    </template>
                    <template v-slot:col-memory-format="data">
                        {{ data.item.data.base.memory }}
                    </template>
                </p-toolbox-table>
            </template>
        </BaseDragHorizontal>
        <div id="empty-space">
            Select a user above for details.
        </div>
    </div>
</template>

<script>
import { reactive, toRefs, computed } from '@vue/composition-api';
import PStatus from '@/components/molecules/status/Status';
import BaseDragHorizontal from '@/components/base/drag/BaseDragHorizontal';
import PToolboxTable from '@/components/organisms/tables/toolbox-table/ToolboxTable';
import PButton from '@/components/atoms/buttons/Button';
import PI from '@/components/atoms/icons/PI';
import PDropdown from '@/components/organisms/buttons/dropdown/Dropdown';
import { makeTrFields, timestampFormater } from '@/components/organisms/tables/data-table/DataTabel.util';
import { requestMetaReactive } from '@/components/organisms/tables/toolbox-table/ToolboxTable.util';
import {
    alert, safe, other1, other2, gray,
} from '@/styles/_variables.scss';
import { statusColorBindFactory } from '@/components/molecules/status/Status.util';

export const serverTableReactive = parent => reactive({
    fields: makeTrFields([
        ['name', 'COL_NM.NAME'],
        ['state', 'COL_NM.STATE'],
        ['primary_ip_address', 'COL_NM.IP'],
        ['core', 'COL_NM.CORE'],
        ['memory', 'COL_NM.MEMORY'],
        ['os_type', 'COL_NM.O_TYPE'],
        ['os_distro', 'COL_NM.O_DIS'],
        ['server_type', 'COL_NM.SE_TYPE'],
        ['platform_type', 'COL_NM.PLATFORM'],
        ['project', 'COL_NM.PROJ'],
        ['pool', 'COL_NM.POOL'],
        ['updated_at', 'COL_NM.UPDATE'],
    ],
    parent),
    selectIndex: [],
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
export const serverSetup = (props, context) => reactive({
    ...toRefs(requestMetaReactive),
    ...toRefs(serverTableReactive(context.parent)),
    dropdown: [
        {
            type: 'item', text: 'update', event: 'update', disabled: false,
        },
        {
            type: 'item', text: 'delete', event: 'delete', disabled: false,
        },
        {
            type: 'item', text: 'activated', event: 'activated', disabled: false,
        },
        {
            type: 'item', text: 'deactivated', event: 'deactivated', disabled: false,
        },
    ],
    serverStateBind: statusColorBindFactory({
        INSERVICE: {
            iconColor: safe,
            textColor: safe,
        },
        PENDING: {
            iconColor: other1,
            textColor: other1,
        },
        MAINTENANCE: {
            iconColor: other2,
            textColor: other2,

        },
        CLOSED: {
            iconColor: alert,
            textColor: alert,
        },
        DELETED: {
            iconColor: gray,
            textColor: gray,
        },
    },
    value => value.toLowerCase()),
    timestampFormater,
    clickAdd() {
        console.log('add');
    },
    changePageSize() { },
    changePageNumber() {},
    clickRefresh() {},
    clickUpdate() {},
    clickDelete() {},
    clickActivated() {},
    clickDeactivated() {},
});

export default {
    name: 'Server',
    components: {
        PStatus,
        BaseDragHorizontal,
        PToolboxTable,
        PButton,
        PI,
        PDropdown,
    },
    setup(props, context) {
        const state = serverSetup(props, context);
        return {
            ...toRefs(state),
            items: computed(() => []),
        };
    },
};


</script>

<style lang="scss" scoped>
    #user-dropdown-btn {
        margin-left: 1rem;
    }
    #empty-space{
        text-align: center;
        margin-bottom: 0.5rem;
        color: $primary2;
        font: 24px/32px Arial;
    }
</style>
