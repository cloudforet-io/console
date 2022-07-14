import { ArgTypes } from '@storybook/addons';

import { textEditorModes } from '@/inputs/text-editor/config';


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
        type: { name: 'string' },
        description: 'Code',
        defaultValue: sampleCode,
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: '""',
            },
        },
        control: {
            type: 'text',
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
    mode: {
        name: 'mode',
        type: { name: 'string' },
        description: 'Mode of text editor.',
        defaultValue: 'edit',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: 'edit',
            },
        },
        control: {
            type: 'select',
            options: textEditorModes,
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
