import { autoProps } from '@sb/storybook-util';
import { number, boolean, text } from '@storybook/addon-knobs';
import {
    toRefs, reactive, ref, computed,
} from '@vue/composition-api';
// import md from './pageTitle.md';
import PpageTitle from '@/components/organisms/title/page-title/pageTitle.vue';
import { action } from '@storybook/addon-actions';

export default {
    title: 'Molecules/title/page-title',
    component: PpageTitle,
    // parameters: {
    //     notes: md,
    // },
};

const getState = () => reactive({});

export const defaultCase = () => ({
    components: { PpageTitle },
    template: '<PpageTitle v-bind="$props"></PpageTitle>',
    props: {
        title: {
            type: String,
            default: text('title', 'Page Title'),
        },
        child: {
            type: Boolean,
            default: boolean('child', false),
        },
        useTotalCount: {
            type: Boolean,
            default: boolean('use Total Count', true),
        },
        useSelectedCount: {
            type: Boolean,
            default: boolean('use Selected Count', false),
        },
        totalCount: {
            type: Number,
            default: number('Total Count', 10),
        },
        selectedCount: {
            type: Number,
            default: number('Selected Count', 2),
        },
    },
    setup(props, context) {
        return {
            goBack: action('goBack'),
        };
    },
});

export const childMode = () => ({
    components: { PpageTitle },
    template: `
        <PpageTitle
          v-bind="$props"
          @goBack="goBack"
        >
        
        </PpageTitle>`,
    props: {
        child: {
            type: Boolean,
            default: boolean('child', true),
        },
    },
    setup(props, context) {
        return {
            goBack: action('goBack'),
        };
    },
});
export const selectedCount = () => ({
    components: { PpageTitle },
    template: '<PpageTitle v-bind="$props"></PpageTitle>',
    props: {
        useTotalCount: {
            type: Boolean,
            default: boolean('use Total Count', true),
        },
        useSelectedCount: {
            type: Boolean,
            default: boolean('use Selected Count', true),
        },
        totalCount: {
            type: Number,
            default: number('Total Count', 10),
        },
        selectedCount: {
            type: Number,
            default: number('Selected Count', 2),
        },
    },
    setup(props, context) {
        return {
        };
    },
});
