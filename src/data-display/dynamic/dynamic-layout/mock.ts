/* eslint-disable camelcase */
export default {
    item: {
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
            }, {
                name: 'Instance Type',
                key: 'data.compute.instance_type',
            }, {
                name: 'Region',
                key: 'data.compute.region',
            }, {
                name: 'Core',
                key: 'data.hardware.core',
            }, {
                name: 'AZ',
                key: 'data.compute.az',
            }, {
                name: 'OS',
                key: 'data.os.os_distro',
            }],
        },
        data: {
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
        },
    },
    html: {
        data: `
        ELB Network Load Balancer 한도의 80%가 넘는 사용량을 검사합니다. 
        Classic Load Balancer와 Application Load Balancer는 별도의 한도를 가지고 있습니다.
        스냅샷을 기반으로 값이 계산되기 때문에 현재 사용량은 다를 수 있습니다. 
        한도 및 사용량 데이터에 변경 사항을 반영하는 데 최대 24시간이 걸릴 수 있습니다. 
        최근에 한도가 상향 조정된 경우에는 사용률이 일시적으로 한도를 초과하는 것을 확인할 수 있습니다.
        <br/>\\n
        <br>\\n
        <b>알림 기준</b>
        <br>\\n노란색: 한도의 80%에 도달했습니다.
        <br>\\n빨간색: 한도의 100%에 도달했습니다.
        <br>\\n파란색: Trusted Advisor가 한 개 이상의 리전에서 사용률 또는 한도를 가져올 수 없습니다.
        <br>\\n
        <br>\\n
        <b>권장 조치</b>
        <br>\\n서비스 한도가 초과할 것으로 예상될 때는 지원 센터에서 케이스를 생성하여 
        <a href=\\"https://aws.amazon.com/support/createCase?type=service_limit_increase\\" target=\\"_blank\\">
        한도 상향 조정을 요청</a>합니다.
        <br>\\n
        <br>\\n
        <b>추가 리소스</b>
        <br>\\n
        <a href=\\"https://docs.aws.amazon.com/general/latest/gr/aws_service_limits.html#limits_elastic_load_balancer\\" target=\\"_blank\\">
        AWS 서비스 한도 - Elastic Load Balancing 기본 서비스 한도
        </a>
        `,
    },
    table: {
        data: [
            { key: 'replica_set', value: '2' },
            { key: 'Name', value: 'mongodb-s2d3-dev' },
            { key: 'rs_type', value: 'arbiter' },
            { key: 'rs_primary', value: 'false' },
            { key: 'server_type', value: 'mongodb' },
            { value: 'terraform', key: 'Managed_by' },
        ],
    },
};
