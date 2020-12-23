import { withKnobs, text } from '@storybook/addon-knobs/vue';
import PVerticalLayout from '@/components/organisms/layouts/vertical-layout/PVerticalLayout.vue';

export default {
    title: 'Layouts/VerticalLayout',
    component: PVerticalLayout,
    decorators: [withKnobs],
    parameters: {
        info: {
            summary: '',
            components: { PVerticalLayout },
        },
    },
};

export const verticalLayout = () => ({
    components: { PVerticalLayout },
    props: {
    },
    template: `
        <div style="width: 100vw; border: 1px solid gray;">
            <p-vertical-layout>
                <template #sidebar>
                    Left Layout
                </template>
                <template #default>
                    Right Layout
                </template>
            </p-vertical-layout>
        </div>`,
});
