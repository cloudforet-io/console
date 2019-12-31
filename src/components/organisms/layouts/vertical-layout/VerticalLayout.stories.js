import { action } from '@storybook/addon-actions';
import { autoProps } from '@sb/storybook-util';
import PVerticalLayout from '@/components/organisms/layouts/vertical-layout/VerticalLayout';

export default {
    title: 'Organisms/layouts/vertical-layout',
    component: PVerticalLayout,
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
        ...autoProps(PVerticalLayout),
    },
    template: `<div style="border: 1px solid red;">
                   <p-vertical-layout>
                        <template #leftContainer="{300 px}">
                            This is left Container.
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
