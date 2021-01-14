import { text, object } from '@storybook/addon-knobs';
import PBoardLayout from '@/organisms/layouts/board-layout/PBoardLayout.vue';

export default {
    title: 'Layouts/BoardLayout',
    component: PBoardLayout,
};


export const boardLayout = () => ({
    components: { PBoardLayout },
    props: {
        title: {
            default: text('title', ''),
        },
        dropdownMenu: {
            default: object('dropdownMenu', null),
        },
        dropdownSelected: {
            default: text('dropdownSelected', ''),
        },
        defaultSlot: {
            default: text('default slot', 'contents', 'slot'),
        },
    },
    template: `<p-board-layout v-bind="$props">
                    <template>{{defaultSlot}}</template>
                </p-board-layout>`,
});
