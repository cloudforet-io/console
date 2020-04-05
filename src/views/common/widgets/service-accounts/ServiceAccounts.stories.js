import {
    toRefs, reactive, ref, computed,
} from '@vue/composition-api';
import { action } from '@storybook/addon-actions';
import {
    text, number, select, object, boolean,
} from '@storybook/addon-knobs/vue';
import PServiceAccounts from './ServiceAccounts.vue';

export default {
    title: 'views/widgets/ServiceAccounts',
    component: PServiceAccounts,
    parameters: {
        info: {
            summary: '',
            components: { PServiceAccounts },
        },
        knobs: { escapeHTML: false },
    },
};


export const defaultCase = () => ({
    components: { PServiceAccounts },
    template: `
    <div style="width: 80vw;">
        <PServiceAccounts v-bind="$props"></PServiceAccounts>
    </div>`,
    setup(props, context) {
        return {};
    },
});
