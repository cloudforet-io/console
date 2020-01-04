import { withKnobs, text } from '@storybook/addon-knobs/vue';
import { toRefs, reactive } from '@vue/composition-api';
import { autoProps } from '@sb/storybook-util';
import { action } from '@storybook/addon-actions';
import PProgressWizard from './ProgressWizard';


export default {
    title: 'organisms/tabs/ProgressTab',
    component: PProgressWizard,
    decorators: [withKnobs],
};


export const defaultCase = () => ({
    components: { PProgressWizard },
    props: {
        ...autoProps(PProgressWizard),
    },
    template: '<PProgressWizard v-bind="$props"/>',
});
