import { reactive, toRefs } from 'vue';

import type { SBType } from '@storybook/types';
import type { ArgTypes, Args, Parameters } from '@storybook/vue';

import PButton from '@/inputs/buttons/button/PButton.vue';

export const getTabArgs = (): Args => ({
    tabs: [
        { name: 'detail', label: 'Detail' },
        { name: 'info', label: 'Info' },
        { name: 'tags', label: 'Tags' },
    ],
    activeTab: 'detail',
    stretch: false,
    defaultSlot: 'This is tab body!',
    extraSlot: null,
    footerSlot: null,
});

export const getTabParameters = (): Parameters => ({
    design: {
        type: 'figma',
        url: 'https://www.figma.com/file/wq4wSowBcADBuUrMEZLz6i/SpaceONE-Console-Design?node-id=6013%3A121728',
    },
});

export const getTabArgTypes = (): ArgTypes => ({
    /* props */
    tabs: {
        name: 'tabs',
        type: { name: 'array' } as SBType,
        description: `Tab items. 
        It is array of \`string\` or array of 
        \`{
          name: string; 
          label?: string; 
          keepAlive?: boolean;
        }\`
        .`,
        table: {
            type: {
                summary: 'array',
            },
            category: 'props',
            defaultValue: {
                summary: '[]',
            },
        },
        control: 'object',
    },
    activeTab: {
        name: 'activeTab',
        type: { name: 'string', required: true },
        description: 'Active tab name. `sync` props.',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: '""',
            },
        },
        control: 'text',
    },
    stretch: {
        name: 'stretch',
        type: { name: 'boolean' },
        description: 'Whether to stretch tab items or not.',
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
    defaultSlot: {
        name: 'default',
        description: 'Use it to insert something to every tab body.',
        table: {
            type: {
                summary: null,
            },
            defaultValue: {
                summary: null,
            },
            category: 'slots',
        },
        control: 'text',
    },
    extraSlot: {
        name: 'extra',
        description: 'Use it to insert something to right extra space of every tab.',
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
    footerSlot: {
        name: 'footer',
        description: 'Use when all tabs require a common footer ui.',
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
    /* events */
    onUpdateActiveTab: {
        name: 'update:activeTab',
        description: 'Event emitted when activated tab changed. Works with `v-model` and `activeTab` props sync.',
        table: {
            type: {
                summary: null,
            },
            defaultValue: {
                summary: null,
            },
            category: 'events',
        },
    },
    onChange: {
        name: 'change',
        description: `Event emitted when activated tab changed.
        Two arguments will be given to the handler that bound to this event. 
        Changed tab item's name(\`string\`) will be given as the first, 
        and the index(\`number\`) will be given as the second argument.`,
        table: {
            type: {
                summary: null,
            },
            defaultValue: {
                summary: null,
            },
            category: 'events',
        },
    },
    // default
    'v-model': { table: { disable: true } },
    extra: { table: { disable: true } },
    default: { table: { disable: true } },
    footer: { table: { disable: true } },
});

export const Inner = {
    name: 'Inner',
    components: { PButton },
    template: `
        <div class="p-4">
            <p-button style-type="primary" :outline="true" @click="visible = true">Show</p-button>
            <p-button style-type="highlight" :outline="true" @click="visible = false">Hide</p-button>
            <div v-if="visible" class="mt-4">
                {{ name }}
            </div>
        </div>`,
    props: {
        name: String,
    },
    setup() {
        const state = reactive({
            visible: false,
        });
        return { ...toRefs(state) };
    },
};
