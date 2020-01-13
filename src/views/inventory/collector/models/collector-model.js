import casual, { arrayOf } from '@/lib/casual';

casual.define('collectorPlugins', () => ([
    {
        id: 'aaa',
        name: 'Plugin1',
        desc: 'plugin description ...',
        tags: ['tag1', 'tag2', 'tag3333'],
    },
    {
        id: 'bbb',
        name: 'Plugin2',
        desc: 'plugin description ...',
        icon: 'aws-ec2',
    },
    {
        id: 'ccc',
        name: 'Plugin3',
        desc: 'plugin description ...',
    },
]));

casual.define('pluginOption', () => ({
    key: casual.uuid,
    name: casual.word,
    type: casual.random_element(['str', 'bool', 'list', 'int', 'float']),
    is_required: casual.boolean,
    enums: casual.array_of_words(5),
    example: casual.word,
    default: casual.word,
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

export default casual;
