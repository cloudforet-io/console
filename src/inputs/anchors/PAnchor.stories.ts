import PAnchor from '@/inputs/anchors/PAnchor.vue';
import {
    text, color, select, withKnobs,
} from '@storybook/addon-knobs';

export default {
    title: 'Inputs/Anchors',
    component: PAnchor,
    decorators: [withKnobs],
    parameters: {
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/wq4wSowBcADBuUrMEZLz6i/SpaceONE-Console-Design?node-id=7050%3A551812',
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
            default: select('target', ['_blank', '_self', '_parent', '_top'], '_blank'),
        },
        fontSize: {
            default: text('font-size', '1rem'),
        },
        color: {
            default: color('text-color', 'black'),
        },
    },
    template: `
        <div class="grid grid-cols-1 gap-6" :style="{fontSize:fontSize, color: color}">
            <p-anchor v-bind="$props">This is <strong>default</strong> anchor to {{href}}</p-anchor>
            <p-anchor v-bind="$props" :show-icon="false">This is <strong>no-icon</strong> anchor to {{href}}</p-anchor>
            <p-anchor v-bind="$props" highlight>This is <strong>highlighted</strong> anchor to {{href}}</p-anchor>
            <p-anchor v-bind="$props" disabled>This is <strong>disabled</strong> anchor to {{href}}</p-anchor>
        </div>
    `,
});
