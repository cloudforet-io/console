import { withKnobs, text } from '@storybook/addon-knobs/vue';
import { toRefs, reactive } from '@vue/composition-api';
import { autoProps } from '@sb/storybook-util';
import PCardItem from './CardItem';


export default {
    title: 'molecules/cards/CardItem',
    component: PCardItem,
    decorators: [withKnobs],
};


export const defaultCase = () => ({
    components: { PCardItem },
    props: {
        ...autoProps(PCardItem),
    },
    template: '<PCardItem v-bind="$props"/>',
});
