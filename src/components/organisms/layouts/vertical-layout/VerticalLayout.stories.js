import { withKnobs, text } from '@storybook/addon-knobs/vue';
import { action } from '@storybook/addon-actions';
import { autoProps } from '@sb/storybook-util';
import PVerticalLayout from '@/components/organisms/layouts/vertical-layout/VerticalLayout';

export default {
    title: 'organisms/layouts/vertical-layout',
    component: PVerticalLayout,
    decorators: [withKnobs],
    parameters: {
        info: {
            summary: '',
            components: { PVerticalLayout },
        },
    },
};

export const defaultCase = () => ({
    components: { PVerticalLayout },
    props: {
        ...autoProps(PVerticalLayout, {
            height: {
                default: text('height', '100vh'),
            },
        }),
    },
    template: `<div style="border: 1px solid red; height: 100vh;">
                   <p-vertical-layout v-bind="$props" >
                        <template #leftContainer="{width}">
                            <div :style="{width: width}">
                                This is left Container.
                            </div>
                        </template>
                        <template #rightContainer>
                            This is right Container.
                        </template>
                    </p-vertical-layout>
                </div>`,
    methods: {
        start: action('start'),
        move: action('move'),
        stop: action('stop'),
    },
});
