import { withKnobs } from '@storybook/addon-knobs/vue';
import PSpinner from './Spinner';
import { autoProps } from '@/setup/storybook-util';

export default {
    title: 'Molecules/spinners/spinner',
    component: PSpinner,
    decorators: [withKnobs],
};

export const Spinner = () => ({
    components: { PSpinner },
    props: {
        ...autoProps(PSpinner, [
            { name: 'value', default: true },
            { name: 'size', default: 2 },
        ]),
    },
    template: '<div style="width: 500px;height: 500px;"><PSpinner v-model="value" :size="size"></PSpinner></div>',

});
