import { boolean, select, withKnobs } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import PTag from '@/data-display/tags/PTag.vue';
import { BADGE_STYLE } from '@/data-display/badges/type';

export default {
    title: 'Data Display/Tags',
    component: PTag,
    decorators: [withKnobs],
    parameters: {
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/wq4wSowBcADBuUrMEZLz6i/SpaceONE-Console-Design?node-id=6132%3A124105',
        },
    },
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
