import { withKnobs } from '@storybook/addon-knobs/vue';
import { autoProps } from '@sb/storybook-util';
import { action } from '@storybook/addon-actions';
import PTag from '@/components/molecules/tags/PTag.vue';

export default {
    title: 'Data Display/Tags',
    component: PTag,
    decorators: [withKnobs],
};

export const tag = () => ({
    components: { PTag },
    props: {
        ...autoProps(PTag),
    },
    template: '<p-tag v-bind="$props" @delete="onDelete">tag name</p-tag>',
    setup() {
        return {
            onDelete: action('delete'),
        };
    },
});
