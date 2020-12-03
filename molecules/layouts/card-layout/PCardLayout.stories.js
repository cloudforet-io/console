// eslint-disable-next-line import/no-extraneous-dependencies
import { withKnobs } from '@storybook/addon-knobs/vue';
import { autoProps } from '@sb/storybook-util';
import CardLayout from '@/components/molecules/layouts/card-layout/PCardLayout.vue';


export default {
    title: 'Layouts/CardLayout',
    component: CardLayout,
    decorators: [withKnobs],
    parameters: {
        info: {
            summary: `
            `,
            components: { CardLayout },
        },
    },
};


export const cardLayout = () => ({
    components: { CardLayout },
    props: {
        ...autoProps(CardLayout),
    },
    template: `<CardLayout v-bind="$props">
                    <template slot="a">
                        <p>aaaa</p>
                    </template>
                    <template slot="b">
                        <p>bbbb</p>
                    </template>
               </CardLayout>`,
});
