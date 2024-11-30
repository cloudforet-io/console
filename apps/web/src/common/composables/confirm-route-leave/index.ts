import {
    ref, readonly,
} from 'vue';
import type { Route } from 'vue-router';
import { useRouter } from 'vue-router/composables';

export const useConfirmRouteLeave = () => {
    const router = useRouter();

    const isConfirmBackModalVisible = ref(false);
    const isConfirmed = ref(false);
    let nextRoute: Route|undefined;

    const openConfirmBackModal = () => {
        isConfirmBackModalVisible.value = true;
    };
    const handleConfirmBack = () => {
        isConfirmed.value = true;
        isConfirmBackModalVisible.value = false;
        router.push(nextRoute);
    };
    const handleCancelBack = () => {
        isConfirmBackModalVisible.value = false;
        nextRoute = undefined;
    };

    const handleBeforeRouteLeave = (to, from, next) => {
        if (!isConfirmed.value) {
            nextRoute = to;
            openConfirmBackModal();
            next(false);
        } else {
            next();
        }
    };

    return {
        isConfirmBackModalVisible: readonly(isConfirmBackModalVisible),
        handleConfirmBack,
        handleCancelBack,
        handleBeforeRouteLeave,
    };
};
