import casual, { arrayOf } from '@/lib/casual';

casual.define('pluginOption', () => ({
    key: casual.uuid,
    name: casual.word,
    // type: casual.random_element(['str', 'bool', 'list', 'int', 'float']),
    type: 'list',
    // eslint-disable-next-line camelcase
    is_required: casual.boolean,
    enums: casual.array_of_words(5),
    example: casual.word,
}));

casual.define('pluginVersions', () => casual.array_of_digits(5));


casual.define('pluginInfo', () => ({
    // eslint-disable-next-line camelcase
    plugin_id: casual.make_id('plugin'),
    name: casual.title,
    image: casual._defaultImg(),
    // eslint-disable-next-line camelcase
    registry_url: casual.url,
    state: casual.random_element(['ENABLED', 'DISABLED']),
    // eslint-disable-next-line camelcase
    service_type: casual.random_element(['inventory.collector', 'identity.domain']),
    // eslint-disable-next-line camelcase
    repository_info: {},
    domain_id: casual.make_id('domain'),
    // eslint-disable-next-line camelcase
    project_id: casual.make_id('project'),
    tags: casual._tags(),
    // eslint-disable-next-line camelcase
    created_at: casual._timestamp,
    template: {
        options: arrayOf(casual.integer(1, 5), casual._pluginOption),
        // credentials = [{key, name, type, [is_required(bool)], [enums], [example]}, ...]
    },
}));

casual.define('credentialGroup', () => ({
    // eslint-disable-next-line camelcase
    credential_group_id: casual.make_id('credential_group'),
    name: casual.word,
}));

casual.define('credential', () => ({
    // eslint-disable-next-line camelcase
    credential_id: casual.make_id('credential'),
    name: casual.word,
    // eslint-disable-next-line camelcase
    issue_type: casual.random_element(['token', 'credential']),
    // eslint-disable-next-line camelcase
    credential_groups: arrayOf(casual.integer(1, 5), casual._credentialGroup),
}));


export default casual;
