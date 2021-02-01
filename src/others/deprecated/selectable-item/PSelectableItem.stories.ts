import {
    select, color, text, boolean,
} from '@storybook/addon-knobs';
import PSelectableItem from '@/others/deprecated/selectable-item/PSelectableItem.vue';
import { themes } from '@/others/deprecated/selectable-item/config';

export default {
    title: 'Others/Deprecated/Selectable Item',
    component: PSelectableItem,
};

const imgUrl = 'https://lh3.googleusercontent.com/proxy/1mxA2dMQk7sYbPjbfVcX8PQ_14UFPDkzixnN52vQMT1zSmxyrzNUNedzEqiIStNU9y8Oev1UQPiq6JjkWlKlSy7GU10jM9ekYfFyETDbHZTJDDhjK84xGPorLN_2E3hdO3Ac';


export const defaultCase = () => ({
    components: { PSelectableItem },
    props: {
        iconUrl: {
            default: text('iconUrl', imgUrl),
        },
        title: {
            default: text('title', 'EC2 Collector'),
        },
        active: {
            default: boolean('active', false),
        },
        disabled: {
            default: boolean('disabled', false),
        },
        defaultIcon: {
            default: text('defaultIcon', ''),
        },
        color: {
            default: color('color', ''),
        },
        theme: {
            default: select('theme', themes, themes[0]),
        },
        iconSize: {
            default: text('iconSize', '2rem'),
        },
    },
    template: `
        <div style="width: 80vw;">
            <p-selectable-item v-bind="$props"></p-selectable-item>
        </div>`,
    setup(props, context) {
        return {
        };
    },
});

export const usingSlots = () => ({
    components: { PSelectableItem },
    props: {
        active: {
            default: boolean('active', false),
        },
        disabled: {
            default: boolean('disabled', false),
        },
        defaultIcon: {
            default: text('defaultIcon', ''),
        },
        theme: {
            default: select('theme', themes, themes[0]),
        },
    },
    template: `
        <div style="width: 80vw; border: 1px solid gray;">
            <p-selectable-item v-bind="$props">
                <template #side>
                    <span class="bg-primary-2">This is <strong>side</strong> slot.</span>
                </template>
                <template #contents>
                    <span class="bg-green-300">This is <strong>contents</strong> slot.</span>
                </template>
                <template #extra>
                    <span class="bg-blue-400">This is <strong>extra</strong> slot.</span>
                </template>
            </p-selectable-item>

            <p-selectable-item class="mt-4" v-bind="$props">
                <template #side>
                    <span class="bg-primary-2">This is <strong>side</strong> slot.</span>
                </template>
                <template #title>
                    <span class="bg-coral-400">This is <strong>title</strong> slot.</span>
                </template>
                <template #extra>
                    <span class="bg-blue-400">This is <strong>extra</strong> slot.</span>
                </template>
            </p-selectable-item>
        
        
        </div>`,
    setup(props, context) {
        return {
        };
    },
});
