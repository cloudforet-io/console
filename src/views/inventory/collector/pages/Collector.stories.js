import { withKnobs, text } from '@storybook/addon-knobs/vue';
import { toRefs, reactive } from '@vue/composition-api';
import { autoProps } from '@sb/storybook-util';
import { action } from '@storybook/addon-actions';
import Collector from './Collector.template';


export default {
    title: 'view/inventory/collector/pages/Collector',
    component: Collector,
    decorators: [withKnobs],
};


export const defaultCase = () => ({
    components: { Collector },
    props: {
        ...autoProps(Collector),
    },
    template: `<Collector v-bind="$props"/>`,
});


