import {
    select, text, color, boolean,
} from '@storybook/addon-knobs';
import PBadge from '@/atoms/badges/PBadge.vue';
import { BADGE_STYLE } from '@/atoms/badges/type';

export default {
    title: 'Data Display/Badges',
    component: PBadge,
    parameters: {
        info: {
            summary: '',
            components: { PBadge },
        },
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/wq4wSowBcADBuUrMEZLz6i/SpaceONE-Console-Design?node-id=6132%3A124077',
        },
    },
};

export const Badge = () => ({
    components: { PBadge },
    template: `
        <PBadge style="width: auto" 
                :styleType="styleType"
                :text-color="textColor"
                :backgroundColor="backgroundColor"
                :outline="outline"
                :shape="shape"
        >{{text}}</PBadge>`,
    props: {
        styleType: {
            default: select(
                'styleType', [
                    'primary', 'primary-dark', 'primary1', 'primary2', 'primary3', 'primary4',
                    'secondary', 'secondary1', 'secondary2',
                    'alert', 'safe', 'gray900',
                    'gray', 'gray200', 'gray100',
                ], 'primary',
            ),
        },
        text: {
            default: text('text', 'badge'),
        },
        shape: {
            default: select('shape', ['round', 'square'], 'round'),
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
});

export const longBadge = () => ({
    components: { PBadge },
    template: `
        <PBadge :styleType="styleType"
                :text-color="textColor"
                :backgroundColor="backgroundColor"
                :outline="outline"
        >Badge with long size in length</PBadge>`,
    props: {
        styleType: {
            default: select('styleType', Object.values(BADGE_STYLE), null),
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
});

export const linkBadge = () => ({
    components: { PBadge },
    template: `
        <PBadge :styleType="styleType"
                :text-color="textColor"
                :backgroundColor="backgroundColor"
                :outline="outline"
                :link="link"
        >Badge with link</PBadge>`,
    props: {
        styleType: {
            default: select('styleType', Object.values(BADGE_STYLE), null),
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
});
