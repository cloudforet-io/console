import PSelectBtnGroupSkeleton from '@/molecules/skeletons/PSelectBtnGroupSkeleton.vue';
import { number } from '@storybook/addon-knobs';

export default {
    title: 'Feedbacks/Loading/Skeleton Group',
    component: PSelectBtnGroupSkeleton,
};

export const SelectBtnGroupSkeleton = () => ({
    components: { PSelectBtnGroupSkeleton },
    template: '<div class="w-screen h-screen"><PSelectBtnGroupSkeleton :buttons="buttons"></PSelectBtnGroupSkeleton></div>',
    props: {
        buttons: {
            type: Number,
            default: number('buttons count', 5),
        },
    },

});
