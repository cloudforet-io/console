import { withKnobs, text, number } from '@storybook/addon-knobs';
import PBoardLayout from '@/organisms/layouts/board-layout/PBoardLayout.vue';
import { autoProps } from '@/util/storybook-util';

export default {
    title: 'Layouts/BoardLayout',
    component: PBoardLayout,
    decorators: [withKnobs],
};


export const boardLayout = () => ({
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
