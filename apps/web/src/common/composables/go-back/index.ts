import { ref } from 'vue';
import type { Location } from 'vue-router';

// CAUTION: Do not change to useRouter() because useRouter is only available in script setup
import { SpaceRouter } from '@/router';

export const useGoBack = (mainRoute?: Location) => {
    const pathFrom = ref<Location|undefined>();
    const setPathFrom = (path: Location) => {
        pathFrom.value = path;
    };

    const handleClickBackButton = () => {
        if (!mainRoute) {
            console.error('mainRoute is not provided');
            return;
        }
        if (!pathFrom.value?.name) { // in case of direct access from the other site, go to the main page
            SpaceRouter.router.push(mainRoute).catch(() => {});
        } else if (pathFrom.value.name === mainRoute.name) { // in case of access from the service main page in the same site, go to the previous page
            SpaceRouter.router.push(pathFrom.value).catch(() => {});
        } else { // in case of access from the other page in the same site, go to the main page
            SpaceRouter.router.push(mainRoute).catch(() => {});
        }
    };

    return {
        pathFrom,
        setPathFrom,
        handleClickBackButton,
        goBack: handleClickBackButton,
    };
};
