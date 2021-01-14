import { ref } from '@vue/composition-api';
import { action } from '@storybook/addon-actions';
import { object, boolean } from '@storybook/addon-knobs';
import { VTooltip } from 'v-tooltip';
import PProgressWizard from '@/organisms/wizards/progress-wizard/PProgressWizard.vue';


export default {
    title: 'Navigation/ProgressWizard',
    component: { PProgressWizard },
    parameters: {
        info: {
            summary: `
            This component needs 'tabs' property with follow format: \n
            \n
                key: String (essential),
                label: String (recommended),
                alert: String (or warning),
                invalid: Boolean,
                help: Boolean,
                optional: Boolean,
            \n
            `,
            component: { PProgressWizard },
        },
    },
};

const actions = () => ({
    onChangeStep: action('changeStep'),
    onCancel: action('cancel'),
    onConfirm: action('confirm'),
});

const getProps = () => ({
    tabs: {
        default: object('tabs', [
            {
                name: 'conf',
                label: 'Configure Collector',
            },
            {
                name: 'credentials',
                label: 'Choose Credentials',
            },
            {
                name: 'tags',
                label: 'Add Tags',
                help: 'This is description of add tags step.',
            },
        ]),
    },
    invalidState: {
        default: object('invalidState', {}),
    },
    cancelBtnBind: {
        default: object('cancelBtnBind', {}),
    },
    navigationBtnBind: {
        default: object('navigationBtnBind', {}),
    },
    confirmBtnBind: {
        default: object('confirmBtnBind', {}),
    },
    loading: {
        default: boolean('loading', false),
    },
    disabled: {
        default: boolean('disabled', false),
    },
});


export const progressWizard = () => ({
    components: { PProgressWizard },
    props: { ...getProps() },
    template: `<p-progress-wizard v-bind="$props"
                                  :activeIdx.sync="activeIdx"
                                style="width: 100vw;"
                                @changeStep="onChangeStep"
                                @cancel="onCancel"
                                @confirm="onConfirm"
                >
                    <template v-for="(tab) in tabs"
                              :slot="'contents-' + tab.name"
                    >
                        <div style="background-color: mediumpurple; padding: 2rem;" :key="tab.name">
                            <h2 style="text-align: center;">
                                This is contents slot for '{{ tab.name }}' tab.
                            </h2>
                            <br>
                            <h4 v-for="(item, idx) in JSON.stringify(tab).split(',')"
                                :key="idx"
                            >
                                {{item}}<br>
                            </h4>
                            <br>
                            <p>* It has min height.</p>
                        </div>
                    </template>
                </p-progress-wizard>`,
    setup(...args) {
        return {
            activeIdx: ref(0),
            ...actions(),
        };
    },
});

export const topSlot = () => ({
    components: { PProgressWizard },
    props: { ...getProps() },
    template: `<p-progress-wizard :tabs.sync="tabs"
                                :active-idx.sync="activeIdx"
                                style="width: 100vw;"
                                @cancel="onCancel"
                                @confirm="onConfirm"
                >
                    <template #top>
                        <h1 style="background-color: hotpink;">This is 'top' slot</h1>
                    </template>
                </p-progress-wizard>`,
    setup(...args) {
        return {
            activeIdx: ref(0),
            ...actions(),
        };
    },
});

export const progressSlot = () => ({
    components: { PProgressWizard },
    props: { ...getProps() },
    template: `<p-progress-wizard :tabs.sync="tabs"
                                :active-idx.sync="activeIdx"
                                style="width: 100vw;"
                                @cancel="onCancel"
                                @confirm="onConfirm"
                >
                    <template v-for="(tab) in tabs"
                              :slot="'progress-' + tab.name"
                    >
                        <div style="color: hotpink; padding: 2rem;" :key="'progress-'+tab.name">
                                This is progress slot for '{{ tab.name }}' tab.
                        </div>
                    </template>
                </p-progress-wizard>`,
    setup(...args) {
        return {
            activeIdx: ref(0),
            ...actions(),
        };
    },
});

export const helpSlot = () => ({
    components: { PProgressWizard },
    directives: { tooltip: VTooltip },
    props: { ...getProps() },
    template: `<p-progress-wizard :tabs.sync="tabs"
                                :active-idx.sync="activeIdx"
                                style="width: 100vw;"
                                @cancel="onCancel"
                                @confirm="onConfirm"
                >
                    <template v-for="(tab) in tabs"
                              :slot="'help-' + tab.name"
                    >
                          <button v-tooltip="{
                              content: 'You can use tooltip options for customizing this help message.',
                              placement: 'right',
                              classes: ['p-tooltip'],
                          }" class="p-tooltip">HOVER ME!</button>
                    </template>
                </p-progress-wizard>`,
    setup(...args) {
        return {
            activeIdx: ref(0),
            ...actions(),
        };
    },
});


export const stepAppendSlot = () => ({
    components: { PProgressWizard },
    props: { ...getProps() },
    template: `<p-progress-wizard :tabs.sync="tabs"
                                :active-idx.sync="activeIdx"
                                style="width: 100vw;"
                                @cancel="onCancel"
                                @confirm="onConfirm"
                >
                    <template slot="step-append-conf">
                        <button style="display: inline-block;">This is step append slot</button>
                    </template>
                </p-progress-wizard>`,
    setup(...args) {
        return {
            activeIdx: ref(0),
            ...actions(),
        };
    },
});


export const bottomSlot = () => ({
    components: { PProgressWizard },
    props: { ...getProps() },
    template: `<p-progress-wizard :tabs.sync="tabs"
                                :active-idx.sync="activeIdx"
                                style="width: 100vw;"
                                @cancel="onCancel"
                                @confirm="onConfirm"
                >
                    <template #bottom>
                        <h1 style="background-color: hotpink;">This is 'bottom' slot</h1>
                    </template>
                </p-progress-wizard>`,
    setup(...args) {
        return {
            activeIdx: ref(0),
            ...actions(),
        };
    },
});
