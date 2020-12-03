import { withKnobs, object, text } from '@storybook/addon-knobs/vue';
import { ref, toRefs, reactive } from '@vue/composition-api';
import { getKnobProps } from '@sb/storybook-util';
import { action } from '@storybook/addon-actions';
import PProgressTabBar from '@/components/molecules/tabs/progress-tab-bar/PProgressTabBar.vue';
import md from '@/components/molecules/tabs/progress-tab-bar/PProgresTabBar.md';

export default {
    title: 'others/ProgressTabBar',
    component: PProgressTabBar,
    decorators: [withKnobs],
    parameters: {
        notes: md,
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
            ...getData(...args),
        };
    },
});
