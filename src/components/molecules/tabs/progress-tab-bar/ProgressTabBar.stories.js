import { withKnobs, object, text } from '@storybook/addon-knobs/vue';
import { ref, toRefs, reactive } from '@vue/composition-api';
import { autoProps } from '@sb/storybook-util';
import { action } from '@storybook/addon-actions';
import _ from 'lodash';
import { VTooltip } from 'v-tooltip';
import PProgressTabBar from './ProgressTabBar';
import { makeProxy } from '@/lib/compostion-util';
import BaseDragVertical from '@/components/base/drag/BaseDragVertical';

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
                unvalid: Boolean,
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
    changeTab: action('changeTab'),
});

const getData = (props, context) => {
    const state = reactive({
        tabs: [
            {
                key: 'conf',
                label: 'Configure Collector (conf)',
                alert: 'This is alert message!!',
                unvalid: true,
            },
            {
                key: 'credentials',
                label: 'Choose Credentials (credentials)',
                warning: 'This is warning messasge',
            },
            {
                key: 'tags',
                label: 'Add Tags (tags)',
                help: 'This is description of add tags step.',
            },
        ],
        activeIdx: 0,
        doneTab: 0,
    });

    const onClickDone = () => {
        state.tabs[Number(state.doneTab)].done = true;
        state.tabs = [...state.tabs];
    };

    const unvalidChange = (idx, e) => {
        state.tabs[idx].unvalid = e.target.checked;
        state.tabs = [...state.tabs];
    };


    return {
        ...toRefs(state),
        onClickDone,
        unvalidChange,
    };
};

export const defaultCase = () => ({
    components: { PProgressTabBar },
    props: getProps(),
    template: `
    <div style="width: 100vw;">
        <p-progress-tab-bar 
            :tabs.sync="tabs" 
            :active-idx="activeIdx"
            @changeTab="changeTab"
         />
         <br><br><br>
         Process Done Tab Index: <input type="text" v-model="doneTab"> 
         <button @click="onClickDone">Done</button>
     </div>
    `,
    setup(...args) {
        return {
            ...getData(...args),
            ...actions(),
        };
    },
});


export const validationMode = () => ({
    components: { PProgressTabBar },
    props: getProps(),
    template: `
    <div style="width: 100vw;">
        <p-progress-tab-bar 
            :tabs.sync="tabs"
            :active-idx="activeIdx"
            :show-validation="true" 
            @changeTab="changeTab"
         />
         <br><br><br>
         <h4>Check unvalid Tabs</h4> 
         <template v-for="(tab, idx) in tabs">
            {{ tab.key }}:
            <input type="checkbox" :checked="tab.unvalid" @change="unvalidChange(idx, $event)">
            <br>
         </template>
     </div>
    `,
    setup(...args) {
        return {
            ...getData(...args),
            ...actions(),
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
            :active-idx="activeIdx"
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
            ...actions(),
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
            ...actions(),
        };
    },
});
