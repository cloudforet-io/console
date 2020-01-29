/* eslint-disable camelcase */
import casual, { arrayOf } from '@/lib/casual';

casual.define('pluginOption', () => ({
    key: casual.uuid,
    name: casual.word,
    type: casual.random_element(['str', 'bool', 'list', 'int', 'float']),
    is_required: casual.boolean,
    enums: casual.array_of_words(5),
    example: casual.word,
}));

casual.define('pluginVersions', () => casual.array_of_digits(5));


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

casual.define('credentialGroup', () => ({
    credential_group_id: casual.make_id('credential_group'),
    name: casual.word,
}));

casual.define('credential', () => ({
    credential_id: casual.make_id('credential'),
    name: casual.word,
    issue_type: casual.random_element(['token', 'credential']),
    credential_groups: arrayOf(casual.integer(1, 5), casual._credentialGroup),
}));

casual.define('collector', () => {
    const crd = casual.random_element(['credential', 'credential_group']);

    return {
        collector_id: casual.make_id('collector'),
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


export default casual;
