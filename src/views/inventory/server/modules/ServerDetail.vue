<template>
    <SDynamicSubData
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
    computed,
    defineComponent, onMounted, reactive, toRefs, watch,
} from '@vue/composition-api';
import _ from 'lodash';

const listLayout = {
    name: 'AWS EC2',
    options: {
        layouts: [{
            name: 'EC2 Instance',
            options: {
                fields: [{
                    key: 'data.compute.instance_id',
                    name: 'Instance ID',
                },
                {
                    key: 'data.compute.instance_state',
                    name: 'Instance State',
                    options: {
                        pending: {
                            options: {
                                icon: {
                                    color: 'gray.500',
                                    image: 'round',
                                },
                            },
                            type: 'state',
                        },
                        running: {
                            options: {
                                icon: {
                                    color: 'green.500',
                                    image: 'round',
                                },
                            },
                            type: 'state',
                        },
                        'shutting-down': {
                            options: {
                                icon: {
                                    color: 'yellow.500',
                                    image: 'round',
                                },
                            },
                            type: 'state',
                        },
                        stopped: {
                            options: {
                                icon: {
                                    color: 'red.500',
                                    image: 'round',
                                },
                            },
                            type: 'state',
                        },
                    },
                    type: 'enum',
                },
                {
                    key: 'data.compute.instance_type',
                    name: 'Instance Type',
                },
                {
                    key: 'data.aws.lifecycle',
                    name: 'EC2 Lifecycle',
                    options: {
                        normal: {
                            options: { background_color: 'green.500' },
                            type: 'badge',
                        },
                        scheduled: {
                            options: { background_color: 'yellow.500' },
                            type: 'badge',
                        },
                        spot: {
                            options: { background_color: 'coral.500' },
                            type: 'badge',
                        },
                    },
                    type: 'enum',
                },
                {
                    key: 'data.compute.keypair',
                    name: 'Key Pair',
                },
                {
                    key: 'data.aws.iam_instance_profile.name',
                    name: 'IAM Role',
                },
                {
                    key: 'data.aws.ebs_optimized',
                    name: 'EBS-Optimized',
                    options: {
                        false: {
                            options: { background_color: 'gray.300' },
                            type: 'badge',
                        },
                        true: {
                            options: { background_color: 'green.500' },
                            type: 'badge',
                        },
                    },
                    type: 'enum',
                },
                {
                    key: 'data.compute.image',
                    name: 'Image',
                },
                {
                    key: 'data.compute.region',
                    name: 'Region',
                },
                {
                    key: 'data.compute.az',
                    name: 'Availability zone',
                },
                {
                    key: 'data.public_ip_address',
                    name: 'Public Ip Address',
                },
                {
                    key: 'data.vpc.vpc_id',
                    name: 'VPC ID',
                },
                {
                    key: 'data.vpc.vpc_name',
                    name: 'VPC Name',
                },
                {
                    key: 'data.subnet.subnet_id',
                    name: 'Subnet ID',
                },
                {
                    key: 'data.subnet.subnet_name',
                    name: 'Subnet Name',
                },
                {
                    key: 'data.compute.security_groups',
                    name: 'Security Group',
                    options: { item: { type: 'text' } },
                    type: 'list',
                },
                {
                    key: 'data.compute.account_id',
                    name: 'Created By',
                },
                {
                    key: 'data.compute.launched_at',
                    name: 'Launched At ',
                }],
            },
            type: 'item',
        },
        {
            name: 'Auto Scaling Group',
            options: {
                fields: [{
                    key: 'data.auto_scaling_group.name',
                    name: 'Auto Scaling Group',
                },
                {
                    key: 'data.auto_scaling_group.launch_configuration_name',
                    name: 'Launch Template',
                }],
            },
            type: 'item',
        }],
    },
    type: 'list',
};
const rawLayout = {
    name: 'Raw Data',
    type: 'raw',

};
const defaultLayouts = [
    {
        name: 'Disk',
        options: {
            fields: [{
                key: 'device_index',
                name: 'Index',
            },
            {
                key: 'device',
                name: 'Name',
            },
            {
                key: 'disk_type',
                name: 'Type',
            },
            {
                key: 'size',
                name: 'Size(GB)',
            },
            {
                key: 'tags.encrypted',
                name: 'Encrypted',
                options: {
                    false: {
                        options: { background_color: 'red.500' },
                        type: 'badge',
                    },
                    true: {
                        options: { background_color: 'green.500' },
                        type: 'badge',
                    },
                },
                type: 'enums',
            },
            {
                key: 'tags.iops',
                name: 'iops',
            }],
            root_path: 'disks',
        },
        type: 'table',
    },
    {
        name: 'NIC',
        options: {
            fields: [{
                key: 'device_index',
                name: 'Index',
            },
            {
                key: 'mac_address',
                name: 'MAC Address',
            },
            {
                key: 'tags.ip_list',
                name: 'IP Addresses',
                options: { item: { type: 'text' } },
                type: 'list',
            },
            {
                key: 'tags.eip',
                name: 'Elastic IP',
            },
            {
                key: 'tags.public_dns',
                name: 'Public DNS',
            }],
            root_path: 'nics',
        },
        type: 'table',
    },
    {
        name: 'Security Group',
        options: {
            fields: [{
                key: 'direction',
                name: 'Direction',
                options: {
                    inbound: {
                        options: { background_color: 'green.500' },
                        type: 'badge',
                    },
                    outbound: {
                        options: { background_color: 'blue.500' },
                        type: 'badge',
                    },
                },
                type: 'enum',
            },
            {
                key: 'security_group_name',
                name: 'Name',
            },
            {
                key: 'remote',
                name: 'Remote',
            },
            {
                key: 'port',
                name: 'Port',
            },
            {
                key: 'protocol',
                name: 'Protocol',
            },
            {
                key: 'description',
                name: 'Description',
            }],
            root_path: 'data.security_group_rules',
        },
        type: 'table',
    },
    {
        name: 'ELB',
        options: {
            fields: [{
                key: 'name',
                name: 'Name',
            },
            {
                key: 'dns',
                name: 'DNS',
            },
            {
                key: 'port',
                name: 'Port',
                options: { item: { type: 'text' } },
                type: 'list',
            },
            {
                key: 'type',
                name: 'Type',
                options: {
                    application: {
                        options: { background_color: 'green.500' },
                        type: 'badge',
                    },
                    network: {
                        options: { background_color: 'blue.500' },
                        type: 'badge',
                    },
                },
                type: 'enum',
            },
            {
                key: 'tags.scheme',
                name: 'Scheme',
                options: {
                    internal: {
                        options: { background_color: 'coral.500' },
                        type: 'badge',
                    },
                    'internet-facing': {
                        options: { background_color: 'green.500' },
                        type: 'badge',
                    },
                },
                type: 'enum',
            }],
            root_path: 'data.load_balancers',
        },
        type: 'table',
    }];
export default defineComponent({
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
            mergeLayouts: computed(() => (state.layouts ? [...state.layouts, rawLayout] : null)),
        });

        const getLayout = async () => {
            state.layouts = null;
            let layouts;
            if (cache[props.selectId]) {
                console.debug(props.selectId, ' hit cache layout');
                layouts = cache[props.selectId];
            } else {
                const resp = await fluentApi.inventory().server().get().setId(props.selectId)
                    .setOnly('metadata.view.sub_data.layouts')
                    .execute();
                // layouts = _.get(resp.data, 'metadata.view.sub_data.layouts');
                layouts = defaultLayouts;
                cache[props.selectId] = layouts;
            }
            state.layouts = layouts;
        };
        let watchStop = null as unknown as any;
        watch(() => props.isShow, (aft, bef) => {
            if (aft !== bef) {
                if (aft) {
                    watchStop = watch(() => props.selectId, async (af, be) => {
                        if (af && af !== be) {
                            await getLayout();
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
});
</script>
