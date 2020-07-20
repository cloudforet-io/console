import { text, select, boolean } from '@storybook/addon-knobs/vue';
import icon from 'vue-svgicon';
import PI from '@/components/atoms/icons/PI.vue';

export default {
    title: 'atoms/icon',
    component: PI,
    parameters: {
        info: {
            summary: '',
            components: { PI },
        },
    },
};

const icons = Object.keys(icon.icons);
export const DefaultCase = () => ({
    components: { PI },
    props: {
        name: {
            default: select('name', icons, 'aws-ec2'),
        },
        dir: {
            default: select('dir', ['up', 'right', 'down', 'left', undefined], undefined),
        },
        width: {
            default: text('width', '1.5rem'),
        },
        height: {
            default: text('height', '1.5rem'),
        },
        color: {
            default: text('color', undefined),
        },
        original: {
            default: boolean('original', true),
        },
        title: {
            default: text('title', 'aws-ec2'),
        },
    },
    template: `<div style="border: 1px solid #eee; height: 300px; width: 300px; position: relative;">
                   <span style="position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);">
                        <p-i v-bind="$props"/>
                   </span>
                </div>`,
});

export const allIcons = () => ({
    components: { PI },
    props: {
        dir: {
            default: select('dir', ['up', 'right', 'down', 'left', undefined], undefined),
        },
        width: {
            default: text('width', '1.5rem'),
        },
        height: {
            default: text('height', '1.5rem'),
        },
        color: {
            default: text('color', undefined),
        },

    },
    template: `
        <div style="width:100vw;border: 1px solid #eee;display: grid; row-gap: 0.5rem;column-gap: 0.5rem;  grid-template-columns: repeat(auto-fill, minmax(200px,1fr));">
            <div v-for="icon in iconList">
                <p-i v-bind="$props" :name="icon"/> <label style="user-select: all">{{icon}}</label>    
            </div>
            
                   <span style="position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);">
                        <p-i v-bind="$props"/>
                   </span>
                </div>`,
    setup() {
        return {
            iconList: icons,
        };
    },
});
