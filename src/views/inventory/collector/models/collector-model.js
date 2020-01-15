import casual, { arrayOf } from '@/lib/casual';

casual.define('pluginOption', () => ({
    key: casual.uuid,
    name: casual.word,
    // type: casual.random_element(['str', 'bool', 'list', 'int', 'float']),
    type: 'bool',
    // eslint-disable-next-line camelcase
    is_required: casual.boolean,
    enums: casual.array_of_words(5),
    example: casual.word,
}));

casual.define('pluginVersions', () => casual.array_of_digits(5));


casual.define('pluginInfo', () => ({
    name: casual.title,
    image: casual._defaultImg(),
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
    // eslint-disable-next-line camelcase
    credential_id: casual.make_id('credential'),
    name: casual.word,
    // eslint-disable-next-line camelcase
    issue_type: casual.random_element(['token', 'credential']),
    // eslint-disable-next-line camelcase
    credential_groups: arrayOf(casual.integer(1, 5), casual._credentialGroup),
}));


export default casual;
