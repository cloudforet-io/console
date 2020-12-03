import {
    select, text, color, boolean,
} from '@storybook/addon-knobs/vue';
import PBadge from '@/components/atoms/badges/PBadge.vue';
import { withKnobs } from '@storybook/addon-knobs';


export default {
    title: 'Data Display/Badges',
    component: PBadge,
    parameters: {
        info: {
            summary: '',
            components: { PBadge },
        },
    },
    decorators: [withKnobs],
    // argTypes: {
    //     styleType: { control: {} }
    // }
};
const actions = {};
const data = {};

export const Badge = () => ({
    components: { PBadge },
    template: `<PBadge style="width: auto" 
                       :styleType="styleType"
                       :text-color="textColor"
                       :backgroundColor="backgroundColor"
                       :outline="outline"
                       :shape="shape"
    >{{text}}</PBadge>`,
    data() {
        return {
            styleType: select('styleType', [
                'primary', 'primary-dark', 'primary1', 'primary2', 'primary3', 'primary4',
                'secondary', 'secondary1', 'secondary2',
                'alert', 'safe', 'gray900',
                'gray', 'gray200', 'gray100',
            ], 'primary'),
            text: text('text', 'badge'),
            shape: select('shape', ['round', 'square'], 'round'),
            textColor: color('textColor', ''),
            backgroundColor: color('backgroundColor', ''),
            outline: boolean('outline', false),
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

export const lightBadge = () => ({});
