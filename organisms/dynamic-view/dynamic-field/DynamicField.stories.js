import { select, boolean, text } from '@storybook/addon-knobs';
import {
    toRefs, reactive, ref, computed,
} from '@vue/composition-api';
import { action } from '@storybook/addon-actions';
import PDynamicField from './DynamicField.vue';
import md from './DynamicField.md';

export default {
    title: 'organisms/dynamic-view/dynamic-field',
    component: PDynamicField,
    parameters: {
        notes: md,
    },
};


export const defaultCase = () => ({
    components: { PDynamicField },
    template: '<div><li v-for="raw in data"><PDynamicField viewType="text"  :data="raw"/></li></div>',
    setup() {
        return {
            data: [
                'this is text field',
                { key: 'this is object' },
                ['this is array', 'test'],
            ],
        };
    },
});

export const unSupportType = () => ({
    components: { PDynamicField },
    template: '<div><li v-for="raw in data"><PDynamicField viewType="mr.peng"  :data="raw"/></li></div>',
    setup() {
        return {
            data: [
                'this is text field',
                { key: 'this is object' },
                ['this is array', 'test'],
            ],
        };
    },
});

export const stateType = () => ({
    components: { PDynamicField },
    template: '<div><li v-for="{option,raw} in data"><PDynamicField viewType="state"  :viewOption="option" :data="raw"/></li></div>',
    setup() {
        return {
            data: [
                {
                    option: {
                        text_color: '#60B731',
                        icon: {
                            image: 'ic_round',
                        },
                    },
                    raw: 'active',
                },
                {
                    option: {
                        text_color: '#EF3817',
                        icon: {
                            image: 'ic_delete',
                            color: '#EF3817',
                        },
                    },
                    raw: 'deactive',
                },
                {
                    option: {
                        text_color: '#FFCE02',
                        icon: {
                            image: 'aws-ec2',
                            color: '#FFCE02',
                        },
                    },
                    raw: 'use icon',
                },
            ],
        };
    },
});
