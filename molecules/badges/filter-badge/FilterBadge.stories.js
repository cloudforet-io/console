import { withKnobs, text } from '@storybook/addon-knobs/vue';
import { toRefs, reactive } from '@vue/composition-api';
import { autoProps } from '@sb/storybook-util';
import { action } from '@storybook/addon-actions';
import PFilterBadge from './FilterBadge';


export default {
    title: 'molecules/badges/FilterBadge',
    component: PFilterBadge,
    decorators: [withKnobs],
};


export const defaultCase = () => ({
    components: { PFilterBadge },
    props: {
        ...autoProps(PFilterBadge),
    },
    template: '<p-filter-badge v-bind="$props" @delete="onDelete">filtername</p-filter-badge>',
    methods: {
        onDelete: action('delete'),
    },
});
