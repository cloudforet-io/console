import { withKnobs } from '@storybook/addon-knobs';
import { toRefs, reactive } from '@vue/composition-api';
import { getKnobProps } from '@/util/storybook-util';
import PProgressTabBar from '@/molecules/tabs/progress-tab-bar/PProgressTabBar.vue';
// import md from '@/molecules/tabs/progress-tab-bar/PProgresTabBar.md';

export default {
    title: 'Others/Tab, Progress Tab/ProgressTabBar',
    component: PProgressTabBar,
    decorators: [withKnobs],
    parameters: {
        info: {
            summary: '',
            components: { PProgressTabBar },
        },
    },
};

const getData = () => {
    const state = reactive({
        tabs: [
            {
                name: 'conf',
                label: 'Configure Collector (conf)',
            },
            {
                name: 'credentials',
                label: 'Choose Credentials (credentials)',
            },
            {
                name: 'tags',
                label: 'Add Tags (tags)',
                help: 'This is description of add tags step.',
            },
        ],
        activeIdx: 0,
    });

    return {
        ...toRefs(state),
    };
};

export const defaultCase = () => ({
    components: { PProgressTabBar },
    props: getKnobProps(
        {
            tabs: {
                type: Array,
                default: () => [],
            },
            /** sync */
            activeIdx: {
                type: Number,
                default: 0,
            },
            invalidState: {
                type: Object,
                default: () => ({}),
            },
        }, {
            invalidState: {
                conf: true,
                credentials: true,
                tags: false,
            },
            progressState: {
                conf: true,
                credentials: true,
                tags: false,
            },
        }, {
            tabs: true,
            activeIdx: true,
        },
    ),
    template: `
    <div style="width: 100vw;">
        <p-progress-tab-bar v-bind="$props"
            :tabs="tabs" 
            :active-idx.sync="activeIdx"
            
         />
         <br><br><br>
        <pre>{{JSON.stringify(tabs, undefined, 2)}}</pre>
     </div>
    `,
    setup(...args) {
        return {
            ...getData(),
        };
    },
});
