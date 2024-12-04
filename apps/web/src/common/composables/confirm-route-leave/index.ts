import type { Ref } from 'vue';
import {
    ref, readonly,
} from 'vue';
import type { Location } from 'vue-router';

// CAUTION: Do not change to useRouter() because useRouter is only available in script setup
import { SpaceRouter } from '@/router';

export const useConfirmRouteLeave = ({
    passConfirmation,
}: {
    passConfirmation?: Ref<boolean>
} = {}) => {
    const isConfirmLeaveModalVisible = ref(false);
    const isConfirmed = ref(false);
    let nextRoute: Location|undefined;

    const openConfirmBackModal = () => {
        isConfirmLeaveModalVisible.value = true;
    };
    const confirmRouteLeave = () => {
        isConfirmed.value = true;
        isConfirmLeaveModalVisible.value = false;
        if (nextRoute) SpaceRouter.router.push(nextRoute);
    };
    const stopRouteLeave = () => {
        isConfirmLeaveModalVisible.value = false;
        nextRoute = undefined;
    };

    const handleBeforeRouteLeave = (to, from, next) => {
        if (passConfirmation?.value) {
            next();
            return;
        }
        if (!isConfirmed.value) {
            nextRoute = to;
            openConfirmBackModal();
            next(false);
        } else {
            next();
        }
    };

    return {
        isConfirmLeaveModalVisible: readonly(isConfirmLeaveModalVisible),
        confirmRouteLeave,
        stopRouteLeave,
        handleBeforeRouteLeave,
    };
};
