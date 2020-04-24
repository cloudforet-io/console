import SkePSelectBtnGroup from '@/components/molecules/skeletons/SkePSelectBtnGroup.vue';
import { number } from '@storybook/addon-knobs';

export default {
    title: 'molecules/skeletons/p-select-btn-group',
    component: SkePSelectBtnGroup,
};

export const defaultCase = () => ({
    components: { SkePSelectBtnGroup },
    template: '<div class="w-screen h-screen"><SkePSelectBtnGroup :buttons="buttons"></SkePSelectBtnGroup></div>',
    props: {
        buttons: {
            type: Number,
            default: number('buttons count', 5),
        },
    },

});
