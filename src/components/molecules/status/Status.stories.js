import { select, text, color } from '@storybook/addon-knobs/vue';
import PStatus from './Status';
import {
    alert, safe, other1, other2, gray,
} from '@/styles/_variables.scss';

import {
    animationMapping, flipMapping,
    iconStyleMapping,
    rotatingMapping,
    sizeMapping,
} from '../../atoms/icons/FiMapping';
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
    :iconStyle="iconStyle" 
    :size="size" 
    :animation="animation" 
    :rotating="rotating" 
    :flip="flip"
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
            default: text('icon', 'fa-circle'),
        },
        iconStyle: {
            default: select('icon_style', [...Object.keys(iconStyleMapping)], 'solid'),
        },
        size: {
            default: select('size', [null, ...Object.keys(sizeMapping)], 'xs'),
        },
        animation: {
            default: select('animation', [null, ...Object.keys(animationMapping)], null),
        },
        rotating: {
            default: select('rotating', [null, ...Object.keys(rotatingMapping)], null),
        },
        flip: {
            default: select('flip', [null, ...Object.keys(flipMapping)], null),
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
<p-status icon="fa-circle" size="xs" iconColor="#60B731" text="enabled"></p-status><br>
<p-status icon="fa-circle" size="xs" iconColor="#EA390F" textColor="#EA390F" text="disabled"></p-status>
</div>
`,
});

export const useUtil = () => ({
    components: { PStatus },
    template: `
<div>
<template v-for="state in states">
<p-status icon="fa-circle" size="xs" v-bind="statusBind(state)"/><br>
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
