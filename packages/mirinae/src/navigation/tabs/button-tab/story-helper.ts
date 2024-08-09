import { reactive, toRefs } from 'vue';

import type { SBType } from '@storybook/types';
import type { ArgTypes, Args, Parameters } from '@storybook/vue';

import PButton from '@/inputs/buttons/button/PButton.vue';

export const getButtonTabArgs = (): Args => ({
    tabs: [
        { name: 'detail', label: 'Detail' },
        { name: 'info', label: 'Info' },
        { name: 'tags', label: 'Tags' },
    ],
    activeTab: 'detail',
    defaultSlot: 'This is tab body!',
});

export const getButtonTabParameters = (): Parameters => ({
    design: {
        type: 'figma',
        url: 'https://www.figma.com/file/wq4wSowBcADBuUrMEZLz6i/SpaceONE-Console-Design?node-id=12164%3A1629',
    },
});

export const getButtonTabArgTypes = (): ArgTypes => ({
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
    default: { table: { disable: true } },
    'v-model': { table: { disable: true } },
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
