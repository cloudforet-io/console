import type { ArgTypes } from '@storybook/addons';
import { reactive, toRefs } from 'vue';


import PButton from '@/inputs/buttons/button/PButton.vue';
import { BOX_TAB_STYLE_TYPE } from '@/navigation/tabs/box-tab/config';

export const getBoxTabArgTypes = (): ArgTypes => ({
    /* props */
    tabs: {
        name: 'tabs',
        type: { name: 'array' },
        description: `Tab items. 
        It is array of \`string\` or array of 
        \`{
          name: string; 
          label?: string; 
          keepAlive?: boolean;
        }\`
        .`,
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
        type: { name: 'string', required: true },
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
    styleType: {
        name: 'styleType',
        type: { name: 'string' },
        description: `Box style types. ${Object.values(BOX_TAB_STYLE_TYPE)} are available.`,
        defaultValue: BOX_TAB_STYLE_TYPE.white,
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: `"${BOX_TAB_STYLE_TYPE.white}"`,
            },
        },
        control: {
            type: 'select',
            options: Object.values(BOX_TAB_STYLE_TYPE),
        },
    },
    /* slots */
    defaultSlot: {
        name: 'default',
        description: 'Use it to insert something to every tab body.',
        defaultValue: 'This is tab body!',
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
    /* events */
    onUpdateActiveTab: {
        name: 'update:active-tab',
        description: 'Event emitted when activated tab changed. Works with `v-model:active-tab`.',
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
