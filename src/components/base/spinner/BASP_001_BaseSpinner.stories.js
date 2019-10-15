import { withKnobs, number, boolean } from '@storybook/addon-knobs/vue';
import BaseSpinner from './BASP_001_BaseSpinner.vue';

export default {
    title: 'Base/spinner',
    component: BaseSpinner,
    decorators: [withKnobs],
};

export const Spinner = () => ({
    components: { BaseSpinner },
    props: {
        value: {
            default: boolean('value',true)
        },
        size: {
            default:number('size',2)
        }
    },
    template: `<div style="width: 500px;height: 500px;"><BaseSpinner v-model="value" :size="size"></BaseSpinner></div>`,

});
