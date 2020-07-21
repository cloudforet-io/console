import {
    withKnobs, text, boolean, object, number,
} from '@storybook/addon-knobs/vue';
import { toRefs, reactive, ref } from '@vue/composition-api';
import { action } from '@storybook/addon-actions';
import { VTooltip } from 'v-tooltip';
import { getKnobProps } from '@sb/storybook-util';
import { progressWizardProps } from '@/components/organisms/wizards/progress-wizard/PProgressWizard.toolset';
import PProgressWizard from '@/components/organisms/wizards/progress-wizard/PProgressWizard.vue';


export default {
    title: 'organisms/wizards/ProgressWizard',
    component: PProgressWizard,
    decorators: [withKnobs],
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
            components: { PProgressWizard },
        },
    },
};

const actions = () => ({
    onChangeStep: action('changeStep'),
    onCancel: action('cancel'),
    onConfirm: action('confirm'),
});


export const defaultCase = () => ({
    components: { PProgressWizard },
    props: getKnobProps(progressWizardProps, {
        title: 'Wizard Title',
        tabs: [
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
        ],
    }, {
        activeIdx: true,
    }),
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
//
// export const topSlot = () => ({
//     components: { PProgressWizard },
//     props: { ...getProps() },
//     template: `<p-progress-wizard :tabs.sync="tabs"
//                                 :active-idx.sync="activeIdx"
//                                 :show-validation="showValidation"
//                                 :show-confirm="showConfirm"
//                                 :title="title"
//                                 style="width: 100vw;"
//                                 @cancel="onCancel"
//                                 @confirm="onConfirm"
//                 >
//                     <template #top>
//                         <h1 style="background-color: hotpink;">This is 'top' slot</h1>
//                     </template>
//                 </p-progress-wizard>`,
//     setup(...args) {
//         return {
//             ...getData(...args),
//             ...actions(),
//         };
//     },
// });
//
// export const progressSlot = () => ({
//     components: { PProgressWizard },
//     props: { ...getProps() },
//     template: `<p-progress-wizard :tabs.sync="tabs"
//                                 :active-idx.sync="activeIdx"
//                                 :show-validation="showValidation"
//                                 :show-confirm="showConfirm"
//                                 :title="title"
//                                 style="width: 100vw;"
//                                 @cancel="onCancel"
//                                 @confirm="onConfirm"
//                 >
//                     <template v-for="(tab) in tabs"
//                               :slot="'progress-' + tab.key"
//                     >
//                         <div style="color: hotpink; padding: 2rem;" :key="'progress-'+tab.key">
//                                 This is progress slot for '{{ tab.key }}' tab.
//                         </div>
//                     </template>
//                 </p-progress-wizard>`,
//     setup(...args) {
//         return {
//             ...getData(...args),
//             ...actions(),
//         };
//     },
// });
//
// export const helpSlot = () => ({
//     components: { PProgressWizard },
//     directives: { tooltip: VTooltip },
//     props: { ...getProps() },
//     template: `<p-progress-wizard :tabs.sync="tabs"
//                                 :active-idx.sync="activeIdx"
//                                 :show-validation="showValidation"
//                                 :show-confirm="showConfirm"
//                                 :title="title"
//                                 style="width: 100vw;"
//                                 @cancel="onCancel"
//                                 @confirm="onConfirm"
//                 >
//                     <template v-for="(tab) in tabs"
//                               :slot="'help-' + tab.key"
//                     >
//                           <button v-tooltip="{
//                               content: 'You can use tooltip options for customizing this help message.',
//                               placement: 'right',
//                               classes: ['p-tooltip'],
//                           }" class="p-tooltip">HOVER ME!</button>
//                     </template>
//                 </p-progress-wizard>`,
//     setup(...args) {
//         return {
//             ...getData(...args),
//             ...actions(),
//         };
//     },
// });
//
// export const bodySlot = () => ({
//     components: { PProgressWizard },
//     props: { ...getProps() },
//     template: `<p-progress-wizard :tabs.sync="tabs"
//                                 :active-idx.sync="activeIdx"
//                                 :show-validation="showValidation"
//                                 :show-confirm="showConfirm"
//                                 :title="title"
//                                 style="width: 100vw;"
//                                 @cancel="onCancel"
//                                 @confirm="onConfirm"
//                 >
//                     <template v-for="(tab) in tabs"
//                               :slot="'body-' + tab.key"
//                     >
//                     <div style="background-color: lightpink; padding: 2rem;" :key="tab.key">
//                         <h2 style="text-align: center;">
//                             This is body slot for '{{ tab.key }}' tab.
//                         </h2>
//                         <br>
//                         <h4 v-for="(item, idx) in JSON.stringify(tab).split(',')"
//                             :key="idx"
//                         >
//                             {{item}}<br>
//                         </h4>
//                         <br>
//                         <p>* There's no min height.</p>
//                         </div>
//                     </template>
//                 </p-progress-wizard>`,
//     setup(...args) {
//         return {
//             ...getData(...args),
//             ...actions(),
//         };
//     },
// });
//
//
// export const stepSlot = () => ({
//     components: { PProgressWizard },
//     props: { ...getProps() },
//     template: `<p-progress-wizard :tabs.sync="tabs"
//                                 :active-idx.sync="activeIdx"
//                                 :show-validation="showValidation"
//                                 :show-confirm="showConfirm"
//                                 :title="title"
//                                 style="width: 100vw;"
//                                 @cancel="onCancel"
//                                 @confirm="onConfirm"
//                 >
//                     <template v-for="(tab) in tabs"
//                               :slot="'step-' + tab.key"
//                     >
//                         <div style="background-color: goldenrod; padding: 2rem;" :key="'step-'+tab.key">
//                             <h2 style="text-align: center;">
//                                 This is step slot for '{{ tab.key }}' tab.
//                             </h2>
//                         </div>
//                     </template>
//                 </p-progress-wizard>`,
//     setup(...args) {
//         return {
//             ...getData(...args),
//             ...actions(),
//         };
//     },
// });
//
// export const stepAppendSlot = () => ({
//     components: { PProgressWizard },
//     props: { ...getProps() },
//     template: `<p-progress-wizard :tabs.sync="tabs"
//                                 :active-idx.sync="activeIdx"
//                                 :show-validation="showValidation"
//                                 :show-confirm="showConfirm"
//                                 :title="title"
//                                 style="width: 100vw;"
//                                 @cancel="onCancel"
//                                 @confirm="onConfirm"
//                 >
//                     <template slot="step-append-conf">
//                         <button style="display: inline-block;">This is step append slot</button>
//                     </template>
//                 </p-progress-wizard>`,
//     setup(...args) {
//         return {
//             ...getData(...args),
//             ...actions(),
//         };
//     },
// });
//
//
// export const bottomSlot = () => ({
//     components: { PProgressWizard },
//     props: { ...getProps() },
//     template: `<p-progress-wizard :tabs.sync="tabs"
//                                 :active-idx.sync="activeIdx"
//                                 :show-validation="showValidation"
//                                 :show-confirm="showConfirm"
//                                 :title="title"
//                                 style="width: 100vw;"
//                                 @cancel="onCancel"
//                                 @confirm="onConfirm"
//                 >
//                     <template #bottom>
//                         <h1 style="background-color: hotpink;">This is 'bottom' slot</h1>
//                     </template>
//                 </p-progress-wizard>`,
//     setup(...args) {
//         return {
//             ...getData(...args),
//             ...actions(),
//         };
//     },
// });
