/* eslint-disable camelcase */
import SDynamicLayout from '@/components/organisms/dynamic-view/dynamic-layout/SDynamicLayout.vue';
import { object } from '@storybook/addon-knobs';
import { mockFluentApi } from '@sb/mockApi';
import { computed, ref } from '@vue/composition-api';
import md from './SDynamicLayout.md';

export default {
    title: 'organisms/dynamic-view/dynamic-layout',
    component: SDynamicLayout,
    parameters: {
        notes: md,
    },
};

const data = {
    name: 'cloudone-dev-eks-cluster-adm-worker',
    primary_ip_address: '172.16.16.100',
    server_type: 'VM',
    os_type: 'LINUX',
    data: {
        compute: {
            az: 'ap-northeast-2a',
            security_groups: [],
            instance_state: 'running',
            instance_type: 'm5.2xlarge',
            image: 'amazon-eks-node-1.14-v20190927',
            region: 'ap-northeast-2',
            launched_at: '2020-04-13',
            account_id: '072548720675',
            keypair: '...',
            instance_name: 'cloudone-dev-eks-cluster-adm-worker',
        },
        aws: {
            lifecycle: 'norma',
            ebs_oprimized: false,
            iam_instance_profile: {
                name: 'cloudone-dev-EKSAdminWorkerRole',
                arn: 'arn:aws:iam::072548720675:instance-profile/cloudone-dev-EKSAdminWorkerRole',
                id: 'AIPARBZB5UARS3CO3KSQF',
            },
        },
        auto_scaling_group: {
            name: 'cloudone-dev-eks-cluster-adm-worker',
            arn: '...',
            launch_configuration_name: 'cloudone-dev-eks-cluster_woker0120200115104205194400000001',
            launch_configuration_arn: '...',
        },
        os: {
            os_distro: 'amazonlinux',
            os_arch: 'x86_64',
        },
        hardware: {
            core: 8,
            memory: 32,
        },
        security_group_rules: [
            {
                port_range_min: 80,
                port_range_max: 80,
                port: '80',
                security_group_name: 'web security group',
                security_group_id: '...',
                remote_cidr: '172.16.0.0/16',
                direction: 'inbound',
                prtocol: 'TCP',
                remote: '172.16.0.0/16',
            },
        ],
    },
    reference: {
        resource_id: 'arn:aws:ec2:ap-northeast-2:072548720675:instance/i-0745c928020bed89f',
        external_link: 'https://ap-northeast-2.console.aws.amazon.com/ec2/v2/home?region=ap-northeast-2#Instances:instanceId=i-0745c928020bed89f',
    },
    metadata: {
        view: {
            sub_data: {
                layouts: [{
                    name: 'AWS EC2',
                    type: 'list',
                    options: [{
                        name: 'EC2 Instance',
                        type: 'item',
                        options: {
                            fields: [{
                                name: 'Instance ID',
                                key: 'data.compute.instance_name',
                            }, {
                                name: 'Region',
                                key: 'data.compute.region',
                            }, {
                                name: 'Instance State',
                                key: 'data.compute.instance_state',
                                type: 'enum',
                                options: {
                                    running: {
                                        type: 'state',
                                        options: {
                                            icon: {
                                                image: 'round',
                                                color: 'green',
                                            },
                                        },
                                    },
                                    'shutting-down': {
                                        type: 'state',
                                        options: {
                                            icon: {
                                                image: 'round',
                                                color: 'red',
                                            },
                                        },
                                    },
                                },
                            }],
                        },
                    }, {
                        name: 'Auto Scaling Group',
                        type: 'item',
                        options: {
                            fields: [{
                                name: 'Auto Scaling Group',
                                key: 'data.auto_scaling_group.name',
                            }, {
                                name: 'Launch Template',
                                key: 'data.auto_scaling_group.launch_configuration_name',
                            }, {
                                name: 'Launch Template',
                                key: 'data.auto_scaling_group.launch_configuration_name',
                            }],
                        },
                    }],
                }, {
                    name: 'Security Group',
                    type: 'table',
                    options: {
                        root_path: 'data.security_group_rules',
                        fields: [{
                            name: 'Direction',
                            key: 'direction',
                            type: 'enum',
                            options: {
                                outbound: {
                                    type: 'badge',
                                    options: {
                                        color: 'blue',
                                    },
                                },
                                inbound: {
                                    type: 'badge',
                                    options: {
                                        color: 'red',
                                    },
                                },
                            },
                        }, {
                            name: 'Name',
                            key: 'security_group_name',
                        }, {
                            name: 'Remote',
                            key: 'Remote',
                        }, {
                            name: 'Port',
                            key: 'port',
                        }, {
                            name: 'Protocol',
                            key: 'protocol',
                        }],
                    },
                }],
            },
        },
    },
};

