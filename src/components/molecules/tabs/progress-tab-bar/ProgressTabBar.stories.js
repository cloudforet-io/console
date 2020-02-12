import { withKnobs, object, text } from '@storybook/addon-knobs/vue';
import { ref, toRefs, reactive } from '@vue/composition-api';
import { autoProps } from '@sb/storybook-util';
import { action } from '@storybook/addon-actions';
import _ from 'lodash';
import { VTooltip } from 'v-tooltip';
import PProgressTabBar from './ProgressTabBar.vue';
import { makeProxy } from '@/lib/compostion-util';

export default {
    title: 'molecules/tabs/ProgressTabBar',
    component: PProgressTabBar,
    decorators: [withKnobs],
    parameters: {
        info: {
            summary: `
            This component needs 'tabs' property with follow format: \n
            \n
                key: String (essential),
                label: String (recommended),
                invalid: Boolean,
                help: Boolean,
            \n
            `,
            components: { PProgressTabBar },
        },
    },
};

const getProps = () => ({

});

const actions = () => ({
});

const getData = (props, context) => {
    const state = reactive({
        tabs: [
            {
                key: 'conf',
                label: 'Configure Collector (conf)',
                alert: 'This is alert message!!',
                invalid: true,
                showValidation: false,
            },
            {
                key: 'credentials',
                label: 'Choose Credentials (credentials)',
                warning: 'This is warning messasge',
                showValidation: false,
            },
            {
                key: 'tags',
                label: 'Add Tags (tags)',
                help: 'This is description of add tags step.',
                showValidation: false,
            },
        ],
        activeIdx: 0,
        doneTab: 0,
    });

    const changeTab = (now, beforeIdx) => {
        state.tabs.splice(beforeIdx, 1, { ...state.tabs[beforeIdx], showValidation: true });
        action('changeTab')(now, beforeIdx);
    };

    const onClickDone = () => {
        state.tabs[Number(state.doneTab)].done = true;
        state.tabs = [...state.tabs];
    };

    const invalidChange = (idx, e) => {
        state.tabs[idx].invalid = e.target.checked;
        state.tabs = [...state.tabs];
    };


    return {
        ...toRefs(state),
        changeTab,
        onClickDone,
        invalidChange,
    };
};

export const defaultCase = () => ({
    components: { PProgressTabBar },
    props: getProps(),
    template: `
    <div style="width: 100vw;">
        <p-progress-tab-bar 
            :tabs.sync="tabs" 
            :active-idx.sync="activeIdx"
         />
         <br><br><br>
         Process Done Tab Index: <input type="text" v-model="doneTab"> 
         <button @click="onClickDone">Done</button>
        <br><br>
        <pre>{{JSON.stringify(tabs, undefined, 2)}}</pre>
     </div>
    `,
    setup(...args) {
        return {
            ...getData(...args),
        };
    },
});


export const validationAutoChange = () => ({
    components: { PProgressTabBar },
    props: getProps(),
    template: `
    <div style="width: 100vw;">
        <p-progress-tab-bar 
            :tabs.sync="tabs"
            :active-idx.sync="activeIdx"
            @changeTab="changeTab"
         />
         <br><br><br>
        <div style="display: flex; padding: 2rem;">
            <div style="margin-right: 2rem; justify-self: flex-start;">
                 <h4>Check invalid Tabs</h4> 
                 <template v-for="(tab, idx) in tabs">
                    {{ tab.key }}:
                    <input type="checkbox" :checked="tab.invalid" @change="invalidChange(idx, $event)">
                    <br>
                 </template>
            </div>
            <div style="border: 1px solid pink; padding: 1rem;">
                <pre>{{JSON.stringify(tabs, undefined, 2)}}</pre>
            </div>
        </div>
     </div>
    `,
    setup(...args) {
        return {
            ...getData(...args),
        };
    },
});

export const helpSlot = () => ({
    components: {
        PProgressTabBar,
    },
    directives: { tooltip: VTooltip },
    props: getProps(),
    template: `
    <div style="width: 100vw;">
        <p-progress-tab-bar 
            :tabs.sync="tabs"
            :active-idx.sync="activeIdx"
            @changeTab="changeTab"
         >
            <template #help-conf>
                  <button v-tooltip="{
                      content: 'You can use tooltip options for customizing this help message.',
                      placement: 'right',
                      classes: ['p-tooltip'],
                  }" class="p-tooltip">HOVER ME!</button>
            </template>
         </p-progress-tab-bar>
     </div>
    `,
    setup(...args) {
        return {
            ...getData(...args),
        };
    },
});

export const progressSlot = () => ({
    components: {
        PProgressTabBar,
    },
    directives: { tooltip: VTooltip },
    props: getProps(),
    template: `
    <div style="width: 100vw;">
        <p-progress-tab-bar 
            :tabs.sync="tabs"
            :active-idx.sync="activeIdx"
            @changeTab="changeTab"
         >
            <template #progress-conf="{tab}">
                  <button v-tooltip="{
                      content: tab.label,
                      placement: 'right',
                      classes: ['p-tooltip'],
                  }" class="p-tooltip" style="display: inline-block !important;">{{tab.label}}</button>
            </template>
         </p-progress-tab-bar>
     </div>
    `,
    setup(...args) {
        return {
            ...getData(...args),
        };
    },
});
