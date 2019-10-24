// eslint-disable-next-line import/no-extraneous-dependencies
import { withKnobs } from '@storybook/addon-knobs/vue';
import PMenuTip from './MenuTip.vue';
import { autoProps } from '../../../setup/storybook-util';


export default {
    title: 'Molecules/menu-tip',
    component: PMenuTip,
    decorators: [withKnobs],
};

export const defaultCase = () => ({
    components: { PMenuTip },
    props: {
        ...autoProps(PMenuTip),
    },
    template: '<p-menu-tip :contents="contents"/>',
});
