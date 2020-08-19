/* eslint-disable camelcase */
import { makeArrayResults, MockData } from '@/lib/mock/toolset';
import { arrayOf } from '@/lib/casual';
import casual from '@/lib/mock/casual';
import { get, map } from 'lodash';

export const DOMAIN_INFO = {
    domain_id: 'domain_test_id',
};
const dynamicLayoutData = {
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
            {
                port_range_min: 80,
                port_range_max: 80,
                port: '80',
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

export default [
    new MockData('/inventory/server/list', () => makeArrayResults(arrayOf(15, casual._server), 80)),
    new MockData('/inventory/server/get', () => dynamicLayoutData),
    new MockData('/inventory/server/get-data', (req) => {
        // console.log(req);
        const data = JSON.parse(req.data);
        return makeArrayResults(get(dynamicLayoutData, data.key_path), 20);
    }),
    new MockData('/inventory/cloud-service-type/list', () => makeArrayResults(arrayOf(15, casual._cloudServiceType), 1)),
    new MockData('/inventory/cloud-service-type/get', () => casual.cloudServiceType),
    new MockData('/inventory/cloud-service/list', () => makeArrayResults(arrayOf(15, casual._cloudService), 80)),
    new MockData('/inventory/cloud-service/get', () => casual.cloudService),
    new MockData(RegExp('.*?/.*?/member/list'), () => makeArrayResults(arrayOf(5, casual._member), 35)),
    new MockData('/inventory/collector/list', (req) => {
        const params: any = JSON.parse(req.data);
        const filter: any = get(params, 'query.filter');
        if (filter) {
            const res: any[] = [];
            map(filter, (f) => {
                const key = f.k || f.key;
                let values: any = f.v || f.value;
                if (typeof values === 'string') values = [values];
                map(values, (v) => {
                    res.push(casual._collector({ [key]: v }));
                });
            });
            return makeArrayResults(res, res.length);
        }
        return makeArrayResults(arrayOf(15, casual._collector), 80);
    }),
];
