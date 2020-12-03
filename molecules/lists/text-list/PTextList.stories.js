import {
    toRefs, reactive, ref, computed,
} from '@vue/composition-api';
import { action } from '@storybook/addon-actions';
import { getKnobProps } from '@sb/storybook-util';
import {
    text, number, select, object, boolean,
} from '@storybook/addon-knobs/vue';
import casual, { arrayOf } from '@/components/util/casual';
import PTextList from './PTextList.vue';

export default {
    title: 'others/TextList',
    component: PTextList,
    parameters: {
        info: {
            summary: '',
            components: { PTextList },
        },
        knobs: { escapeHTML: false },
    },
};


export const defaultCase = () => ({
    components: { PTextList },
    props: {
        items: {
            default: object('items', ['hi', 'hello']),
        },
        delimiter: {
            default: text('delimiter', ', '),
        },
        subKey: {
            default: text('subKey', undefined),
        },
        tag: {
            default: text('tag', 'span'),
        },
        link: {
            default: text('link', undefined),
        },
        target: {
            default: text('target', undefined),
        },
    },
    template: `
    <div style="width: 80vw;">
        <PTextList v-bind="$props"></PTextList>
    </div>`,
    setup(props, context) {
        const state = reactive({});

        return {
            ...toRefs(state),
        };
    },
});


export const linkFormatter = () => ({
    components: { PTextList },
    props: {
        items: {
            default: object('items', ['hi', '', true, false, 0, 1, 'hello']),
        },
        delimiter: {
            default: text('delimiter', ', '),
        },
        subKey: {
            default: text('subKey', undefined),
        },
        tag: {
            default: text('tag', 'span'),
        },
        link: {
            default: text('link', undefined),
        },
        target: {
            default: text('target', undefined),
        },
    },
    template: `
    <div style="width: 80vw;">
        <PTextList v-bind="$props" :linkFormatter="linkFormatter"></PTextList>
    </div>`,
    setup(props, context) {
        const state = reactive({});

        return {
            ...toRefs(state),
            linkFormatter(d, i) {
                return d;
            },
        };
    },
});


export const objectArray = () => ({
    components: { PTextList },
    props: {
        items: {
            default: object('items', arrayOf(10, () => ({
                name: casual.name,
                phone: casual.phone,
                group: casual.random_element([undefined, casual.word]),
            }))),
        },
        delimiter: {
            default: text('delimiter', ', '),
        },
        subKey: {
            default: text('subKey', 'name'),
        },
        tag: {
            default: text('tag', 'span'),
        },
        link: {
            default: text('link', undefined),
        },
        target: {
            default: text('target', undefined),
        },
    },
    template: `
    <div style="width: 80vw;">
        <PTextList v-bind="$props"></PTextList>
    </div>`,
    setup(props, context) {
        const state = reactive({});

        return {
            ...toRefs(state),
        };
    },
});


export const defaultSlot = () => ({
    components: { PTextList },
    props: {
        items: {
            default: object('items', arrayOf(10, () => ({
                name: casual.name,
                phone: casual.phone,
                group: casual.random_element([undefined, casual.word]),
            }))),
        },
        delimiter: {
            default: text('delimiter', ', '),
        },
        subKey: {
            default: text('subKey', 'name'),
        },
        tag: {
            default: text('tag', 'span'),
        },
        link: {
            default: text('link', undefined),
        },
        target: {
            default: text('target', undefined),
        },
    },
    template: `
    <div style="width: 80vw;">
        <p>scopedSlot Props: <br>
            all props, <br>
            index,<br> 
            data( = items[index]), <br>
            value(exact value. it will be different from data only when subKey is given.)
        </p>
        <br><br><br><br>
        <PTextList v-bind="$props">
            <template #default="{value, index}">
                <span>[{{index + 1}}] {{value}}</span>
            </template>
            <template #delimiter="">
                <br>
            </template>
        </PTextList>
    </div>`,
    setup(props, context) {
        const state = reactive({});

        return {
            ...toRefs(state),
        };
    },
});
