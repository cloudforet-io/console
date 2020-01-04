import { withKnobs, object, text } from '@storybook/addon-knobs/vue';
import { ref, toRefs, reactive } from '@vue/composition-api';
import { autoProps } from '@sb/storybook-util';
import { action } from '@storybook/addon-actions';
import _ from 'lodash';
import { VTooltip } from 'v-tooltip';
import PProgressTabBar from './ProgressTabBar';
import { makeProxy } from '@/lib/compostion-util';

export default {
    title: 'molecules/tabs/ProgressTabBar',
    component: PProgressTabBar,
    decorators: [withKnobs],
};

const getProps = () => ({

});

const actions = {
    changeTabs: action('changeTabs'),
};
const getData = (props, context) => {
    const state = reactive({
        tabs: {
            conf: {
                label: 'Configure Collector (conf)',
                alert: 'This is alert message!!',
                active: true,
                unvalid: true,
            },
            credentials: {
                label: 'Choose Credentials (credentials)',
                warning: 'This is warning messasge',
            },
            tags: {
                label: 'Add Tags (tags)',
                help: 'This is description of add tags step.',
            },
        },
        doneTab: 'conf',
        unvalidTabs: [false, false, false],
    });

    const onClickDone = () => {
        state.tabs[state.doneTab].done = true;
        state.tabs = { ...state.tabs };
    };

    const unvalidChange = (name, e) => {
        state.tabs[name].unvalid = e.target.checked;
        state.tabs = { ...state.tabs };
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
            @changeTabs="changeTabs"
         />
         <br><br><br>
         Process Done Tab: <input type="text" v-model="doneTab"> 
         <button @click="onClickDone">Done</button>
     </div>
    `,
    setup(...args) {
        return {
            ...getData(...args),
            ...actions,
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
            :show-validation="true" 
            @changeTabs="changeTabs"
         />
         <br><br><br>
         <h4>Check unvalid Tabs</h4> 
         <template v-for="(tab, key)  in tabs">
            {{ key }}:
            <input type="checkbox" :checked="tab.unvalid" @change="unvalidChange(key, $event)">
            <br>
         </template>
     </div>
    `,
    setup(...args) {
        return {
            ...getData(...args),
            ...actions,
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
            @changeTabs="changeTabs"
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
            ...actions,
        };
    },
});

export const defaultSlot = () => ({
    components: {
        PProgressTabBar,
    },
    directives: { tooltip: VTooltip },
    props: getProps(),
    template: `
    <div style="width: 100vw;">
        <p-progress-tab-bar 
            :tabs.sync="tabs" 
            @changeTabs="changeTabs"
         >
            <template #default="{tab}">
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
            ...actions,
        };
    },
});
