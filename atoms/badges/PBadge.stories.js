import {
    select, text, color, boolean,
} from '@storybook/addon-knobs/vue';
import { BADGE_SHAPE } from '@/components/atoms/badges/PBadge.toolset';
import PBadge from '@/components/atoms/badges/PBadge.vue';

export default {
    title: 'atoms/badges',
    component: PBadge,
    parameters: {
        info: {
            summary: '',
            components: { PBadge },
        },
    },
};
const actions = {};
const data = {};

export const DefaultCase = () => ({
    components: { PBadge },
    template: `<PBadge style="width: auto" 
                       :styleType="styleType"
                       :text-color="textColor"
                       :backgroundColor="backgroundColor"
                       :outline="outline"
                       :shape="shape"
    >{{text}}</PBadge>`,
    props: {
        styleType: {
            default: select('styleType', [
                'primary', 'primary-dark', 'primary1', 'primary2', 'primary3', 'primary4',
                'secondary', 'secondary1', 'secondary2',
                'alert', 'safe', 'gray900',
                'gray', 'gray200', 'gray100',
            ], 'primary'),
        },
        text: {
            default: text('text', 'badge'),
        },
        shape: {
            default: select('shape', [BADGE_SHAPE.ROUND, BADGE_SHAPE.SQUARE], BADGE_SHAPE.ROUND),
        },
        textColor: {
            default: color('textColor', ''),
        },
        backgroundColor: {
            default: color('backgroundColor', ''),
        },
        outline: {
            default: boolean('outline', false),
        },
    },
    data() {
        return {
            ...data,
        };
    },
    methods: {
        ...actions,
    },
});
export const longBadge = () => ({
    components: { PBadge },
    template: `<PBadge :styleType="styleType"  
                       :text-color="textColor" 
                       :backgroundColor="backgroundColor"
                       :outline="outline"
    >Badge with long size in length</PBadge>`,
    props: {
        styleType: {
            default: select('styleType', [
                '',
                'primary', 'primary-dark', 'primary1', 'primary2', 'primary3', 'primary4',
                'secondary', 'secondary1', 'secondary2',
                'coral', 'yellow',
                'gray', 'gray200', 'gray100',
                'alert', 'safe', 'gray900',
            ], ''),
        },
        textColor: {
            default: color('textColor', ''),
        },
        backgroundColor: {
            default: color('backgroundColor', ''),
        },
        outline: {
            default: boolean('outline', true),
        },
    },
    data() {
        return {
            ...data,
        };
    },
    methods: {
        ...actions,
    },
});

export const linkBadge = () => ({
    components: { PBadge },
    template: `<PBadge :styleType="styleType"  
                       :text-color="textColor" 
                       :backgroundColor="backgroundColor"
                       :outline="outline"
                       :link="link"
    >Badge with link</PBadge>`,
    props: {
        styleType: {
            default: select('styleType', [
                '',
                'primary', 'primary-dark', 'primary1', 'primary2', 'primary3', 'primary4',
                'secondary', 'secondary1', 'secondary2',
                'coral', 'yellow',
                'gray', 'gray200', 'gray100',
                'alert', 'safe', 'gray900',
            ], ''),
        },
        textColor: {
            default: color('textColor', ''),
        },
        backgroundColor: {
            default: color('backgroundColor', ''),
        },
        outline: {
            default: boolean('outline', true),
        },
        link: {
            default: '/?path=/story/atoms-badges--default-case',
        },
    },
    data() {
        return {
            ...data,
        };
    },
    methods: {
        ...actions,
    },
});
