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
            }, {
                name: 'Changed Jobs',
                key: 'collection_info.change_history.job_id',
                options: {
                    delimiter: '  ',
                    link: 'https://www.google.com',
                },
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
            collection_info: {
                secrets: [
                    'secret-dc17a188d214',
                    'secret-fe25ca834a20',
                ],
                state: 'ACTIVE',
                collectors: [
                    'collector-005363ecb28d',
                    'collector-15a0703b5dc6',
                    'collector-2bee95327fa2',
                ],
                service_accounts: [
                    'sa-5e186fcc7c91',
                    'sa-6b677520656a',
                ],
                change_history: [
                    {
                        updated_at: '2021-03-16T07:00:20.890000Z',
                        job_id: 'job-fed98e922800',
                        key: 'state',
                        diff: {},
                        updated_by: 'collector-2bee95327fa2',
                    },
                    {
                        diff: {},
                        key: 'project_id',
                        job_id: 'job-fed98e922800',
                        updated_at: '2021-03-16T07:00:20.890000Z',
                        updated_by: 'collector-2bee95327fa2',
                    },
                    {
                        job_id: 'job-36ec104500f2',
                        diff: {
                            delete: {
                                status: 'IN_PROGRESS',
                            },
                            insert: {
                                status: 'RUNNING',
                            },
                        },
                        updated_by: 'collector-15a0703b5dc6',
                        key: 'data.power_state',
                        updated_at: '2021-03-16T09:53:54.280000Z',
                    },
                    {
                        updated_at: '2021-03-16T07:12:14.603000Z',
                        diff: {},
                        key: 'metadata.plugin-4969e01314b4',
                        job_id: 'job-2ecb802f026f',
                        updated_by: 'collector-005363ecb28d',
                    },
                    {
                        diff: {
                            insert: {
                                cpu: {
                                    utilization: {
                                        max: 7,
                                        avg: 1,
                                    },
                                },
                                network: {
                                    sent_throughput: {
                                        avg: 860034,
                                        max: 970746,
                                    },
                                    sent_pps: {
                                        max: 3123,
                                        avg: 2727.2,
                                    },
                                    received_pps: {
                                        avg: 2249.6,
                                        max: 2786,
                                    },
                                    received_throughput: {
                                        max: 1654573,
                                        avg: 846850.8,
                                    },
                                },
                                disk: {
                                    read_iops: {
                                        max: 65,
                                        avg: 0.1,
                                    },
                                    write_throughput: {
                                        max: 85647360,
                                        avg: 3391348.6,
                                    },
                                    read_throughput: {
                                        max: 868352,
                                        avg: 1029.7,
                                    },
                                    write_iops: {
                                        avg: 455.3,
                                        max: 831,
                                    },
                                },
                            },
                            delete: {
                                cpu: {
                                    utilization: {
                                        avg: 1.1,
                                        max: 49,
                                    },
                                },
                                disk: {
                                    write_iops: {
                                        avg: 474.1,
                                        max: 18128,
                                    },
                                    read_throughput: {
                                        avg: 517468.8,
                                        max: 609410560,
                                    },
                                    read_iops: {
                                        avg: 15.9,
                                        max: 9602,
                                    },
                                    write_throughput: {
                                        avg: 4296616.3,
                                        max: 377769984,
                                    },
                                },
                                network: {
                                    sent_pps: {
                                        max: 8713,
                                        avg: 2673.6,
                                    },
                                    received_throughput: {
                                        avg: 1005247.7,
                                        max: 225911634,
                                    },
                                    received_pps: {
                                        avg: 2295.6,
                                        max: 152832,
                                    },
                                    sent_throughput: {
                                        max: 3606504,
                                        avg: 839661.4,
                                    },
                                },
                            },
                        },
                        job_id: 'job-5f808281f536',
                        key: 'data.monitoring',
                        updated_by: 'collector-005363ecb28d',
                        updated_at: '2021-03-18T08:00:13.541000Z',
                    },
                ],
            },
        },
    },
    html: {
        options: {},
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
        options: {
            fields: [
                {
                    key: 'key',
                    type: 'text',
                    name: 'Key',
                },
                {
                    key: 'value',
                    name: 'Value',
                    type: 'text',
                },
                {
                    key: 'data.array.id',
                    name: 'Hello',
                    type: 'badge',
                },
            ],
        },
        data: [
            { key: 'replica_set', value: '2', data: { array: [{ id: 'a' }] } },
            { key: 'Name', value: 'mongodb-s2d3-dev', data: { array: [{ id: 'b' }] } },
            { key: 'rs_type', value: 'arbiter', data: { array: [{ id: 'c' }, { id: 'cccccc' }] } },
            { key: 'rs_primary', value: 'false', data: { array: [{ id: 'd' }, { id: 'ddd' }] } },
            { key: 'server_type', value: 'mongodb', data: { array: [] } },
        ],
    },
    rawTable: {
        data: [
            { key: 'replica_set', value: '2', data: { array: [{ id: 'a' }] } },
            { key: 'Name', value: 'mongodb-s2d3-dev', data: { array: [{ id: 'b' }] } },
            { key: 'rs_type', value: 'arbiter', data: { array: [{ id: 'c' }, { id: 'cccccc' }] } },
            { key: 'rs_primary', value: 'false', data: { array: [{ id: 'd' }, { id: 'ddd' }] } },
            { key: 'server_type', value: 'mongodb', data: { array: [] } },
        ],
    },
    querySearchTable: {
        options: {
            fields: [{
                name: 'Instance ID',
                key: 'server_id',
            }, {
                name: 'Region',
                key: 'data.compute.region',
            }, {
                name: 'Changed Jobs',
                key: 'data.collection_info.change_history.job_id',
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
                    DISCONNECTED: {
                        type: 'state',
                        options: {
                            icon: {
                                image: 'ic_state_disconnected',
                            },
                        },
                    },
                },
            }],
        },
    },
    markdown: {
        options: {
            markdown: `
## Header

# h1 Heading 8-)
## h2 Heading
### h3 Heading
#### h4 Heading
##### h5 Heading
###### h6 Heading


## Horizontal Rules

bar 1

___

bar 2

---

bar 3

***



## Emphasis

**This is bold text**

__This is bold text__

*This is italic text*

_This is italic text_

~~Strikethrough~~


## Blockquotes

> Blockquotes!!!

> > nested Blockquotes


## Lists

Unordered

+ Create a list by starting a line with \`+\`, \`-\`, or \`*\`
+ Sub-lists are made by indenting 2 spaces:
- Marker character change forces new list start:
* Ac tristique libero volutpat at
+ Facilisis in pretium nisl aliquet
- Nulla volutpat aliquam velit
+ Very easy!

Ordered

1. Lorem ipsum dolor sit amet
2. Consectetur adipiscing elit
3. Integer molestie lorem at massa


1. You can use sequential numbers...
1. ...or keep all the numbers as \`1.\`

Start numbering with offset:

57. foo
1. bar


## Code

Inline \`code\`

Indented code

// Some comments
line 1 of code
line 2 of code
line 3 of code


Block code "fences"

\`\`\`
Sample text here...
\`\`\`

Syntax highlighting

\`\`\` js
var foo = function (bar) {
return bar++;
};

console.log(foo(5));
\`\`\`

## Tables

| Option | Description |
| ------ | ----------- |
| data   | path to data files to supply the data that will be passed into templates. |
| engine | engine to be used for processing templates. Handlebars is the default. |
| ext    | extension to be used for dest files. |

Right aligned columns

| Option | Description |
| ------:| -----------:|
| data   | path to data files to supply the data that will be passed into templates. |
| engine | engine to be used for processing templates. Handlebars is the default. |
| ext    | extension to be used for dest files. |


## Links

[link text](http://dev.nodeca.com)


## Images

![Minion](https://octodex.github.com/images/minion.png)

![Stormtroopocat](https://octodex.github.com/images/stormtroopocat.jpg)


`,
        },
        data: {},
    },
};
