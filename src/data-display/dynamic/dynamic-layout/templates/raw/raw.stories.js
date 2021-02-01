/* eslint-disable camelcase */
import {
    boolean, object, text, select,
} from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import { ref } from '@vue/composition-api';
import md from '@/organisms/dynamic-layout/PDynamicLayout.md';
import PDynamicLayout from '@/organisms/dynamic-layout/PDynamicLayout.vue';

export default {
    title: 'Others/Dynamic/DynamicLayout/Raw',
    component: PDynamicLayout,
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
};

const defaultLayout = {
    name: 'EC2 Instance',
    type: 'raw',
    options: {

    },
};

export const defaultCase = () => ({
    components: { PDynamicLayout },
    template: `
        <div class="w-screen bg-white">
            <PDynamicLayout v-bind="$props" type="raw" @init="onInit" />
        </div>
    `,
    props: {
        name: {
            default: text('name', 'Raw Data'),
        },
        options: {
            default: object('options', {}),
        },
        timezone: {
            default: text('timezone', 'UTC'),
        },
        data: {
            default: object('data', data),
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
    type: 'raw',
    options: {
        root_path: 'data.compute',
    },
};

export const rootPathCase = () => ({
    components: { PDynamicLayout },
    template: `
        <div class="w-screen bg-white">
            <PDynamicLayout type="raw"
                            :name="name"
                            :options="options"
                            :data="data"
                            @init="onInit" />
        </div>
    `,
    props: {
        name: {
            default: text('name', 'Root Path Raw Data'),
        },
        options: {
            default: object('options', {
                root_path: 'data.compute',
            }),
        },
        data: {
            default: object('data', data),
        },
    },
    setup() {
        return {
            onInit: action('init'),
        };
    },
});
