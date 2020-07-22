<template>
    <s-dynamic-sub-data
        :layouts="mergeLayouts"
        :resource-api="resourceApi"
        :select-id="selectId"
        :is-show="isShow"
    />
</template>

<script lang="ts">

import SDynamicSubData from '@/components/organisms/dynamic-view/dynamic-subdata/SDynamicSubData.vue';
import { fluentApi } from '@/lib/fluent-api';
import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';
import { get, debounce } from 'lodash';
import baseInfoSchema from '@/metadata-schema/view/inventory/server/sub_data/layouts/base_info.json';

const rawLayout = {
    name: 'Raw Data',
    type: 'raw',

};
// const defaultLayouts = [
//     listLayout,
//     {
//         name: 'Disk',
//         options: {
//             fields: [{
//                 key: 'device_index',
//                 name: 'Index',
//             },
//             {
//                 key: 'device',
//                 name: 'Name',
//             },
//             {
//                 key: 'disk_type',
//                 name: 'Type',
//             },
//             {
//                 key: 'size',
//                 name: 'Size(GB)',
//             },
//             {
//                 key: 'tags.encrypted',
//                 name: 'Encrypted',
//                 options: {
//                     false: {
//                         options: { background_color: 'red.500' },
//                         type: 'badge',
//                     },
//                     true: {
//                         options: { background_color: 'green.500' },
//                         type: 'badge',
//                     },
//                 },
//                 type: 'enums',
//             },
//             {
//                 key: 'tags.iops',
//                 name: 'iops',
//             }],
//             root_path: 'disks',
//         },
//         type: 'table',
//     },
//     {
//         name: 'NIC',
//         options: {
//             fields: [{
//                 key: 'device_index',
//                 name: 'Index',
//             },
//             {
//                 key: 'mac_address',
//                 name: 'MAC Address',
//             },
//             {
//                 key: 'tags.ip_list',
//                 name: 'IP Addresses',
//                 options: { item: { type: 'text' } },
//                 type: 'list',
//             },
//             {
//                 key: 'tags.eip',
//                 name: 'Elastic IP',
//             },
//             {
//                 key: 'tags.public_dns',
//                 name: 'Public DNS',
//             }],
//             root_path: 'nics',
//         },
//         type: 'table',
//     },
//     {
//         name: 'Security Group',
//         options: {
//             fields: [{
//                 key: 'direction',
//                 name: 'Direction',
//                 options: {
//                     inbound: {
//                         options: { background_color: 'green.500' },
//                         type: 'badge',
//                     },
//                     outbound: {
//                         options: { background_color: 'blue.500' },
//                         type: 'badge',
//                     },
//                 },
//                 type: 'enum',
//             },
//             {
//                 key: 'security_group_name',
//                 name: 'Name',
//             },
//             {
//                 key: 'remote',
//                 name: 'Remote',
//             },
//             {
//                 key: 'port',
//                 name: 'Port',
//             },
//             {
//                 key: 'protocol',
//                 name: 'Protocol',
//             },
//             {
//                 key: 'description',
//                 name: 'Description',
//             }],
//             root_path: 'data.security_group_rules',
//         },
//         type: 'table',
//     },
//     {
//         name: 'ELB',
//         options: {
//             fields: [{
//                 key: 'name',
//                 name: 'Name',
//             },
//             {
//                 key: 'dns',
//                 name: 'DNS',
//             },
//             {
//                 key: 'port',
//                 name: 'Port',
//                 options: { item: { type: 'text' } },
//                 type: 'list',
//             },
//             {
//                 key: 'type',
//                 name: 'Type',
//                 options: {
//                     application: {
//                         options: { background_color: 'green.500' },
//                         type: 'badge',
//                     },
//                     network: {
//                         options: { background_color: 'blue.500' },
//                         type: 'badge',
//                     },
//                 },
//                 type: 'enum',
//             },
//             {
//                 key: 'tags.scheme',
//                 name: 'Scheme',
//                 options: {
//                     internal: {
//                         options: { background_color: 'coral.500' },
//                         type: 'badge',
//                     },
//                     'internet-facing': {
//                         options: { background_color: 'green.500' },
//                         type: 'badge',
//                     },
//                 },
//                 type: 'enum',
//             }],
//             root_path: 'data.load_balancers',
//         },
//         type: 'table',
//     }];

export default {
    name: 'PServerDetail',
    components: {
        SDynamicSubData,
    },
    props: {
        selectId: {
            type: String,
            default: '',
        },
        isShow: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, context) {
        const cache = {};
        const state = reactive({
            layouts: null,
            resourceApi: fluentApi.inventory().server(),
            mergeLayouts: computed(() => (state.layouts ? [baseInfoSchema, ...state.layouts, rawLayout] : [baseInfoSchema, rawLayout])),
        });


        const getLayoutFunc = async () => {
            state.layouts = null;
            let layouts;
            if (cache[props.selectId]) {
                // console.debug(props.selectId, ' hit cache layout');
                layouts = cache[props.selectId];
            } else {
                const resp = await fluentApi.inventory().server().get().setId(props.selectId)
                    .setOnly('metadata.view.sub_data.layouts')
                    .execute();
                layouts = get(resp.data, 'metadata.view.sub_data.layouts', []);
                // layouts = defaultLayouts;
                cache[props.selectId] = layouts;
            }
            state.layouts = layouts;
        };
        const getLayout = debounce(getLayoutFunc, 50);

        let watchStop = null as unknown as any;
        watch(() => props.isShow, (aft, bef) => {
            if (aft !== bef) {
                if (aft) {
                    watchStop = watch(() => props.selectId, (af, be) => {
                        if (af && af !== be) {
                            getLayout();
                        }
                    });
                } else if (watchStop) {
                    watchStop();
                    state.layouts = null;
                    watchStop = null;
                }
            }
        });
        getLayout();

        return {
            ...toRefs(state),
        };
    },
};
</script>
