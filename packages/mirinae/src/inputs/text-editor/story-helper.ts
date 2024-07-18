import type { SBType } from '@storybook/types';
import type { ArgTypes, Args, Parameters } from '@storybook/vue';

const sampleCodeObj = {
    server_id: 'server-283cd170d17d',
    name: 'spaceone-dev-eks-cluster_kubectl',
    state: 'INSERVICE',
    primary_ip_address: '172.16.1.205',
    ip_addresses: [
        '172.16.1.205',
    ],
    server_type: 'VM',
    os_type: 'LINUX',
    data: {
        os: {
            os_distro: 'ubuntu',
            os_arch: 'x86_64',
        },
        base: {
            core: 2,
            memory: 0,
        },
    },
};
export const sampleCode = JSON.stringify(sampleCodeObj, null, ' ');

export const getTextEditorParameters = (): Parameters => ({
    design: {
        type: 'figma',
        url: 'https://www.figma.com/file/wq4wSowBcADBuUrMEZLz6i/SpaceONE-Console-Design?node-id=6169%3A182308',
    },
});

export const getTextEditorArgs = (): Args => ({
    code: sampleCode,
    options: {
        tabSize: 4,
        styleActiveLine: true,
        lineNumbers: true,
        line: true,
        mode: 'application/json',
        lineWrapping: true,
        theme: 'ayu-mirage',
        matchBrackets: true,
        autoCloseBrackets: true,
        autoCloseTags: true,
        foldGutter: true,
        gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
    },
    readOnly: false,
    loading: false,
    folded: false,
    highlightLines: undefined,
    disableAutoReformat: false,
    loader: null,
});

export const getTextEditorArgTypes = (): ArgTypes => ({
    code: {
        name: 'code',
        description: 'Code',
        table: {
            type: {
                summary: 'any',
            },
            category: 'props',
            defaultValue: {
                summary: '""',
            },
        },
        control: 'object',
    },
    options: {
        name: 'options',
        type: { name: 'object' } as SBType,
        description: 'CodeMirror options.',
        table: {
            type: {
                summary: 'object',
            },
            category: 'props',
            defaultValue: {
                summary: '',
            },
        },
        control: 'object',
    },
    readOnly: {
        name: 'readOnly',
        type: 'boolean',
        description: 'Whether Mode of text editor is ReadOnly',
        defaultValue: false,
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: 'edit',
            },
        },
        control: 'boolean',
    },
    loading: {
        name: 'loading',
        type: 'boolean',
        description: 'Whether to show loader or not.',
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: 'false',
            },
        },
        control: 'boolean',
    },
    folded: {
        name: 'folded',
        type: 'boolean',
        description: 'Whether to fold code block or not.',
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: 'false',
            },
        },
        control: 'boolean',
    },
    highlightLines: {
        name: 'highlightLines',
        type: { name: 'array' } as SBType,
        description: 'highlight inputted lines',
        table: {
            type: {
                summary: 'Array<number>',
            },
            category: 'props',
            defaultValue: {
                summary: 'undefined',
            },
        },
        control: 'object',
    },
    disableAutoReformat: {
        name: 'disableAutoReformat',
        type: 'boolean',
        description: 'Whether to disable auto reformatting of code on code change or not. It works only when the code prop\'s type is `string`.',
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: 'false',
            },
        },
        control: 'boolean',
    },
    /* slots */
    loader: {
        name: 'loader',
        description: 'Slot for loader.',
        table: {
            type: {
                summary: null,
            },
            defaultValue: {
                summary: null,
            },
            category: 'slots',
        },
    },
    // default
    'update:code': { table: { disable: true } },
});
