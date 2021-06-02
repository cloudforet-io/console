import { ArgTypes } from '@storybook/addons';
import {
    reactive, toRefs,
} from '@vue/composition-api';
import PButton from '@/inputs/buttons/button/PButton.vue';

export const argTypes: ArgTypes = {
    tabs: {
        name: 'tabs',
        type: { name: 'array' },
        description: 'Tab items. It is array of `string` or array of ```{name: string; label?: string; keepAlive: boolean;}```.',
        defaultValue: [
            { name: 'detail', label: 'Detail' },
            { name: 'info', label: 'Info' },
            { name: 'tags', label: 'Tags' },
        ],
        table: {
            type: {
                summary: 'array',
            },
            category: 'props',
            defaultValue: {
                summary: '[]',
            },
        },
        control: {
            type: 'object',
        },
    },
    activeTab: {
        name: 'activeTab',
        type: { name: 'string' },
        description: 'Active tab name. `sync` props.',
        defaultValue: 'detail',
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
    stretch: {
        name: 'stretch',
        type: { name: 'boolean' },
        description: 'Whether to stretch tab items or not.',
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
            type: 'text',
        },
    },
    'v-model': {
        name: 'v-model',
        type: { name: 'string' },
        description: 'Two way binding for `activeTab` props with `update:activeTab` event.',
        defaultValue: '',
        table: {
            type: {
                summary: 'string',
            },
            category: 'model',
            defaultValue: {
                summary: '""',
            },
        },
        control: null,
    },
    defaultSlot: {
        name: 'default',
        description: 'Use it to replace whole tab body.',
        defaultValue: 'This is card body!',
        table: {
            type: {
                summary: null,
            },
            defaultValue: {
                summary: null,
            },
            category: 'slots',
        },
        control: {
            type: 'text',
        },
    },
    tabNameSlot: {
        name: '<tab-name>',
        description: `Slot for specific tab's body. <br/>
            The \`string\` or tab item's name property given in \`tabs\` props is used as the slot name.`,
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
        control: null,
    },
    'update:activeTab': {
        name: 'update:activeTab',
        description: 'Event emitted when activated tab changed. Works with `v-model` and `activeTab` props sync.',
        defaultValue: null,
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
};


export const Inner = {
    name: 'Inner',
    components: { PButton },
    template: `
        <div class="p-4">
            <p-button style-type="primary" :outline="true" @click="visible = true">Show</p-button>
            <p-button style-type="secondary" :outline="true" @click="visible = false">Hide</p-button>
            <div v-if="visible" class="mt-4">
                {{ name }}
            </div>
        </div>`,
    props: {
        name: String,
    },
    setup(props) {
        const state = reactive({
            visible: false,
        });
        return { ...toRefs(state) };
    },
};
