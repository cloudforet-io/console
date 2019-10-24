// eslint-disable-next-line import/no-extraneous-dependencies
import { withKnobs, text } from '@storybook/addon-knobs/vue';
import PMenuTip from './MenuTip.vue';
import { autoProps } from '../../../setup/storybook-util';


export default {
  title: 'Molecules/MenuTip',
  component: PMenuTip,
  decorators: [withKnobs],
};

export const defaultCase = () => ({
  components: { PMenuTip },
  props: {
    ...autoProps(PMenuTip),
  },
  template: '<p-menu-tip v-bind="$props"></p-menu-tip>',
});

export const slotUseCase = () => ({
  components: { PMenuTip },
  props: {
    ...autoProps(PMenuTip),
    slotContents: {
      default:
          text('Text', 'Hello Storybook'),
    },
  },
  template: `<p-menu-tip v-bind="$props">
                <slot>
                    {{slotContents}}
                </slot>
             </p-menu-tip> `,
});
