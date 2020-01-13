// eslint-disable-next-line import/no-extraneous-dependencies
import { withKnobs, text } from '@storybook/addon-knobs/vue';
import { toRefs, reactive } from '@vue/composition-api';
import { autoProps } from '@sb/storybook-util';
import CardLayout from './CardLayout';


export default {
    title: 'molecules/layouts/CardLayout',
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


export const defaultCase = () => ({
    components: { CardLayout },
    props: {
        ...autoProps(CardLayout),
    },
    template: `<CardLayout v-bind="$props">
                    <template slot="a">aa</template>
                    <template slot="b">bb</template>
                    <template slot="c">cc</template>
               </CardLayout>`,
});
