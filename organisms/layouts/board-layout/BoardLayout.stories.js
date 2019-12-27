import { withKnobs, text, number } from '@storybook/addon-knobs/vue';
import PBoardLayout from './BoardLayout';
import { autoProps } from '@sb/storybook-util';

export default {
    title: 'Organisms/layouts/board-layout',
    component: PBoardLayout,
    decorators: [withKnobs],
};


export const BoardLayout = () => ({
    components: { PBoardLayout },
    props: {
        ...autoProps(PBoardLayout),
        defaultSlot: {
            default: text('default slot', 'contents', 'slot'),
        },
    },
    template: `<p-board-layout v-bind="$props">
                    <template>{{defaultSlot}}</template>
                </p-board-layout>`,
});
