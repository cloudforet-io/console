import { select, text, color } from '@storybook/addon-knobs/vue';
import PStatus from './Status';
import {
    alert, safe, other1, other2, gray,
} from '@/styles/_variables.scss';
import { autoProps } from '@sb/storybook-util';
import { ColorBindFactory } from '@/lib/util';

export default {
    title: 'molecules/status',
    component: PStatus,
};

export const DefaultCase = () => ({
    components: { PStatus },
    props: {
        ...autoProps(PStatus, [
            {
                name: 'text',
                default: text('text', 'enabled'),
            },
            {
                name: 'iconColor',
                default: color('iconColor', safe),
                knobType: 'color',
            },
            {
                name: 'textColor',
                default: color('textColor', safe),
                knobType: 'color',
            },
        ]),

    },
    template: '<p-status  v-bind="$props"/>',
});

export const iconStatus = () => ({
    components: { PStatus },
    template: `<div>
                    <p-status icon="aws-ec2" iconColor="#60B731" text="enabled"/><br>
                </div>`
    ,
});

/*
export const useUtil = () => ({
    components: { PStatus },
    template: `
<div>
<template v-for="state in states">
<p-status icon="aws-ec2" v-bind="statusBind(state)"></p-status><br>
</template>
</div>
`,
    data() {
        return {
            states: ['ENABLED', 'DISABLED', 'DISABLED', 'ENABLED', 'DISABLED', 'ENABLED'],
        };
    },
    methods: {
        statusBind: statusBindFactory({
            ENABLED: {
                iconColor: safe,
                textColor: safe,
            },
            DISABLED: {
                iconColor: other1,
                textColor: other1,
            },
        },
        value => value.toLowerCase()),
    },
});
*/
