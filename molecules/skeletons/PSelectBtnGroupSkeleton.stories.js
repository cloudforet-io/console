import PSelectBtnGroupSkeleton from '@/components/molecules/skeletons/PSelectBtnGroupSkeleton.vue';
import { number } from '@storybook/addon-knobs';

export default {
    title: 'Feedbacks/Loading',
    component: PSelectBtnGroupSkeleton,
};

export const skeleton = () => ({
    components: { PSelectBtnGroupSkeleton },
    template: '<div class="w-screen h-screen"><PSelectBtnGroupSkeleton :buttons="buttons"></PSelectBtnGroupSkeleton></div>',
    props: {
        buttons: {
            type: Number,
            default: number('buttons count', 5),
        },
    },

});
