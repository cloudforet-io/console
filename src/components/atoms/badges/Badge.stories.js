import {
    select, text, color, boolean,
} from '@storybook/addon-knobs/vue';
import PBadge from './Badge.vue';

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
    >{{text}}</PBadge>`,
    props: {
        styleType: {
            default: select('styleType', [
                'primary', 'primary-dark', 'primary1', 'primary2', 'primary3', 'primary4',
                'secondary', 'secondary1', 'secondary2',
                'alert', 'safe', 'dark',
                'gray', 'gray1', 'gray2', 'gray3',
            ], 'primary'),
        },
        text: {
            default: text('text', 'badge'),
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
                'other1', 'other2', 'other3', 'other4',
                'gray', 'gray1', 'gray2', 'gray3',
                'alert', 'safe', 'dark',
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
