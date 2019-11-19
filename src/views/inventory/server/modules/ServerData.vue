<template>
    <div>
        <p-select-btn-group :buttons="buttons" :selected.sync="selected" @clickButton="getData" />
        <p-toolbox-table
            :items="items"
            :fields="dataFields[selected]"
            :selectable="false"
            :sortable="true"
            :hover="true"
            :sort-by.sync="proxySortBy"
            :sort-desc.sync="proxySortDesc"
            :all-page="proxyAllPage"
            :this-page.sync="proxyThisPage"
            :page-size.sync="proxyPageSize"
            :responsive-style="{'height': '24rem', 'overflow-y':'auto'}"
            :setting-visible="false"
            :shadow="false"
            :border="false"
            @changePageSize="getData"
            @changePageNumber="getData"
            @clickRefresh="getData"
            @changeSort="getData"
        >
            <!-- nic fields -->
            <template #col-ip_address-format="{item}">
                {{ item.ip_addresses? item.ip_addresses[0].ip_address:'' }}
            </template>
            <template #col-cidr-format="{item}">
                {{ item.ip_addresses? item.ip_addresses[0].cidr :'' }}
            </template>
            <template #col-subnet_id-format="{item}">
                {{ item.ip_addresses? item.ip_addresses[0].subnet_id :'' }}
            </template>
            <!-- sg -->
            <template #col-port_range-format="{item}">
                {{ item.port_range_min }} - {{ item.port_range_max }}
            </template>
        </p-toolbox-table>
    </div>
</template>

<script>
import {
    onMounted, reactive, toRefs, watch,
} from '@vue/composition-api';
import PSelectBtnGroup from '@/components/organisms/buttons/select-btn-group/SelectBtnGroup';
import PToolboxTable from '@/components/organisms/tables/toolbox-table/ToolboxTable';
import { makeTrItems } from '@/lib/helper';
import serverEventBus from '@/views/inventory/server/ServerEventBus';
import { makeProxy } from '@/lib/compostion-util';


export default {
    name: 'ServerData',
    components: { PSelectBtnGroup, PToolboxTable },
    props: {
        serverId: String,
        items: {
            type: Array,
            default: () => [],
        },
        sortBy: {
            type: String,
            default: null,
        },
        sortDesc: {
            type: Boolean,
            default: true,
        },
        pageSize: {
            type: Number,
            default: 15,
        },
        allPage: {
            type: Number,
            default: 1,
            validator(value) {
                return value > 0;
            },
        },
        thisPage: {
            type: Number,
            default: 1,
            validator(value) {
                return value > 0;
            },
        },
        getServerSubData: String, // event name
    },
    setup(props, { parent, emit }) {
        const dataFields = {
            disk: makeTrItems([
                ['device_index', null, { label: '#' }],
                ['device', 'COMMON.DEVICE'],
                ['disk_type', 'COMMON.TYPE'],
                ['size', 'COMMON.SIZE'],
                ['tags', 'COMMON.TAG'],
            ], parent),
            nic: makeTrItems([
                ['device_index', null, { label: '#' }],
                ['device', 'COMMON.DEVICE'],
                ['ip_address', 'COMMON.IP'],
                ['cidr', 'COMMON.CIDR'],
                ['subnet_id', 'COMMON.NETWORK'],
                ['mac_address', 'COMMON.MAC'],
                ['tags', 'COMMON.TAG'],
            ], parent),
            security_group: makeTrItems([
                ['direction', 'COMMON.DIRECTION'],
                ['protocol', 'COMMON.PROTOCOL'],
                ['port_range', 'COMMON.PORT_RANGE'],
                ['remote_cidr', 'COMMON.SRC_DEST'],
                ['security_group_name', 'COMMON.SG_NAME'],
                ['security_group_id', 'COMMON.SG_ID'],
            ], parent),
        };
        const buttons = makeTrItems(
            [
                ['disk', null, { label: 'disk' }],
                ['nic', null, { label: 'nic' }],
                ['security_group', null, { label: 'security_group' }],
            ],
            parent,
            { vbind: { styleType: 'dark', outline: true } },
        );
        const state = reactive({
            selected: 'disk',
            proxyThisPage: makeProxy('thisPage', props, emit),
            proxyAllPage: makeProxy('allPage', props, emit),
            proxyPageSize: makeProxy('pageSize', props, emit),
            proxySortBy: makeProxy('sortBy', props, emit),
            proxySortDesc: makeProxy('sortDesc', props, emit),
            dataFields,
            buttons,
        });
        const getData = () => {
            serverEventBus.$emit(props.getServerSubData, props.serverId, state.selected);
        };
        onMounted(() => {
            watch(() => props.serverId, (val) => {
                if (val) {
                    getData();
                }
            });
        });

        return {
            ...toRefs(state),
            getData,
        };
    },
};
</script>
