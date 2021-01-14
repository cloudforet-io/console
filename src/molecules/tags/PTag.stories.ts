import { boolean, select } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import PTag from '@/molecules/tags/PTag.vue';
import { BADGE_STYLE } from '@/atoms/badges/type';

export default {
    title: 'Data Display/Tags',
    component: PTag,
};

const styleTypes = Object.values(BADGE_STYLE);
export const tag = () => ({
    components: { PTag },
    props: {
        deletable: {
            default: boolean('deletable', true),
        },
        styleType: {
            default: select('styleType', styleTypes, BADGE_STYLE.gray200),
        },
        outline: {
            default: boolean('outline', false),
        },
    },
    template: '<p-tag v-bind="$props" @delete="onDelete">tag name</p-tag>',
    setup() {
        return {
            onDelete: action('delete'),
        };
    },
});
