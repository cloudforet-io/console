import { withKnobs, boolean } from '@storybook/addon-knobs/vue';
import { ref, toRefs, reactive } from '@vue/composition-api';
import { autoProps } from '@sb/storybook-util';
import { action } from '@storybook/addon-actions';
import PRadio from './Radio';


export default {
    title: 'molecules/forms/Radio',
    component: PRadio,
    decorators: [withKnobs],
};


export const defaultCase = () => ({
    components: { PRadio },
    props: {
        hovered: {
            default: boolean('hovered', false),
        },
    },
    template: '<p-radio :hovered="hovered" v-model="selected"/>',
    setup() {
        const selected = ref(false)
        return {
            selected,
        };
    },
});
