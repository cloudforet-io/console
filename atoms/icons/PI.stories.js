import { text, select } from '@storybook/addon-knobs/vue';
import PI from './PI';
import { autoProps } from '../../../../.storybook/storybook-util';

export default {
    title: 'atoms/icon/',
    component: PI,
};


export const DefaultCase = () => ({
    components: { PI },
    props: {
        name: {
            default: text('name', 'aws-ec2'),
        },
        dir: {
            default: select('dir', ['up', 'right', 'down', 'left', undefined], undefined),
        },
        ...autoProps(PI),
    },
    template: `<div style="border: 1px solid #eee; height: 300px; width: 300px; position: relative;">
                   <span style="position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);">
                        <p-i v-bind="$props"/>
                   </span>
                </div>`,
});
