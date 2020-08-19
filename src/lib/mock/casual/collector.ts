/* eslint-disable camelcase, @typescript-eslint/camelcase */
import { arrayOf } from '@/lib/casual';
import { ModelType } from '@/lib/mock/casual/type';

const pluginOption: ModelType = (casual) => {
    casual.define('pluginOption', () => {
        const res: any = {
            key: casual.uuid,
            name: casual.word,
            type: casual.random_element(['str', 'bool', 'list', 'int', 'float']),
            is_required: casual.boolean,
        };

        if (casual.random > 0.7) {
            if (res.type === 'str') res.enums = casual.array_of_words(5);
        }
        if (casual.random > 0.7) {
            if (res.type === 'str') res.example = casual.word;
            else if (res.type === 'bool') res.example = casual.boolean;
            else if (res.type === 'int') res.example = casual.integer();
            else if (res.type === 'float') res.example = casual.double();
        }
        if (casual.random > 0.8) {
            if (res.type === 'str') res.default = casual.word;
            else if (res.type === 'bool') res.default = casual.boolean;
            else if (res.type === 'int') res.default = casual.integer();
            else if (res.type === 'float') res.default = casual.double();
            else if (res.type === 'list') res.default = casual.array_of_words();
        }
        return res;
    });
    return casual;
};

const pluginVersions = (casual) => {
    casual.define('pluginVersions', () => casual.array_of_digits(5).map(digit => digit.toString()));
    return casual;
};
const pluginInfo = (casual) => {
    casual.define('pluginInfo', () => ({
        plugin_id: casual.make_id('plugin'),
        name: casual.title,
        registry_url: casual.url,
        state: casual.random_element(['ENABLED', 'DISABLED']),
        service_type: casual.random_element(['inventory.collector', 'identity.domain']),
        repository_info: {},
        domain_id: casual.make_id('domain'),
        project_id: casual.make_id('project'),
        tags: { ...casual._tags(), icon: casual._defaultImg() },
        created_at: casual._timestamp,
        template: {
            options: arrayOf(casual.integer(1, 5), casual._pluginOption),
            // credentials = [{key, name, type, [is_required(bool)], [enums], [example]}, ...]
        },
    }));
    return casual;
};

const collector = (casual) => {
    casual.define('collector', (params: any = {}) => {
        const crd = casual.random_element(['credential', 'credential_group']);

        return {
            collector_id: params.collector_id || casual.make_id('collector'),
            name: casual.word,
            state: casual.random_element(['ENABLED', 'DISABLED']),
            plugin_info: {
                plugin_id: casual.make_id('plugin'),
                version: '1.0',
                options: {
                    supported_resource_type: [
                        'SERVER',
                    ],
                    filter_format: [
                        {
                            change_key: [
                                'data.compute.instance_id',
                                'instance_id',
                            ],
                            type: 'str',
                            resource_type: 'SERVER',
                            name: 'Region',
                            key: 'region_id',
                        },
                        {
                            resource_type: 'SERVER',
                            name: 'Zone',
                            key: 'zone_id',
                            change_key: [
                                'data.compute.instance_id',
                                'instance_id',
                            ],
                            type: 'str',
                        },
                        {
                            change_key: [
                                'data.compute.instance_id',
                                'instance_id',
                            ],
                            type: 'str',
                            resource_type: 'SERVER',
                            name: 'Pool',
                            key: 'pool_id',
                        },
                        {
                            type: 'list',
                            change_key: [
                                'data.compute.instance_id',
                                'instance_id',
                            ],
                            resource_type: 'SERVER',
                            key: 'server_id',
                            name: 'Server',
                            object_key: 'uuid',
                        },
                        {
                            type: 'list',
                            resource_type: 'CUSTOM',
                            name: 'Instance ID',
                            key: 'instance_id',
                        },
                        {
                            enums: [
                                'NETWORK',
                                'SUBNET',
                                'IP_ADDRESS',
                            ],
                            resource_type: 'CUSTOM',
                            name: 'Resource Type',
                            key: 'resource_type',
                            type: 'str',
                        },
                    ],
                },
                [`${crd}_id`]: casual.make_id(crd),
            },
            priority: 2,
            tags: {
                A: 1,
                B: 'haha',
                icon: casual._defaultImg(),
            },
            created_at: {
                seconds: '1579666769',
                nanos: 13000000,
            },
            last_collected_at: null,
            domain_id: 'domain-265f363db69e',
        };
    });
    return casual;
};


const repository = (casual) => {
    casual.define('repository', () => ({
        repository_id: casual.make_id('repository'),
        name: casual.word,
        repository_type: 'remote',
        endpoint: 'grpc://repository.portal.dev.pyengine.net:50051',
        version: 'v1',
        credential_id: 'cred-f441fb76501c',
        created_at: {
            seconds: '1579586785',
            nanos: 366000000,
        },
    }));
    return casual;
};

export interface CollectorCasual {
    pluginOption?: any;
    _pluginOption?: any;
    pluginVersions?: any;
    _pluginVersions?: any;
    pluginInfo?: any;
    _pluginInfo?: any;
    collector?: any;
    _collector?: any;
    repository?: any;
    _repository?: any;
}

const result: ModelType[] = [
    pluginOption, pluginVersions, pluginInfo,
    collector, repository,
];

export default result;
