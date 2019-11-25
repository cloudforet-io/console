<template>
    <div>
        <p-toolbox-table
            :items="items"
            :fields="fields"
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
import { makeTrItems } from '@/lib/helper';
import serverEventBus from '@/views/inventory/server/ServerEventBus';
import { isEmpty } from '@/lib/util';
import { makeProxy } from '@/lib/compostion-util';

const PToolboxTable = () => import('@/components/organisms/tables/toolbox-table/ToolboxTable');


export default {
    name: 'PServerData',
    components: { PToolboxTable },
    props: {
        selectIndex: Array,
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
        getServerAdmin: String, // event name
    },
    setup(props, { parent, emit }) {
        const fields = makeTrItems([
            ['user_id', 'COMMON.ID'],
            ['name', 'COMMON.NAME'],
            ['email', 'COMMON.EMAIL'],
            ['group', 'COMMON.GROUP'],
            ['tags', 'COMMON.TAG'],
        ], parent);
        const state = reactive({
            proxyThisPage: makeProxy('thisPage', props, emit),
            proxyAllPage: makeProxy('allPage', props, emit),
            proxyPageSize: makeProxy('pageSize', props, emit),
            proxySortBy: makeProxy('sortBy', props, emit),
            proxySortDesc: makeProxy('sortDesc', props, emit),
            fields,
        });
        const getData = () => {
            serverEventBus.$emit(props.getServerAdmin, props.selectIndex);
        };
        onMounted(() => {
            watch(() => props.selectIndex, (val) => {
                if (isEmpty(val)) {
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
