import PSelectBtnGroupSkeleton from '@/components/molecules/skeletons/PSelectBtnGroupSkeleton.vue';
import { number } from '@storybook/addon-knobs';

export default {
    title: 'molecules/skeletons/p-select-btn-group',
    component: PSelectBtnGroupSkeleton,
};

export const defaultCase = () => ({
    components: { PSelectBtnGroupSkeleton },
    template: '<div class="w-screen h-screen"><PSelectBtnGroupSkeleton :buttons="buttons"></PSelectBtnGroupSkeleton></div>',
    props: {
        buttons: {
            type: Number,
            default: number('buttons count', 5),
        },
    },

});
