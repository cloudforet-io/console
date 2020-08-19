/* eslint-disable camelcase */
import {
    text, number, select, object, boolean,
} from '@storybook/addon-knobs/vue';
import { action } from '@storybook/addon-actions';
import { computed, reactive, toRefs } from '@vue/composition-api';
import casual, { arrayOf } from '@/components/util/casual';
import md from '@/components/organisms/dynamic-layout/PDynamicLayout.md';
import PDynamicLayout from '@/components/organisms/dynamic-layout/PDynamicLayout.vue';

export default {
    title: 'organisms/dynamic-layout/simple-table',
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
                name: 'Nested',
                key: 'nested.child',
            },
            {
                name: 'Port',
                key: 'port',
            },
            {
                name: 'Protocol',
                key: 'protocol',
                type: 'enum',
                options: {
                    TCP: {
                        type: 'state',
                        options: {
                            icon: {
                                image: 'ic_admin',
                            },
                        },
                    },
                    UDP: {
                        type: 'state',
                        options: {
                            icon: {
                                image: 'ic_alert',
                            },
                        },
                    },
                },
            }],
    },
};

export const defaultCase = () => ({
    components: { PDynamicLayout },
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
    },
    template: `
        <div style="width: 95vw;" class="flex">
            <PDynamicLayout style="width: 65%;"
                            type="simple-table"
                            :name="name"
                            :options="options"
                            :extra="extra"
                            :data="data"
                            
                           @init="onInit"/>
            <pre style="width: 30%; font-size: 0.75rem; overflow: scroll; height: 100%; border: 1px solid gray; margin-left: 1rem;">
                {{data}}
            </pre>
        </div>
        `,
    setup() {
        const state = reactive({
            data: [],
            extra: {
                totalCount: 0,
                timezone: computed(() => props.timezone),
            },
        });

        const onFetch = async (options, changed) => {
            state.data = await new Promise((resolve) => {
                setTimeout(() => {
                    state.extra.totalCount = casual.integer(0, 25);
                    const res = {
                        data: {
                            security_group_rules: arrayOf(state.extra.totalCount,
                                () => ({
                                    security_group_name: casual.name,
                                    port_range_max: casual.integer(0),
                                    port_range_min: casual.integer(0),
                                    port: casual.integer(0),
                                    protocol: casual.random_element(['TCP', 'UDP']),
                                    nested: {
                                        child: casual.word,
                                    },
                                })),
                        },
                    };
                    resolve(res);
                }, 1000);
            });
        };
        return {
            ...toRefs(state),
            onInit(...args) {
                action('init')(...args);
                onFetch(...args);
            },
        };
    },
});
