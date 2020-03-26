import { autoProps } from '@sb/storybook-util';
import PMenuItem from 'src/components/molecules/menu-item/MenuItem.vue';
import { text, number, boolean } from '@storybook/addon-knobs';

export default {
    title: 'Molecules/MenuItem',
    component: PMenuItem,
};


export const defaultCase = () => ({
    components: { PMenuItem },
    props: {
        contents: {
            default: text('contents', 'contents'),
        },
        indent: {
            default: number('indent', 0),
        },
        selected: {
            default: boolean('selected', false),
        },
    },
    template: '<p-list-item :contents="contents" :indent="indent" :selected="selected"/>',
});
