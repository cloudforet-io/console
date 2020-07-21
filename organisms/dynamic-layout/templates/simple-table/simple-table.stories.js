/* eslint-disable camelcase */
import SDynamicLayout from '@/components/organisms/dynamic-view/dynamic-layout/SDynamicLayout.vue';
import SDynamicLayoutSimpleTable from '@/components/organisms/dynamic-view/dynamic-layout/templates/simple-table/index.vue';

import { object } from '@storybook/addon-knobs';
import md from '@/components/organisms/dynamic-view/dynamic-layout/SDynamicLayout.md';

export default {
    title: 'organisms/dynamic-layout/simple-table',
    component: SDynamicLayoutSimpleTable,
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
                nested: {
                    child: 'test nested',
                },
                security_group_name: 'web security group',
                security_group_id: '...',
                remote_cidr: '172.16.0.0/16',
                direction: 'inbound',
                prtocol: 'TCP',
                remote: '172.16.0.0/16',
            },
            {
                port_range_min: 80,
                port_range_max: 80,
                port: '80',
                nested: {
                    child: 'test nested',
                },
                security_group_name: 'web security group-2',
                security_group_id: '...',
                remote_cidr: '172.16.0.0/16',
                direction: 'inbound',
                prtocol: 'TCP',
                remote: '172.16.0.0/16',
            },
            {
                port_range_min: 80,
                port_range_max: 80,
                port: '80',
                nested: {
                    child: 'test nested',
                },
                security_group_name: 'web security group-3',
                security_group_id: '...',
                remote_cidr: '172.16.0.0/16',
                direction: 'inbound',
                prtocol: 'UDP',
                remote: '172.16.0.0/16',
            },
        ],
    },
    reference: {
        resource_id: 'arn:aws:ec2:ap-northeast-2:072548720675:instance/i-0745c928020bed89f',
        external_link: 'https://ap-northeast-2.console.aws.amazon.com/ec2/v2/home?region=ap-northeast-2#Instances:instanceId=i-0745c928020bed89f',
    },
};

const defaultLayout = {
    name: 'Security Group Rules',
    type: 'simple-table',
    options: {
        root_path: 'data.security_group_rules',
        fields: [
            {
                name: 'Name',
                key: 'security_group_name',
            },
            {
                name: 'Port Max',
                key: 'port_range_max',
            },
            {
                name: 'Port Min',
                key: 'port_range_min',
            },
            {
                name: 'nested',
                key: 'nested.child',
            },
            {
                name: 'Port',
                key: 'port',
            },
            {
                name: 'Protocol',
                key: 'port',
            },


            {
                name: 'Protocol',
                key: 'prtocol',
                type: 'enum',
                options: {
                    TCP: {
                        type: 'state',
                        options: {
                            icon: {
                                color: 'green',
                            },
                        },
                    },
                    UDP: {
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

export const defaultCase = () => ({
    components: { SDynamicLayout },
    template: '<div  class="w-screen bg-white"><SDynamicLayout v-bind="layout" :data="data" /></div>',
    props: {
        layout: {
            type: Object,
            default: object('layout', defaultLayout, 'layout'),
        },
        data: {
            type: Object,
            default: object('data', data, 'data'),
        },

    },

});
