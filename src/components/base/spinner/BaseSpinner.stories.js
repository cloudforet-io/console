import { withKnobs, } from '@storybook/addon-knobs/vue';
import BaseSpinner from './BaseSpinner.vue';
import { autoProps } from '../../../setup/storybook-util';

export default {
    title: 'Base/spinner',
    component: BaseSpinner,
    decorators: [withKnobs],
};

export const Spinner = () => ({
    components: { BaseSpinner },
    props: {
        ...autoProps(BaseSpinner, [
            { name: 'value', default: true },
            { name: 'size', default: 2 }
        ])
    },
    template: '<div style="width: 500px;height: 500px;"><BaseSpinner v-model="value" :size="size"></BaseSpinner></div>',

});
