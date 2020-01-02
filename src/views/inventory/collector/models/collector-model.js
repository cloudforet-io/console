import casual, { dictOf } from '@/lib/casual';

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

export default casual;
