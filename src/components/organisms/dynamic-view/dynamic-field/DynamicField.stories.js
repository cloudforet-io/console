/* eslint-disable camelcase */
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
    template: '<div><li v-for="raw in data"><PDynamicField type="text"  :data="raw"/></li></div>',
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

export const datetimeType = () => ({
    components: { PDynamicField },
    template: '<div><li v-for="ex in data"><PDynamicField type="datetime"  :options="ex.option" :data="ex.raw"/></li></div>',
    setup() {
        return {
            data: [
                {
                    option: {
                        source_type: 'iso861',
                    },
                    raw: '2013-02-08 09:30:26.123',
                },
                {
                    option: {
                        source_type: 'iso861',
                        source_format: 'MM-DD-YYYY',
                    },
                    raw: '10-20-2019',
                },
                {
                    option: {
                        source_type: 'iso861',
                        source_format: 'MM-DD-YYYY',
                        display_format: 'YYYY-MM-DD',
                    },
                    raw: '4-20-2019',
                },
                {
                    option: {
                        source_type: 'timestamp',
                    },
                    raw: '1318781876406',
                },
            ],
        };
    },
});


export const unSupportType = () => ({
    components: { PDynamicField },
    template: '<div><li v-for="raw in data"><PDynamicField type="mr.peng"  :data="raw"/></li></div>',
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
    template: '<div><li v-for="{option,raw} in data"><PDynamicField type="state"  :options="option" :data="raw"/></li></div>',
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


export const badgeType = () => ({
    components: { PDynamicField },
    template: '<div><li v-for="ex in data"><PDynamicField type="badge"  :options="ex.option" :data="ex.raw"/></li></div>',
    setup() {
        return {
            data: [
                {
                    option: { },
                    raw: 'no option',
                },
                {
                    option: {
                        text_color: '#60B731',
                    },
                    raw: 'test',
                },
                {
                    option: {
                        background_color: '#60B731',
                    },
                    raw: 'sample',
                },
                {
                    option: {
                        text_color: 'yellow',
                        background_color: '#000000',
                    },
                    raw: '펭수',
                },

            ],
        };
    },
});


export const listType = () => ({
    components: { PDynamicField },
    template: '<div><li v-for="ex in example"><PDynamicField type="list"  :options="ex.option" :data="ex.data"/></li></div>',
    setup() {
        return {
            example: [
                {
                    option: {
                        item: {
                            options: {
                                text_color: '#FFCE02',
                                icon: {
                                    image: 'aws-ec2',
                                    color: '#FFCE02',
                                },
                            },
                            type: 'state',
                        },

                    },
                    data: ['펭하', '구독', '좋아요'],
                },
                {
                    option: {
                        item: {
                            options: {
                                background_color: '#FFCE02',
                            },
                            type: 'badge',
                        },

                    },
                    data: ['펭하', '구독', '좋아요'],
                },
                {
                    option: {
                        item: {
                            type: 'text',
                        },

                    },
                    data: ['펭하', '구독', '좋아요'],
                },

            ],
        };
    },
});
export const dictType = () => ({
    components: { PDynamicField },
    template: '<PDynamicField type="dict" :data="data"/>',
    setup() {
        return {
            data: reactive({
                tag1: 'asdf',
                tag2: 'ahahah',
            }),
        };
    },
});

export const enumType = () => ({
    components: { PDynamicField },
    template: '<div><li v-for="d in data"><PDynamicField type="enum"  :options="option" :data="d"/></li></div>',
    setup() {
        return {
            option: {
                AWS: {
                    options: {
                        text_color: '#FF7750',
                        icon: {
                            image: 'aws-ec2',
                            color: '#FF7750',
                        },
                    },
                    type: 'state',
                },
                GCP: {
                    options: {
                        text_color: '#60B731',
                        icon: {
                            image: 'aws-ec2',
                            color: '#60B731',
                        },
                    },
                    type: 'state',
                },
                AZURE: {
                    options: {
                        text_color: '#0080FB',
                        icon: {
                            image: 'aws-ec2',
                            color: '#0080FB',
                        },
                    },
                    type: 'state',
                },
                AWSBadge: {
                    options: {
                        background_color: '#FF7750',
                    },
                    type: 'badge',
                },
                GCPBadge: {
                    options: {
                        background_color: '#60B731',
                    },
                    type: 'badge',
                },
                AZUREBadge: {
                    options: {
                        background_color: '#0080FB',
                    },
                    type: 'badge',
                },
            },
            data: ['AWS', 'GCP', 'AZURE', 'SpaceOne', 'AWSBadge', 'GCPBadge', 'AZUREBadge'],
        };
    },
});
