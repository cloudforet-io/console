/* eslint-disable camelcase */
import { faker } from '@faker-js/faker';

import { getQueryTags as getToolboxQueryTags } from '@/navigation/toolbox/mock';

const getCareerInfo = () => ({ company: faker.company.companyName(), from: faker.datatype.datetime() });
const getTableRow = () => ({
    name: faker.name.firstName(),
    age: faker.datatype.number({ min: 10, max: 90 }),
    job: faker.name.jobTitle(),
    information: { career: faker.datatype.array(5).map(() => getCareerInfo()) },
});
const makeTableData = () => faker.datatype.array(5).map(() => getTableRow());

const makeTableFields = () => ([
    {
        key: 'name',
        name: 'Key (text)',
        type: 'text',
    },
    {
        key: 'age',
        name: 'Age (text)',
        type: 'text',
        options: { postfix: ' age' },
    },
    {
        key: 'job',
        name: 'Job (badge)',
        type: 'badge',
    },
    {
        key: 'information.career.company',
        name: 'Career (more, array)',
        type: 'more',
        options: {
            sub_key: 'information.career',
            layout: {
                name: 'Career Details',
                type: 'popup',
                options: {
                    layout: {
                        type: 'raw',
                    },
                },
            },
        },
    },
]);


export default {
    list: {
        options: {
            layouts: [{
                name: 'Base Information',
                type: 'item',
                options: {
                    fields: [{
                        key: 'server_id',
                        name: 'ID',
                    }, {
                        key: 'name',
                        name: 'Name',
                    }, {
                        key: 'primary_ip_address',
                        name: 'Primary IP',
                    }, {
                        key: 'collection_info.state',
                        name: 'Collection State',
                        type: 'enum',
                        options: {
                            ACTIVE: {
                                type: 'state',
                                options: {
                                    icon: {
                                        image: 'ic_check',
                                        color: 'green.500',
                                    },
                                },
                            },
                            DUPLICATED: {
                                type: 'state',
                                options: {
                                    icon: {
                                        image: 'ic_warning-filled',
                                    },
                                },
                            },
                            DISCONNECTED: {
                                type: 'state',
                                options: {
                                    icon: {
                                        image: 'ic_plug-filled',
                                    },
                                },
                            },
                            MANUAL: {
                                type: 'state',
                                options: {
                                    icon: {
                                        image: 'ic_spanner',
                                    },
                                },
                            },
                        },
                    }, {
                        key: 'state',
                        name: 'Life Cycle',
                        type: 'enum',
                        options: {
                            INSERVICE: {
                                type: 'state',
                                options: {
                                    icon: {
                                        color: 'green.500',
                                    },
                                },
                            },
                            MAINTENANCE: {
                                type: 'state',
                                options: {
                                    icon: {
                                        color: 'yellow.500',
                                    },
                                },
                            },
                            CLOSED: {
                                type: 'state',
                                options: {
                                    text_color: 'red.500',
                                    icon: {
                                        color: 'red.500',
                                    },
                                },
                            },
                            DELETED: {
                                type: 'state',
                                options: {
                                    text_color: 'gray.500',
                                    icon: {
                                        color: 'gray.500',
                                    },
                                },
                            },
                        },
                    }, {
                        key: 'reference.resource_id',
                        name: 'Resource ID',
                    }, {
                        key: 'os_type',
                        name: 'OS Type',
                    }, {
                        key: 'server_type',
                        name: 'Server Type',
                        type: 'enum',
                        options: {
                            VM: {
                                type: 'badge',
                                options: {
                                    outline_color: 'indigo.500',
                                },
                            },
                            BAREMETAL: {
                                type: 'badge',
                                options: {
                                    outline_color: 'coral.600',
                                },
                            },
                            HYPERVISOR: {
                                type: 'badge',
                                options: {
                                    outline_color: 'peacock.500',
                                },
                            },
                            UNKNOWN: {
                                type: 'badge',
                                options: {
                                    outline_color: 'gray.500',
                                },
                            },
                        },
                    }, {
                        key: 'project_id',
                        name: 'Project',
                    }, {
                        key: 'provider',
                        name: 'Provider',
                        type: 'enum',
                        options: {
                            aws: {
                                type: 'badge',
                                options: {
                                    color: 'white',
                                    background_color: '#FF9900',
                                },
                            },
                            google_cloud: {
                                type: 'badge',
                                options: {
                                    color: 'white',
                                    background_color: '#4285F4',
                                },
                            },
                            azure: {
                                type: 'badge',
                                options: {
                                    color: 'white',
                                    background_color: '#00BCF2',
                                },
                            },
                        },
                    }, {
                        key: 'collection_info.service_accounts',
                        name: 'Service Accounts',
                        type: 'list',
                        reference: {
                            reference_type: 'identity.ServiceAccount',
                        },
                        options: {
                            item: {
                                type: 'badge',
                                options: {
                                    outline_color: 'violet.500',
                                },
                            },
                            delimiter: '  ',
                        },
                    }, {
                        key: 'collection_info.secrets',
                        name: 'Secrets',
                        type: 'list',
                        options: {
                            item: {
                                type: 'badge',
                                options: {
                                    outline_color: 'violet.500',
                                },
                            },
                            delimiter: '  ',
                        },
                    }, {
                        key: 'collection_info.collectors',
                        name: 'Collected by',
                        type: 'list',
                        options: {
                            item: {
                                type: 'badge',
                                options: {
                                    outline_color: 'violet.500',
                                },
                            },
                            delimiter: '  ',
                        },
                    }, {
                        key: 'created_at.seconds',
                        name: 'Created',
                        type: 'datetime',
                        options: {
                            source_type: 'timestamp',
                            source_format: 'seconds',
                        },
                    }, {
                        key: 'updated_at.seconds',
                        name: 'Updated',
                        type: 'datetime',
                        options: {
                            source_type: 'timestamp',
                            source_format: 'seconds',
                        },
                    }, {
                        key: 'deleted_at.seconds',
                        name: 'Deleted',
                        type: 'datetime',
                        options: {
                            source_type: 'timestamp',
                            source_format: 'seconds',
                        },
                    }],
                },
            }, {
                name: 'Operation System',
                type: 'item',
                options: {
                    root_path: 'data.os',
                    fields: [{
                        key: 'os_distro',
                        name: 'OS Distribution',
                    }, {
                        key: 'os_arch',
                        name: 'OS Architecture',
                    }, {
                        key: 'os_details',
                        name: 'OS Version Details',
                    }, {
                        key: 'os_license',
                        name: 'OS License',
                    }],
                },
            }, {
                name: 'Hardware',
                type: 'item',
                options: {
                    root_path: 'data.hardware',
                    fields: [{
                        key: 'core',
                        name: 'Core',
                    }, {
                        key: 'memory',
                        name: 'Memory',
                    }, {
                        key: 'serial_number',
                        name: 'Serial Number',
                    }, {
                        key: 'manufacturer',
                        name: 'Manufacturer',
                    }, {
                        key: 'model',
                        name: 'Server Model',
                    }, {
                        key: 'cpu_model',
                        name: 'CPU Model',
                    }, {
                        key: 'cpu_arch',
                        name: 'CPU Architecture',
                    }, {
                        key: 'cpu_socket',
                        name: 'CPU Socket',
                    }, {
                        key: 'core_per_socket',
                        name: 'Core per Socket',
                    }, {
                        key: 'memory_count',
                        name: 'Memory Count',
                    }, {
                        key: 'hyper_threading',
                        name: 'Hyper-threading',
                    }, {
                        key: 'bios_version',
                        name: 'Bios Version',
                    }, {
                        key: 'bios_released_at',
                        name: 'Bios Released',
                    }],
                },
            }],
        },
        data: {
            nics: [],
            disks: [],
            server_id: 'server-cb8ebd06742f',
            name: '',
            state: 'INSERVICE',
            primary_ip_address: faker.internet.ip(),
            ip_addresses: [],
            server_type: 'VM',
            os_type: 'LINUX',
            provider: 'aws',
            region_code: '',
            region_type: '',
            data: {
                os: {
                    os_distro: 'amazonlinux',
                    os_arch: 'x86_64',
                },
                hardware: { memory: 16, core: 4 },
            },
            metadata: {},
            reference: {
                resource_id: `arn:aws:ec2:ap-northeast-2:${faker.random.numeric(15)}:instance/i-${faker.random.alphaNumeric(17)}`,
                external_link: '',
            },
            tags: {},
            collection_info: {
                service_accounts: [`sa-${faker.random.numeric(10)}`],
                state: 'ACTIVE',
                collectors: [`collector-${faker.random.numeric(10)}`],
                pinned_keys: [],
                collected_at: null,
                change_history: [],
                secrets: [`secret-${faker.random.numeric(10)}`],
            },
            project_id: `project-${faker.random.numeric(10)}`,
            domain_id: '',
            created_at: { seconds: '1595497991', nanos: 452000000 },
            updated_at: { seconds: '1596773009', nanos: 956000000 },
            deleted_at: null,
        },
    },
    item: {
        options: {
            fields: [
                {
                    name: 'Instance ID',
                    key: 'data.compute.instance_name',
                    options: {
                        disable_copy: true,
                    },
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
                                    image: 'ic_check',
                                    color: 'green.500',
                                },
                            },
                        },
                        DUPLICATED: {
                            type: 'state',
                            options: {
                                icon: {
                                    image: 'ic_warning-filled',
                                },
                            },
                        },
                        DISCONNECTED: {
                            type: 'state',
                            options: {
                                icon: {
                                    image: 'ic_plug-filled',
                                },
                            },
                        },
                        MANUAL: {
                            type: 'state',
                            options: {
                                icon: {
                                    image: 'ic_spanner',
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
                    name: 'Compute (object)',
                    key: 'data.compute',
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
                }, {
                    name: 'Collection Information',
                    key: 'collection_info.state',
                    type: 'more',
                    options: {
                        sub_key: 'collection_info.change_history',
                        layout: {
                            name: 'Change History Details',
                            type: 'popup',
                            options: {
                                layout: {
                                    type: 'raw',
                                    options: {},
                                },
                            },
                        },
                    },
                }],
        },
        data: {
            name: 'cloudone-dev-eks-cluster-adm-worker',
            primary_ip_address: faker.internet.ip(),
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
                    account_id: faker.random.numeric(15),
                    keypair: '...',
                    instance_name: 'cloudone-dev-eks-cluster-adm-worker',
                },
                aws: {
                    lifecycle: 'norma',
                    ebs_oprimized: false,
                    iam_instance_profile: {
                        name: 'cloudone-dev-EKSAdminWorkerRole',
                        arn: `arn:aws:iam::${faker.random.numeric(10)}:instance-profile/cloudone-dev-EKSAdminWorkerRole`,
                        id: faker.random.alpha({
                            count: 21,
                            casing: 'upper',
                        }),
                    },
                },
                auto_scaling_group: {
                    name: 'cloudone-dev-eks-cluster-adm-worker',
                    arn: '...',
                    launch_configuration_name: `cloudone-dev-eks-cluster_woker${faker.random.numeric(15)}`,
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
                resource_id: `arn:aws:ec2:ap-northeast-2:${faker.random.numeric(15)}:instance/i-${faker.random.alphaNumeric(17)}`,
                external_link: `https://ap-northeast-2.console.aws.amazon.com/ec2/v2/home?region=ap-northeast-2#Instances:instanceId=i-${faker.random.alphaNumeric(17)}`,
            },
            collection_info: {
                secrets: [
                    `secret-${faker.random.alphaNumeric(12)}`,
                    `secret-${faker.random.alphaNumeric(12)}`,
                ],
                state: 'ACTIVE',
                collectors: [
                    `collector-${faker.random.alphaNumeric(12)}`,
                    `collector-${faker.random.alphaNumeric(12)}`,
                    `collector-${faker.random.alphaNumeric(12)}`,
                ],
                service_accounts: [
                    `sa-${faker.random.alphaNumeric(12)}`,
                    `sa-${faker.random.alphaNumeric(12)}`,
                ],
                change_history: [
                    {
                        updated_at: '2021-03-16T07:00:20.890000Z',
                        job_id: `job-${faker.random.alphaNumeric(12)}`,
                        key: 'state',
                        diff: {},
                        updated_by: `collector-${faker.random.alphaNumeric(12)}`,
                    },
                    {
                        diff: {},
                        key: 'project_id',
                        job_id: `job-${faker.random.alphaNumeric(12)}`,
                        updated_at: '2021-03-16T07:00:20.890000Z',
                        updated_by: `collector-${faker.random.alphaNumeric(12)}`,
                    },
                    {
                        job_id: `job-${faker.random.alphaNumeric(12)}`,
                        diff: {
                            delete: {
                                status: 'IN_PROGRESS',
                            },
                            insert: {
                                status: 'RUNNING',
                            },
                        },
                        updated_by: `collector-${faker.random.alphaNumeric(12)}`,
                        key: 'data.power_state',
                        updated_at: '2021-03-16T09:53:54.280000Z',
                    },
                    {
                        updated_at: '2021-03-16T07:12:14.603000Z',
                        diff: {},
                        key: `metadata.plugin-${faker.random.alphaNumeric(12)}`,
                        job_id: `job-${faker.random.alphaNumeric(12)}`,
                        updated_by: `collector-${faker.random.alphaNumeric(12)}`,
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
                        job_id: `job-${faker.random.alphaNumeric(12)}`,
                        key: 'data.monitoring',
                        updated_by: `collector-${faker.random.alphaNumeric(12)}`,
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
            fields: makeTableFields(),
            default_sort: {
                key: 'name',
                desc: false,
            },
        },
        data: makeTableData(),
    },
    simpleTable: {
        options: {
            fields: makeTableFields(),
        },
        data: makeTableData(),
    },
    rawTable: {
        options: {
            headers: ['information', 'age', 'name', 'job'],
            disable_search: false,
        },
        data: makeTableData(),
    },
    querySearchTable: {
        options: {
            fields: makeTableFields(),
            default_sort: {
                key: 'name',
                desc: false,
            },
        },
        data: makeTableData(),
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
    popup: {
        options: {
            layout: {
                name: 'Pop Up',
                type: 'raw',
                options: {},
            },
        },
        data: [
            { key: 'replica_set', value: '2', data: { array: [{ id: 'a' }] } },
            { key: 'Name', value: 'mongodb-s2d3-dev', data: { array: [{ id: 'b' }] } },
            { key: 'rs_type', value: 'arbiter', data: { array: [{ id: 'c' }, { id: 'cccccc' }] } },
            { key: 'rs_primary', value: 'false', data: { array: [{ id: 'd' }, { id: 'ddd' }] } },
            { key: 'server_type', value: 'mongodb', data: { array: [] } },
        ],
    },
};

export const getQueryTags = () => getToolboxQueryTags();
