import { select, text, boolean } from '@storybook/addon-knobs';
import { withDesign } from 'storybook-addon-designs';
import { action } from '@storybook/addon-actions';
import PButton from '@/atoms/buttons-new/PButton.vue';
import PLottie from '@/molecules/lottie/PLottie.vue';
import { BUTTON_STYLE } from '@/atoms/buttons-new/type';

export default {
    title: 'Inputs/Buttons/Button',
    component: PButton,
    decorators: [withDesign],
    parameters: {
        info: {
            summary: '',
            components: { PButton },
        },
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/wq4wSowBcADBuUrMEZLz6i/SpaceONE-Console-Design?node-id=100%3A47',
        },
    },
};

const actions = {
    click: action('click'),
};

export const button = () => ({
    components: { PButton, PLottie },
    template: `
      <div style="display:flex; align-items:center; justify-content:center; width:1000px; height:100px;">
      <p-button
        @click="click"
        :href="href" 
        :styleType="styleType" 
        :size="size"
        :disabled="disabled"
        :loading="loading"
        :outline="outline"
        :block="block"
      >
        <div v-if="loading" class="loading-btn">
          <p-lottie v-if="loading" class="spinner"
                    name="thin-spinner" auto
                    :size="1.5"
          />
          <slot />
        </div>
       {{defaultSlot}} 
      </p-button>
      </div>`,
    props: {
        styleType: {
            default: select('styleType', Object.values(BUTTON_STYLE), BUTTON_STYLE.primary),
        },
        size: {
            default: select('size', ['(default)', 'sm', 'lg'], '(default)'),
        },
        defaultSlot: {
            default: text('default slot', 'button'),
        },
        href: {
            default: text('href', ''),
        },
        disabled: {
            default: boolean('disabled', false),
        },
        loading: {
            default: boolean('loading', false),
        },
        outline: {
            default: boolean('outline', false),
        },
        block: {
            default: boolean('block', false),
        },
    },
    setup() {
        return {
            ...actions,
        };
    },
});
