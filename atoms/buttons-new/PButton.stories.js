import { select, text, boolean } from '@storybook/addon-knobs/vue';
import { withDesign } from 'storybook-addon-designs';
import { action } from '@storybook/addon-actions';
import PButton from '@/components/atoms/buttons-new/PButton.vue';
import PLottie from '@/components/molecules/lottie/PLottie.vue';

export default {
    title: 'Inputs/Buttons',
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
const data = {};

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
        :link="link"
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
    data() {
        return {
            ...data,
        };
    },
    props: {
        styleType: {
            default: select('styleType', [
                'primary-dark', 'primary', 'primary1', 'primary2',
                'secondary', 'secondary1',
                'gray', 'gray900', 'gray900-hover',
                'alert', 'safe', 'gray-border', 'transparent',
            ], 'primary'),
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
        link: {
            default: boolean('link', false),
        },
        block: {
            default: boolean('block', false),
        },
    },
    methods: {
        ...actions,
    },
});
