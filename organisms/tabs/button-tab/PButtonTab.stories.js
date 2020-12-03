import {
    toRefs, reactive, ref, computed,
} from '@vue/composition-api';
import { action } from '@storybook/addon-actions';
import {
    text, number, select, object, boolean,
} from '@storybook/addon-knobs/vue';
import PButtonTab from './PButtonTab.vue';

export default {
    title: 'others/tabs/ButtonTab',
    component: PButtonTab,
    parameters: {
        info: {
            summary: '',
            components: { PButtonTab },
        },
        knobs: { escapeHTML: false },
    },
};


export const defaultCase = () => ({
    components: { PButtonTab },
    template: `
    <div style="height: 80vh; width: 80vw;">
        <p-button-tab :tabs="tabs" :active-tab.sync="activeTab"
                      keep-alive-all
                      v-on="actions"
        >
            <template #A>
                <div class="m-4">This is A</div>
            </template>
            <template #B>
                <div class="m-4">Hello, This is B.</div>
            </template>
            <template #C>
                <div class="m-4">Hi, This is C!!!!</div>
            </template>
        </p-button-tab>
    </div>`,
    setup(props, context) {
        const state = reactive({
            tabs: ['A', 'B', 'C'],
            activeTab: 'A',
        });

        return {
            ...toRefs(state),
            actions: {
                change: action('change'),
            },
        };
    },
});


export const AdvancedCase = () => ({
    components: { PButtonTab },
    template: `
    <div style="height: 80vh; width: 80vw;">
        <p-button-tab :tabs="tabs" :active-tab.sync="activeTab"
                      keep-alive-all
                      v-on="actions"
        >
            <template v-for="t in tabs" v-slot:[t.name]="scope" >
                <div class="m-4" :style="scope.style">{{ scope.data }}</div>
            </template>
        </p-button-tab>
    </div>`,
    setup(props, context) {
        const state = reactive({
            tabs: [
                { name: 'A', data: 'This is A', style: 'padding: 1rem; border: 1px solid pink;' },
                { name: 'B', data: 'Hello, This is B.', style: 'height: 300px; border: 1px solid aquamarine;' },
                {
                    name: 'C', label: 'The C', data: 'Hi, This is C!!!!', style: 'height: 300px; line-height: 1.2; font-weight: border; font-size: 3rem; border: 1px solid slateblue;',
                },
            ],
            activeTab: 'A',
        });

        return {
            ...toRefs(state),
            actions: {
                change: action('change'),
            },
        };
    },
});
