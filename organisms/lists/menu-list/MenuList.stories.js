import { object, text } from '@storybook/addon-knobs/vue';
import { action } from '@storybook/addon-actions';
import PMenuList from './MenuList_new.vue';

export default {
    title: 'Organisms/menu-list',
    component: PMenuList,
};

export const defaultCase = () => ({
    components: { PMenuList },
    props: {
        listItems: {
            default: object('menu-item', [
                { key: 'item1', contents: 'item1', indent: 0 },
                { key: 'item2', contents: 'item2', indent: 1 },
                { key: 'item3', contents: 'item3' },
            ]),
        },
        tooltip: {
            default: text('tooltip', 'tooltip'),
        },
        contents: {
            default: text('contents', 'activator'),
        },
        tooltipOptions: {
            default: object('tooltip options', { offset: '12px' }),
        },
    },
    template: `<p-menu-list :list-items="listItems" :contents="contents"
                @show="show" @hide="hide" @change="change" @select="select"/>`,
    methods: {
        show: action('show'),
        hide: action('hide'),
        change: action('change'),
        select: action('select'),
    },
});


export const activatorSlotCase = () => ({
    components: { PMenuList },
    props: {
        listItems: {
            default: object('menu-item', [
                { key: 'item1', contents: 'item1', indent: 0 },
                { key: 'item2', contents: 'item2', indent: 1 },
                { key: 'item3', contents: 'item3' },
            ]),
        },
        tooltip: {
            default: text('tooltip', 'tooltip'),
        },
        contents: {
            default: text('contents', 'activator'),
        },
        tooltipOptions: {
            default: object('tooltip options', { offset: '12px' }),
        },
        activatorSlot: {
            default: text('activator slot', '<button>STORYBOOK BUG...T.T</button>', 'slot'),
        },
    },
    template: `<p-menu-list :list-items="listItems" :contents="contents"
                @show="show" @hide="hide" @change="change" @select="select">
                    <template #activator>
                        {{activatorSlot}}
                    </template>
                </p-menu-list>`,
    methods: {
        show: action('show'),
        hide: action('hide'),
        change: action('change'),
        select: action('select'),
    },
});


export const activatorContentsSlotCase = () => ({
    components: { PMenuList },
    props: {
        listItems: {
            default: object('menu-item', [
                { key: 'item1', contents: 'item1', indent: 0 },
                { key: 'item2', contents: 'item2', indent: 1 },
                { key: 'item3', contents: 'item3' },
            ]),
        },
        tooltip: {
            default: text('tooltip', 'tooltip'),
        },
        contents: {
            default: text('contents', 'activator'),
        },
        tooltipOptions: {
            default: object('tooltip options', { offset: '12px' }),
        },
        contentsSlot: {
            default: text('contents slot', 'icon', 'slot'),
        },
    },
    template: `<p-menu-list :list-items="listItems" 
                            :contents="contents"
                            @show="show" 
                            @hide="hide" 
                            @change="change" 
                            @select="select">
                    <template #contents>
                        {{contentsSlot}}
                    </template>
                </p-menu-list>`,
    methods: {
        show: action('show'),
        hide: action('hide'),
        change: action('change'),
        select: action('select'),
    },
});
