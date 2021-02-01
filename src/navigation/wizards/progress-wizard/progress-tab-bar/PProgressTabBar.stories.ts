import { toRefs, reactive, watch } from '@vue/composition-api';
import { object } from '@storybook/addon-knobs';
import PProgressTabBar from '@/navigation/wizards/progress-wizard/progress-tab-bar/PProgressTabBar.vue';
import PTextEditor from '@/inputs/text-editor/PTextEditor.vue';

export default {
    title: 'Navigation/Wizards/Progress Wizard',
    component: PProgressTabBar,
    parameters: {
        info: {
            summary: '',
            components: { PProgressTabBar },
        },
    },
};


export const barOnly = () => ({
    components: { PProgressTabBar, PTextEditor },
    props: {
        invalidState: {
            default: object('invalidState', {
                conf: true,
                credentials: true,
                tags: false,
            }),
        },
    },
    template: `
    <div style="width: 100vw;">
        <p-progress-tab-bar v-bind="$props"
            :tabs="tabs" 
            :active-idx.sync="activeIdx"
            
         />
         <br><br><br>
        <p-text-editor :code.sync="code"
                       class="w-full px-4"
        />
     </div>
    `,
    setup() {
        const tabs = [
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
        ];
        const state = reactive({
            tabs,
            activeIdx: 0,
            code: JSON.stringify(tabs, undefined, 2),
        });

        watch(() => state.code, (code) => {
            try {
                state.tabs = JSON.parse(code);
            } catch (e) {

            }
        });

        return {
            ...toRefs(state),
        };
    },
});
