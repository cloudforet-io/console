import PAnchor from '@/molecules/anchors/PAnchor.vue';
import { text } from '@storybook/addon-knobs';

export default {
    title: 'Inputs/Anchors',
    component: PAnchor,
    parameters: {
        info: {
            summary: '',
            components: { PAnchor },
        },
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/wq4wSowBcADBuUrMEZLz6i/SpaceONE-Console-Design?node-id=5339%3A34087',
        },
    },
};

export const anchor = () => ({
    components: { PAnchor },
    props: {
        href: {
            default: text('href', 'https://www.google.com/'),
        },
        target: {
            default: text('target', '_blank'),
        },
        fontSize: {
            default: text('font-size', '1rem'),
        },
        color: {
            default: text('text-color', 'black'),
        },
    },
    template: `
        <div :style="{fontSize:fontSize, color: color, display:'flex', flexDirection:'column'}">
            <p-anchor v-bind="$props">This is anchor to {{href}}</p-anchor>
            <p-anchor v-bind="$props" :show-icon="false">This is anchor to {{href}}</p-anchor>
            <p-anchor v-bind="$props" disabled>Disabled anchor</p-anchor>
        </div>
    `,
});
