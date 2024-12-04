import type { Location } from 'vue-router';

// CAUTION: Do not change to useRouter() because useRouter is only available in script setup
import { SpaceRouter } from '@/router';

export const useGoBack = (mainRoute: Location) => {
    let pathFrom;
    const setPathFrom = (path: Location) => {
        pathFrom = path;
    };

    const handleClickBackButton = () => {
        if (!pathFrom?.name) { // in case of direct access from the other site, go to the main page
            SpaceRouter.router.push(mainRoute).catch(() => {});
        } else if (pathFrom.name === mainRoute.name) { // in case of access from the service main page in the same site, go to the previous page
            SpaceRouter.router.push(pathFrom).catch(() => {});
        } else { // in case of access from the other page in the same site, go to the main page
            SpaceRouter.router.push(mainRoute).catch(() => {});
        }
    };

    return {
        setPathFrom,
        handleClickBackButton,
        goBack: handleClickBackButton,
    };
};
