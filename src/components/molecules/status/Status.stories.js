import { select, text, color } from '@storybook/addon-knobs/vue';
import PStatus from './Status';
import {
    alert, safe, other1, other2, gray,
} from '@/styles/_variables.scss';

import { statusBindFactory } from '@/components/molecules/status/Status.util';


export default {
    title: 'molecules/status',
    component: PStatus,
    parameters: {
        info: {
            summary: '',
            components: { PStatus },
        },
    },
};


export const base = () => ({
    components: { PStatus },
    template: `
<p-status  
    :icon="icon" 
    :text="text"
    :textColor="textColor"
    :iconColor="iconColor"
    />
`,
    props: {
        text: {
            default: text('text', 'enabled'),
        },
        icon: {
            default: text('icon', null),
        },
        textColor: {
            default: color('textColor', '#000000'),
        },
        iconColor: {
            default: color('iconColor', '#60B731'),
        },
    },
});
export const example = () => ({
    components: { PStatus },
    template: `
<div>
<p-status icon="aws-ec2" iconColor="#60B731" text="enabled"></p-status><br>
</div>
`,
});

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
