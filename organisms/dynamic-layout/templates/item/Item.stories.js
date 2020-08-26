/* eslint-disable camelcase */
import {
    text, number, select, object, boolean,
} from '@storybook/addon-knobs';
import PDynamicLayout from '@/components/organisms/dynamic-layout/PDynamicLayout.vue';
import { action } from '@storybook/addon-actions';
import md from '@/components/organisms/dynamic-layout/PDynamicLayout.md';

export default {
    title: 'organisms/dynamic-layout/item',
    component: PDynamicLayout,
    parameters: {
        notes: md,
    },
};

const defaultLayout = {
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
                ACTIVE: {
                    type: 'state',
                    options: {
                        icon: {
                            image: 'ic_state_active',
                        },
                    },
                },
                DUPLICATED: {
                    type: 'state',
                    options: {
                        icon: {
                            image: 'ic_state_duplicated',
                        },
                    },
                },
                DISCONNECTED: {
                    type: 'state',
                    options: {
                        icon: {
                            image: 'ic_state_disconnected',
                        },
                    },
                },
                MANUAL: {
                    type: 'state',
                    options: {
                        icon: {
                            image: 'ic_state_manual',
                        },
                    },
                },
            },
        }],
    },
};

export const defaultCase = () => ({
    components: { PDynamicLayout },
    template: `<div class="w-full bg-white">
        <PDynamicLayout type="item"
                        :name="name"
                        :options="options"
                        :data="data"
                        :typeOptions="{timezone}"
                        @init="onInit"
        />
    </div>`,
    props: {
        name: {
            default: text('name', defaultLayout.name),
        },
        options: {
            default: object('options', defaultLayout.options),
        },
        timezone: {
            default: text('timezone', 'UTC'),
        },
        data: {
            default: object('data', {
                name: 'cloudone-dev-eks-cluster-adm-worker',
                primary_ip_address: '172.16.16.100',
                server_type: 'VM',
                os_type: 'LINUX',
                data: {
                    compute: {
                        az: 'ap-northeast-2a',
                        security_groups: [],
                        instance_state: 'ACTIVE',
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
            }),
        },
    },
    setup() {
        return {
            onInit: action('init'),
        };
    },
});

const rootPathLayout = {
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
                ACTIVE: {
                    type: 'state',
                    options: {
                        icon: {
                            image: 'ic_state_active',
                        },
                    },
                },
                DUPLICATED: {
                    type: 'state',
                    options: {
                        icon: {
                            image: 'ic_state_duplicated',
                        },
                    },
                },
                DISCONNECTED: {
                    type: 'state',
                    options: {
                        icon: {
                            image: 'ic_state_disconnected',
                        },
                    },
                },
                MANUAL: {
                    type: 'state',
                    options: {
                        icon: {
                            image: 'ic_state_manual',
                        },
                    },
                },
            },
        }],
    },
};

export const rootPathCase = () => ({
    components: { PDynamicLayout },
    template: `<div class="w-full bg-white">
        <PDynamicLayout type="item"
                        :name="name"
                        :options="options"
                        :data="data"
                        :typeOptions="{timezone}"
                        @init="onInit"
        />
    </div>`,
    props: {
        name: {
            default: text('name', rootPathLayout.name),
        },
        options: {
            default: object('options', rootPathLayout.options),
        },
        timezone: {
            default: text('timezone', 'UTC'),
        },
        data: {
            default: object('data', {
                name: 'cloudone-dev-eks-cluster-adm-worker',
                primary_ip_address: '172.16.16.100',
                server_type: 'VM',
                os_type: 'LINUX',
                data: {
                    compute: {
                        az: 'ap-northeast-2a',
                        security_groups: [],
                        instance_state: 'ACTIVE',
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
            }),
        },
    },
    setup() {
        return {
            onInit: action('init'),
        };
    },
});
