import type { ArgTypes } from '@storybook/addons';

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

export const getTextEditorArgTypes = (): ArgTypes => ({
    code: {
        name: 'code',
        type: { name: 'any' },
        description: 'Code',
        defaultValue: sampleCode,
        table: {
            type: {
                summary: 'any',
            },
            category: 'props',
            defaultValue: {
                summary: '""',
            },
        },
        control: {
            type: 'object',
        },
    },
    options: {
        name: 'options',
        type: { name: 'object' },
        description: 'CodeMirror options.',
        defaultValue: {
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
        table: {
            type: {
                summary: 'object',
            },
            category: 'props',
            defaultValue: {
                summary: '',
            },
        },
        control: {
            type: 'object',
        },
    },
    readOnly: {
        name: 'readOnly',
        type: { name: 'boolean' },
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
        control: {
            type: 'boolean',
        },
    },
    loading: {
        name: 'loading',
        type: { name: 'boolean' },
        description: 'Whether to show loader or not.',
        defaultValue: false,
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: 'false',
            },
        },
        control: {
            type: 'boolean',
        },
    },
    folded: {
        name: 'folded',
        type: { name: 'boolean' },
        description: 'Whether to fold code block or not.',
        defaultValue: false,
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: 'false',
            },
        },
        control: {
            type: 'boolean',
        },
    },
    highlightLines: {
        name: 'highlightLines',
        type: { name: 'Array<number>' },
        description: 'highlight inputted lines',
        defaultValue: undefined,
        table: {
            type: {
                summary: 'Array<number>',
            },
            category: 'props',
            defaultValue: {
                summary: 'undefined',
            },
        },
        control: {
            type: 'object',
        },
    },
    disableAutoReformat: {
        name: 'disableAutoReformat',
        type: { name: 'boolean' },
        description: 'Whether to disable auto reformatting of code on code change or not. It works only when the code prop\'s type is `string`.',
        defaultValue: false,
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: 'false',
            },
        },
        control: {
            type: 'boolean',
        },
    },
    /* slots */
    loader: {
        name: 'loader',
        description: 'Slot for loader.',
        defaultValue: null,
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
});
