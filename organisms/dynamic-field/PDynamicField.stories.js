/* eslint-disable camelcase */
import {
    select, boolean, text, object,
} from '@storybook/addon-knobs';
import {
    toRefs, reactive, ref, computed,
} from '@vue/composition-api';
import PDynamicField from '@/components/organisms/dynamic-field/PDynamicField.vue';
import md from '@/components/organisms/dynamic-field/PDynamicField.md';

export default {
    title: 'others/dynamic-field',
    component: PDynamicField,
    parameters: {
        notes: md,
    },
};
export const playground = () => ({
    components: { PDynamicField },
    template: `<div class="flex">
        <div>
            <h2 class="font-bold">Example</h2>
            <table class="border">
                <thead>
                    <tr>
                        <th class="w-30 border">name</th>
                        <th class="w-60 border">schema</th>
                        <th class="w-30 border">result</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="exp in samples">
                        <td class="font-bold border">{{exp.name}}</td>
                        <td class="border"><pre>{{exp.schema}}</pre></td>
                        <td class="border">
                            <PDynamicField v-bind="exp.schema" :data="exp.data" ></PDynamicField>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div class="ml-8">
            <h2 class="font-bold">Playground</h2>
            <div class="p-4 border border-black flex justify-center items-center"><PDynamicField v-bind="schema" :data="value.data"/></div>
        </div>
    </div>`,
    props: {
        schema: {
            default: object('schema', {
                type: 'state',
                options: {
                    text_color: 'red.300',
                    icon: {
                        image: 'fab fa-aws fa-spin',
                        color: 'red.500',
                    },
                },
            }),
        },
        value: {
            default: object('value', { data: 'text' }),
        },
    },
    setup() {
        return {
            samples: [
                {
                    name: 'text',
                    schema: {},
                    data: 'test',
                },
                {
                    name: 'font-awsome icon',
                    schema: {
                        type: 'state',
                        options: {
                            text_color: 'red.300',
                            icon: {
                                image: 'fab fa-aws fa-spin',
                                color: 'red.500',
                            },
                        },
                    },
                    data: 'spin',
                },

            ],
        };
    },
});


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
                        source_type: 'iso8601',
                    },
                    raw: '2013-02-08 09:30:26.123',
                },
                {
                    option: {
                        source_type: 'iso8601',
                        source_format: 'MM-DD-YYYY',
                    },
                    raw: '10-20-2019',
                },
                {
                    option: {
                        source_type: 'iso8601',
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
    template: '<div><li v-for="{options,raw} in data"><PDynamicField type="state"  :options="options" :data="raw"/></li></div>',
    setup() {
        return {
            data: [
                {
                    options: {
                        text_color: '#60B731',
                    },
                    raw: 'active',
                },
                {
                    options: {
                        text_color: 'red.300',
                        icon: {
                            image: 'fas fa-address-book fa-spin',
                            color: 'red.500',
                        },
                    },
                    raw: 'deactive',
                },
                {
                    options: {
                        text_color: 'yellow',
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
    template: '<div><li v-for="ex in data"><PDynamicField type="badge"  :options="ex.options" :data="ex.raw"/></li></div>',
    setup() {
        return {
            data: [
                {
                    options: { },
                    raw: 'no option',
                },
                {
                    options: {
                        text_color: '#60B731',
                    },
                    raw: 'test',
                },
                {
                    options: {
                        text_color: 'peacock',
                    },
                    raw: 'named color',
                },
                {
                    options: {
                        text_color: 'green.300',
                        background_color: 'green.800',
                    },
                    raw: 'named color2',
                },
                {
                    options: {
                        text_color: 'green.600',
                    },
                    raw: 'named color3',
                },
                {
                    options: {
                        background_color: '#60B731',
                    },
                    raw: 'sample',
                },
                {
                    options: {
                        text_color: 'yellow',
                        background_color: '#000000',
                    },
                    raw: '펭수',
                },
                {
                    options: {
                        outline_color: 'blue.600',
                    },
                    raw: 'outline',
                },
                {
                    options: {
                        shape: 'SQUARE',
                    },
                    raw: 'square badge',
                },
                {
                    options: {
                        shape: 'SQUARE',
                        outline_color: 'blue.600',
                    },
                    raw: 'square badge outline',
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