const itemLayout = {
    name: 'EC2 Instance',
    type: 'item',
    options: {
        fields: [{
            name: 'Instance ID',
            key: 'data.compute.instance_name',
        }, {
            name: 'Region',
            key: 'data.compute.region',
        }, {
            name: 'Instance State',
            key: 'data.compute.instance_state',
            type: 'enum',
            options: {
                running: {
                    type: 'state',
                    options: {
                        icon: {
                            color: 'green',
                        },
                    },
                },
                'shutting-down': {
                    type: 'state',
                    options: {
                        icon: {
                            color: 'red',
                        },
                    },
                },
            },
        }],
    },
};

export const itemType = () => ({
    components: { SDynamicLayout },
    template: '<div class="w-full bg-white"><SDynamicLayout v-bind="layout" :data="data" /></div>',
    props: {
        layout: {
            type: Object,
            default: object('layout', itemLayout, 'layout'),
        },
        data: {
            type: Object,
            default: object('data', data, 'data'),
        },

    },

});

const itemLayoutRootPath = {
    name: 'EC2 Instance',
    type: 'item',
    options: {
        root_path: 'data.compute',
        fields: [{
            name: 'Instance ID',
            key: 'instance_name',
        }, {
            name: 'Region',
            key: 'region',
        }, {
            name: 'Instance State',
            key: 'instance_state',
            type: 'enum',
            options: {
                running: {
                    type: 'state',
                    options: {
                        icon: {
                            color: 'green',
                        },
                    },
                },
                'shutting-down': {
                    type: 'state',
                    options: {
                        icon: {
                            color: 'red',
                        },
                    },
                },
            },
        }],
    },
};
export const itemTypeWidthRootPath = () => ({
    components: { SDynamicLayout },
    template: '<div class="w-3/4 bg-white"><SDynamicLayout v-bind="layout" :data="data" /></div>',
    setup() {
        return {
            layout: itemLayoutRootPath,
            data,
        };
    },
});

