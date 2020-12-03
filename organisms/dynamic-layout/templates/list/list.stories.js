/* eslint-disable camelcase */
import {
    toRefs, reactive, ref, computed,
} from '@vue/composition-api';
import { action } from '@storybook/addon-actions';
import {
    text, number, select, object, boolean,
} from '@storybook/addon-knobs/vue';
import PDynamicLayout from '@/components/organisms/dynamic-layout/PDynamicLayout.vue';
import md from '@/components/organisms/dynamic-layout/PDynamicLayout.md';

export default {
    title: 'others/dynamic-layout/list',
    component: PDynamicLayout,
    parameters: {
        notes: md,
        knobs: { escapeHTML: false },
    },
};


export const defaultCase = () => ({
    components: { PDynamicLayout },
    props: {
        name: {
            default: text('name', 'List!'),
        },
        options: {
            default: object('options', {
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
            }),
        },
        timezone: {
            default: text('timezone', 'UTC'),
        },
        data: {
            default: object('data', {
                nics: [],
                disks: [],
                server_id: 'server-cb8ebd06742f',
                name: '',
                state: 'INSERVICE',
                primary_ip_address: '172.16.16.58',
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
                    resource_id: 'arn:aws:ec2:ap-northeast-2:257706363616:instance/i-094985f71d3bc30a7',
                    external_link: '',
                },
                tags: {},
                collection_info: {
                    service_accounts: ['sa-ebc86e9cea28'],
                    state: 'ACTIVE',
                    collectors: ['collector-6746d641c98b'],
                    pinned_keys: [],
                    collected_at: null,
                    change_history: [],
                    secrets: ['secret-5545c9db0a42'],
                },
                project_id: 'project-18655561c535',
                domain_id: '',
                created_at: { seconds: '1595497991', nanos: 452000000 },
                updated_at: { seconds: '1596773009', nanos: 956000000 },
                deleted_at: null,
            }),
        },
    },
    template: `
    <div style="width: 80vw;">
        <PDynamicLayout :name="name"
                        :options="options"
                        :typeOptions="{timezone}"
                        type="list"
                        @init="onInit" 
                        @fetch="onFetch" 
                        @select="onSelect"/>
    </div>`,
    setup(props, context) {
        const state = reactive({});

        return {
            ...toRefs(state),
            onInit: action('init'),
            onFetch: action('fetch'),
            onSelect: action('select'),
        };
    },
});
