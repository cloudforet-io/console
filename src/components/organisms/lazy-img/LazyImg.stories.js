import {
    toRefs, reactive, ref, computed,
} from '@vue/composition-api';
import { action } from '@storybook/addon-actions';
import {
    text, number, select, object, boolean,
} from '@storybook/addon-knobs/vue';
import { getKnobProps } from '@sb/storybook-util';
import { lazyImgProps } from '@/components/organisms/lazy-img/LazyImg.toolset';
import PLazyImg from './LazyImg.vue';

export default {
    title: 'organisms/LazyImg',
    component: PLazyImg,
    parameters: {
        info: {
            summary: '',
            components: { PLazyImg },
        },
        knobs: { escapeHTML: false },
    },
};


export const defaultCase = () => ({
    components: { PLazyImg },
    props: getKnobProps(lazyImgProps, {
        imgUrl: 'https://assets-console-cloudone-dev.s3.ap-northeast-2.amazonaws.com/console-assets/icons/aws-ec2.svg',
    }, {
        loading: true,
    }),
    template: `
    <div style="width: 80vw;">
        <PLazyImg v-bind="$props"></PLazyImg>
    </div>`,
    setup(props, context) {
        const state = reactive({
        });

        return {
            ...toRefs(state),
        };
    },
});


export const errorCase = () => ({
    components: { PLazyImg },
    props: getKnobProps(lazyImgProps, {
        imgUrl: 'wrong',
    }, {
        loading: true,
    }),
    template: `
    <div style="width: 80vw;">
        <PLazyImg v-bind="$props"></PLazyImg>
    </div>`,
    setup(props, context) {
        const state = reactive({
        });

        return {
            ...toRefs(state),
        };
    },
});
