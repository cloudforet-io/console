import type { Ref } from 'vue';
import {
    ref, readonly,
} from 'vue';
import type { Route } from 'vue-router';
import { useRouter } from 'vue-router/composables';

export const useConfirmRouteLeave = ({
    passConfirmation,
}: {
    passConfirmation?: Ref<boolean>
} = {}) => {
    const router = useRouter();

    const isConfirmLeaveModalVisible = ref(false);
    const isConfirmed = ref(false);
    let nextRoute: Route|undefined;

    const openConfirmBackModal = () => {
        isConfirmLeaveModalVisible.value = true;
    };
    const confirmRouteLeave = () => {
        isConfirmed.value = true;
        isConfirmLeaveModalVisible.value = false;
        router.push(nextRoute);
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