export const itemTypeWidthApi = () => ({
    components: { SDynamicLayout },
    template: `<div class="screen-full bg-white">
        <span>
        <input type="checkbox" v-model="isShow"> is show    
        </span>
        <div class="bg-blue text-white" @click="showData()">show data</div>
        <SDynamicLayout v-bind="layout" :is-show="isShow" :api="api" ref="item"/>
    </div>`,

    setup() {
        const item = ref(null);
        const ts = computed(() => (item.value ? item.value.toolset : null));
        const isShow = ref(true);
        const showData = () => {
            console.log(item.value);
            console.log(ts.value.tableTS.state.items);
        };
        console.log('toolset', ts.value);

        return {
            layout: itemLayoutRootPath,
            api: {
                resource: mockFluentApi.inventory().server(),
                getAction: action => action.setId('dynamicTest'),
            },
            isShow,
            item,
            showData,
        };
    },
});
// const subData = [
//     {
//         IndexName: 'add-pk-index-1',
//         Projection: { ProjectionType: 'ALL' },
//         IndexStatus: 'ACTIVE',
//         ProvisionedThroughput: {
//             NumberOfDecreasesToday: 1, ReadCapacityUnits: 5, WriteCapacityUnits: 5,
//         },
//         ItemCount: 0,
//     },
//     {
//         IndexName: 'add-pk-index-2',
//         KeySchema: [{ AttributeName: 'add-pk', KeyType: 'HASH' }],
//         Projection: { ProjectionType: 'Half' },
//         IndexStatus: 'ACTIVE',
//         ProvisionedThroughput: {
//             NumberOfDecreasesToday: 1, ReadCapacityUnits: 9, WriteCapacityUnits: 5,
//         },
//         ItemCount: 10,
//     },
//     {
//         IndexName: 'add-pk-index-3',
//         KeySchema: [{ AttributeName: 'add-pk', KeyType: 'HASH' }],
//         Projection: { ProjectionType: 'ALL' },
//         IndexStatus: 'DEACTIVATE',
//         ProvisionedThroughput: {
//             NumberOfDecreasesToday: 1, ReadCapacityUnits: 15, WriteCapacityUnits: 2,
//         },
//         ItemCount: 300,
//     },
//     {
//         IndexName: 'add-pk-index-4',
//         KeySchema: [{ AttributeName: 'add-pk', KeyType: 'HASH' }],
//         Projection: { ProjectionType: 'KEY_ONLY' },
//         IndexStatus: 'ACTIVE',
//         ProvisionedThroughput: {
//             NumberOfDecreasesToday: 1, ReadCapacityUnits: 3, WriteCapacityUnits: 1,
//         },
//         ItemCount: 1000,
//     },
// ];
// //
// // export const tableType = () => ({
// //     components: { PDynamicView },
// //     template: '<div style="width: 80vw"><PDynamicView view_type="table" :data_source="data_source" :apiHandler="apiHandler" :data="null"/></div>',
// //     setup(props, { parent }) {
// //         return {
// //             apiHandler: new MockSubDataAPI(subData),
// //             data_source: [
// //                 {
// //                     name: 'Index Name',
// //                     key: 'IndexName',
// //                 },
// //                 {
// //                     name: 'Projection Type',
// //                     key: 'Projection.ProjectionType',
// //                 },
// //                 {
// //                     name: 'Item Count',
// //                     key: 'ItemCount',
// //                 },
// //                 {
// //                     name: 'status',
// //                     key: 'IndexStatus',
// //                     view_type: 'enum',
// //                     view_option: {
// //                         DEACTIVE: {
// //                             view_option: {
// //                                 text_color: '#FF7750',
// //                                 icon: {
// //                                     image: 'aws-ec2',
// //                                     color: '#FF7750',
// //                                 },
// //                             },
// //                             view_type: 'state',
// //                         },
// //                         ACTIVE: {
// //                             view_option: {
// //                                 text_color: '#60B731',
// //                                 icon: {
// //                                     image: 'aws-ec2',
// //                                     color: '#60B731',
// //                                 },
// //                             },
// //                             view_type: 'state',
// //                         },
// //
// //                     },
// //                 },
// //                 {
// //                     name: 'Write capacity units',
// //                     key: 'ProvisionedThroughput.WriteCapacityUnits',
// //                 },
// //                 {
// //                     name: 'Read capacity units',
// //                     key: 'ProvisionedThroughput.ReadCapacityUnits',
// //                 },
// //             ],
// //
// //         };
// //     },
// // });
//
// export const simpleTable = () => ({
//     components: { PDynamicView },
//     template: '<div style="width: 80vw"><PDynamicView view_type="simple-table" :data_source="data_source"  :data="data.GlobalSecondaryIndexes"/></div>',
//     setup(props, { parent }) {
//         return {
//             data,
//             data_source: [
//                 {
//                     name: 'Index Name',
//                     key: 'IndexName',
//                 },
//                 {
//                     name: 'Projection Type',
//                     key: 'Projection.ProjectionType',
//                 },
//                 {
//                     name: 'Item Count',
//                     key: 'ItemCount',
//                 },
//                 {
//                     name: 'status',
//                     key: 'IndexStatus',
//                     view_type: 'enum',
//                     view_option: {
//                         DEACTIVE: {
//                             view_option: {
//                                 text_color: '#FF7750',
//                                 icon: {
//                                     image: 'aws-ec2',
//                                     color: '#FF7750',
//                                 },
//                             },
//                             view_type: 'state',
//                         },
//                         ACTIVE: {
//                             view_option: {
//                                 text_color: '#60B731',
//                                 icon: {
//                                     image: 'aws-ec2',
//                                     color: '#60B731',
//                                 },
//                             },
//                             view_type: 'state',
//                         },
//
//                     },
//                 },
//                 {
//                     name: 'Write capacity units',
//                     key: 'ProvisionedThroughput.WriteCapacityUnits',
//                 },
//                 {
//                     name: 'Read capacity units',
//                     key: 'ProvisionedThroughput.ReadCapacityUnits',
//                 },
//             ],
//
//         };
//     },
// });
